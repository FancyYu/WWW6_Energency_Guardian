const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Utility functions for ZK circuit operations
 */

class ZKUtils {
  /**
   * Generate cryptographically secure random BigInt
   * @param {number} bytes - Number of bytes for randomness
   * @returns {BigInt} Random BigInt
   */
  static generateRandomBigInt(bytes = 32) {
    const randomBytes = crypto.randomBytes(bytes);
    return BigInt("0x" + randomBytes.toString("hex"));
  }

  /**
   * Generate random field element for bn128 curve
   * @returns {BigInt} Random field element
   */
  static generateRandomFieldElement() {
    // bn128 field size
    const fieldSize = BigInt(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617"
    );
    let random;

    do {
      random = this.generateRandomBigInt(32);
    } while (random >= fieldSize);

    return random;
  }

  /**
   * Convert string to BigInt (for addresses, hashes, etc.)
   * @param {string} str - String to convert
   * @returns {BigInt} Converted BigInt
   */
  static stringToBigInt(str) {
    if (str.startsWith("0x")) {
      return BigInt(str);
    }

    // Convert string to hex then to BigInt
    const hex = Buffer.from(str, "utf8").toString("hex");
    return BigInt("0x" + hex);
  }

  /**
   * Convert BigInt to hex string
   * @param {BigInt} bigInt - BigInt to convert
   * @returns {string} Hex string
   */
  static bigIntToHex(bigInt) {
    return "0x" + bigInt.toString(16);
  }

  /**
   * Generate Merkle tree from array of leaves
   * @param {Array} leaves - Array of leaf values (BigInt)
   * @returns {Object} Merkle tree with root and proofs
   */
  static generateMerkleTree(leaves) {
    if (leaves.length === 0) {
      throw new Error("Cannot generate Merkle tree from empty array");
    }

    // Pad to power of 2
    const paddedLeaves = [...leaves];
    while (paddedLeaves.length & (paddedLeaves.length - 1)) {
      paddedLeaves.push(BigInt(0));
    }

    const tree = [paddedLeaves];
    let currentLevel = paddedLeaves;

    // Build tree bottom-up
    while (currentLevel.length > 1) {
      const nextLevel = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || BigInt(0);
        const hash = this.poseidonHash([left, right]);
        nextLevel.push(hash);
      }

      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    const root = currentLevel[0];

    return {
      root: root,
      tree: tree,
      leaves: paddedLeaves,
      generateProof: (leafIndex) => this.generateMerkleProof(tree, leafIndex),
    };
  }

  /**
   * Generate Merkle proof for a specific leaf
   * @param {Array} tree - Merkle tree levels
   * @param {number} leafIndex - Index of leaf to prove
   * @returns {Object} Merkle proof
   */
  static generateMerkleProof(tree, leafIndex) {
    const proof = [];
    const pathIndices = [];
    let currentIndex = leafIndex;

    // Generate proof path from leaf to root
    for (let level = 0; level < tree.length - 1; level++) {
      const currentLevel = tree[level];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      proof.push(currentLevel[siblingIndex] || BigInt(0));
      pathIndices.push(isRightNode ? 1 : 0);

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      proof: proof,
      pathIndices: pathIndices,
      leaf: tree[0][leafIndex],
      root: tree[tree.length - 1][0],
    };
  }

  /**
   * Verify Merkle proof
   * @param {Object} merkleProof - Merkle proof to verify
   * @returns {boolean} Verification result
   */
  static verifyMerkleProof(merkleProof) {
    const { proof, pathIndices, leaf, root } = merkleProof;

    let currentHash = leaf;

    for (let i = 0; i < proof.length; i++) {
      const sibling = proof[i];
      const isRightNode = pathIndices[i] === 1;

      if (isRightNode) {
        currentHash = this.poseidonHash([sibling, currentHash]);
      } else {
        currentHash = this.poseidonHash([currentHash, sibling]);
      }
    }

    return currentHash === root;
  }

  /**
   * Simulate Poseidon hash (for testing without circomlib)
   * In production, use actual Poseidon implementation
   * @param {Array} inputs - Array of BigInt inputs
   * @returns {BigInt} Hash result
   */
  static poseidonHash(inputs) {
    // This is a simplified hash for testing
    // In production, use the actual Poseidon hash from circomlib
    const combined = inputs.reduce((acc, input) => acc + input.toString(), "");
    const hash = crypto.createHash("sha256").update(combined).digest("hex");
    return (
      BigInt("0x" + hash) %
      BigInt(
        "21888242871839275222246405745257275088548364400416034343698204186575808495617"
      )
    );
  }

  /**
   * Generate test guardian registry
   * @param {number} count - Number of guardians
   * @returns {Object} Guardian registry with Merkle tree
   */
  static generateTestGuardianRegistry(count = 100) {
    const guardians = [];

    for (let i = 0; i < count; i++) {
      const secret = this.generateRandomFieldElement();
      const commitment = this.poseidonHash([secret, BigInt(i)]);

      guardians.push({
        index: i,
        secret: secret,
        commitment: commitment,
        address: this.bigIntToHex(this.generateRandomBigInt(20)), // 20 bytes for address
      });
    }

    const commitments = guardians.map((g) => g.commitment);
    const merkleTree = this.generateMerkleTree(commitments);

    return {
      guardians: guardians,
      merkleTree: merkleTree,
      getGuardian: (index) => guardians[index],
      getProofForGuardian: (index) => merkleTree.generateProof(index),
    };
  }

  /**
   * Format proof for Solidity contract
   * @param {Object} proof - snarkjs proof object
   * @returns {Object} Formatted proof for Solidity
   */
  static formatProofForSolidity(proof) {
    return {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      c: [proof.pi_c[0], proof.pi_c[1]],
    };
  }

  /**
   * Validate circuit inputs
   * @param {Object} inputs - Circuit inputs to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation result
   */
  static validateInputs(inputs, schema) {
    const errors = [];
    const warnings = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = inputs[field];

      // Check required fields
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${field}`);
        continue;
      }

      if (value !== undefined && value !== null) {
        // Check type
        if (rules.type === "bigint" && typeof value !== "bigint") {
          errors.push(`Field ${field} must be BigInt`);
        }

        if (rules.type === "array" && !Array.isArray(value)) {
          errors.push(`Field ${field} must be an array`);
        }

        // Check range
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`Field ${field} must be >= ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
          errors.push(`Field ${field} must be <= ${rules.max}`);
        }

        // Check array length
        if (
          rules.length !== undefined &&
          Array.isArray(value) &&
          value.length !== rules.length
        ) {
          errors.push(`Field ${field} must have length ${rules.length}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
    };
  }

  /**
   * Save proof to file
   * @param {Object} proof - Proof to save
   * @param {string} filename - Output filename
   * @param {string} directory - Output directory
   */
  static saveProofToFile(proof, filename, directory = "proofs") {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const filepath = path.join(directory, filename);
    const proofData = {
      ...proof,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };

    fs.writeFileSync(filepath, JSON.stringify(proofData, null, 2));
    console.log(`💾 Proof saved to: ${filepath}`);
  }

  /**
   * Load proof from file
   * @param {string} filepath - Path to proof file
   * @returns {Object} Loaded proof
   */
  static loadProofFromFile(filepath) {
    if (!fs.existsSync(filepath)) {
      throw new Error(`Proof file not found: ${filepath}`);
    }

    const proofData = JSON.parse(fs.readFileSync(filepath));
    console.log(`📂 Proof loaded from: ${filepath}`);

    return proofData;
  }

  /**
   * Get circuit statistics
   * @param {string} circuitPath - Path to circuit R1CS file
   * @returns {Object} Circuit statistics
   */
  static async getCircuitStats(circuitPath) {
    try {
      const snarkjs = require("snarkjs");
      const stats = await snarkjs.r1cs.info(circuitPath);

      return {
        constraints: stats.nConstraints,
        variables: stats.nVars,
        publicInputs: stats.nPubInputs,
        outputs: stats.nOutputs,
        labels: stats.nLabels,
      };
    } catch (error) {
      console.error("Error getting circuit stats:", error.message);
      return null;
    }
  }
}

module.exports = { ZKUtils };
