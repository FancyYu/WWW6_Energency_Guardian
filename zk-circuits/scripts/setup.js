const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * Setup script for Emergency Guardian ZK circuits
 * Generates proving and verification keys for all circuits
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

async function setup() {
  console.log("🔧 Starting Emergency Guardian ZK Circuit Setup...\n");

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

  for (const circuit of CIRCUITS) {
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
        continue;
      }

      console.log(`   📊 R1CS file: ${r1csPath}`);
      console.log(`   🔧 WASM file: ${wasmPath}`);

      // Phase 1: Powers of Tau ceremony (using existing ptau file or generate)
      const ptauPath = path.join("keys", "powersOfTau28_hez_final_15.ptau");

      if (!fs.existsSync(ptauPath)) {
        console.log(
          `   🌟 Generating Powers of Tau (this may take a while)...`
        );

        // Start new ceremony
        await snarkjs.powersOfTau.newAccumulator(
          "bn128",
          15, // 2^15 = 32768 constraints
          path.join("keys", "pot15_0000.ptau")
        );

        // Contribute to ceremony
        await snarkjs.powersOfTau.contribute(
          path.join("keys", "pot15_0000.ptau"),
          path.join("keys", "pot15_0001.ptau"),
          "Emergency Guardian Setup",
          "emergency-guardian-entropy-" + Date.now()
        );

        // Phase 2
        await snarkjs.powersOfTau.preparePhase2(
          path.join("keys", "pot15_0001.ptau"),
          ptauPath
        );

        // Cleanup intermediate files
        fs.unlinkSync(path.join("keys", "pot15_0000.ptau"));
        fs.unlinkSync(path.join("keys", "pot15_0001.ptau"));

        console.log(`   ✅ Powers of Tau ceremony completed`);
      } else {
        console.log(`   ♻️  Using existing Powers of Tau file`);
      }

      // Phase 2: Circuit-specific setup
      console.log(`   🔑 Generating proving key...`);

      // Generate zkey
      await snarkjs.zKey.newZKey(r1csPath, ptauPath, zkeyPath);

      // Contribute to phase 2
      const zkeyFinalPath = path.join(
        "keys",
        circuit.name,
        `${circuit.name}_final.zkey`
      );
      await snarkjs.zKey.contribute(
        zkeyPath,
        zkeyFinalPath,
        `${circuit.name} contribution`,
        `${circuit.name}-entropy-` + Date.now()
      );

      // Export verification key
      const vKey = await snarkjs.zKey.exportVerificationKey(zkeyFinalPath);
      fs.writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));

      // Get circuit info
      const r1cs = await snarkjs.r1cs.info(r1csPath);

      console.log(`   ✅ Setup completed for ${circuit.name}`);
      console.log(`      - Constraints: ${r1cs.nConstraints}`);
      console.log(`      - Variables: ${r1cs.nVars}`);
      console.log(`      - Proving key: ${zkeyFinalPath}`);
      console.log(`      - Verification key: ${vkeyPath}`);

      // Cleanup intermediate zkey
      fs.unlinkSync(zkeyPath);
    } catch (error) {
      console.error(`❌ Error setting up ${circuit.name}:`, error.message);
    }
  }

  console.log("\n🎉 ZK Circuit setup completed!");
  console.log("\n📋 Next steps:");
  console.log("   1. Run tests: npm test");
  console.log("   2. Generate proofs: node js/proof-generator.js");
  console.log("   3. Integrate with smart contracts");
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
