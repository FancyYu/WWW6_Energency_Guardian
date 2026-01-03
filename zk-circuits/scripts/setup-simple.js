const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * Simplified setup script for Emergency Guardian ZK circuits
 * Uses pre-generated powers of tau for faster development
 */

const CIRCUITS = [
  {
    name: "identity",
    description: "Guardian Identity Proof Circuit",
  },
  {
    name: "emergency",
    description: "Emergency State Proof Circuit",
  },
  {
    name: "authorization",
    description: "Execution Authorization Proof Circuit",
  },
];

async function downloadPtau() {
  const ptauPath = path.join("keys", "powersOfTau28_hez_final_15.ptau");

  if (fs.existsSync(ptauPath)) {
    console.log("   ♻️  Using existing Powers of Tau file");
    return ptauPath;
  }

  console.log(
    "   📥 Downloading Powers of Tau file (this may take a while)..."
  );

  // For development, we'll create a smaller ptau file
  // In production, you should download the official ceremony file
  try {
    await snarkjs.powersOfTau.newAccumulator("bn128", 15, ptauPath + ".tmp");
    await snarkjs.powersOfTau.contribute(
      ptauPath + ".tmp",
      ptauPath + ".tmp2",
      "dev contribution",
      "dev-entropy-" + Date.now()
    );
    await snarkjs.powersOfTau.preparePhase2(ptauPath + ".tmp2", ptauPath);

    // Cleanup
    fs.unlinkSync(ptauPath + ".tmp");
    fs.unlinkSync(ptauPath + ".tmp2");

    console.log("   ✅ Powers of Tau file generated");
    return ptauPath;
  } catch (error) {
    console.error("   ❌ Failed to generate Powers of Tau:", error.message);
    throw error;
  }
}

async function setupCircuit(circuit, ptauPath) {
  console.log(`\n🔄 Setting up ${circuit.description}...`);

  try {
    // Paths
    const r1csPath = path.join("build", `${circuit.name}.r1cs`);
    const wasmPath = path.join(
      "build",
      `${circuit.name}_js`,
      `${circuit.name}.wasm`
    );
    const zkeyPath = path.join("keys", circuit.name, `${circuit.name}.zkey`);
    const vkeyPath = path.join("keys", circuit.name, `verification_key.json`);

    // Check if R1CS file exists
    if (!fs.existsSync(r1csPath)) {
      console.log(`❌ R1CS file not found: ${r1csPath}`);
      console.log(`   Please run: npm run compile`);
      return false;
    }

    console.log(`   📊 R1CS file: ${r1csPath}`);
    console.log(`   🔧 WASM file: ${wasmPath}`);

    // Generate zkey
    console.log(`   🔑 Generating proving key...`);
    await snarkjs.zKey.newZKey(r1csPath, ptauPath, zkeyPath);

    // Export verification key
    console.log(`   🔐 Exporting verification key...`);
    const vKey = await snarkjs.zKey.exportVerificationKey(zkeyPath);
    fs.writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));

    // Get circuit info
    const r1cs = await snarkjs.r1cs.info(r1csPath);

    console.log(`   ✅ Setup completed for ${circuit.name}`);
    console.log(`      - Constraints: ${r1cs.nConstraints}`);
    console.log(`      - Variables: ${r1cs.nVars}`);
    console.log(`      - Proving key: ${zkeyPath}`);
    console.log(`      - Verification key: ${vkeyPath}`);

    return true;
  } catch (error) {
    console.error(`❌ Error setting up ${circuit.name}:`, error.message);
    return false;
  }
}

async function setup() {
  console.log(
    "🔧 Starting Emergency Guardian ZK Circuit Setup (Simplified)...\n"
  );

  // Create directories if they don't exist
  const dirs = [
    "build",
    "keys",
    "keys/identity",
    "keys/emergency",
    "keys/authorization",
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  try {
    // Download or generate powers of tau
    const ptauPath = await downloadPtau();

    // Setup each circuit
    let successCount = 0;
    for (const circuit of CIRCUITS) {
      const success = await setupCircuit(circuit, ptauPath);
      if (success) successCount++;
    }

    console.log(
      `\n🎉 ZK Circuit setup completed! (${successCount}/${CIRCUITS.length} circuits)`
    );
    console.log("\n📋 Next steps:");
    console.log("   1. Run tests: npm test");
    console.log("   2. Generate proofs: node js/proof-generator.js");
    console.log("   3. Integrate with smart contracts");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled rejection:", error);
  process.exit(1);
});

// Run setup
if (require.main === module) {
  setup().catch(console.error);
}

module.exports = { setup };
