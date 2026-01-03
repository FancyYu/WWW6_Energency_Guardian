pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/mux1.circom";

/**
 * @title Guardian Identity Proof Circuit (Simplified)
 * @dev Proves guardian identity without revealing the actual guardian address
 * Uses simplified Merkle tree verification
 */
template GuardianIdentity(levels) {
    // Private inputs
    signal input secret;           // Guardian's secret key
    signal input nullifier;       // Unique nullifier to prevent reuse
    signal input merkleProof[levels]; // Merkle inclusion proof
    signal input merkleIndex;     // Index in Merkle tree
    
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
    
    // 3. Simplified Merkle tree verification
    // Convert index to bits for Merkle proof
    num2Bits.in <== merkleIndex;
    
    // Verify Merkle path (simplified version)
    component merkleHashers[levels];
    component merkleSelectors[levels];
    
    signal currentHash[levels + 1];
    currentHash[0] <== commitment;
    
    for (var i = 0; i < levels; i++) {
        merkleHashers[i] = Poseidon(2);
        merkleSelectors[i] = Mux1();
        
        // Select left or right based on path bit
        merkleSelectors[i].c[0] <== currentHash[i];
        merkleSelectors[i].c[1] <== merkleProof[i];
        merkleSelectors[i].s <== num2Bits.out[i];
        
        // Hash with sibling
        merkleHashers[i].inputs[0] <== merkleSelectors[i].out;
        merkleHashers[i].inputs[1] <== merkleProof[i];
        
        currentHash[i + 1] <== merkleHashers[i].out;
    }
    
    // 4. Verify the final hash matches the root
    component rootCheck = IsEqual();
    rootCheck.in[0] <== currentHash[levels];
    rootCheck.in[1] <== merkleRoot;
    isValid <== rootCheck.out;
    
    // 5. Constraint: nullifier must be non-zero to prevent trivial proofs
    component nullifierCheck = IsZero();
    nullifierCheck.in <== nullifier;
    nullifierCheck.out === 0;
    
    // 6. Constraint: secret must be non-zero
    component secretCheck = IsZero();
    secretCheck.in <== secret;
    secretCheck.out === 0;
}



// Main component with 20 levels (supports up to 2^20 = ~1M guardians)
component main = GuardianIdentity(20);