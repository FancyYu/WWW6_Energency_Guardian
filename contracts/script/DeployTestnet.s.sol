// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Deploy.s.sol";

/**
 * @title DeployTestnet Script
 * @notice Deploys Emergency Guardian System to testnet with testnet-specific configurations
 */
contract DeployTestnetScript is DeployScript {
    function run() external override {
        console.log("=== Deploying to Testnet ===");
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        
        // Load deployment configuration
        DeploymentConfig memory config = loadConfig();
        
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
        
        console.log("=== Testnet Deployment Complete ===");
        console.log("ZKProofVerifier:", deployed.zkProofVerifier);
        console.log("EmergencyManagement Implementation:", deployed.emergencyManagementImpl);
        console.log("EmergencyManagement Proxy:", deployed.emergencyManagementProxy);
        console.log("EmergencyManagement (for interactions):", deployed.emergencyManagement);
        console.log("Remember to:");
        console.log("1. Verify contracts on Etherscan");
        console.log("2. Update frontend configuration with new addresses");
        console.log("3. Test all functionality before mainnet deployment");
    }
}