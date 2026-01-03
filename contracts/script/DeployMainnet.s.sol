// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Deploy.s.sol";

/**
 * @title DeployMainnet Script
 * @notice Deploys Emergency Guardian System to mainnet with production configurations
 */
contract DeployMainnetScript is DeployScript {
    function run() external override {
        console.log("=== Deploying to Mainnet ===");
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        
        // Additional mainnet safety checks
        require(block.chainid == 1, "Not mainnet");
        
        // Verify configuration before deployment
        DeploymentConfig memory config = loadConfig();
        
        // Mainnet safety validations
        require(config.owner != address(0), "Owner must be set for mainnet");
        require(config.initialGuardians.length >= 3, "Minimum 3 guardians required for mainnet");
        require(config.emergencyTimelock >= 3600, "Minimum 1 hour timelock for mainnet");
        require(config.guardianChangeTimelock >= 86400, "Minimum 24 hour guardian change timelock for mainnet");
        
        console.log("=== Mainnet Safety Checks Passed ===");
        
        // Start broadcasting transactions
        vm.startBroadcast(config.deployer);
        
        // Deploy contracts
        DeployedContracts memory deployed = deployContracts(config);
        
        // Configure contracts
        configureContracts(deployed, config);
        
        // Verify deployment
        verifyDeployment(deployed, config);
        
        vm.stopBroadcast();
        
        // Save deployment information
        saveDeploymentInfo(deployed, config);
        
        emit DeploymentCompleted(deployed);
        
        console.log("=== Mainnet Deployment Complete ===");
        console.log("ZKProofVerifier:", deployed.zkProofVerifier);
        console.log("EmergencyManagement Implementation:", deployed.emergencyManagementImpl);
        console.log("EmergencyManagement Proxy:", deployed.emergencyManagementProxy);
        console.log("EmergencyManagement (for interactions):", deployed.emergencyManagement);
        console.log("CRITICAL: Verify all contracts and test thoroughly!");
        console.log("1. Verify contracts on Etherscan");
        console.log("2. Transfer ownership to multisig");
        console.log("3. Update all frontend and backend configurations");
        console.log("4. Perform comprehensive testing");
    }
}