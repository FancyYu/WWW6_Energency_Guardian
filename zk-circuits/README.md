# Emergency Guardian ZK Circuits

Zero-Knowledge Proof circuits for the Emergency Guardian system, providing privacy-preserving identity verification, emergency state validation, and operation authorization.

## Overview

This module implements three core ZK circuits:

1. **Identity Circuit** (`identity.circom`) - Proves guardian identity without revealing sensitive information
2. **Emergency Circuit** (`emergency.circom`) - Validates emergency states with privacy protection
3. **Authorization Circuit** (`authorization.circom`) - Authorizes operations with guardian consensus

## Features

- 🔐 **Privacy-Preserving**: Zero-knowledge proofs protect sensitive guardian and user data
- 🌳 **Merkle Tree Integration**: Efficient guardian registry with inclusion proofs
- 🔒 **Commitment Schemes**: Secure hiding of emergency details and authorization data
- ⚡ **Batch Processing**: Generate and verify multiple proofs efficiently
- 🛡️ **Security Validation**: Comprehensive input validation and constraint checking

## Architecture

```
zk-circuits/
├── circuits/           # Circom circuit definitions
│   ├── identity.circom      # Guardian identity proof
│   ├── emergency.circom     # Emergency state proof
│   └── authorization.circom # Operation authorization proof
├── js/                # JavaScript proof generation and verification
│   ├── proof-generator.js   # Main proof generator
│   ├── verifier.js         # Proof verifier
│   └── utils.js            # Utility functions
├── keys/              # Generated proving and verification keys
├── build/             # Compiled circuit artifacts
├── scripts/           # Setup and utility scripts
└── test/              # Test files
```

## Quick Start

### Prerequisites

- Node.js 16+
- Rust (for circom compiler)
- circom 2.1.6+

### Installation

```bash
# Install dependencies
npm install

# Install circom compiler (if not already installed)
./scripts/install-deps.sh

# Compile circuits
npm run compile

# Generate proving and verification keys
npm run setup
```

### Basic Usage

```javascript
const { ZKProofGenerator, ZKProofVerifier } = require("./js");

// Initialize
const generator = new ZKProofGenerator();
const verifier = new ZKProofVerifier();

// Generate identity proof
const identityInputs = {
  secret: guardianSecret,
  nullifier: uniqueNullifier,
  merkleProof: guardianMerkleProof,
  merkleIndex: guardianIndex,
  merkleRoot: registryRoot,
  emergencyHash: emergencyHash,
};

const proof = await generator.generateIdentityProof(identityInputs);
const isValid = await verifier.verifyIdentityProof(
  proof.proof,
  proof.publicSignals
);
```

## Circuit Specifications

### Identity Circuit

**Purpose**: Prove guardian identity without revealing the actual guardian address.

**Private Inputs**:

- `secret`: Guardian's secret key
- `nullifier`: Unique nullifier to prevent reuse
- `merkleProof[20]`: Merkle inclusion proof (20 levels = ~1M guardians)
- `merkleIndex`: Index in Merkle tree

**Public Inputs**:

- `merkleRoot`: Public Merkle root of guardian registry
- `emergencyHash`: Hash of emergency being responded to

**Outputs**:

- `nullifierHash`: Public nullifier hash for uniqueness
- `commitment`: Public commitment to guardian identity
- `isValid`: Validity flag

### Emergency Circuit

**Purpose**: Prove the validity of an emergency state without revealing sensitive details.

**Private Inputs**:

- `emergencyType`: Type of emergency (1-5)
- `timestamp`: When emergency occurred
- `userSecret`: User's secret for commitment
- `nonce`: Unique nonce for this emergency
- `severity`: Emergency severity level (1-10)

**Public Inputs**:

- `userAddress`: User's Ethereum address
- `minTimestamp`: Minimum valid timestamp
- `maxTimestamp`: Maximum valid timestamp

**Outputs**:

- `emergencyHash`: Hash of emergency details
- `commitment`: Commitment to emergency state
- `isValid`: Validity flag
- `severityCommitment`: Commitment to severity level

### Authorization Circuit

**Purpose**: Prove authorization to execute operations without revealing guardian secrets.

**Private Inputs**:

- `guardianSecret`: Guardian's authorization secret
- `operationType`: Type of operation (1-10)
- `authNonce`: Unique authorization nonce
- `guardianIndex`: Guardian's index in registry

**Public Inputs**:

- `targetAddress`: Target address for operation
- `amount`: Amount involved in operation
- `timestamp`: Authorization timestamp
- `emergencyLevel`: Current emergency level (1-3)
- `minAuthLevel`: Minimum authorization level required

**Outputs**:

- `authHash`: Authorization hash
- `operationCommitment`: Commitment to authorized operation
- `guardianCommitment`: Commitment to guardian authorization
- `isAuthorized`: Authorization validity flag

## Security Features

### Constraint Validation

All circuits include comprehensive constraint validation:

- **Range Checks**: Emergency types (1-5), severity levels (1-10), operation types (1-10)
- **Timestamp Validation**: Ensures emergency timestamps are within valid ranges
- **Non-Zero Constraints**: Prevents trivial proofs with zero values
- **Authorization Levels**: Validates emergency level meets minimum requirements

### Privacy Protection

- **Nullifier System**: Prevents double-spending and replay attacks
- **Commitment Schemes**: Hide sensitive data while proving validity
- **Merkle Tree Inclusion**: Efficient guardian verification without revealing identity
- **Field Element Validation**: All inputs validated within bn128 field

### High-Value Operation Protection

The authorization circuit includes special constraints for high-value operations:

- Operations > 1000 ETH require emergency level ≥ 2
- Additional validation for critical operations
- Guardian consensus requirements based on operation value

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Identity Circuit"

# Run demo
node demo.js
```

## Performance

| Circuit       | Constraints | Proving Time | Verification Time | Key Size |
| ------------- | ----------- | ------------ | ----------------- | -------- |
| Identity      | ~1000       | ~2s          | ~10ms             | ~50MB    |
| Emergency     | ~800        | ~1.5s        | ~8ms              | ~40MB    |
| Authorization | ~600        | ~1s          | ~6ms              | ~30MB    |

_Performance measured on Apple M1 Pro_

## Integration with Smart Contracts

The generated proofs are compatible with Solidity verification:

```solidity
// Example verification in Solidity
function verifyGuardianIdentity(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[3] memory publicSignals
) public view returns (bool) {
    return zkVerifier.verifyProof(a, b, c, publicSignals);
}
```

## Development

### Adding New Circuits

1. Create new `.circom` file in `circuits/`
2. Add compilation to `package.json` scripts
3. Implement generator methods in `proof-generator.js`
4. Add verification methods in `verifier.js`
5. Update tests and documentation

### Debugging Circuits

```bash
# Compile with debug symbols
circom circuits/identity.circom --r1cs --wasm --sym --c -o build/

# Generate witness for debugging
node build/identity_js/generate_witness.js build/identity_js/identity.wasm input.json witness.wtns
```

## Security Considerations

⚠️ **Important Security Notes**:

1. **Trusted Setup**: This implementation uses a development trusted setup. For production, use the official Powers of Tau ceremony.

2. **Key Management**: Proving keys are large (~50MB each). Implement proper key distribution and verification.

3. **Input Validation**: Always validate inputs before proof generation to prevent constraint violations.

4. **Nullifier Management**: Implement proper nullifier tracking to prevent double-spending.

5. **Circuit Auditing**: Have circuits audited by ZK security experts before production use.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For questions and support:

- Create an issue on GitHub
- Check the documentation in `docs/`
- Review example usage in `demo.js`
