/**
 * Mock ZK proofs for development and testing
 * Generates valid-looking proofs without actual circuit compilation
 */

const { ZKUtils } = require("./utils");

class MockZKProofGenerator {
  /**
   * Generate mock identity proof
   */
  async generateIdentityProof(inputs) {
    console.log("🔐 Generating mock identity proof...");

    // Validate inputs structure
    this._validateIdentityInputs(inputs);

    // Generate mock proof with correct structure
    const mockProof = this._generateMockGroth16Proof();

    // Generate realistic public signals
    const nullifierHash = ZKUtils.poseidonHash([
      inputs.secret,
      inputs.nullifier,
    ]);
    const commitment = ZKUtils.poseidonHash([
      inputs.secret,
      inputs.emergencyHash,
      inputs.nullifier,
    ]);
    const isValid = BigInt(1); // Always valid for mock

    console.log("✅ Mock identity proof generated");

    return {
      proof: mockProof,
      publicSignals: [
        nullifierHash.toString(),
        commitment.toString(),
        isValid.toString(),
      ],
      nullifierHash: nullifierHash.toString(),
      commitment: commitment.toString(),
      isValid: isValid.toString(),
    };
  }

  /**
   * Generate mock emergency proof
   */
  async generateEmergencyProof(inputs) {
    console.log("🚨 Generating mock emergency proof...");

    this._validateEmergencyInputs(inputs);

    const mockProof = this._generateMockGroth16Proof();

    // Generate realistic public signals
    const emergencyHash = ZKUtils.poseidonHash([
      BigInt(inputs.emergencyType),
      BigInt(inputs.timestamp),
      inputs.userAddress,
      inputs.nonce,
    ]);

    const commitment = ZKUtils.poseidonHash([
      BigInt(inputs.emergencyType),
      BigInt(inputs.timestamp),
      inputs.userSecret,
      inputs.nonce,
      BigInt(inputs.severity),
    ]);

    const severityCommitment = ZKUtils.poseidonHash([
      BigInt(inputs.severity),
      inputs.userSecret,
      inputs.nonce,
    ]);

    const isValid = BigInt(1);

    console.log("✅ Mock emergency proof generated");

    return {
      proof: mockProof,
      publicSignals: [
        emergencyHash.toString(),
        commitment.toString(),
        isValid.toString(),
        severityCommitment.toString(),
      ],
      emergencyHash: emergencyHash.toString(),
      commitment: commitment.toString(),
      isValid: isValid.toString(),
      severityCommitment: severityCommitment.toString(),
    };
  }

  /**
   * Generate mock authorization proof
   */
  async generateAuthorizationProof(inputs) {
    console.log("🔑 Generating mock authorization proof...");

    this._validateAuthorizationInputs(inputs);

    const mockProof = this._generateMockGroth16Proof();

    // Generate realistic public signals
    const authHash = ZKUtils.poseidonHash([
      BigInt(inputs.operationType),
      inputs.targetAddress,
      inputs.amount,
      BigInt(inputs.timestamp),
    ]);

    const operationCommitment = ZKUtils.poseidonHash([
      BigInt(inputs.operationType),
      inputs.targetAddress,
      inputs.amount,
      inputs.guardianSecret,
      inputs.authNonce,
      BigInt(inputs.emergencyLevel),
    ]);

    const guardianCommitment = ZKUtils.poseidonHash([
      inputs.guardianSecret,
      BigInt(inputs.guardianIndex),
      inputs.authNonce,
    ]);

    const isAuthorized = BigInt(1);

    console.log("✅ Mock authorization proof generated");

    return {
      proof: mockProof,
      publicSignals: [
        authHash.toString(),
        operationCommitment.toString(),
        guardianCommitment.toString(),
        isAuthorized.toString(),
      ],
      authHash: authHash.toString(),
      operationCommitment: operationCommitment.toString(),
      guardianCommitment: guardianCommitment.toString(),
      isAuthorized: isAuthorized.toString(),
    };
  }

  // Generate mock Groth16 proof structure
  _generateMockGroth16Proof() {
    return {
      pi_a: [
        ZKUtils.generateRandomFieldElement().toString(),
        ZKUtils.generateRandomFieldElement().toString(),
      ],
      pi_b: [
        [
          ZKUtils.generateRandomFieldElement().toString(),
          ZKUtils.generateRandomFieldElement().toString(),
        ],
        [
          ZKUtils.generateRandomFieldElement().toString(),
          ZKUtils.generateRandomFieldElement().toString(),
        ],
      ],
      pi_c: [
        ZKUtils.generateRandomFieldElement().toString(),
        ZKUtils.generateRandomFieldElement().toString(),
      ],
    };
  }

  // Validation methods (same as real generator)
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
  }
}

module.exports = { MockZKProofGenerator };
