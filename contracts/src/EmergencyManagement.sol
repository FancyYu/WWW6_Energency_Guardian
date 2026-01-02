// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./interfaces/IEmergencyManagement.sol";
import "./interfaces/IZKProofVerifier.sol";
import "./interfaces/IEmergencyDataStorage.sol";
import "./utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title EmergencyManagement
 * @dev Enhanced emergency management contract based on OmniGuardianV3 with ZKP integration
 * @notice Implements three-phase emergency management with multi-signature verification and ZK proofs
 * 
 * Key enhancements over base OmniGuardianV3:
 * - Integrated zero-knowledge proof verification for privacy-preserving guardian authentication
 * - Enhanced multi-signature threshold validation with proper enforcement
 * - IPFS data storage integration for encrypted emergency data
 * - Batch signature verification for gas optimization
 * - Progressive emergency level system with granular access control
 */
contract EmergencyManagement is 
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    EIP712Upgradeable,
    ReentrancyGuardUpgradeable,
    IEmergencyManagement
{
    using ECDSA for bytes32;

    // ============ CONSTANTS ============

    /// @dev Version of the contract for upgrades
    string public constant VERSION = "1.0.0";

    /// @dev Minimum timelock period for emergency proposals (1 hour)
    uint256 public constant MIN_TIMELOCK_PERIOD = 1 hours;

    /// @dev Maximum timelock period for emergency proposals (7 days)
    uint256 public constant MAX_TIMELOCK_PERIOD = 7 days;

    /// @dev Grace period for owner response before auto-escalation (24 hours)
    uint256 public constant OWNER_RESPONSE_GRACE_PERIOD = 24 hours;

    /// @dev Maximum number of guardians allowed
    uint256 public constant MAX_GUARDIANS = 20;

    /// @dev EIP-712 type hashes
    bytes32 public constant PAYMENT_REQUEST_TYPEHASH = keccak256(
        "PaymentRequest(bytes32 requestId,address recipient,uint256 amount,bytes32 purpose,uint256 deadline,uint8 requiredLevel)"
    );

    bytes32 public constant GUARDIAN_SIGNATURE_TYPEHASH = keccak256(
        "GuardianSignature(bytes32 messageHash,address guardian,uint256 nonce,uint256 deadline)"
    );

    // ============ STATE VARIABLES ============

    /// @dev Current emergency state
    EmergencyLevel public currentEmergencyLevel;
    uint256 public emergencyActivatedAt;
    uint256 public activeProposalId;

    /// @dev Emergency proposals mapping
    mapping(uint256 => EmergencyProposal) public emergencyProposals;
    uint256 public nextProposalId;

    /// @dev Guardian configuration
    GuardianConfig public guardianConfig;

    /// @dev Guardian nonces for replay protection
    mapping(address => uint256) public guardianNonces;

    /// @dev Payment request tracking
    mapping(bytes32 => PaymentRequest) public paymentRequests;

    /// @dev Emergency data storage references
    mapping(bytes32 => string) public levelDataCID; // IPFS hashes for emergency data

    /// @dev ZK proof verifier contract
    IZKProofVerifier public zkProofVerifier;

    /// @dev Emergency data storage contract
    IEmergencyDataStorage public emergencyDataStorage;

    /// @dev Owner response tracking for auto-escalation
    uint256 public lastOwnerResponse;
    bool public ownerResponseRequired;

    /// @dev Timelock periods for different operations
    uint256 public emergencyProposalTimelock;
    uint256 public guardianChangeTimelock;

    // ============ MODIFIERS ============

    modifier onlyGuardian() {
        if (!isGuardian(msg.sender)) {
            revert UnauthorizedCaller(msg.sender);
        }
        _;
    }

    modifier onlyGuardianOrOwner() {
        if (!isGuardian(msg.sender) && msg.sender != owner()) {
            revert UnauthorizedCaller(msg.sender);
        }
        _;
    }

    modifier validEmergencyLevel(EmergencyLevel level) {
        if (level == EmergencyLevel.None || level > EmergencyLevel.Level3) {
            revert InvalidEmergencyLevel(level, currentEmergencyLevel);
        }
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        if (emergencyProposals[proposalId].proposalId == 0) {
            revert ProposalNotFound(proposalId);
        }
        _;
    }

    // ============ INITIALIZATION ============

    /**
     * @notice Initializes the Emergency Management contract
     * @param _owner Address of the contract owner
     * @param _guardians Initial guardian addresses
     * @param _thresholds Approval thresholds for each emergency level [L1, L2, L3]
     * @param _zkProofVerifier Address of the ZK proof verifier contract
     * @param _emergencyDataStorage Address of the emergency data storage contract
     */
    function initialize(
        address _owner,
        address[] calldata _guardians,
        uint256[3] calldata _thresholds,
        address _zkProofVerifier,
        address _emergencyDataStorage
    ) external initializer {
        __Ownable_init(_owner);
        __EIP712_init("EmergencyManagement", VERSION);
        __ReentrancyGuard_init();

        // Validate guardian configuration
        _validateGuardianConfig(_guardians, _thresholds);

        // Set initial guardian configuration
        guardianConfig.guardians = _guardians;
        guardianConfig.requiredApprovalsForLevel1 = _thresholds[0];
        guardianConfig.requiredApprovalsForLevel2 = _thresholds[1];
        guardianConfig.requiredApprovalsForLevel3 = _thresholds[2];
        guardianConfig.lastUpdated = block.timestamp;

        // Set external contract addresses
        zkProofVerifier = IZKProofVerifier(_zkProofVerifier);
        emergencyDataStorage = IEmergencyDataStorage(_emergencyDataStorage);

        // Set default timelock periods
        emergencyProposalTimelock = 2 hours;
        guardianChangeTimelock = 48 hours;

        // Initialize state
        currentEmergencyLevel = EmergencyLevel.None;
        nextProposalId = 1;
        lastOwnerResponse = block.timestamp;
    }

    // ============ PHASE 1: TRIGGER & ACTIVATION ============

    /**
     * @inheritdoc IEmergencyManagement
     */
    function proposeEmergency(
        bytes calldata evidence,
        bytes32 evidenceHash,
        bytes calldata zkProof
    ) external onlyGuardianOrOwner returns (uint256 proposalId) {
        // Verify ZK proof of emergency validity
        if (!zkProofVerifier.verifyEmergencyProof(zkProof, evidenceHash)) {
            revert InvalidZKProof(zkProof);
        }

        proposalId = nextProposalId++;
        
        EmergencyProposal storage proposal = emergencyProposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.proposer = msg.sender;
        proposal.evidence = evidence;
        proposal.evidenceHash = evidenceHash;
        proposal.proposedAt = block.timestamp;
        proposal.timelock = block.timestamp + emergencyProposalTimelock;
        proposal.status = ProposalStatus.Pending;
        proposal.targetLevel = EmergencyLevel.Level1; // Start with Level 1
        proposal.zkProof = zkProof;

        emit EmergencyProposed(proposalId, msg.sender, evidenceHash, EmergencyLevel.Level1);
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function cancelEmergencyProposal(uint256 proposalId) external onlyOwner proposalExists(proposalId) {
        EmergencyProposal storage proposal = emergencyProposals[proposalId];
        
        if (proposal.status != ProposalStatus.Pending) {
            revert InvalidEmergencyLevel(EmergencyLevel.None, currentEmergencyLevel);
        }

        proposal.status = ProposalStatus.Cancelled;
        
        // Reset emergency state if this was the active proposal
        if (activeProposalId == proposalId) {
            currentEmergencyLevel = EmergencyLevel.None;
            activeProposalId = 0;
            emergencyActivatedAt = 0;
        }
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function activateEmergency(
        uint256 proposalId,
        bytes calldata activationProof
    ) external onlyGuardianOrOwner proposalExists(proposalId) nonReentrant {
        EmergencyProposal storage proposal = emergencyProposals[proposalId];
        
        // Check timelock
        if (block.timestamp < proposal.timelock) {
            revert TimelockNotExpired(proposalId, proposal.timelock - block.timestamp);
        }

        if (proposal.status != ProposalStatus.Pending) {
            revert InvalidEmergencyLevel(EmergencyLevel.None, currentEmergencyLevel);
        }

        // Verify activation authorization proof
        bytes32 operationHash = keccak256(abi.encodePacked("ACTIVATE_EMERGENCY", proposalId, msg.sender));
        if (!zkProofVerifier.verifyExecutionAuthorization(activationProof, msg.sender, operationHash)) {
            revert InvalidZKProof(activationProof);
        }

        // Activate emergency
        proposal.status = ProposalStatus.Executed;
        currentEmergencyLevel = proposal.targetLevel;
        activeProposalId = proposalId;
        emergencyActivatedAt = block.timestamp;
        ownerResponseRequired = true;

        emit EmergencyActivated(proposalId, proposal.targetLevel, msg.sender);
    }

    // ============ PHASE 2: PAYMENT & FAULT TOLERANCE ============

    /**
     * @inheritdoc IEmergencyManagement
     */
    function executePaymentWithMultiSig(
        PaymentRequest calldata request,
        bytes[] calldata guardianSignatures,
        bytes[] calldata zkProofs
    ) external nonReentrant returns (bool success) {
        // Validate emergency level requirement
        if (currentEmergencyLevel < request.requiredLevel) {
            revert InvalidEmergencyLevel(request.requiredLevel, currentEmergencyLevel);
        }

        // Check deadline
        if (block.timestamp > request.deadline) {
            revert InvalidEmergencyLevel(request.requiredLevel, currentEmergencyLevel);
        }

        // Verify payment request hasn't been executed
        if (paymentRequests[request.requestId].executed) {
            revert InvalidEmergencyLevel(request.requiredLevel, currentEmergencyLevel);
        }

        // Create EIP-712 message hash
        bytes32 structHash = keccak256(abi.encode(
            PAYMENT_REQUEST_TYPEHASH,
            request.requestId,
            request.recipient,
            request.amount,
            request.purpose,
            request.deadline,
            uint8(request.requiredLevel)
        ));
        bytes32 messageHash = _hashTypedDataV4(structHash);

        // Verify guardian threshold with ZK proofs
        (bool thresholdMet, uint256 validSignatures) = _verifyGuardianThresholdWithZK(
            guardianSignatures,
            zkProofs,
            messageHash,
            request.requiredLevel
        );

        if (!thresholdMet) {
            uint256 required = _getRequiredApprovals(request.requiredLevel);
            revert InsufficientSignatures(required, validSignatures);
        }

        // Store payment request
        paymentRequests[request.requestId] = request;
        paymentRequests[request.requestId].executed = true;

        // Execute payment (in a real implementation, this would interact with DeFi protocols)
        success = _executePayment(request);

        if (success) {
            emit PaymentExecuted(request.requestId, request.recipient, request.amount, validSignatures);
        }

        return success;
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function acknowledgeResolution() external onlyOwner {
        if (currentEmergencyLevel == EmergencyLevel.None) {
            revert InvalidEmergencyLevel(EmergencyLevel.Level1, currentEmergencyLevel);
        }

        lastOwnerResponse = block.timestamp;
        ownerResponseRequired = false;

        // Begin resolution process - in full implementation, this would start de-escalation
        emit ResolutionAcknowledged(msg.sender, block.timestamp);
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function checkAndAutoEscalate(bytes calldata escalationProof) external onlyGuardian {
        if (!ownerResponseRequired) {
            revert InvalidEmergencyLevel(EmergencyLevel.Level1, currentEmergencyLevel);
        }

        // Check if grace period has passed
        if (block.timestamp < lastOwnerResponse + OWNER_RESPONSE_GRACE_PERIOD) {
            revert TimelockNotExpired(0, (lastOwnerResponse + OWNER_RESPONSE_GRACE_PERIOD) - block.timestamp);
        }

        // Verify escalation authorization
        bytes32 operationHash = keccak256(abi.encodePacked("AUTO_ESCALATE", currentEmergencyLevel, msg.sender));
        if (!zkProofVerifier.verifyExecutionAuthorization(escalationProof, msg.sender, operationHash)) {
            revert InvalidZKProof(escalationProof);
        }

        EmergencyLevel oldLevel = currentEmergencyLevel;
        EmergencyLevel newLevel = _getNextEmergencyLevel(currentEmergencyLevel);

        if (newLevel != oldLevel) {
            currentEmergencyLevel = newLevel;
            lastOwnerResponse = block.timestamp; // Reset grace period
            
            emit EmergencyEscalated(oldLevel, newLevel, msg.sender);
        }
    }

    // ============ PHASE 3: DYNAMIC MANAGEMENT ============

    /**
     * @inheritdoc IEmergencyManagement
     */
    function proposeGuardianChange(
        address[] calldata newGuardians,
        uint256[3] calldata newThresholds,
        bytes calldata changeProof
    ) external onlyOwner returns (bytes32 proposalHash) {
        // Validate new configuration
        _validateGuardianConfig(newGuardians, newThresholds);

        // Verify change authorization proof
        proposalHash = keccak256(abi.encode(newGuardians, newThresholds, block.timestamp));
        bytes32 operationHash = keccak256(abi.encodePacked("GUARDIAN_CHANGE", proposalHash));
        
        if (!zkProofVerifier.verifyExecutionAuthorization(changeProof, msg.sender, operationHash)) {
            revert InvalidZKProof(changeProof);
        }

        guardianConfig.changeProposalHash = proposalHash;
        
        return proposalHash;
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function executeGuardianChange(
        address[] calldata newGuardians,
        uint256[3] calldata newThresholds,
        bytes32 /* proposalHash */
    ) external onlyOwner {
        // Verify proposal hash matches
        bytes32 expectedHash = keccak256(abi.encode(newGuardians, newThresholds, guardianConfig.lastUpdated));
        if (guardianConfig.changeProposalHash != expectedHash) {
            revert InvalidGuardianConfig("Proposal hash mismatch");
        }

        // Check timelock (simplified - in full implementation would have proper timelock)
        if (block.timestamp < guardianConfig.lastUpdated + guardianChangeTimelock) {
            revert TimelockNotExpired(0, (guardianConfig.lastUpdated + guardianChangeTimelock) - block.timestamp);
        }

        // Update guardian configuration
        guardianConfig.guardians = newGuardians;
        guardianConfig.requiredApprovalsForLevel1 = newThresholds[0];
        guardianConfig.requiredApprovalsForLevel2 = newThresholds[1];
        guardianConfig.requiredApprovalsForLevel3 = newThresholds[2];
        guardianConfig.lastUpdated = block.timestamp;
        guardianConfig.changeProposalHash = bytes32(0);

        emit GuardianConfigChanged(newGuardians, newThresholds, msg.sender);
    }

    // ============ ENHANCED VERIFICATION FUNCTIONS ============

    /**
     * @inheritdoc IEmergencyManagement
     */
    function verifyGuardianThreshold(
        bytes[] calldata signatures,
        bytes32 messageHash,
        EmergencyLevel level
    ) external view returns (bool verified, uint256 validCount) {
        return _verifyGuardianThreshold(signatures, messageHash, level);
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function validateGuardianZKProof(
        bytes calldata proof,
        bytes32 guardianCommitment,
        address guardian
    ) external view returns (bool isValid) {
        if (!isGuardian(guardian)) {
            return false;
        }

        bytes32 publicInputHash = keccak256(abi.encodePacked(guardianCommitment, guardian));
        return zkProofVerifier.verifyGuardianIdentity(proof, publicInputHash);
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function storeEncryptedEmergencyData(
        string calldata ipfsHash,
        bytes32 dataHash,
        bytes calldata zkProof
    ) external onlyOwner nonReentrant returns (bytes32 dataId) {
        // Verify data ownership proof
        bytes32 operationHash = keccak256(abi.encodePacked("STORE_DATA", ipfsHash, dataHash));
        if (!zkProofVerifier.verifyExecutionAuthorization(zkProof, msg.sender, operationHash)) {
            revert InvalidZKProof(zkProof);
        }

        // Store data reference
        dataId = keccak256(abi.encodePacked(msg.sender, ipfsHash, block.timestamp));
        levelDataCID[dataId] = ipfsHash;

        // Store in emergency data storage contract
        emergencyDataStorage.storeEncryptedEmergencyData(
            ipfsHash,
            dataHash,
            uint256(IEmergencyDataStorage.AccessLevel.OWNER_ONLY),
            zkProof
        );

        emit EmergencyDataStored(dataId, ipfsHash, msg.sender);
        return dataId;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @inheritdoc IEmergencyManagement
     */
    function getCurrentEmergencyState() external view returns (
        EmergencyLevel level,
        uint256 activatedAt,
        uint256 proposalId
    ) {
        return (currentEmergencyLevel, emergencyActivatedAt, activeProposalId);
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function getGuardianConfig() external view returns (GuardianConfig memory config) {
        return guardianConfig;
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function getEmergencyProposal(uint256 proposalId) external view returns (EmergencyProposal memory proposal) {
        return emergencyProposals[proposalId];
    }

    /**
     * @inheritdoc IEmergencyManagement
     */
    function isGuardian(address guardian) public view returns (bool) {
        address[] memory guardians = guardianConfig.guardians;
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == guardian) {
                return true;
            }
        }
        return false;
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Verifies guardian threshold with ZK proof validation
     */
    function _verifyGuardianThresholdWithZK(
        bytes[] calldata signatures,
        bytes[] calldata zkProofs,
        bytes32 messageHash,
        EmergencyLevel level
    ) internal view returns (bool thresholdMet, uint256 validCount) {
        if (signatures.length != zkProofs.length) {
            return (false, 0);
        }

        uint256 requiredApprovals = _getRequiredApprovals(level);
        address[] memory signers = new address[](signatures.length);
        validCount = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = messageHash.recover(signatures[i]);
            
            // Check if signer is a guardian and not already counted
            if (isGuardian(signer) && !_isAddressInArray(signer, signers, validCount)) {
                // Verify ZK proof for guardian identity
                bytes32 guardianCommitment = keccak256(abi.encodePacked(signer, block.timestamp));
                bytes32 publicInputHash = keccak256(abi.encodePacked(guardianCommitment, signer));
                
                if (zkProofVerifier.verifyGuardianIdentity(zkProofs[i], publicInputHash)) {
                    signers[validCount] = signer;
                    validCount++;
                }
            }
        }

        thresholdMet = validCount >= requiredApprovals;
    }

    /**
     * @dev Standard guardian threshold verification without ZK proofs
     */
    function _verifyGuardianThreshold(
        bytes[] calldata signatures,
        bytes32 messageHash,
        EmergencyLevel level
    ) internal view returns (bool verified, uint256 validCount) {
        uint256 requiredApprovals = _getRequiredApprovals(level);
        address[] memory signers = new address[](signatures.length);
        validCount = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = messageHash.recover(signatures[i]);
            
            if (isGuardian(signer) && !_isAddressInArray(signer, signers, validCount)) {
                signers[validCount] = signer;
                validCount++;
            }
        }

        verified = validCount >= requiredApprovals;
    }

    /**
     * @dev Gets required approvals for emergency level
     */
    function _getRequiredApprovals(EmergencyLevel level) internal view returns (uint256) {
        if (level == EmergencyLevel.Level1) return guardianConfig.requiredApprovalsForLevel1;
        if (level == EmergencyLevel.Level2) return guardianConfig.requiredApprovalsForLevel2;
        if (level == EmergencyLevel.Level3) return guardianConfig.requiredApprovalsForLevel3;
        return 0;
    }

    /**
     * @dev Gets next emergency level for escalation
     */
    function _getNextEmergencyLevel(EmergencyLevel current) internal pure returns (EmergencyLevel) {
        if (current == EmergencyLevel.Level1) return EmergencyLevel.Level2;
        if (current == EmergencyLevel.Level2) return EmergencyLevel.Level3;
        return current; // Level3 is maximum
    }

    /**
     * @dev Validates guardian configuration
     */
    function _validateGuardianConfig(
        address[] calldata guardians,
        uint256[3] calldata thresholds
    ) internal pure {
        if (guardians.length == 0 || guardians.length > MAX_GUARDIANS) {
            revert InvalidGuardianConfig("Invalid guardian count");
        }

        if (thresholds[0] > guardians.length || 
            thresholds[1] > guardians.length || 
            thresholds[2] > guardians.length) {
            revert InvalidGuardianConfig("Threshold exceeds guardian count");
        }

        if (thresholds[0] == 0 || thresholds[1] == 0 || thresholds[2] == 0) {
            revert InvalidGuardianConfig("Threshold cannot be zero");
        }

        // Check for duplicate guardians
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == address(0)) {
                revert InvalidGuardianConfig("Guardian cannot be zero address");
            }
            for (uint256 j = i + 1; j < guardians.length; j++) {
                if (guardians[i] == guardians[j]) {
                    revert InvalidGuardianConfig("Duplicate guardian");
                }
            }
        }
    }

    /**
     * @dev Checks if address is already in array (up to length)
     */
    function _isAddressInArray(
        address addr,
        address[] memory array,
        uint256 length
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < length; i++) {
            if (array[i] == addr) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Executes payment (placeholder - would integrate with DeFi protocols)
     */
    function _executePayment(PaymentRequest calldata /* request */) internal pure returns (bool) {
        // In a real implementation, this would:
        // 1. Interact with DeFi protocols (Uniswap, Aave, etc.)
        // 2. Execute token transfers
        // 3. Handle cross-chain operations
        // 4. Implement slippage protection
        
        // For now, return true as placeholder
        return true;
    }

    /**
     * @dev Authorizes contract upgrades (UUPS pattern)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Returns the current version for upgrade compatibility
     */
    function getVersion() external pure returns (string memory) {
        return VERSION;
    }
}