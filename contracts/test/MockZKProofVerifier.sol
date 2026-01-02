// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/interfaces/IZKProofVerifier.sol";

/**
 * @title MockZKProofVerifier
 * @dev Mock ZK proof verifier for testing that always returns true
 */
contract MockZKProofVerifier is IZKProofVerifier {
    mapping(uint256 => VerificationKey) public verificationKeys;
    
    function verifyGuardianIdentity(
        bytes calldata /* proof */,
        bytes32 /* publicInputHash */
    ) external pure returns (bool isValid) {
        // Always return true for testing
        return true;
    }

    function verifyEmergencyProof(
        bytes calldata /* proof */,
        bytes32 /* emergencyHash */
    ) external pure returns (bool isValid) {
        // Always return true for testing
        return true;
    }

    function verifyExecutionAuthorization(
        bytes calldata /* proof */,
        address /* executor */,
        bytes32 /* operationHash */
    ) external pure returns (bool isValid) {
        // Always return true for testing
        return true;
    }

    function updateVerificationKey(
        uint256 proofType,
        bytes32 vkHash
    ) external {
        verificationKeys[proofType] = VerificationKey({
            proofType: proofType,
            vkHash: vkHash,
            version: 1,
            active: true
        });
        emit VerificationKeyUpdated(proofType, vkHash, 1);
    }

    function getVerificationKey(uint256 proofType) external view returns (VerificationKey memory vk) {
        return verificationKeys[proofType];
    }

    function batchVerifyProofs(
        bytes[] calldata proofs,
        uint256[] calldata /* proofTypes */,
        bytes32[] calldata /* publicInputs */
    ) external pure returns (bool[] memory results) {
        results = new bool[](proofs.length);
        for (uint256 i = 0; i < proofs.length; i++) {
            results[i] = true; // Always return true for testing
        }
        return results;
    }
}