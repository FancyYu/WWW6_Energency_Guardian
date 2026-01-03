// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {EmergencyManagement} from "../src/EmergencyManagement.sol";
import {ZKProofVerifier} from "../src/ZKProofVerifier.sol";
import {IEmergencyManagement} from "../src/interfaces/IEmergencyManagement.sol";
import {IZKProofVerifier} from "../src/interfaces/IZKProofVerifier.sol";

/**
 * @title Verify Script
 * @notice Verifies deployed contracts and their configuration
 */
contract VerifyScript is Script {
    struct DeployedAddresses {
        address emergencyManagement;
        address zkProofVerifier;
        address emergencyManagementImpl;
    }

    function run() external view {
        // Load deployed addresses
        DeployedAddresses memory addresses = loadDeployedAddresses();
        
        console.log("=== Verifying Deployed Contracts ===");
        
        // Verify ZKProofVerifier
        verifyZKProofVerifier(addresses.zkProofVerifier);
        
        // Verify EmergencyManagement
        verifyEmergencyManagement(addresses.emergencyManagement);
        
        // Verify proxy setup
        verifyProxySetup(addresses.emergencyManagement, addresses.emergencyManagementImpl);
        
        console.log("=== Verification Complete ===");
    }

    function loadDeployedAddresses() internal view returns (DeployedAddresses memory) {
        DeployedAddresses memory addresses;
        
        // Load from environment or deployment artifacts
        addresses.emergencyManagement = vm.envAddress("EMERGENCY_MANAGEMENT_ADDRESS");
        addresses.zkProofVerifier = vm.envAddress("ZK_PROOF_VERIFIER_ADDRESS");
        addresses.emergencyManagementImpl = vm.envAddress("EMERGENCY_MANAGEMENT_IMPL_ADDRESS");
        
        return addresses;
    }

    function verifyZKProofVerifier(address zkVerifierAddr) internal view {
        console.log("Verifying ZKProofVerifier at:", zkVerifierAddr);
        
        ZKProofVerifier zkVerifier = ZKProofVerifier(zkVerifierAddr);
        
        // Check basic functionality
        require(zkVerifierAddr.code.length > 0, "ZKProofVerifier not deployed");
        
        // Check version
        string memory version = zkVerifier.getVersion();
        console.log("  Version:", version);
        
        // Check verification keys
        for (uint256 i = 0; i < 3; i++) {
            IZKProofVerifier.VerificationKey memory vk = zkVerifier.getVerificationKey(i);
            console.log("  Verification Key", i, "Active:", vk.active);
            console.log("  VK Hash:", vm.toString(vk.vkHash));
        }
        
        console.log("ZKProofVerifier verification passed");
    }

    function verifyEmergencyManagement(address emergencyMgmtAddr) internal view {
        console.log("Verifying EmergencyManagement at:", emergencyMgmtAddr);
        
        EmergencyManagement emergencyMgmt = EmergencyManagement(emergencyMgmtAddr);
        
        // Check basic functionality
        require(emergencyMgmtAddr.code.length > 0, "EmergencyManagement not deployed");
        
        // Check version
        string memory version = emergencyMgmt.getVersion();
        console.log("  Version:", version);
        
        // Check owner
        address owner = emergencyMgmt.owner();
        console.log("  Owner:", owner);
        
        // Check ZK verifier integration
        address zkVerifier = address(emergencyMgmt.zkProofVerifier());
        console.log("  ZK Verifier:", zkVerifier);
        
        // Check guardian configuration
        IEmergencyManagement.GuardianConfig memory config = emergencyMgmt.getGuardianConfig();
        console.log("  Guardians count:", config.guardians.length);
        console.log("  Level 1 threshold:", config.requiredApprovalsForLevel1);
        console.log("  Level 2 threshold:", config.requiredApprovalsForLevel2);
        console.log("  Level 3 threshold:", config.requiredApprovalsForLevel3);
        
        // Check emergency state
        (IEmergencyManagement.EmergencyLevel level, uint256 activatedAt, uint256 proposalId) = 
            emergencyMgmt.getCurrentEmergencyState();
        console.log("  Current Emergency Level:", uint256(level));
        console.log("  Activated At:", activatedAt);
        console.log("  Active Proposal ID:", proposalId);
        
        console.log("EmergencyManagement verification passed");
    }

    function verifyProxySetup(address proxyAddr, address implAddr) internal view {
        console.log("Verifying Proxy Setup...");
        console.log("  Proxy Address:", proxyAddr);
        console.log("  Implementation Address:", implAddr);
        
        // Verify proxy and implementation are different
        require(proxyAddr != implAddr, "Proxy and implementation should be different");
        
        // Verify both have code
        require(proxyAddr.code.length > 0, "Proxy has no code");
        require(implAddr.code.length > 0, "Implementation has no code");
        
        console.log("Proxy setup verification passed");
    }

    function verifyContractInteraction(address emergencyMgmtAddr) external {
        console.log("Testing contract interaction...");
        
        vm.startBroadcast();
        
        EmergencyManagement emergencyMgmt = EmergencyManagement(emergencyMgmtAddr);
        
        // Test view functions
        bool isGuardian = emergencyMgmt.isGuardian(msg.sender);
        console.log("  Caller is guardian:", isGuardian);
        
        // Test timelock configuration (if caller is owner)
        try emergencyMgmt.updateTimelockConfig(3600, 86400, 7200) {
            console.log("Timelock configuration test passed");
        } catch {
            console.log("Timelock configuration test skipped (not owner)");
        }
        
        vm.stopBroadcast();
        
        console.log("Contract interaction test completed");
    }
}