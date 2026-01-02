// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/EmergencyManagement.sol";
import "../src/ZKProofVerifier.sol";
import "../src/interfaces/IEmergencyDataStorage.sol";
import "./MockZKProofVerifier.sol";
import "./MockEmergencyDataStorage.sol";

/**
 * @title TimelockConfigTest
 * @dev Tests for user-configurable timelock functionality
 */
contract TimelockConfigTest is Test {
    EmergencyManagement public emergencyManagement;
    MockZKProofVerifier public mockZKVerifier;
    MockEmergencyDataStorage public mockDataStorage;

    address public owner = address(0x1);
    address public guardian1 = address(0x2);
    address public guardian2 = address(0x3);
    address public guardian3 = address(0x4);
    address public user = address(0x5);

    address[] public guardians;
    uint256[3] public thresholds = [2, 2, 3]; // [Level1, Level2, Level3]

    function setUp() public {
        // Setup guardian array
        guardians.push(guardian1);
        guardians.push(guardian2);
        guardians.push(guardian3);

        // Deploy mock contracts
        mockZKVerifier = new MockZKProofVerifier();
        mockDataStorage = new MockEmergencyDataStorage();

        // Deploy main contract
        emergencyManagement = new EmergencyManagement();
        
        // Initialize contract
        emergencyManagement.initialize(
            owner,
            guardians,
            thresholds,
            address(mockZKVerifier),
            address(mockDataStorage)
        );
    }

    // ============ TIMELOCK CONFIGURATION TESTS ============

    function testUpdateTimelockConfig() public {
        vm.startPrank(user);

        uint256 emergencyTimelock = 4 hours;
        uint256 guardianChangeTimelock = 72 hours;
        uint256 gracePeriod = 12 hours;

        // Update timelock configuration
        emergencyManagement.updateTimelockConfig(
            emergencyTimelock,
            guardianChangeTimelock,
            gracePeriod
        );

        // Verify configuration was updated
        (
            uint256 returnedEmergencyTimelock,
            uint256 returnedGuardianChangeTimelock,
            uint256 returnedGracePeriod,
            bool dynamicAdjustmentEnabled,
            uint256 lastUpdated
        ) = emergencyManagement.getUserTimelockConfig(user);

        assertEq(returnedEmergencyTimelock, emergencyTimelock);
        assertEq(returnedGuardianChangeTimelock, guardianChangeTimelock);
        assertEq(returnedGracePeriod, gracePeriod);
        assertEq(dynamicAdjustmentEnabled, false);
        assertEq(lastUpdated, block.timestamp);

        vm.stopPrank();
    }

    function testUpdateTimelockConfigBounds() public {
        vm.startPrank(user);

        // Test minimum bounds
        emergencyManagement.updateTimelockConfig(
            1 hours,    // MIN_EMERGENCY_TIMELOCK
            24 hours,   // MIN_GUARDIAN_CHANGE_TIMELOCK
            1 hours     // MIN_GRACE_PERIOD
        );

        // Test maximum bounds
        emergencyManagement.updateTimelockConfig(
            7 days,     // MAX_EMERGENCY_TIMELOCK
            30 days,    // MAX_GUARDIAN_CHANGE_TIMELOCK
            7 days      // MAX_GRACE_PERIOD
        );

        vm.stopPrank();
    }

    function testUpdateTimelockConfigInvalidBounds() public {
        vm.startPrank(user);

        // Test emergency timelock too low
        vm.expectRevert();
        emergencyManagement.updateTimelockConfig(
            30 minutes, // Below MIN_EMERGENCY_TIMELOCK
            24 hours,
            1 hours
        );

        // Test emergency timelock too high
        vm.expectRevert();
        emergencyManagement.updateTimelockConfig(
            8 days,     // Above MAX_EMERGENCY_TIMELOCK
            24 hours,
            1 hours
        );

        // Test guardian change timelock too low
        vm.expectRevert();
        emergencyManagement.updateTimelockConfig(
            2 hours,
            12 hours,   // Below MIN_GUARDIAN_CHANGE_TIMELOCK
            1 hours
        );

        // Test guardian change timelock too high
        vm.expectRevert();
        emergencyManagement.updateTimelockConfig(
            2 hours,
            31 days,    // Above MAX_GUARDIAN_CHANGE_TIMELOCK
            1 hours
        );

        // Test grace period too low
        vm.expectRevert();
        emergencyManagement.updateTimelockConfig(
            2 hours,
            24 hours,
            30 minutes  // Below MIN_GRACE_PERIOD
        );

        // Test grace period too high
        vm.expectRevert();
        emergencyManagement.updateTimelockConfig(
            2 hours,
            24 hours,
            8 days      // Above MAX_GRACE_PERIOD
        );

        vm.stopPrank();
    }

    function testSetLevelSpecificTimelock() public {
        vm.startPrank(user);

        uint256 level1Timelock = 2 hours;
        uint256 level2Timelock = 1 hours;
        uint256 level3Timelock = 1 hours; // Changed from 30 minutes to 1 hour

        // Set level-specific timelocks
        emergencyManagement.setLevelSpecificTimelock(
            IEmergencyManagement.EmergencyLevel.Level1,
            level1Timelock
        );
        emergencyManagement.setLevelSpecificTimelock(
            IEmergencyManagement.EmergencyLevel.Level2,
            level2Timelock
        );
        emergencyManagement.setLevelSpecificTimelock(
            IEmergencyManagement.EmergencyLevel.Level3,
            level3Timelock
        );

        // Verify level-specific timelocks
        assertEq(
            emergencyManagement.getLevelSpecificTimelock(
                user,
                IEmergencyManagement.EmergencyLevel.Level1
            ),
            level1Timelock
        );
        assertEq(
            emergencyManagement.getLevelSpecificTimelock(
                user,
                IEmergencyManagement.EmergencyLevel.Level2
            ),
            level2Timelock
        );
        assertEq(
            emergencyManagement.getLevelSpecificTimelock(
                user,
                IEmergencyManagement.EmergencyLevel.Level3
            ),
            level3Timelock
        );

        vm.stopPrank();
    }

    function testSetLevelSpecificTimelockInvalidBounds() public {
        vm.startPrank(user);

        // Test timelock too low
        vm.expectRevert();
        emergencyManagement.setLevelSpecificTimelock(
            IEmergencyManagement.EmergencyLevel.Level1,
            30 minutes  // Below MIN_EMERGENCY_TIMELOCK
        );

        // Test timelock too high
        vm.expectRevert();
        emergencyManagement.setLevelSpecificTimelock(
            IEmergencyManagement.EmergencyLevel.Level1,
            8 days      // Above MAX_EMERGENCY_TIMELOCK
        );

        vm.stopPrank();
    }

    function testSetDynamicTimelockAdjustment() public {
        vm.startPrank(user);

        // Enable dynamic adjustment
        emergencyManagement.setDynamicTimelockAdjustment(true);

        // Verify dynamic adjustment is enabled
        (,,, bool dynamicAdjustmentEnabled,) = emergencyManagement.getUserTimelockConfig(user);
        assertTrue(dynamicAdjustmentEnabled);

        // Disable dynamic adjustment
        emergencyManagement.setDynamicTimelockAdjustment(false);

        // Verify dynamic adjustment is disabled
        (,,, dynamicAdjustmentEnabled,) = emergencyManagement.getUserTimelockConfig(user);
        assertFalse(dynamicAdjustmentEnabled);

        vm.stopPrank();
    }

    function testAdjustTimelockForRisk() public {
        vm.startPrank(user);

        // Set base timelock
        emergencyManagement.updateTimelockConfig(6 hours, 48 hours, 24 hours);
        
        // Enable dynamic adjustment
        emergencyManagement.setDynamicTimelockAdjustment(true);

        // Test high risk (80-100) - should be 30 minutes to 2 hours
        uint256 highRiskTimelock = emergencyManagement.adjustTimelockForRisk(user, 90);
        assertTrue(highRiskTimelock >= 30 minutes && highRiskTimelock <= 2 hours);

        // Test medium risk (40-79) - should be 2 hours to 6 hours
        uint256 mediumRiskTimelock = emergencyManagement.adjustTimelockForRisk(user, 60);
        assertTrue(mediumRiskTimelock >= 2 hours && mediumRiskTimelock <= 6 hours);

        // Test low risk (0-39) - should be base timelock or extended
        uint256 lowRiskTimelock = emergencyManagement.adjustTimelockForRisk(user, 20);
        assertTrue(lowRiskTimelock >= 6 hours);

        vm.stopPrank();
    }

    function testAdjustTimelockForRiskDisabled() public {
        vm.startPrank(user);

        // Set base timelock
        uint256 baseTimelock = 4 hours;
        emergencyManagement.updateTimelockConfig(baseTimelock, 48 hours, 24 hours);
        
        // Keep dynamic adjustment disabled (default)
        
        // Test that risk adjustment returns base timelock when disabled
        uint256 adjustedTimelock = emergencyManagement.adjustTimelockForRisk(user, 90);
        assertEq(adjustedTimelock, baseTimelock);

        vm.stopPrank();
    }

    function testAdjustTimelockForRiskInvalidScore() public {
        vm.startPrank(user);

        // Test invalid risk score
        vm.expectRevert();
        emergencyManagement.adjustTimelockForRisk(user, 101);

        vm.stopPrank();
    }

    function testGetDefaultTimelockConfig() public {
        // Test user with no custom configuration gets defaults
        (
            uint256 emergencyTimelock,
            uint256 guardianChangeTimelock,
            uint256 gracePeriod,
            bool dynamicAdjustmentEnabled,
            uint256 lastUpdated
        ) = emergencyManagement.getUserTimelockConfig(address(0x999));

        // Should return default values
        assertEq(emergencyTimelock, 2 hours);
        assertEq(guardianChangeTimelock, 48 hours);
        assertEq(gracePeriod, 24 hours);
        assertEq(dynamicAdjustmentEnabled, false);
        assertTrue(lastUpdated > 0); // Default config should have been initialized
    }

    function testGetDefaultLevelSpecificTimelock() public view {
        // Test user with no custom level-specific configuration gets defaults
        uint256 level1Default = emergencyManagement.getLevelSpecificTimelock(
            address(0x999),
            IEmergencyManagement.EmergencyLevel.Level1
        );
        uint256 level2Default = emergencyManagement.getLevelSpecificTimelock(
            address(0x999),
            IEmergencyManagement.EmergencyLevel.Level2
        );
        uint256 level3Default = emergencyManagement.getLevelSpecificTimelock(
            address(0x999),
            IEmergencyManagement.EmergencyLevel.Level3
        );

        // Should return default values (updated to match new defaults)
        assertEq(level1Default, 2 hours);
        assertEq(level2Default, 1 hours);
        assertEq(level3Default, 1 hours);
    }

    // ============ INTEGRATION TESTS ============

    function testProposeEmergencyWithCustomTimelock() public {
        vm.startPrank(guardian1);

        // Set custom emergency timelock
        uint256 customTimelock = 3 hours;
        emergencyManagement.updateTimelockConfig(customTimelock, 48 hours, 24 hours);

        // Mock ZK proof verification
        mockZKVerifier.setVerificationResult(true);

        // Propose emergency
        bytes memory evidence = "Emergency evidence";
        bytes32 evidenceHash = keccak256(evidence);
        bytes memory zkProof = "mock_zk_proof";

        uint256 proposalId = emergencyManagement.proposeEmergency(
            evidence,
            evidenceHash,
            zkProof
        );

        // Get proposal and verify custom timelock was used
        IEmergencyManagement.EmergencyProposal memory proposal = 
            emergencyManagement.getEmergencyProposal(proposalId);
        
        assertEq(proposal.timelock, block.timestamp + customTimelock);

        vm.stopPrank();
    }

    // ============ EVENT TESTS ============

    function testTimelockConfigUpdatedEvent() public {
        vm.startPrank(user);

        uint256 emergencyTimelock = 4 hours;
        uint256 guardianChangeTimelock = 72 hours;
        uint256 gracePeriod = 12 hours;

        // Expect event emission
        vm.expectEmit(true, false, false, true);
        emit IEmergencyManagement.TimelockConfigUpdated(
            user,
            emergencyTimelock,
            guardianChangeTimelock,
            gracePeriod
        );

        emergencyManagement.updateTimelockConfig(
            emergencyTimelock,
            guardianChangeTimelock,
            gracePeriod
        );

        vm.stopPrank();
    }

    function testLevelSpecificTimelockSetEvent() public {
        vm.startPrank(user);

        uint256 timelock = 2 hours;
        IEmergencyManagement.EmergencyLevel level = IEmergencyManagement.EmergencyLevel.Level1;

        // Expect event emission
        vm.expectEmit(true, false, false, true);
        emit IEmergencyManagement.LevelSpecificTimelockSet(user, level, timelock);

        emergencyManagement.setLevelSpecificTimelock(level, timelock);

        vm.stopPrank();
    }

    function testDynamicTimelockAdjustmentSetEvent() public {
        vm.startPrank(user);

        // Expect event emission
        vm.expectEmit(true, false, false, true);
        emit IEmergencyManagement.DynamicTimelockAdjustmentSet(user, true);

        emergencyManagement.setDynamicTimelockAdjustment(true);

        vm.stopPrank();
    }
}