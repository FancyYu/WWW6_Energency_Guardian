// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/interfaces/IZKProofVerifier.sol";

/**
 * @title MockZKProofVerifier
 * @dev Mock ZK proof verifier for testing that allows configurable results
 */
contract MockZKProofVerifier is IZKProofVerifier {
    mapping(uint256 => VerificationKey) public verificationKeys;
    
    // Configurable verification results for testing
    bool private _verificationResult = true;
    
    function setVerificationResult(bool result) external {
        _verificationResult = result;
    }
    
    function verifyGuardianIdentity(
        bytes calldata /* proof */,
        bytes32 /* publicInputHash */
    ) external view returns (bool isValid) {
        return _verificationResult;
    }

    function verifyEmergencyProof(
        bytes calldata /* proof */,
        bytes32 /* emergencyHash */
    ) external view returns (bool isValid) {
        return _verificationResult;
    }

    function verifyExecutionAuthorization(
        bytes calldata /* proof */,
        address /* executor */,
        bytes32 /* operationHash */
    ) external view returns (bool isValid) {
        return _verificationResult;
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
    ) external view returns (bool[] memory results) {
        results = new bool[](proofs.length);
        for (uint256 i = 0; i < proofs.length; i++) {
            results[i] = _verificationResult;
        }
        return results;
    }
}