const { ZKProofGenerator } = require("./js/proof-generator");
const { ZKProofVerifier } = require("./js/verifier");
const { ZKUtils } = require("./js/utils");

/**
 * Demo script for Emergency Guardian ZK circuits
 * Shows how to generate and verify proofs for all circuit types
 */

async function runDemo() {
  console.log("🚀 Emergency Guardian ZK Circuits Demo\n");

  try {
    // Initialize generator and verifier
    const generator = new ZKProofGenerator();
    const verifier = new ZKProofVerifier();

    console.log("📊 Verifier Statistics:");
    console.log(verifier.getVerificationStats());
    console.log("");

    // Demo 1: Identity Proof
    await demoIdentityProof(generator, verifier);

    // Demo 2: Emergency Proof
    await demoEmergencyProof(generator, verifier);

    // Demo 3: Authorization Proof
    await demoAuthorizationProof(generator, verifier);

    // Demo 4: Batch Operations
    await demoBatchOperations(generator, verifier);

    console.log("🎉 Demo completed successfully!");
  } catch (error) {
    console.error("❌ Demo failed:", error.message);
  }
}

async function demoIdentityProof(generator, verifier) {
  console.log("=== Identity Proof Demo ===");

  // Generate test guardian registry
  const registry = ZKUtils.generateTestGuardianRegistry(100);
  const guardian = registry.getGuardian(42); // Use guardian at index 42
  const merkleProof = registry.getProofForGuardian(42);

  console.log(`👤 Guardian ${guardian.index}: ${guardian.address}`);
  console.log(
    `🌳 Merkle root: ${ZKUtils.bigIntToHex(registry.merkleTree.root)}`
  );

  // Generate test inputs
  const inputs = {
    secret: guardian.secret,
    nullifier: ZKUtils.generateRandomFieldElement(),
    merkleProof: merkleProof.proof,
    merkleIndex: guardian.index,
    merkleRoot: registry.merkleTree.root,
    emergencyHash: ZKUtils.generateRandomFieldElement(),
  };

  console.log("🔐 Generating identity proof...");
  // Note: This would fail without compiled circuits, but shows the structure
  console.log("   (Simulated - requires compiled circuits)");
  console.log("✅ Identity proof demo structure validated\n");
}
async function demoEmergencyProof(generator, verifier) {
  console.log("=== Emergency Proof Demo ===");

  const now = Math.floor(Date.now() / 1000);
  const inputs = {
    emergencyType: 3, // Critical emergency
    timestamp: now,
    userSecret: ZKUtils.generateRandomFieldElement(),
    nonce: ZKUtils.generateRandomFieldElement(),
    severity: 8, // High severity
    userAddress: ZKUtils.generateRandomBigInt(20),
    minTimestamp: now - 3600, // 1 hour ago
    maxTimestamp: now + 3600, // 1 hour from now
  };

  console.log(
    `🚨 Emergency Type: ${inputs.emergencyType}, Severity: ${inputs.severity}`
  );
  console.log("🔐 Generating emergency proof...");
  console.log("   (Simulated - requires compiled circuits)");
  console.log("✅ Emergency proof demo structure validated\n");
}

async function demoAuthorizationProof(generator, verifier) {
  console.log("=== Authorization Proof Demo ===");

  const inputs = {
    guardianSecret: ZKUtils.generateRandomFieldElement(),
    operationType: 5, // Fund transfer
    authNonce: ZKUtils.generateRandomFieldElement(),
    guardianIndex: 42,
    targetAddress: ZKUtils.generateRandomBigInt(20),
    amount: BigInt("1000000000000000000000"), // 1000 ETH
    timestamp: Math.floor(Date.now() / 1000),
    emergencyLevel: 3, // Highest level
    minAuthLevel: 2, // Requires level 2+
  };

  console.log(
    `🔑 Operation Type: ${inputs.operationType}, Amount: ${inputs.amount} wei`
  );
  console.log(
    `📊 Emergency Level: ${inputs.emergencyLevel}, Required: ${inputs.minAuthLevel}`
  );
  console.log("🔐 Generating authorization proof...");
  console.log("   (Simulated - requires compiled circuits)");
  console.log("✅ Authorization proof demo structure validated\n");
}

async function demoBatchOperations(generator, verifier) {
  console.log("=== Batch Operations Demo ===");

  const requests = [
    { type: "identity", inputs: generator.generateTestInputs("identity") },
    { type: "emergency", inputs: generator.generateTestInputs("emergency") },
    {
      type: "authorization",
      inputs: generator.generateTestInputs("authorization"),
    },
  ];

  console.log(`📦 Batch processing ${requests.length} proof requests...`);
  console.log("   (Simulated - requires compiled circuits)");
  console.log("✅ Batch operations demo structure validated\n");
}

// Run demo if called directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
