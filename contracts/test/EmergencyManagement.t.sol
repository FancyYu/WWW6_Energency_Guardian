// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/EmergencyManagement.sol";
import "../src/ZKProofVerifier.sol";
import "../src/interfaces/IEmergencyDataStorage.sol";
import "./MockZKProofVerifier.sol";

/**
 * @title EmergencyManagementTest
 * @dev Basic unit tests for EmergencyManagement contract
 */
contract EmergencyManagementTest is Test {
    EmergencyManagement public emergencyManagement;
    MockZKProofVerifier public zkProofVerifier;
    
    address public owner;
    address public guardian1;
    address public guardian2;
    address public guardian3;
    address public nonGuardian;
    
    address[] public guardians;
    uint256[3] public thresholds;
    
    // Mock emergency data storage (simplified for testing)
    MockEmergencyDataStorage public mockDataStorage;
    
    event EmergencyProposed(uint256 indexed proposalId, address indexed proposer, bytes32 evidenceHash, IEmergencyManagement.EmergencyLevel targetLevel);
    event EmergencyActivated(uint256 indexed proposalId, IEmergencyManagement.EmergencyLevel level, address activatedBy);
    
    function setUp() public {
        // Set up test accounts
        owner = makeAddr("owner");
        guardian1 = makeAddr("guardian1");
        guardian2 = makeAddr("guardian2");
        guardian3 = makeAddr("guardian3");
        nonGuardian = makeAddr("nonGuardian");
        
        // Set up guardian configuration
        guardians.push(guardian1);
        guardians.push(guardian2);
        guardians.push(guardian3);
        
        thresholds[0] = 2; // Level 1: 2 signatures
        thresholds[1] = 2; // Level 2: 2 signatures
        thresholds[2] = 3; // Level 3: 3 signatures
        
        // Deploy ZK Proof Verifier
        zkProofVerifier = new MockZKProofVerifier();
        zkProofVerifier.updateVerificationKey(0, keccak256("guardian_identity_key"));
        zkProofVerifier.updateVerificationKey(1, keccak256("emergency_state_key"));
        zkProofVerifier.updateVerificationKey(2, keccak256("execution_auth_key"));
        
        // Deploy mock data storage
        mockDataStorage = new MockEmergencyDataStorage();
        
        // Deploy Emergency Management contract
        emergencyManagement = new EmergencyManagement();
        emergencyManagement.initialize(
            owner,
            guardians,
            thresholds,
            address(zkProofVerifier),
            address(mockDataStorage)
        );
    }
    
    function testInitialization() public view {
        // Test initial state
        (IEmergencyManagement.EmergencyLevel level, uint256 activatedAt, uint256 proposalId) = 
            emergencyManagement.getCurrentEmergencyState();
        
        assertEq(uint256(level), uint256(IEmergencyManagement.EmergencyLevel.None));
        assertEq(activatedAt, 0);
        assertEq(proposalId, 0);
        
        // Test guardian configuration
        IEmergencyManagement.GuardianConfig memory config = emergencyManagement.getGuardianConfig();
        assertEq(config.guardians.length, 3);
        assertEq(config.requiredApprovalsForLevel1, 2);
        assertEq(config.requiredApprovalsForLevel2, 2);
        assertEq(config.requiredApprovalsForLevel3, 3);
        
        // Test guardian membership
        assertTrue(emergencyManagement.isGuardian(guardian1));
        assertTrue(emergencyManagement.isGuardian(guardian2));
        assertTrue(emergencyManagement.isGuardian(guardian3));
        assertFalse(emergencyManagement.isGuardian(nonGuardian));
    }
    
    function testProposeEmergency() public {
        bytes memory evidence = "Emergency evidence data";
        bytes32 evidenceHash = keccak256(evidence);
        bytes memory zkProof = "mock_zk_proof_data";
        
        // Test proposal by guardian
        vm.startPrank(guardian1);
        vm.expectEmit(true, true, false, true);
        emit EmergencyProposed(1, guardian1, evidenceHash, IEmergencyManagement.EmergencyLevel.Level1);
        
        uint256 proposalId = emergencyManagement.proposeEmergency(evidence, evidenceHash, zkProof);
        assertEq(proposalId, 1);
        vm.stopPrank();
        
        // Verify proposal details
        IEmergencyManagement.EmergencyProposal memory proposal = emergencyManagement.getEmergencyProposal(proposalId);
        assertEq(proposal.proposalId, proposalId);
        assertEq(proposal.proposer, guardian1);
        assertEq(proposal.evidenceHash, evidenceHash);
        assertEq(uint256(proposal.status), uint256(IEmergencyManagement.ProposalStatus.Pending));
        assertEq(uint256(proposal.targetLevel), uint256(IEmergencyManagement.EmergencyLevel.Level1));
    }
    
    function testProposeEmergencyByOwner() public {
        bytes memory evidence = "Owner emergency evidence";
        bytes32 evidenceHash = keccak256(evidence);
        bytes memory zkProof = "mock_owner_zk_proof";
        
        vm.startPrank(owner);
        uint256 proposalId = emergencyManagement.proposeEmergency(evidence, evidenceHash, zkProof);
        assertEq(proposalId, 1);
        vm.stopPrank();
        
        IEmergencyManagement.EmergencyProposal memory proposal = emergencyManagement.getEmergencyProposal(proposalId);
        assertEq(proposal.proposer, owner);
    }
    
    function testProposeEmergencyUnauthorized() public {
        bytes memory evidence = "Unauthorized evidence";
        bytes32 evidenceHash = keccak256(evidence);
        bytes memory zkProof = "mock_unauthorized_proof";
        
        vm.startPrank(nonGuardian);
        vm.expectRevert(abi.encodeWithSelector(IEmergencyManagement.UnauthorizedCaller.selector, nonGuardian));
        emergencyManagement.proposeEmergency(evidence, evidenceHash, zkProof);
        vm.stopPrank();
    }
    
    function testCancelEmergencyProposal() public {
        // First create a proposal
        bytes memory evidence = "Test evidence";
        bytes32 evidenceHash = keccak256(evidence);
        bytes memory zkProof = "mock_proof";
        
        vm.prank(guardian1);
        uint256 proposalId = emergencyManagement.proposeEmergency(evidence, evidenceHash, zkProof);
        
        // Cancel the proposal as owner
        vm.prank(owner);
        emergencyManagement.cancelEmergencyProposal(proposalId);
        
        // Verify proposal is cancelled
        IEmergencyManagement.EmergencyProposal memory proposal = emergencyManagement.getEmergencyProposal(proposalId);
        assertEq(uint256(proposal.status), uint256(IEmergencyManagement.ProposalStatus.Cancelled));
    }
    
    function testCancelEmergencyProposalUnauthorized() public {
        // Create a proposal
        vm.prank(guardian1);
        uint256 proposalId = emergencyManagement.proposeEmergency("evidence", keccak256("evidence"), "proof");
        
        // Try to cancel as non-owner
        vm.startPrank(guardian1);
        vm.expectRevert();
        emergencyManagement.cancelEmergencyProposal(proposalId);
        vm.stopPrank();
    }
    
    function testActivateEmergency() public {
        // Create a proposal
        vm.prank(guardian1);
        uint256 proposalId = emergencyManagement.proposeEmergency("evidence", keccak256("evidence"), "proof");
        
        // Fast forward past timelock
        vm.warp(block.timestamp + 3 hours);
        
        // Activate emergency
        bytes memory activationProof = "activation_proof";
        
        vm.startPrank(guardian2);
        vm.expectEmit(true, false, false, true);
        emit EmergencyActivated(proposalId, IEmergencyManagement.EmergencyLevel.Level1, guardian2);
        
        emergencyManagement.activateEmergency(proposalId, activationProof);
        vm.stopPrank();
        
        // Verify emergency state
        (IEmergencyManagement.EmergencyLevel level, uint256 activatedAt, uint256 activeId) = 
            emergencyManagement.getCurrentEmergencyState();
        
        assertEq(uint256(level), uint256(IEmergencyManagement.EmergencyLevel.Level1));
        assertEq(activeId, proposalId);
        assertGt(activatedAt, 0);
    }
    
    function testActivateEmergencyTimelockNotExpired() public {
        // Create a proposal
        vm.prank(guardian1);
        uint256 proposalId = emergencyManagement.proposeEmergency("evidence", keccak256("evidence"), "proof");
        
        // Try to activate before timelock expires
        vm.startPrank(guardian2);
        vm.expectRevert();
        emergencyManagement.activateEmergency(proposalId, "proof");
        vm.stopPrank();
    }
    
    function testIsGuardian() public view {
        assertTrue(emergencyManagement.isGuardian(guardian1));
        assertTrue(emergencyManagement.isGuardian(guardian2));
        assertTrue(emergencyManagement.isGuardian(guardian3));
        assertFalse(emergencyManagement.isGuardian(owner));
        assertFalse(emergencyManagement.isGuardian(nonGuardian));
    }
    
    function testGetGuardianConfig() public view {
        IEmergencyManagement.GuardianConfig memory config = emergencyManagement.getGuardianConfig();
        
        assertEq(config.guardians.length, 3);
        assertEq(config.guardians[0], guardian1);
        assertEq(config.guardians[1], guardian2);
        assertEq(config.guardians[2], guardian3);
        assertEq(config.requiredApprovalsForLevel1, 2);
        assertEq(config.requiredApprovalsForLevel2, 2);
        assertEq(config.requiredApprovalsForLevel3, 3);
    }
    
    function testStoreEncryptedEmergencyData() public {
        string memory ipfsHash = "QmTest123";
        bytes32 dataHash = keccak256("test_data");
        bytes memory zkProof = "data_ownership_proof";
        
        vm.startPrank(owner);
        bytes32 dataId = emergencyManagement.storeEncryptedEmergencyData(ipfsHash, dataHash, zkProof);
        vm.stopPrank();
        
        // Verify data was stored (basic check)
        assertNotEq(dataId, bytes32(0));
    }
    
    function testStoreEncryptedEmergencyDataUnauthorized() public {
        vm.startPrank(nonGuardian);
        vm.expectRevert();
        emergencyManagement.storeEncryptedEmergencyData("hash", keccak256("data"), "proof");
        vm.stopPrank();
    }
}

/**
 * @dev Mock Emergency Data Storage contract for testing
 */
contract MockEmergencyDataStorage is IEmergencyDataStorage {
    mapping(bytes32 => EmergencyDataRef) private dataRefs;
    mapping(address => bytes32[]) private ownerData;
    
    function storeEncryptedEmergencyData(
        string calldata ipfsHash,
        bytes32 dataHash,
        uint256 accessLevel,
        bytes calldata /* zkProof */
    ) external returns (bytes32 dataId) {
        dataId = keccak256(abi.encodePacked(msg.sender, ipfsHash, block.timestamp));
        
        dataRefs[dataId] = EmergencyDataRef({
            ipfsHash: ipfsHash,
            dataHash: dataHash,
            timestamp: block.timestamp,
            owner: msg.sender,
            accessLevel: accessLevel,
            active: true
        });
        
        ownerData[msg.sender].push(dataId);
        
        emit EmergencyDataStored(dataId, msg.sender, ipfsHash, accessLevel);
        return dataId;
    }
    
    function getEmergencyDataRef(
        bytes32 dataId,
        address /* requester */,
        bytes calldata /* accessProof */
    ) external view returns (EmergencyDataRef memory dataRef) {
        return dataRefs[dataId];
    }
    
    function updateDataAccessLevel(
        bytes32 dataId,
        uint256 newAccessLevel,
        bytes calldata /* authorizationProof */
    ) external {
        dataRefs[dataId].accessLevel = newAccessLevel;
        emit DataAccessLevelUpdated(dataId, dataRefs[dataId].accessLevel, newAccessLevel, msg.sender);
    }
    
    function revokeDataAccess(
        bytes32 dataId,
        string calldata reason
    ) external {
        dataRefs[dataId].active = false;
        emit DataAccessRevoked(dataId, msg.sender, reason);
    }
    
    function getOwnerDataRefs(address owner) external view returns (bytes32[] memory dataIds) {
        return ownerData[owner];
    }
    
    function verifyDataIntegrity(
        bytes32 dataId,
        bytes32 providedHash
    ) external view returns (bool isValid) {
        return dataRefs[dataId].dataHash == providedHash;
    }
}