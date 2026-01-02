// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IZKProofVerifier
 * @dev Interface for zero-knowledge proof verification in Emergency Guardian system
 * @notice Supports multiple proof types for identity, emergency state, and authorization verification
 */
interface IZKProofVerifier {
    /// @dev Proof types supported by the verifier
    enum ProofType {
        GUARDIAN_IDENTITY,      // Proves guardian identity without revealing personal info
        EMERGENCY_STATE,        // Proves emergency situation validity
        EXECUTION_AUTHORIZATION // Proves authorization for operation execution
    }

    /// @dev Verification key structure for different proof types
    struct VerificationKey {
        uint256 proofType;
        bytes32 vkHash;
        uint256 version;
        bool active;
    }

    /**
     * @notice Verifies guardian identity proof
     * @param proof The zero-knowledge proof bytes
     * @param publicInputHash Hash of public inputs (guardian commitment, challenge)
     * @return isValid True if proof is valid
     */
    function verifyGuardianIdentity(
        bytes calldata proof,
        bytes32 publicInputHash
    ) external view returns (bool isValid);

    /**
     * @notice Verifies emergency state proof
     * @param proof The zero-knowledge proof bytes
     * @param emergencyHash Hash of emergency situation data
     * @return isValid True if proof is valid
     */
    function verifyEmergencyProof(
        bytes calldata proof,
        bytes32 emergencyHash
    ) external view returns (bool isValid);

    /**
     * @notice Verifies execution authorization proof
     * @param proof The zero-knowledge proof bytes
     * @param executor Address of the operation executor
     * @param operationHash Hash of the operation to be executed
     * @return isValid True if proof is valid
     */
    function verifyExecutionAuthorization(
        bytes calldata proof,
        address executor,
        bytes32 operationHash
    ) external view returns (bool isValid);

    /**
     * @notice Updates verification key for a specific proof type
     * @param proofType The type of proof (0=identity, 1=emergency, 2=authorization)
     * @param vkHash Hash of the new verification key
     * @dev Only callable by authorized key manager
     */
    function updateVerificationKey(
        uint256 proofType,
        bytes32 vkHash
    ) external;

    /**
     * @notice Gets the current verification key for a proof type
     * @param proofType The type of proof to query
     * @return vk The verification key structure
     */
    function getVerificationKey(uint256 proofType) external view returns (VerificationKey memory vk);

    /**
     * @notice Batch verification of multiple proofs
     * @param proofs Array of proof bytes
     * @param proofTypes Array of proof types corresponding to each proof
     * @param publicInputs Array of public input hashes
     * @return results Array of verification results
     */
    function batchVerifyProofs(
        bytes[] calldata proofs,
        uint256[] calldata proofTypes,
        bytes32[] calldata publicInputs
    ) external view returns (bool[] memory results);

    /// @dev Emitted when a verification key is updated
    event VerificationKeyUpdated(uint256 indexed proofType, bytes32 vkHash, uint256 version);

    /// @dev Emitted when a proof verification is performed
    event ProofVerified(uint256 indexed proofType, bytes32 publicInputHash, bool result);

    /// @dev Thrown when proof verification fails
    error InvalidProof(uint256 proofType, bytes32 publicInputHash);

    /// @dev Thrown when verification key is not found or inactive
    error InvalidVerificationKey(uint256 proofType);

    /// @dev Thrown when array lengths don't match in batch operations
    error ArrayLengthMismatch();
}