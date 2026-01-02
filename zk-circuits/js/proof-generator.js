const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * ZK Proof Generator for Emergency Guardian System
 * Generates proofs for identity, emergency state, and authorization circuits
 */

class ZKProofGenerator {
  constructor() {
    this.circuitsPath = path.join(__dirname, "..", "build");
    this.keysPath = path.join(__dirname, "..", "keys");
    this.circuits = ["identity", "emergency", "authorization"];
  }

  /**
   * Generate identity proof for guardian
   * @param {Object} inputs - Identity proof inputs
   * @returns {Object} Generated proof and public signals
   */
  async generateIdentityProof(inputs) {
    console.log("🔐 Generating guardian identity proof...");

    const {
      secret,
      nullifier,
      merkleProof,
      merkleIndex,
      merkleRoot,
      emergencyHash,
    } = inputs;

    // Validate inputs
    this._validateIdentityInputs(inputs);

    try {
      const circuitInputs = {
        secret: secret,
        nullifier: nullifier,
        merkleProof: merkleProof,
        merkleIndex: merkleIndex,
        merkleRoot: merkleRoot,
        emergencyHash: emergencyHash,
      };

      const wasmPath = path.join(
        this.circuitsPath,
        "identity_js",
        "identity.wasm"
      );
      const zkeyPath = path.join(
        this.keysPath,
        "identity",
        "identity_final.zkey"
      );

      // Generate witness
      const { witness } = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
      );

      // Generate proof
      const proof = await snarkjs.groth16.prove(zkeyPath, witness);

      console.log("✅ Identity proof generated successfully");

      return {
        proof: this._formatProof(proof.proof),
        publicSignals: proof.publicSignals,
        nullifierHash: proof.publicSignals[0],
        commitment: proof.publicSignals[1],
        isValid: proof.publicSignals[2],
      };
    } catch (error) {
      console.error("❌ Error generating identity proof:", error.message);
      throw error;
    }
  }

  /**
   * Generate emergency state proof
   * @param {Object} inputs - Emergency proof inputs
   * @returns {Object} Generated proof and public signals
   */
  async generateEmergencyProof(inputs) {
    console.log("🚨 Generating emergency state proof...");

    const {
      emergencyType,
      timestamp,
      userSecret,
      nonce,
      severity,
      userAddress,
      minTimestamp,
      maxTimestamp,
    } = inputs;

    // Validate inputs
    this._validateEmergencyInputs(inputs);

    try {
      const circuitInputs = {
        emergencyType: emergencyType,
        timestamp: timestamp,
        userSecret: userSecret,
        nonce: nonce,
        severity: severity,
        userAddress: userAddress,
        minTimestamp: minTimestamp,
        maxTimestamp: maxTimestamp,
      };

      const wasmPath = path.join(
        this.circuitsPath,
        "emergency_js",
        "emergency.wasm"
      );
      const zkeyPath = path.join(
        this.keysPath,
        "emergency",
        "emergency_final.zkey"
      );

      // Generate proof
      const proof = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
      );

      console.log("✅ Emergency proof generated successfully");

      return {
        proof: this._formatProof(proof.proof),
        publicSignals: proof.publicSignals,
        emergencyHash: proof.publicSignals[0],
        commitment: proof.publicSignals[1],
        isValid: proof.publicSignals[2],
        severityCommitment: proof.publicSignals[3],
      };
    } catch (error) {
      console.error("❌ Error generating emergency proof:", error.message);
      throw error;
    }
  }

  /**
   * Generate authorization proof for operation execution
   * @param {Object} inputs - Authorization proof inputs
   * @returns {Object} Generated proof and public signals
   */
  async generateAuthorizationProof(inputs) {
    console.log("🔑 Generating authorization proof...");

    const {
      guardianSecret,
      operationType,
      authNonce,
      guardianIndex,
      targetAddress,
      amount,
      timestamp,
      emergencyLevel,
      minAuthLevel,
    } = inputs;

    // Validate inputs
    this._validateAuthorizationInputs(inputs);

    try {
      const circuitInputs = {
        guardianSecret: guardianSecret,
        operationType: operationType,
        authNonce: authNonce,
        guardianIndex: guardianIndex,
        targetAddress: targetAddress,
        amount: amount,
        timestamp: timestamp,
        emergencyLevel: emergencyLevel,
        minAuthLevel: minAuthLevel,
      };

      const wasmPath = path.join(
        this.circuitsPath,
        "authorization_js",
        "authorization.wasm"
      );
      const zkeyPath = path.join(
        this.keysPath,
        "authorization",
        "authorization_final.zkey"
      );

      // Generate proof
      const proof = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
      );

      console.log("✅ Authorization proof generated successfully");

      return {
        proof: this._formatProof(proof.proof),
        publicSignals: proof.publicSignals,
        authHash: proof.publicSignals[0],
        operationCommitment: proof.publicSignals[1],
        guardianCommitment: proof.publicSignals[2],
        isAuthorized: proof.publicSignals[3],
      };
    } catch (error) {
      console.error("❌ Error generating authorization proof:", error.message);
      throw error;
    }
  }

  /**
   * Batch generate multiple proofs
   * @param {Array} proofRequests - Array of proof requests
   * @returns {Array} Array of generated proofs
   */
  async generateBatchProofs(proofRequests) {
    console.log(`🔄 Generating ${proofRequests.length} proofs in batch...`);

    const results = [];

    for (const request of proofRequests) {
      try {
        let proof;

        switch (request.type) {
          case "identity":
            proof = await this.generateIdentityProof(request.inputs);
            break;
          case "emergency":
            proof = await this.generateEmergencyProof(request.inputs);
            break;
          case "authorization":
            proof = await this.generateAuthorizationProof(request.inputs);
            break;
          default:
            throw new Error(`Unknown proof type: ${request.type}`);
        }

        results.push({
          type: request.type,
          success: true,
          proof: proof,
        });
      } catch (error) {
        results.push({
          type: request.type,
          success: false,
          error: error.message,
        });
      }
    }

    console.log(
      `✅ Batch proof generation completed: ${
        results.filter((r) => r.success).length
      }/${results.length} successful`
    );

    return results;
  }

  /**
   * Verify a generated proof
   * @param {string} circuitType - Type of circuit (identity, emergency, authorization)
   * @param {Object} proof - Proof to verify
   * @param {Array} publicSignals - Public signals
   * @returns {boolean} Verification result
   */
  async verifyProof(circuitType, proof, publicSignals) {
    console.log(`🔍 Verifying ${circuitType} proof...`);

    try {
      const vkeyPath = path.join(
        this.keysPath,
        circuitType,
        "verification_key.json"
      );

      if (!fs.existsSync(vkeyPath)) {
        throw new Error(`Verification key not found: ${vkeyPath}`);
      }

      const vKey = JSON.parse(fs.readFileSync(vkeyPath));
      const result = await snarkjs.groth16.verify(vKey, publicSignals, proof);

      console.log(
        `${result ? "✅" : "❌"} Proof verification ${
          result ? "passed" : "failed"
        }`
      );

      return result;
    } catch (error) {
      console.error("❌ Error verifying proof:", error.message);
      return false;
    }
  }

  /**
   * Generate random inputs for testing
   * @param {string} circuitType - Type of circuit
   * @returns {Object} Random inputs
   */
  generateTestInputs(circuitType) {
    const randomBytes = (length) => crypto.randomBytes(length).toString("hex");
    const randomInt = (max) => Math.floor(Math.random() * max) + 1;
    const randomBigInt = () => BigInt("0x" + randomBytes(32));

    switch (circuitType) {
      case "identity":
        return {
          secret: randomBigInt(),
          nullifier: randomBigInt(),
          merkleProof: Array(20)
            .fill(0)
            .map(() => randomBigInt()),
          merkleIndex: randomInt(1000000),
          merkleRoot: randomBigInt(),
          emergencyHash: randomBigInt(),
        };

      case "emergency":
        const now = Math.floor(Date.now() / 1000);
        return {
          emergencyType: randomInt(5),
          timestamp: now,
          userSecret: randomBigInt(),
          nonce: randomBigInt(),
          severity: randomInt(10),
          userAddress: randomBigInt(),
          minTimestamp: now - 3600,
          maxTimestamp: now + 3600,
        };

      case "authorization":
        return {
          guardianSecret: randomBigInt(),
          operationType: randomInt(10),
          authNonce: randomBigInt(),
          guardianIndex: randomInt(100),
          targetAddress: randomBigInt(),
          amount: randomBigInt() % BigInt(1000000000000000000000n), // Max 1000 ETH
          timestamp: Math.floor(Date.now() / 1000),
          emergencyLevel: randomInt(3),
          minAuthLevel: randomInt(3),
        };

      default:
        throw new Error(`Unknown circuit type: ${circuitType}`);
    }
  }

  // Private helper methods
  _formatProof(proof) {
    return {
      pi_a: [proof.pi_a[0], proof.pi_a[1]],
      pi_b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      pi_c: [proof.pi_c[0], proof.pi_c[1]],
    };
  }

  _validateIdentityInputs(inputs) {
    const required = [
      "secret",
      "nullifier",
      "merkleProof",
      "merkleIndex",
      "merkleRoot",
      "emergencyHash",
    ];
    for (const field of required) {
      if (inputs[field] === undefined || inputs[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (
      !Array.isArray(inputs.merkleProof) ||
      inputs.merkleProof.length !== 20
    ) {
      throw new Error("merkleProof must be an array of 20 elements");
    }
  }

  _validateEmergencyInputs(inputs) {
    const required = [
      "emergencyType",
      "timestamp",
      "userSecret",
      "nonce",
      "severity",
      "userAddress",
      "minTimestamp",
      "maxTimestamp",
    ];
    for (const field of required) {
      if (inputs[field] === undefined || inputs[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (inputs.emergencyType < 1 || inputs.emergencyType > 5) {
      throw new Error("emergencyType must be between 1 and 5");
    }

    if (inputs.severity < 1 || inputs.severity > 10) {
      throw new Error("severity must be between 1 and 10");
    }
  }

  _validateAuthorizationInputs(inputs) {
    const required = [
      "guardianSecret",
      "operationType",
      "authNonce",
      "guardianIndex",
      "targetAddress",
      "amount",
      "timestamp",
      "emergencyLevel",
      "minAuthLevel",
    ];
    for (const field of required) {
      if (inputs[field] === undefined || inputs[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (inputs.operationType < 1 || inputs.operationType > 10) {
      throw new Error("operationType must be between 1 and 10");
    }

    if (inputs.emergencyLevel < 1 || inputs.emergencyLevel > 3) {
      throw new Error("emergencyLevel must be between 1 and 3");
    }
  }
}

module.exports = { ZKProofGenerator };
