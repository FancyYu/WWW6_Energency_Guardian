// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IEmergencyManagement
 * @dev Interface for the main Emergency Guardian management contract
 * @notice Defines the three-phase emergency management system with ZKP integration
 */
interface IEmergencyManagement {
    /// @dev Emergency levels with progressive access rights
    enum EmergencyLevel {
        None,     // No emergency state
        Level1,   // Initial emergency - limited access
        Level2,   // Escalated emergency - expanded access  
        Level3    // Critical emergency - full access
    }

    /// @dev Proposal status in the timelock system
    enum ProposalStatus {
        Pending,    // Proposal created, waiting for timelock
        Active,     // Timelock passed, can be executed
        Executed,   // Proposal has been executed
        Cancelled   // Proposal was cancelled
    }

    /// @dev Emergency proposal structure
    struct EmergencyProposal {
        uint256 proposalId;
        address proposer;
        bytes evidence;
        bytes32 evidenceHash;
        uint256 proposedAt;
        uint256 timelock;
        ProposalStatus status;
        EmergencyLevel targetLevel;
        bytes zkProof;
    }

    /// @dev Payment request structure for emergency operations
    struct PaymentRequest {
        bytes32 requestId;
        address recipient;
        uint256 amount;
        bytes32 purpose;
        uint256 deadline;
        EmergencyLevel requiredLevel;
        bool executed;
    }

    /// @dev Guardian configuration
    struct GuardianConfig {
        address[] guardians;
        uint256 requiredApprovalsForLevel1;
        uint256 requiredApprovalsForLevel2;
        uint256 requiredApprovalsForLevel3;
        uint256 lastUpdated;
        bytes32 changeProposalHash;
    }

    /// @dev Multi-signature verification record
    struct MultiSigRecord {
        bytes32 messageHash;
        address[] signers;
        bytes[] signatures;
        uint256 validSignatures;
        uint256 requiredSignatures;
        bool verified;
    }

    // ============ PHASE 1: TRIGGER & ACTIVATION ============

    /**
     * @notice Proposes an emergency situation with evidence
     * @param evidence Encrypted evidence of emergency situation
     * @param evidenceHash Hash of the evidence for integrity
     * @param zkProof Zero-knowledge proof of emergency validity
     * @return proposalId Unique identifier for the emergency proposal
     */
    function proposeEmergency(
        bytes calldata evidence,
        bytes32 evidenceHash,
        bytes calldata zkProof
    ) external returns (uint256 proposalId);

    /**
     * @notice Cancels a pending emergency proposal (owner only)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelEmergencyProposal(uint256 proposalId) external;

    /**
     * @notice Activates emergency after timelock period
     * @param proposalId ID of the proposal to activate
     * @param activationProof ZK proof of activation authorization
     */
    function activateEmergency(
        uint256 proposalId,
        bytes calldata activationProof
    ) external;

    // ============ PHASE 2: PAYMENT & FAULT TOLERANCE ============

    /**
     * @notice Executes payment with enhanced multi-signature verification
     * @param request Payment request details
     * @param guardianSignatures Array of guardian signatures
     * @param zkProofs Array of ZK proofs for guardian identity verification
     * @return success True if payment was executed successfully
     */
    function executePaymentWithMultiSig(
        PaymentRequest calldata request,
        bytes[] calldata guardianSignatures,
        bytes[] calldata zkProofs
    ) external returns (bool success);

    /**
     * @notice Owner acknowledges resolution of emergency
     */
    function acknowledgeResolution() external;

    /**
     * @notice AI agent checks and auto-escalates if owner doesn't respond
     * @param escalationProof ZK proof of escalation authorization
     */
    function checkAndAutoEscalate(bytes calldata escalationProof) external;

    // ============ PHASE 3: DYNAMIC MANAGEMENT ============

    /**
     * @notice Proposes guardian configuration changes
     * @param newGuardians Array of new guardian addresses
     * @param newThresholds Array of new approval thresholds [L1, L2, L3]
     * @param changeProof ZK proof of change authorization
     * @return proposalHash Hash of the change proposal
     */
    function proposeGuardianChange(
        address[] calldata newGuardians,
        uint256[3] calldata newThresholds,
        bytes calldata changeProof
    ) external returns (bytes32 proposalHash);

    /**
     * @notice Executes guardian configuration changes after timelock
     * @param newGuardians Array of new guardian addresses
     * @param newThresholds Array of new approval thresholds
     * @param proposalHash Hash of the original proposal
     */
    function executeGuardianChange(
        address[] calldata newGuardians,
        uint256[3] calldata newThresholds,
        bytes32 proposalHash
    ) external;

    // ============ ENHANCED VERIFICATION FUNCTIONS ============

    /**
     * @notice Verifies guardian threshold for specific emergency level
     * @param signatures Array of signatures to verify
     * @param messageHash Hash of the message that was signed
     * @param level Emergency level to check threshold for
     * @return verified True if threshold is met
     * @return validCount Number of valid signatures
     */
    function verifyGuardianThreshold(
        bytes[] calldata signatures,
        bytes32 messageHash,
        EmergencyLevel level
    ) external view returns (bool verified, uint256 validCount);

    /**
     * @notice Validates guardian ZK proof for identity verification
     * @param proof ZK proof of guardian identity
     * @param guardianCommitment Commitment to guardian identity
     * @param guardian Guardian address to verify
     * @return isValid True if proof is valid for the guardian
     */
    function validateGuardianZKProof(
        bytes calldata proof,
        bytes32 guardianCommitment,
        address guardian
    ) external view returns (bool isValid);

    /**
     * @notice Stores encrypted emergency data with IPFS integration
     * @param ipfsHash IPFS hash of encrypted emergency data
     * @param dataHash Hash of original data for integrity
     * @param zkProof ZK proof of data ownership
     * @return dataId Unique identifier for stored data
     */
    function storeEncryptedEmergencyData(
        string calldata ipfsHash,
        bytes32 dataHash,
        bytes calldata zkProof
    ) external returns (bytes32 dataId);

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Gets current emergency state
     * @return level Current emergency level
     * @return activatedAt Timestamp when current level was activated
     * @return proposalId ID of the active emergency proposal
     */
    function getCurrentEmergencyState() external view returns (
        EmergencyLevel level,
        uint256 activatedAt,
        uint256 proposalId
    );

    /**
     * @notice Gets guardian configuration
     * @return config Current guardian configuration
     */
    function getGuardianConfig() external view returns (GuardianConfig memory config);

    /**
     * @notice Gets emergency proposal details
     * @param proposalId ID of the proposal to query
     * @return proposal Emergency proposal structure
     */
    function getEmergencyProposal(uint256 proposalId) external view returns (EmergencyProposal memory proposal);

    /**
     * @notice Checks if address is authorized guardian
     * @param guardian Address to check
     * @return isGuardian True if address is a guardian
     */
    function isGuardian(address guardian) external view returns (bool isGuardian);

    // ============ EVENTS ============

    /// @dev Emitted when emergency proposal is created
    event EmergencyProposed(
        uint256 indexed proposalId,
        address indexed proposer,
        bytes32 evidenceHash,
        EmergencyLevel targetLevel
    );

    /// @dev Emitted when emergency is activated
    event EmergencyActivated(
        uint256 indexed proposalId,
        EmergencyLevel level,
        address activatedBy
    );

    /// @dev Emitted when payment is executed
    event PaymentExecuted(
        bytes32 indexed requestId,
        address indexed recipient,
        uint256 amount,
        uint256 validSignatures
    );

    /// @dev Emitted when owner acknowledges resolution
    event ResolutionAcknowledged(
        address indexed owner,
        uint256 timestamp
    );

    /// @dev Emitted when emergency is auto-escalated
    event EmergencyEscalated(
        EmergencyLevel fromLevel,
        EmergencyLevel toLevel,
        address escalatedBy
    );

    /// @dev Emitted when guardian configuration changes
    event GuardianConfigChanged(
        address[] newGuardians,
        uint256[3] newThresholds,
        address changedBy
    );

    /// @dev Emitted when emergency data is stored
    event EmergencyDataStored(
        bytes32 indexed dataId,
        string ipfsHash,
        address indexed owner
    );

    // ============ ERRORS ============

    /// @dev Thrown when caller is not authorized for operation
    error UnauthorizedCaller(address caller);

    /// @dev Thrown when emergency proposal is not found
    error ProposalNotFound(uint256 proposalId);

    /// @dev Thrown when timelock period has not passed
    error TimelockNotExpired(uint256 proposalId, uint256 remainingTime);

    /// @dev Thrown when multi-signature threshold is not met
    error InsufficientSignatures(uint256 required, uint256 provided);

    /// @dev Thrown when ZK proof verification fails
    error InvalidZKProof(bytes proof);

    /// @dev Thrown when emergency level is invalid for operation
    error InvalidEmergencyLevel(EmergencyLevel required, EmergencyLevel current);

    /// @dev Thrown when guardian configuration is invalid
    error InvalidGuardianConfig(string reason);
}