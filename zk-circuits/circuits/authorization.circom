pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

/**
 * @title Execution Authorization Proof Circuit
 * @dev Proves authorization to execute operations without revealing guardian secrets
 * Supports multiple operation types with different authorization requirements
 */
template AuthorizationProof() {
    // Private inputs
    signal private input guardianSecret;     // Guardian's authorization secret
    signal private input operationType;      // Type of operation (1-10)
    signal private input authNonce;         // Unique authorization nonce
    signal private input guardianIndex;     // Guardian's index in registry
    
    // Public inputs
    signal input targetAddress;             // Target address for operation
    signal input amount;                   // Amount involved (can be 0 for non-financial ops)
    signal input timestamp;                // Authorization timestamp
    signal input emergencyLevel;           // Current emergency level (1-3)
    signal input minAuthLevel;             // Minimum authorization level required
    
    // Outputs
    signal output authHash;                // Authorization hash
    signal output operationCommitment;     // Commitment to authorized operation
    signal output guardianCommitment;      // Commitment to guardian authorization
    signal output isAuthorized;            // Authorization validity flag
    
    // Components
    component poseidon1 = Poseidon(4);
    component poseidon2 = Poseidon(6);
    component poseidon3 = Poseidon(3);
    component poseidon4 = Poseidon(2);
    
    // Validation components
    component operationTypeCheck = LessEqThan(8);     // operationType <= 10
    component emergencyLevelCheck = LessEqThan(8);    // emergencyLevel <= 3
    component authLevelCheck = GreaterEqThan(8);      // emergencyLevel >= minAuthLevel
    
    // Zero check components
    component secretCheck = IsZero();
    component nonceCheck = IsZero();
    component addressCheck = IsZero();
    
    // 1. Validate operation type (1-10)
    operationTypeCheck.in[0] <== operationType;
    operationTypeCheck.in[1] <== 10;
    operationTypeCheck.out === 1;
    
    // Operation type must be at least 1
    component operationTypeMin = GreaterEqThan(8);
    operationTypeMin.in[0] <== operationType;
    operationTypeMin.in[1] <== 1;
    operationTypeMin.out === 1;
    
    // 2. Validate emergency level (1-3)
    emergencyLevelCheck.in[0] <== emergencyLevel;
    emergencyLevelCheck.in[1] <== 3;
    emergencyLevelCheck.out === 1;
    
    // Emergency level must be at least 1
    component emergencyLevelMin = GreaterEqThan(8);
    emergencyLevelMin.in[0] <== emergencyLevel;
    emergencyLevelMin.in[1] <== 1;
    emergencyLevelMin.out === 1;
    
    // 3. Check authorization level requirement
    authLevelCheck.in[0] <== emergencyLevel;
    authLevelCheck.in[1] <== minAuthLevel;
    authLevelCheck.out === 1;
    
    // 4. Ensure critical inputs are non-zero
    secretCheck.in <== guardianSecret;
    secretCheck.out === 0;
    
    nonceCheck.in <== authNonce;
    nonceCheck.out === 0;
    
    addressCheck.in <== targetAddress;
    addressCheck.out === 0;
    
    // 5. Generate authorization hash
    poseidon1.inputs[0] <== operationType;
    poseidon1.inputs[1] <== targetAddress;
    poseidon1.inputs[2] <== amount;
    poseidon1.inputs[3] <== timestamp;
    authHash <== poseidon1.out;
    
    // 6. Generate operation commitment
    poseidon2.inputs[0] <== operationType;
    poseidon2.inputs[1] <== targetAddress;
    poseidon2.inputs[2] <== amount;
    poseidon2.inputs[3] <== guardianSecret;
    poseidon2.inputs[4] <== authNonce;
    poseidon2.inputs[5] <== emergencyLevel;
    operationCommitment <== poseidon2.out;
    
    // 7. Generate guardian commitment
    poseidon3.inputs[0] <== guardianSecret;
    poseidon3.inputs[1] <== guardianIndex;
    poseidon3.inputs[2] <== authNonce;
    guardianCommitment <== poseidon3.out;
    
    // 8. Generate authorization validity proof
    poseidon4.inputs[0] <== authHash;
    poseidon4.inputs[1] <== operationCommitment;
    isAuthorized <== poseidon4.out;
    
    // 9. Additional constraints for high-value operations
    // If amount > threshold, require higher emergency level
    component amountThreshold = GreaterThan(64);
    amountThreshold.in[0] <== amount;
    amountThreshold.in[1] <== 1000000000000000000000; // 1000 ETH in wei
    
    // If high-value operation, emergency level must be at least 2
    component highValueCheck = LessEqThan(8);
    signal highValueRequirement;
    highValueRequirement <== amountThreshold.out * (2 - emergencyLevel);
    highValueCheck.in[0] <== highValueRequirement;
    highValueCheck.in[1] <== 0;
    highValueCheck.out === 1;
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

// Main component
component main = AuthorizationProof();