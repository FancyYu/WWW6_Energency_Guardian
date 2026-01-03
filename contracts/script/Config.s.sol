// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {EmergencyManagement} from "../src/EmergencyManagement.sol";
import {ZKProofVerifier} from "../src/ZKProofVerifier.sol";
import {IEmergencyManagement} from "../src/interfaces/IEmergencyManagement.sol";
import {IZKProofVerifier} from "../src/interfaces/IZKProofVerifier.sol";

/**
 * @title Config Script
 * @notice Post-deployment configuration script for Emergency Guardian System
 */
contract ConfigScript is Script {
    struct NetworkConfig {
        address emergencyManagement;
        address zkProofVerifier;
        address owner;
    }

    function run() external {
        // Load network configuration
        NetworkConfig memory config = loadNetworkConfig();
        
        vm.startBroadcast();
        
        // Configure contracts
        configureZKProofVerifier(config);
        configureEmergencyManagement(config);
        
        vm.stopBroadcast();
        
        console.log("=== Configuration Complete ===");
    }

    function loadNetworkConfig() internal view returns (NetworkConfig memory) {
        NetworkConfig memory config;
        
        // Load from deployment artifacts or environment
        config.emergencyManagement = vm.envAddress("EMERGENCY_MANAGEMENT_ADDRESS");
        config.zkProofVerifier = vm.envAddress("ZK_PROOF_VERIFIER_ADDRESS");
        config.owner = vm.envAddress("OWNER_ADDRESS");
        
        return config;
    }

    function configureZKProofVerifier(NetworkConfig memory config) internal {
        console.log("Configuring ZKProofVerifier...");
        
        ZKProofVerifier zkVerifier = ZKProofVerifier(config.zkProofVerifier);
        
        // Update verification keys with real keys (replace with actual ceremony results)
        bytes32 identityVkHash = keccak256("identity_verification_key_v1");
        bytes32 emergencyVkHash = keccak256("emergency_verification_key_v1");
        bytes32 authVkHash = keccak256("authorization_verification_key_v1");
        
        zkVerifier.updateVerificationKey(0, identityVkHash);
        zkVerifier.updateVerificationKey(1, emergencyVkHash);
        zkVerifier.updateVerificationKey(2, authVkHash);
        
        // Update circuit parameters
        zkVerifier.updateCircuitParams(0, 2, 1000, keccak256("identity_circuit_v1"));
        zkVerifier.updateCircuitParams(1, 3, 1500, keccak256("emergency_circuit_v1"));
        zkVerifier.updateCircuitParams(2, 2, 800, keccak256("authorization_circuit_v1"));
        
        console.log("ZKProofVerifier configured successfully");
    }

    function configureEmergencyManagement(NetworkConfig memory config) internal {
        console.log("Configuring EmergencyManagement...");
        
        EmergencyManagement emergencyMgmt = EmergencyManagement(config.emergencyManagement);
        
        // Set default timelock configuration for the owner
        emergencyMgmt.updateTimelockConfig(
            2 hours,    // Emergency timelock
            48 hours,   // Guardian change timelock
            24 hours    // Grace period
        );
        
        // Set level-specific timelocks
        emergencyMgmt.setLevelSpecificTimelock(IEmergencyManagement.EmergencyLevel.Level1, 2 hours);
        emergencyMgmt.setLevelSpecificTimelock(IEmergencyManagement.EmergencyLevel.Level2, 4 hours);
        emergencyMgmt.setLevelSpecificTimelock(IEmergencyManagement.EmergencyLevel.Level3, 1 hours);
        
        console.log("EmergencyManagement configured successfully");
    }

    function updateVerificationKeys(
        address zkVerifier,
        bytes32[] calldata vkHashes
    ) external {
        require(vkHashes.length == 3, "Must provide 3 verification key hashes");
        
        vm.startBroadcast();
        
        ZKProofVerifier verifier = ZKProofVerifier(zkVerifier);
        
        for (uint256 i = 0; i < vkHashes.length; i++) {
            verifier.updateVerificationKey(i, vkHashes[i]);
        }
        
        vm.stopBroadcast();
        
        console.log("Verification keys updated");
    }
}