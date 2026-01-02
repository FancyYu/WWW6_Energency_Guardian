// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IEmergencyDataStorage
 * @dev Interface for emergency data storage integration with IPFS
 * @notice Manages encrypted emergency data references and access control
 */
interface IEmergencyDataStorage {
    /// @dev Emergency data storage structure
    struct EmergencyDataRef {
        string ipfsHash;           // IPFS hash of encrypted data
        bytes32 dataHash;          // Hash of the original data for integrity
        uint256 timestamp;         // When data was stored
        address owner;             // Data owner address
        uint256 accessLevel;       // Required access level to retrieve
        bool active;               // Whether data reference is active
    }

    /// @dev Access control levels for emergency data
    enum AccessLevel {
        OWNER_ONLY,        // Only owner can access
        GUARDIAN_LEVEL1,   // Level 1 emergency access
        GUARDIAN_LEVEL2,   // Level 2 emergency access  
        GUARDIAN_LEVEL3,   // Level 3 emergency access
        AI_AGENT_ACCESS    // AI agent verification access
    }

    /**
     * @notice Stores encrypted emergency data reference
     * @param ipfsHash IPFS hash of the encrypted data
     * @param dataHash Hash of original data for integrity verification
     * @param accessLevel Required access level for data retrieval
     * @param zkProof Zero-knowledge proof of data ownership
     * @return dataId Unique identifier for the stored data reference
     */
    function storeEncryptedEmergencyData(
        string calldata ipfsHash,
        bytes32 dataHash,
        uint256 accessLevel,
        bytes calldata zkProof
    ) external returns (bytes32 dataId);

    /**
     * @notice Retrieves emergency data reference
     * @param dataId Unique identifier of the data
     * @param requester Address requesting the data
     * @param accessProof Proof of access authorization
     * @return dataRef The emergency data reference structure
     */
    function getEmergencyDataRef(
        bytes32 dataId,
        address requester,
        bytes calldata accessProof
    ) external view returns (EmergencyDataRef memory dataRef);

    /**
     * @notice Updates data access level (emergency escalation)
     * @param dataId Unique identifier of the data
     * @param newAccessLevel New access level to set
     * @param authorizationProof Proof of authorization for level change
     */
    function updateDataAccessLevel(
        bytes32 dataId,
        uint256 newAccessLevel,
        bytes calldata authorizationProof
    ) external;

    /**
     * @notice Revokes access to emergency data
     * @param dataId Unique identifier of the data
     * @param reason Reason for revocation
     */
    function revokeDataAccess(
        bytes32 dataId,
        string calldata reason
    ) external;

    /**
     * @notice Gets all data references for an owner
     * @param owner Address of the data owner
     * @return dataIds Array of data identifiers owned by the address
     */
    function getOwnerDataRefs(address owner) external view returns (bytes32[] memory dataIds);

    /**
     * @notice Verifies data integrity using stored hash
     * @param dataId Unique identifier of the data
     * @param providedHash Hash of data to verify
     * @return isValid True if hashes match
     */
    function verifyDataIntegrity(
        bytes32 dataId,
        bytes32 providedHash
    ) external view returns (bool isValid);

    /// @dev Emitted when emergency data is stored
    event EmergencyDataStored(
        bytes32 indexed dataId,
        address indexed owner,
        string ipfsHash,
        uint256 accessLevel
    );

    /// @dev Emitted when data access level is updated
    event DataAccessLevelUpdated(
        bytes32 indexed dataId,
        uint256 oldLevel,
        uint256 newLevel,
        address updatedBy
    );

    /// @dev Emitted when data access is revoked
    event DataAccessRevoked(
        bytes32 indexed dataId,
        address indexed owner,
        string reason
    );

    /// @dev Emitted when data is accessed
    event DataAccessed(
        bytes32 indexed dataId,
        address indexed requester,
        uint256 accessLevel,
        uint256 timestamp
    );

    /// @dev Thrown when caller lacks permission for operation
    error UnauthorizedAccess(address caller, bytes32 dataId);

    /// @dev Thrown when data reference is not found
    error DataNotFound(bytes32 dataId);

    /// @dev Thrown when access level is insufficient
    error InsufficientAccessLevel(uint256 required, uint256 provided);

    /// @dev Thrown when data integrity check fails
    error DataIntegrityCheckFailed(bytes32 dataId, bytes32 expectedHash, bytes32 providedHash);
}