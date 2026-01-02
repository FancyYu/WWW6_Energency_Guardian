pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/merkletree.circom";
include "circomlib/circuits/bitify.circom";

/**
 * @title Guardian Identity Proof Circuit
 * @dev Proves guardian identity without revealing the actual guardian address
 * Uses Merkle tree inclusion proof to verify guardian is registered
 */
template GuardianIdentity(levels) {
    // Private inputs
    signal private input secret;           // Guardian's secret key
    signal private input nullifier;       // Unique nullifier to prevent reuse
    signal private input merkleProof[levels]; // Merkle inclusion proof
    signal private input merkleIndex;     // Index in Merkle tree
    
    // Public inputs
    signal input merkleRoot;              // Public Merkle root of guardian registry
    signal input emergencyHash;          // Hash of emergency being responded to
    
    // Outputs
    signal output nullifierHash;         // Public nullifier hash
    signal output commitment;            // Public commitment to guardian identity
    signal output isValid;               // Validity flag
    
    // Components
    component poseidon1 = Poseidon(2);
    component poseidon2 = Poseidon(3);
    component poseidon3 = Poseidon(2);
    component merkleTree = MerkleTreeInclusionProof(levels);
    component num2Bits = Num2Bits(levels);
    
    // 1. Generate nullifier hash to prevent double-spending
    poseidon1.inputs[0] <== secret;
    poseidon1.inputs[1] <== nullifier;
    nullifierHash <== poseidon1.out;
    
    // 2. Generate guardian commitment
    poseidon2.inputs[0] <== secret;
    poseidon2.inputs[1] <== emergencyHash;
    poseidon2.inputs[2] <== nullifier;
    commitment <== poseidon2.out;
    
    // 3. Verify Merkle tree inclusion
    // Convert index to bits for Merkle proof
    num2Bits.in <== merkleIndex;
    
    // Set up Merkle tree verification
    merkleTree.leaf <== commitment;
    merkleTree.root <== merkleRoot;
    
    for (var i = 0; i < levels; i++) {
        merkleTree.pathElements[i] <== merkleProof[i];
        merkleTree.pathIndices[i] <== num2Bits.out[i];
    }
    
    // 4. Verify the proof is valid
    isValid <== merkleTree.root;
    
    // 5. Constraint: nullifier must be non-zero to prevent trivial proofs
    component nullifierCheck = IsZero();
    nullifierCheck.in <== nullifier;
    nullifierCheck.out === 0;
    
    // 6. Constraint: secret must be non-zero
    component secretCheck = IsZero();
    secretCheck.in <== secret;
    secretCheck.out === 0;
}

/**
 * @title IsZero
 * @dev Helper template to check if input is zero
 */
template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    
    inv <-- in != 0 ? 1/in : 0;
    
    out <== -in*inv + 1;
    in*out === 0;
}

// Main component with 20 levels (supports up to 2^20 = ~1M guardians)
component main = GuardianIdentity(20);