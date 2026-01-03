// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {EmergencyManagement} from "../src/EmergencyManagement.sol";
import {ZKProofVerifier} from "../src/ZKProofVerifier.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title Deploy Script for Emergency Guardian System
 * @notice Deploys all contracts for the Emergency Guardian system to testnet/mainnet
 * @dev This script handles the deployment of:
 *      - ZKProofVerifier contract
 *      - EmergencyManagement implementation and proxy
 *      - Initial configuration and setup
 */
contract DeployScript is Script {
    // Deployment configuration
    struct DeploymentConfig {
        address deployer;
        address owner;
        address[] initialGuardians;
        uint256 emergencyTimelock;
        uint256 guardianChangeTimelock;
        uint256 gracePeriod;
        uint256 requiredApprovalsLevel1;
        uint256 requiredApprovalsLevel2;
        uint256 requiredApprovalsLevel3;
    }

    // Deployed contract addresses
    struct DeployedContracts {
        address zkProofVerifier;
        address emergencyManagementImpl;
        address emergencyManagementProxy;
        address emergencyManagement; // Proxy address for interactions
    }

    // Events for deployment tracking
    event ContractDeployed(string name, address addr);
    event DeploymentCompleted(DeployedContracts contracts);

    function run() external virtual {
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
        
        console.log("=== Emergency Guardian Deployment Completed ===");
        console.log("ZKProofVerifier:", deployed.zkProofVerifier);
        console.log("EmergencyManagement Implementation:", deployed.emergencyManagementImpl);
        console.log("EmergencyManagement Proxy:", deployed.emergencyManagementProxy);
        console.log("EmergencyManagement (for interactions):", deployed.emergencyManagement);
    }

    /**
     * @notice Load deployment configuration from environment variables
     */
    function loadConfig() internal view returns (DeploymentConfig memory) {
        DeploymentConfig memory config;
        
        // Get deployer from private key
        config.deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        
        // Owner address (can be same as deployer or different)
        try vm.envAddress("OWNER_ADDRESS") returns (address ownerAddr) {
            config.owner = ownerAddr;
        } catch {
            config.owner = config.deployer;
        }
        
        // Initial guardians (comma-separated addresses)
        try vm.envString("INITIAL_GUARDIANS") returns (string memory guardiansStr) {
            if (bytes(guardiansStr).length > 0) {
                config.initialGuardians = parseAddresses(guardiansStr);
            }
        } catch {
            // No initial guardians specified
        }
        
        // Timelock configurations (in seconds)
        try vm.envUint("EMERGENCY_TIMELOCK") returns (uint256 timelock) {
            config.emergencyTimelock = timelock;
        } catch {
            config.emergencyTimelock = 3600; // 1 hour default
        }
        
        try vm.envUint("GUARDIAN_CHANGE_TIMELOCK") returns (uint256 timelock) {
            config.guardianChangeTimelock = timelock;
        } catch {
            config.guardianChangeTimelock = 86400; // 24 hours default
        }
        
        try vm.envUint("GRACE_PERIOD") returns (uint256 period) {
            config.gracePeriod = period;
        } catch {
            config.gracePeriod = 7200; // 2 hours default
        }
        
        // Required approvals for each emergency level
        try vm.envUint("REQUIRED_APPROVALS_LEVEL1") returns (uint256 approvals) {
            config.requiredApprovalsLevel1 = approvals;
        } catch {
            config.requiredApprovalsLevel1 = 1;
        }
        
        try vm.envUint("REQUIRED_APPROVALS_LEVEL2") returns (uint256 approvals) {
            config.requiredApprovalsLevel2 = approvals;
        } catch {
            config.requiredApprovalsLevel2 = 2;
        }
        
        try vm.envUint("REQUIRED_APPROVALS_LEVEL3") returns (uint256 approvals) {
            config.requiredApprovalsLevel3 = approvals;
        } catch {
            config.requiredApprovalsLevel3 = 3;
        }
        
        console.log("Deployment Configuration:");
        console.log("- Deployer:", config.deployer);
        console.log("- Owner:", config.owner);
        console.log("- Initial Guardians:", config.initialGuardians.length);
        console.log("- Emergency Timelock:", config.emergencyTimelock);
        console.log("- Guardian Change Timelock:", config.guardianChangeTimelock);
        
        return config;
    }

    /**
     * @notice Deploy all contracts
     */
    function deployContracts(DeploymentConfig memory config) 
        internal 
        returns (DeployedContracts memory) 
    {
        DeployedContracts memory deployed;
        
        console.log("=== Starting Contract Deployment ===");
        
        // 1. Deploy ZKProofVerifier
        console.log("Deploying ZKProofVerifier...");
        deployed.zkProofVerifier = address(new ZKProofVerifier());
        emit ContractDeployed("ZKProofVerifier", deployed.zkProofVerifier);
        console.log("ZKProofVerifier deployed at:", deployed.zkProofVerifier);
        
        // Initialize ZKProofVerifier
        console.log("Initializing ZKProofVerifier...");
        address[] memory keyManagers = new address[](1);
        keyManagers[0] = config.owner; // Owner is also a key manager
        ZKProofVerifier(deployed.zkProofVerifier).initialize(config.owner, keyManagers);
        
        // 2. Deploy EmergencyManagement implementation
        console.log("Deploying EmergencyManagement implementation...");
        deployed.emergencyManagementImpl = address(new EmergencyManagement());
        emit ContractDeployed("EmergencyManagement_Implementation", deployed.emergencyManagementImpl);
        console.log("EmergencyManagement implementation deployed at:", deployed.emergencyManagementImpl);
        
        // 3. Prepare initialization data
        uint256[3] memory thresholds = [
            config.requiredApprovalsLevel1,
            config.requiredApprovalsLevel2,
            config.requiredApprovalsLevel3
        ];
        
        bytes memory initData = abi.encodeWithSelector(
            EmergencyManagement.initialize.selector,
            config.owner,
            config.initialGuardians,
            thresholds,
            deployed.zkProofVerifier,
            address(0) // Emergency data storage - will be set later
        );
        
        // 4. Deploy proxy with initialization
        console.log("Deploying EmergencyManagement proxy...");
        deployed.emergencyManagementProxy = address(
            new ERC1967Proxy(deployed.emergencyManagementImpl, initData)
        );
        emit ContractDeployed("EmergencyManagement_Proxy", deployed.emergencyManagementProxy);
        console.log("EmergencyManagement proxy deployed at:", deployed.emergencyManagementProxy);
        
        // 5. Set the interaction address (proxy address)
        deployed.emergencyManagement = deployed.emergencyManagementProxy;
        
        return deployed;
    }

    /**
     * @notice Configure deployed contracts
     */
    function configureContracts(
        DeployedContracts memory deployed, 
        DeploymentConfig memory config
    ) internal {
        console.log("=== Configuring Contracts ===");
        
        EmergencyManagement emergencyMgmt = EmergencyManagement(deployed.emergencyManagement);
        ZKProofVerifier zkVerifier = ZKProofVerifier(deployed.zkProofVerifier);
        
        // Configure ZKProofVerifier
        console.log("Configuring ZKProofVerifier...");
        // Set initial verification keys (mock keys for testnet)
        bytes32 mockVkHash = keccak256("mock_verification_key");
        zkVerifier.updateVerificationKey(0, mockVkHash); // Identity proof type
        zkVerifier.updateVerificationKey(1, mockVkHash); // Emergency proof type
        zkVerifier.updateVerificationKey(2, mockVkHash); // Authorization proof type
        
        // Configure timelock settings
        console.log("Configuring timelock settings...");
        emergencyMgmt.updateTimelockConfig(
            config.emergencyTimelock,
            config.guardianChangeTimelock,
            config.gracePeriod
        );
        
        console.log("Contract configuration completed");
    }

    /**
     * @notice Verify deployment was successful
     */
    function verifyDeployment(
        DeployedContracts memory deployed, 
        DeploymentConfig memory config
    ) internal view {
        console.log("=== Verifying Deployment ===");
        
        // Verify ZKProofVerifier
        require(deployed.zkProofVerifier.code.length > 0, "ZKProofVerifier not deployed");
        
        // Verify EmergencyManagement
        require(deployed.emergencyManagement.code.length > 0, "EmergencyManagement not deployed");
        
        EmergencyManagement emergencyMgmt = EmergencyManagement(deployed.emergencyManagement);
        
        // Verify initialization
        require(emergencyMgmt.owner() == config.owner, "Owner not set correctly");
        require(address(emergencyMgmt.zkProofVerifier()) == deployed.zkProofVerifier, "ZKProofVerifier not set correctly");
        
        // Verify guardian count
        if (config.initialGuardians.length > 0) {
            // Note: This would require a getter function in the contract
            console.log("Initial guardians configured:", config.initialGuardians.length);
        }
        
        console.log("Deployment verification completed successfully");
    }

    /**
     * @notice Save deployment information to files
     */
    function saveDeploymentInfo(
        DeployedContracts memory deployed, 
        DeploymentConfig memory config
    ) internal {
        string memory chainId = vm.toString(block.chainid);
        string memory timestamp = vm.toString(block.timestamp);
        
        // Create deployment JSON
        string memory json = string.concat(
            '{\n',
            '  "chainId": "', chainId, '",\n',
            '  "timestamp": "', timestamp, '",\n',
            '  "deployer": "', vm.toString(config.deployer), '",\n',
            '  "owner": "', vm.toString(config.owner), '",\n',
            '  "contracts": {\n',
            '    "ZKProofVerifier": "', vm.toString(deployed.zkProofVerifier), '",\n',
            '    "EmergencyManagement_Implementation": "', vm.toString(deployed.emergencyManagementImpl), '",\n',
            '    "EmergencyManagement_Proxy": "', vm.toString(deployed.emergencyManagementProxy), '",\n',
            '    "EmergencyManagement": "', vm.toString(deployed.emergencyManagement), '"\n',
            '  },\n',
            '  "configuration": {\n',
            '    "emergencyTimelock": "', vm.toString(config.emergencyTimelock), '",\n',
            '    "guardianChangeTimelock": "', vm.toString(config.guardianChangeTimelock), '",\n',
            '    "gracePeriod": "', vm.toString(config.gracePeriod), '",\n',
            '    "requiredApprovalsLevel1": "', vm.toString(config.requiredApprovalsLevel1), '",\n',
            '    "requiredApprovalsLevel2": "', vm.toString(config.requiredApprovalsLevel2), '",\n',
            '    "requiredApprovalsLevel3": "', vm.toString(config.requiredApprovalsLevel3), '"\n',
            '  }\n',
            '}'
        );
        
        // Write deployment info
        string memory filename = string.concat("deployments/", chainId, ".json");
        vm.writeFile(filename, json);
        
        console.log("Deployment info saved to:", filename);
    }

    /**
     * @notice Parse comma-separated addresses
     */
    function parseAddresses(string memory addressesStr) 
        internal 
        pure 
        returns (address[] memory) 
    {
        if (bytes(addressesStr).length == 0) {
            return new address[](0);
        }
        
        // Count commas to determine array size
        uint256 count = 1;
        bytes memory strBytes = bytes(addressesStr);
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == ',') {
                count++;
            }
        }
        
        address[] memory addresses = new address[](count);
        uint256 index = 0;
        uint256 start = 0;
        
        for (uint256 i = 0; i <= strBytes.length; i++) {
            if (i == strBytes.length || strBytes[i] == ',') {
                // Extract address substring
                bytes memory addrBytes = new bytes(i - start);
                for (uint256 j = 0; j < i - start; j++) {
                    addrBytes[j] = strBytes[start + j];
                }
                
                // Convert to address (remove any whitespace)
                string memory addrStr = string(addrBytes);
                addresses[index] = parseAddress(addrStr);
                index++;
                start = i + 1;
            }
        }
        
        return addresses;
    }
    
    /**
     * @notice Parse a single address string
     */
    function parseAddress(string memory addrStr) internal pure returns (address) {
        bytes memory strBytes = bytes(addrStr);
        require(strBytes.length >= 42, "Invalid address length");
        
        // Find the start of the hex address (skip whitespace and 0x)
        uint256 start = 0;
        while (start < strBytes.length && (strBytes[start] == ' ' || strBytes[start] == '\t')) {
            start++;
        }
        
        if (start + 1 < strBytes.length && strBytes[start] == '0' && strBytes[start + 1] == 'x') {
            start += 2;
        }
        
        // Convert hex string to address
        uint160 addr = 0;
        for (uint256 i = start; i < start + 40 && i < strBytes.length; i++) {
            uint8 digit;
            if (strBytes[i] >= '0' && strBytes[i] <= '9') {
                digit = uint8(strBytes[i]) - uint8(bytes1('0'));
            } else if (strBytes[i] >= 'a' && strBytes[i] <= 'f') {
                digit = uint8(strBytes[i]) - uint8(bytes1('a')) + 10;
            } else if (strBytes[i] >= 'A' && strBytes[i] <= 'F') {
                digit = uint8(strBytes[i]) - uint8(bytes1('A')) + 10;
            } else {
                revert("Invalid hex character");
            }
            addr = addr * 16 + digit;
        }
        
        return address(addr);
    }
}