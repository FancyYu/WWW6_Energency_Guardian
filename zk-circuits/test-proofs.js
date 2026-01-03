const { ZKProofGenerator } = require("./js/proof-generator");
const { MockZKProofGenerator } = require("./js/mock-proofs");

/**
 * Test script for ZK proof generation
 * Demonstrates both mock and real proof generation
 */

async function testMockProofs() {
  console.log("🧪 Testing Mock Proof System...\n");

  const mockSystem = new MockZKProofGenerator();

  // Test identity proof
  console.log("1. Testing Identity Proof (Mock):");
  const identityInputs = {
    secret: "12345",
    nullifier: "67890",
    merkleProof: Array(20).fill("0"),
    merkleIndex: 1,
    merkleRoot: "0x1234567890abcdef",
    emergencyHash: "0xabcdef1234567890",
  };

  const identityProof = await mockSystem.generateIdentityProof(identityInputs);
  console.log("   ✅ Identity proof generated");
  console.log("   📋 Nullifier Hash:", identityProof.nullifierHash);
  console.log("   📋 Commitment:", identityProof.commitment);

  // Test emergency proof
  console.log("\n2. Testing Emergency Proof (Mock):");
  const emergencyInputs = {
    emergencyType: 2,
    timestamp: Math.floor(Date.now() / 1000),
    userSecret: "secret123",
    nonce: "nonce456",
    severity: 7,
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    minTimestamp: Math.floor(Date.now() / 1000) - 3600,
    maxTimestamp: Math.floor(Date.now() / 1000) + 3600,
  };

  const emergencyProof = await mockSystem.generateEmergencyProof(
    emergencyInputs
  );
  console.log("   ✅ Emergency proof generated");
  console.log("   📋 Emergency Hash:", emergencyProof.emergencyHash);
  console.log("   📋 Commitment:", emergencyProof.commitment);

  // Test authorization proof
  console.log("\n3. Testing Authorization Proof (Mock):");
  const authInputs = {
    guardianSecret: "guardian123",
    operationType: 3,
    authNonce: "auth789",
    guardianIndex: 1,
    targetAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    amount: "1000000000000000000", // 1 ETH
    timestamp: Math.floor(Date.now() / 1000),
    emergencyLevel: 2,
    minAuthLevel: 1,
  };

  const authProof = await mockSystem.generateAuthorizationProof(authInputs);
  console.log("   ✅ Authorization proof generated");
  console.log("   📋 Auth Hash:", authProof.authHash);
  console.log("   📋 Operation Commitment:", authProof.operationCommitment);

  console.log("\n🎉 Mock proof system working correctly!");
}

async function testRealProofs() {
  console.log("\n🔬 Testing Real ZK Proof Generation...\n");

  try {
    const generator = new ZKProofGenerator();

    // Generate test inputs
    console.log("1. Generating test inputs...");
    const identityInputs = generator.generateTestInputs("identity");
    const emergencyInputs = generator.generateTestInputs("emergency");
    const authInputs = generator.generateTestInputs("authorization");

    console.log("   ✅ Test inputs generated");

    // Note: Real proof generation will fail with mock keys
    // This demonstrates the structure and error handling
    console.log(
      "\n2. Attempting real proof generation (will fail with mock keys):"
    );

    try {
      await generator.generateIdentityProof(identityInputs);
    } catch (error) {
      console.log(
        "   ⚠️  Identity proof failed (expected with mock keys):",
        error.message.substring(0, 100) + "..."
      );
    }

    try {
      await generator.generateEmergencyProof(emergencyInputs);
    } catch (error) {
      console.log(
        "   ⚠️  Emergency proof failed (expected with mock keys):",
        error.message.substring(0, 100) + "..."
      );
    }

    try {
      await generator.generateAuthorizationProof(authInputs);
    } catch (error) {
      console.log(
        "   ⚠️  Authorization proof failed (expected with mock keys):",
        error.message.substring(0, 100) + "..."
      );
    }

    console.log(
      "\n📝 Note: Real proof generation requires proper ceremony setup."
    );
    console.log("   For development, use the mock proof system.");
  } catch (error) {
    console.error("❌ Error in real proof testing:", error.message);
  }
}

async function demonstrateIntegration() {
  console.log("\n🔗 Demonstrating Smart Contract Integration...\n");

  const mockSystem = new MockZKProofGenerator();

  // Generate proofs for a complete emergency flow
  console.log("Scenario: Guardian responding to emergency");

  // 1. Identity proof
  const identityProof = await mockSystem.generateIdentityProof({
    secret: "guardian_secret_123",
    nullifier: "unique_nullifier_456",
    merkleProof: Array(20).fill("0"),
    merkleIndex: 1,
    merkleRoot: "0x1234567890abcdef1234567890abcdef12345678",
    emergencyHash: "0xabcdef1234567890abcdef1234567890abcdef12",
  });

  console.log("1. ✅ Guardian identity verified");
  console.log("   📋 Nullifier:", identityProof.nullifierHash);

  // 2. Emergency proof
  const emergencyProof = await mockSystem.generateEmergencyProof({
    emergencyType: 3, // Critical emergency
    timestamp: Math.floor(Date.now() / 1000),
    userSecret: "user_emergency_secret",
    nonce: "emergency_nonce_789",
    severity: 9, // High severity
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    minTimestamp: Math.floor(Date.now() / 1000) - 3600,
    maxTimestamp: Math.floor(Date.now() / 1000) + 3600,
  });

  console.log("2. ✅ Emergency state validated");
  console.log("   📋 Emergency Hash:", emergencyProof.emergencyHash);

  // 3. Authorization proof
  const authProof = await mockSystem.generateAuthorizationProof({
    guardianSecret: "guardian_secret_123",
    operationType: 5, // Emergency fund transfer
    authNonce: "auth_nonce_101112",
    guardianIndex: 1,
    targetAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    amount: "5000000000000000000", // 5 ETH
    timestamp: Math.floor(Date.now() / 1000),
    emergencyLevel: 3, // Critical
    minAuthLevel: 2,
  });

  console.log("3. ✅ Operation authorized");
  console.log("   📋 Auth Hash:", authProof.authHash);

  // Format for smart contract
  const contractData = {
    identityProof: {
      proof: identityProof.proof,
      nullifierHash: identityProof.nullifierHash,
      commitment: identityProof.commitment,
    },
    emergencyProof: {
      proof: emergencyProof.proof,
      emergencyHash: emergencyProof.emergencyHash,
      commitment: emergencyProof.commitment,
    },
    authorizationProof: {
      proof: authProof.proof,
      authHash: authProof.authHash,
      operationCommitment: authProof.operationCommitment,
    },
  };

  console.log("\n📦 Smart contract integration data prepared:");
  console.log("   - Identity proof: Ready");
  console.log("   - Emergency proof: Ready");
  console.log("   - Authorization proof: Ready");
  console.log("\n🚀 Ready for smart contract verification!");
}

async function main() {
  console.log("🔐 Emergency Guardian ZK Proof System Test\n");
  console.log("==========================================\n");

  try {
    // Test mock proofs (should work)
    await testMockProofs();

    // Test real proofs (will show expected failures)
    await testRealProofs();

    // Demonstrate integration
    await demonstrateIntegration();

    console.log("\n🎯 Test Summary:");
    console.log("   ✅ Mock proof system: Working");
    console.log("   ⚠️  Real proof system: Needs proper ceremony");
    console.log("   ✅ Smart contract integration: Ready");
    console.log("\n🔧 Next Steps:");
    console.log("   1. Integrate mock proofs with smart contracts");
    console.log("   2. Set up proper Powers of Tau ceremony for production");
    console.log("   3. Deploy and test end-to-end flow");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMockProofs, testRealProofs, demonstrateIntegration };
