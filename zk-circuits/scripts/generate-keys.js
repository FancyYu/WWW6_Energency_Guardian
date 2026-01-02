const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * Generate proving and verification keys for Emergency Guardian circuits
 * This script handles the trusted setup ceremony for all circuits
 */

const CIRCUITS = ["identity", "emergency", "authorization"];

async function generateKeys() {
  console.log("🔐 Generating ZK Circuit Keys for Emergency Guardian...\n");

  // Ensure directories exist
  if (!fs.existsSync("keys")) {
    fs.mkdirSync("keys", { recursive: true });
  }

  for (const circuitName of CIRCUITS) {
    console.log(`\n🔄 Processing ${circuitName} circuit...`);

    const circuitDir = path.join("keys", circuitName);
    if (!fs.existsSync(circuitDir)) {
      fs.mkdirSync(circuitDir, { recursive: true });
    }

    const r1csPath = path.join("build", `${circuitName}.r1cs`);
    const wasmPath = path.join(
      "build",
      `${circuitName}_js`,
      `${circuitName}.wasm`
    );

    if (!fs.existsSync(r1csPath)) {
      console.log(
        `❌ R1CS file not found for ${circuitName}. Please compile circuits first.`
      );
      continue;
    }

    try {
      // Generate proving key
      console.log(`   🔑 Generating proving key for ${circuitName}...`);

      const ptauPath = path.join("keys", "powersOfTau28_hez_final_15.ptau");
      const zkeyPath = path.join(circuitDir, `${circuitName}.zkey`);
      const vkeyPath = path.join(circuitDir, "verification_key.json");

      // Check if ptau file exists, if not download or generate
      if (!fs.existsSync(ptauPath)) {
        console.log(`   📥 Powers of Tau file not found. Generating...`);

        // For development, we'll use a smaller ceremony
        // In production, use the official ceremony files
        await snarkjs.powersOfTau.newAccumulator(
          snarkjs.getCurveFromName("bn128"),
          12, // 2^12 = 4096 constraints (sufficient for our circuits)
          path.join("keys", "pot12_0000.ptau")
        );

        await snarkjs.powersOfTau.contribute(
          path.join("keys", "pot12_0000.ptau"),
          path.join("keys", "pot12_0001.ptau"),
          "Emergency Guardian",
          "random-entropy-" + Math.random()
        );

        await snarkjs.powersOfTau.preparePhase2(
          path.join("keys", "pot12_0001.ptau"),
          ptauPath
        );

        // Cleanup
        fs.unlinkSync(path.join("keys", "pot12_0000.ptau"));
        fs.unlinkSync(path.join("keys", "pot12_0001.ptau"));
      }

      // Generate circuit-specific zkey
      await snarkjs.zKey.newZKey(r1csPath, ptauPath, zkeyPath);

      // Export verification key
      const vKey = await snarkjs.zKey.exportVerificationKey(zkeyPath);
      fs.writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));

      // Get circuit statistics
      const r1cs = await snarkjs.r1cs.info(r1csPath);

      console.log(`   ✅ Keys generated for ${circuitName}`);
      console.log(`      - Constraints: ${r1cs.nConstraints}`);
      console.log(`      - Variables: ${r1cs.nVars}`);
      console.log(`      - Public signals: ${r1cs.nPubInputs + r1cs.nOutputs}`);
      console.log(
        `      - Proving key size: ${(
          fs.statSync(zkeyPath).size /
          1024 /
          1024
        ).toFixed(2)} MB`
      );
    } catch (error) {
      console.error(
        `❌ Error generating keys for ${circuitName}:`,
        error.message
      );
    }
  }

  console.log("\n🎉 Key generation completed!");

  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    circuits: {},
    totalSize: 0,
  };

  for (const circuitName of CIRCUITS) {
    const zkeyPath = path.join("keys", circuitName, `${circuitName}.zkey`);
    const vkeyPath = path.join("keys", circuitName, "verification_key.json");

    if (fs.existsSync(zkeyPath) && fs.existsSync(vkeyPath)) {
      const zkeySize = fs.statSync(zkeyPath).size;
      const vkeySize = fs.statSync(vkeyPath).size;

      summary.circuits[circuitName] = {
        provingKeySize: zkeySize,
        verificationKeySize: vkeySize,
        provingKeyPath: zkeyPath,
        verificationKeyPath: vkeyPath,
      };

      summary.totalSize += zkeySize + vkeySize;
    }
  }

  fs.writeFileSync(
    path.join("keys", "summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(
    `\n📊 Total key size: ${(summary.totalSize / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(`📄 Summary saved to: keys/summary.json`);
}

if (require.main === module) {
  generateKeys().catch(console.error);
}

module.exports = { generateKeys };
