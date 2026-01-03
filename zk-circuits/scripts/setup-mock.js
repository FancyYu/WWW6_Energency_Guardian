const fs = require("fs");
const path = require("path");

/**
 * Mock setup script for Emergency Guardian ZK circuits
 * Creates mock keys for development and testing
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

function createMockVerificationKey(circuitName) {
  // Mock verification key structure for development
  return {
    protocol: "groth16",
    curve: "bn128",
    nPublic: 3,
    vk_alpha_1: [
      "20491192805390485299153009773594534940189261866228447918068658471970481763042",
      "9383485363053290200918347156157836566562967994039712273449902621266178545958",
      "1",
    ],
    vk_beta_2: [
      [
        "6375614351688725206403948262868962793625744043794305715222011528459656738731",
        "4252822878758300859123897981450591353533073413197771768651442665752259397132",
      ],
      [
        "10505242626370262277552901082094356697409835680220590971873171140371331206856",
        "21847035105528745403288232691147584728191162732299865338377159692350059136679",
      ],
      ["1", "0"],
    ],
    vk_gamma_2: [
      [
        "10857046999023057135944570762232829481370756359578518086990519993285655852781",
        "11559732032986387107991004021392285783925812861821192530917403151452391805634",
      ],
      [
        "8495653923123431417604973247489272438418190587263600148770280649306958101930",
        "4082367875863433681332203403145435568316851327593401208105741076214120093531",
      ],
      ["1", "0"],
    ],
    vk_delta_2: [
      [
        "10857046999023057135944570762232829481370756359578518086990519993285655852781",
        "11559732032986387107991004021392285783925812861821192530917403151452391805634",
      ],
      [
        "8495653923123431417604973247489272438418190587263600148770280649306958101930",
        "4082367875863433681332203403145435568316851327593401208105741076214120093531",
      ],
      ["1", "0"],
    ],
    vk_alphabeta_12: [],
    IC: [
      [
        "5616469518913509529866404395194143877797046086160064604022686358004328594052",
        "11142187463392177196255431580779265094890543259495329720825306264165980830557",
        "1",
      ],
      [
        "16165975933942742648174502274471846943179669094571785869924194509158852308349",
        "19321463894373734681884753783137168434571095329763421306106395788866892170914",
        "1",
      ],
    ],
    circuitName: circuitName,
    mockKey: true,
  };
}

async function setup() {
  console.log(
    "🔧 Starting Emergency Guardian ZK Circuit Setup (Mock Mode)...\n"
  );
  console.log("⚠️  This is a MOCK setup for development only!");
  console.log("   Real proofs require proper ceremony setup.\n");

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

  let successCount = 0;

  for (const circuit of CIRCUITS) {
    console.log(`\n🔄 Setting up ${circuit.description} (Mock)...`);

    try {
      // Paths
      const r1csPath = path.join("build", `${circuit.name}.r1cs`);
      const wasmPath = path.join(
        "build",
        `${circuit.name}_js`,
        `${circuit.name}.wasm`
      );
      const zkeyPath = path.join(
        "keys",
        circuit.name,
        `${circuit.name}_mock.zkey`
      );
      const vkeyPath = path.join("keys", circuit.name, `verification_key.json`);

      // Check if R1CS file exists
      if (!fs.existsSync(r1csPath)) {
        console.log(`❌ R1CS file not found: ${r1csPath}`);
        console.log(`   Please run: npm run compile`);
        continue;
      }

      if (!fs.existsSync(wasmPath)) {
        console.log(`❌ WASM file not found: ${wasmPath}`);
        console.log(`   Please run: npm run compile`);
        continue;
      }

      console.log(`   📊 R1CS file: ${r1csPath}`);
      console.log(`   🔧 WASM file: ${wasmPath}`);

      // Create mock zkey file (just a placeholder)
      fs.writeFileSync(
        zkeyPath,
        JSON.stringify(
          {
            type: "mock_zkey",
            circuit: circuit.name,
            created: new Date().toISOString(),
            note: "This is a mock proving key for development only",
          },
          null,
          2
        )
      );

      // Create mock verification key
      const vKey = createMockVerificationKey(circuit.name);
      fs.writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));

      console.log(`   ✅ Mock setup completed for ${circuit.name}`);
      console.log(`      - Mock proving key: ${zkeyPath}`);
      console.log(`      - Mock verification key: ${vkeyPath}`);

      successCount++;
    } catch (error) {
      console.error(`❌ Error setting up ${circuit.name}:`, error.message);
    }
  }

  console.log(
    `\n🎉 Mock ZK Circuit setup completed! (${successCount}/${CIRCUITS.length} circuits)`
  );
  console.log("\n📋 Next steps:");
  console.log("   1. Run tests: npm test");
  console.log("   2. Generate mock proofs: node js/proof-generator.js");
  console.log(
    "   3. For production: Set up real ceremony with proper powers of tau"
  );
  console.log("\n⚠️  Remember: Mock keys are for development only!");
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
