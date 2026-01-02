// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/interfaces/IEmergencyDataStorage.sol";

/**
 * @title MockEmergencyDataStorage
 * @dev Mock implementation of emergency data storage for testing
 */
contract MockEmergencyDataStorage is IEmergencyDataStorage {
    mapping(bytes32 => EmergencyDataRef) public dataRefs;
    mapping(address => bytes32[]) public ownerDataRefs;
    
    function storeEncryptedEmergencyData(
        string calldata ipfsHash,
        bytes32 dataHash,
        uint256 accessLevel,
        bytes calldata /* zkProof */
    ) external override returns (bytes32 dataId) {
        // Generate deterministic data ID
        dataId = keccak256(abi.encodePacked(ipfsHash, dataHash, accessLevel, msg.sender, block.timestamp));
        
        // Store the data reference
        dataRefs[dataId] = EmergencyDataRef({
            ipfsHash: ipfsHash,
            dataHash: dataHash,
            timestamp: block.timestamp,
            owner: msg.sender,
            accessLevel: accessLevel,
            active: true
        });
        
        ownerDataRefs[msg.sender].push(dataId);
        return dataId;
    }
    
    function getEmergencyDataRef(
        bytes32 dataId,
        address /* requester */,
        bytes calldata /* accessProof */
    ) external view override returns (EmergencyDataRef memory dataRef) {
        return dataRefs[dataId];
    }
    
    function updateDataAccessLevel(
        bytes32 dataId,
        uint256 newAccessLevel,
        bytes calldata /* authorizationProof */
    ) external override {
        if (dataRefs[dataId].active) {
            dataRefs[dataId].accessLevel = newAccessLevel;
        }
    }
    
    function revokeDataAccess(
        bytes32 dataId,
        string calldata /* reason */
    ) external override {
        if (dataRefs[dataId].active) {
            dataRefs[dataId].active = false;
        }
    }
    
    function getOwnerDataRefs(address owner) external view override returns (bytes32[] memory dataIds) {
        return ownerDataRefs[owner];
    }
    
    function verifyDataIntegrity(
        bytes32 dataId,
        bytes32 providedHash
    ) external view override returns (bool isValid) {
        return dataRefs[dataId].dataHash == providedHash;
    }
}