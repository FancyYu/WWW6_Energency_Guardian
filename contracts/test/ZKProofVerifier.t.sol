// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/ZKProofVerifier.sol";

/**
 * @title ZKProofVerifierTest
 * @dev Unit tests for ZKProofVerifier contract
 */
contract ZKProofVerifierTest is Test {
    ZKProofVerifier public zkVerifier;
    
    address public owner;
    address public keyManager1;
    address public keyManager2;
    address public nonManager;
    
    event VerificationKeyUpdated(uint256 indexed proofType, bytes32 vkHash, uint256 version);
    event ProofVerified(uint256 indexed proofType, bytes32 publicInputHash, bool result);
    
    function setUp() public {
        owner = makeAddr("owner");
        keyManager1 = makeAddr("keyManager1");
        keyManager2 = makeAddr("keyManager2");
        nonManager = makeAddr("nonManager");
        
        // Deploy ZK Proof Verifier
        zkVerifier = new ZKProofVerifier();
        
        address[] memory keyManagers = new address[](2);
        keyManagers[0] = keyManager1;
        keyManagers[1] = keyManager2;
        
        zkVerifier.initialize(owner, keyManagers);
    }
    
    function testInitialization() public view {
        // Test key managers
        assertTrue(zkVerifier.isKeyManager(keyManager1));
        assertTrue(zkVerifier.isKeyManager(keyManager2));
        assertFalse(zkVerifier.isKeyManager(nonManager));
        
        // Test batch configuration
        (uint256 maxBatchSize, bool enabled) = zkVerifier.batchConfig();
        assertEq(maxBatchSize, 10);
        assertTrue(enabled);
        
        // Test initial verification keys are inactive
        IZKProofVerifier.VerificationKey memory vk = zkVerifier.getVerificationKey(0);
        assertFalse(vk.active);
    }
    
    function testUpdateVerificationKey() public {
        uint256 proofType = uint256(IZKProofVerifier.ProofType.GUARDIAN_IDENTITY);
        bytes32 vkHash = keccak256("test_verification_key");
        
        vm.startPrank(keyManager1);
        vm.expectEmit(true, false, false, true);
        emit VerificationKeyUpdated(proofType, vkHash, 1);
        
        zkVerifier.updateVerificationKey(proofType, vkHash);
        vm.stopPrank();
        
        // Verify key was updated
        IZKProofVerifier.VerificationKey memory vk = zkVerifier.getVerificationKey(proofType);
        assertEq(vk.proofType, proofType);
        assertEq(vk.vkHash, vkHash);
        assertEq(vk.version, 1);
        assertTrue(vk.active);
    }
    
    function testUpdateVerificationKeyUnauthorized() public {
        uint256 proofType = 0;
        bytes32 vkHash = keccak256("unauthorized_key");
        
        vm.startPrank(nonManager);
        vm.expectRevert();
        zkVerifier.updateVerificationKey(proofType, vkHash);
        vm.stopPrank();
    }
    
    function testUpdateVerificationKeyByOwner() public {
        uint256 proofType = 1;
        bytes32 vkHash = keccak256("owner_key");
        
        vm.startPrank(owner);
        zkVerifier.updateVerificationKey(proofType, vkHash);
        vm.stopPrank();
        
        IZKProofVerifier.VerificationKey memory vk = zkVerifier.getVerificationKey(proofType);
        assertTrue(vk.active);
        assertEq(vk.vkHash, vkHash);
    }
    
    function testDeactivateVerificationKey() public {
        // First activate a key
        uint256 proofType = 0;
        bytes32 vkHash = keccak256("test_key");
        
        vm.prank(keyManager1);
        zkVerifier.updateVerificationKey(proofType, vkHash);
        
        // Verify it's active
        assertTrue(zkVerifier.getVerificationKey(proofType).active);
        
        // Deactivate it
        vm.prank(keyManager1);
        zkVerifier.deactivateVerificationKey(proofType);
        
        // Verify it's inactive
        assertFalse(zkVerifier.getVerificationKey(proofType).active);
    }
    
    function testVerifyGuardianIdentity() public {
        // Set up verification key
        uint256 proofType = uint256(IZKProofVerifier.ProofType.GUARDIAN_IDENTITY);
        bytes32 vkHash = keccak256("guardian_identity_key");
        
        vm.prank(keyManager1);
        zkVerifier.updateVerificationKey(proofType, vkHash);
        
        // Create mock proof (256 bytes for Groth16)
        bytes memory proof = new bytes(256);
        for (uint256 i = 0; i < 256; i++) {
            proof[i] = bytes1(uint8(i % 256));
        }
        
        bytes32 publicInputHash = keccak256("guardian_commitment");
        
        // Verify proof
        bool result = zkVerifier.verifyGuardianIdentity(proof, publicInputHash);
        
        // Result depends on simulation logic, but should not revert
        // In the simulation, we expect ~95% success rate
        console.log("Guardian identity verification result:", result);
    }
    
    function testVerifyEmergencyProof() public {
        // Set up verification key
        uint256 proofType = uint256(IZKProofVerifier.ProofType.EMERGENCY_STATE);
        bytes32 vkHash = keccak256("emergency_state_key");
        
        vm.prank(keyManager1);
        zkVerifier.updateVerificationKey(proofType, vkHash);
        
        // Create mock proof
        bytes memory proof = new bytes(256);
        for (uint256 i = 0; i < 256; i++) {
            proof[i] = bytes1(uint8((i * 7) % 256)); // Different pattern
        }
        
        bytes32 emergencyHash = keccak256("emergency_situation");
        
        bool result = zkVerifier.verifyEmergencyProof(proof, emergencyHash);
        console.log("Emergency proof verification result:", result);
    }
    
    function testVerifyExecutionAuthorization() public {
        // Set up verification key
        uint256 proofType = uint256(IZKProofVerifier.ProofType.EXECUTION_AUTHORIZATION);
        bytes32 vkHash = keccak256("execution_auth_key");
        
        vm.prank(keyManager1);
        zkVerifier.updateVerificationKey(proofType, vkHash);
        
        // Create mock proof
        bytes memory proof = new bytes(256);
        for (uint256 i = 0; i < 256; i++) {
            proof[i] = bytes1(uint8((i * 13) % 256)); // Another pattern
        }
        
        address executor = makeAddr("executor");
        bytes32 operationHash = keccak256("operation_data");
        
        bool result = zkVerifier.verifyExecutionAuthorization(proof, executor, operationHash);
        console.log("Execution authorization verification result:", result);
    }
    
    function testVerifyProofInactiveKey() public {
        // Try to verify without setting up verification key
        bytes memory proof = new bytes(256);
        bytes32 publicInputHash = keccak256("test");
        
        vm.expectRevert(abi.encodeWithSelector(IZKProofVerifier.InvalidVerificationKey.selector, 0));
        zkVerifier.verifyGuardianIdentity(proof, publicInputHash);
    }
    
    function testBatchVerifyProofs() public {
        // Set up verification keys for all proof types
        vm.startPrank(keyManager1);
        zkVerifier.updateVerificationKey(0, keccak256("key0"));
        zkVerifier.updateVerificationKey(1, keccak256("key1"));
        zkVerifier.updateVerificationKey(2, keccak256("key2"));
        vm.stopPrank();
        
        // Create batch of proofs
        bytes[] memory proofs = new bytes[](3);
        uint256[] memory proofTypes = new uint256[](3);
        bytes32[] memory publicInputs = new bytes32[](3);
        
        for (uint256 i = 0; i < 3; i++) {
            proofs[i] = new bytes(256);
            for (uint256 j = 0; j < 256; j++) {
                proofs[i][j] = bytes1(uint8((i * j + 1) % 256));
            }
            proofTypes[i] = i;
            publicInputs[i] = keccak256(abi.encodePacked("input", i));
        }
        
        bool[] memory results = zkVerifier.batchVerifyProofs(proofs, proofTypes, publicInputs);
        
        assertEq(results.length, 3);
        console.log("Batch verification results:");
        for (uint256 i = 0; i < results.length; i++) {
            console.log("  Proof", i, ":", results[i]);
        }
    }
    
    function testBatchVerifyProofsArrayLengthMismatch() public {
        bytes[] memory proofs = new bytes[](2);
        uint256[] memory proofTypes = new uint256[](3); // Different length
        bytes32[] memory publicInputs = new bytes32[](2);
        
        vm.expectRevert(IZKProofVerifier.ArrayLengthMismatch.selector);
        zkVerifier.batchVerifyProofs(proofs, proofTypes, publicInputs);
    }
    
    function testUpdateCircuitParams() public {
        uint256 proofType = 0;
        uint256 publicInputCount = 5;
        uint256 constraintCount = 2000;
        bytes32 circuitHash = keccak256("new_circuit");
        
        vm.prank(keyManager1);
        zkVerifier.updateCircuitParams(proofType, publicInputCount, constraintCount, circuitHash);
        
        (uint256 inputCount, uint256 constraints, bytes32 hash, bool active) = zkVerifier.circuitParams(proofType);
        assertEq(inputCount, publicInputCount);
        assertEq(constraints, constraintCount);
        assertEq(hash, circuitHash);
        assertTrue(active);
    }
    
    function testAddRemoveKeyManager() public {
        address newManager = makeAddr("newManager");
        
        // Add key manager
        vm.prank(owner);
        zkVerifier.addKeyManager(newManager);
        assertTrue(zkVerifier.isKeyManager(newManager));
        
        // Remove key manager
        vm.prank(owner);
        zkVerifier.removeKeyManager(newManager);
        assertFalse(zkVerifier.isKeyManager(newManager));
    }
    
    function testAddKeyManagerUnauthorized() public {
        address newManager = makeAddr("newManager");
        
        vm.startPrank(nonManager);
        vm.expectRevert();
        zkVerifier.addKeyManager(newManager);
        vm.stopPrank();
    }
    
    function testUpdateBatchConfig() public {
        uint256 newMaxBatchSize = 20;
        bool newEnabled = false;
        
        vm.prank(owner);
        zkVerifier.updateBatchConfig(newMaxBatchSize, newEnabled);
        
        (uint256 maxBatchSize, bool enabled) = zkVerifier.batchConfig();
        assertEq(maxBatchSize, newMaxBatchSize);
        assertEq(enabled, newEnabled);
    }
    
    function testGetVerificationStats() public view {
        uint256 proofType = 0;
        
        (uint256 total, uint256 failed, uint256 successRate) = zkVerifier.getVerificationStats(proofType);
        
        // Initially should be zero
        assertEq(total, 0);
        assertEq(failed, 0);
        assertEq(successRate, 0);
    }
    
    function testPauseAllVerifications() public {
        // Set up some verification keys
        vm.startPrank(keyManager1);
        zkVerifier.updateVerificationKey(0, keccak256("key0"));
        zkVerifier.updateVerificationKey(1, keccak256("key1"));
        vm.stopPrank();
        
        // Verify they're active
        assertTrue(zkVerifier.getVerificationKey(0).active);
        assertTrue(zkVerifier.getVerificationKey(1).active);
        
        // Pause all verifications
        vm.prank(owner);
        zkVerifier.pauseAllVerifications();
        
        // Verify they're all inactive
        assertFalse(zkVerifier.getVerificationKey(0).active);
        assertFalse(zkVerifier.getVerificationKey(1).active);
    }
    
    function testGetVersion() public view {
        string memory version = zkVerifier.getVersion();
        assertEq(version, "1.0.0");
    }
}