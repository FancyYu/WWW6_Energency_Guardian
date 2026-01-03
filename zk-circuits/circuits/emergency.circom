pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

/**
 * @title Emergency State Proof Circuit
 * @dev Proves the validity of an emergency state without revealing sensitive details
 * Uses commitment scheme to hide emergency specifics while proving authenticity
 */
template EmergencyProof() {
    // Private inputs
    signal input emergencyType;   // Type of emergency (1-5)
    signal input timestamp;       // When emergency occurred
    signal input userSecret;      // User's secret for commitment
    signal input nonce;          // Unique nonce for this emergency
    signal input severity;        // Emergency severity level (1-10)
    
    // Public inputs
    signal input userAddress;            // User's Ethereum address (public)
    signal input minTimestamp;           // Minimum valid timestamp
    signal input maxTimestamp;           // Maximum valid timestamp
    
    // Outputs
    signal output emergencyHash;         // Hash of emergency details
    signal output commitment;            // Commitment to emergency state
    signal output isValid;               // Validity flag
    signal output severityCommitment;    // Commitment to severity level
    
    // Components
    component poseidon1 = Poseidon(4);
    component poseidon2 = Poseidon(5);
    component poseidon3 = Poseidon(3);
    component poseidon4 = Poseidon(2);
    
    // Range check components
    component emergencyTypeCheck = LessEqThan(8);  // emergencyType <= 5
    component severityCheck = LessEqThan(8);        // severity <= 10
    component timestampMinCheck = GreaterEqThan(64); // timestamp >= minTimestamp
    component timestampMaxCheck = LessEqThan(64);    // timestamp <= maxTimestamp
    
    // Zero check components
    component nonceCheck = IsZero();
    component secretCheck = IsZero();
    
    // 1. Validate emergency type (1-5)
    emergencyTypeCheck.in[0] <== emergencyType;
    emergencyTypeCheck.in[1] <== 5;
    emergencyTypeCheck.out === 1;
    
    // Emergency type must be at least 1
    component emergencyTypeMin = GreaterEqThan(8);
    emergencyTypeMin.in[0] <== emergencyType;
    emergencyTypeMin.in[1] <== 1;
    emergencyTypeMin.out === 1;
    
    // 2. Validate severity level (1-10)
    severityCheck.in[0] <== severity;
    severityCheck.in[1] <== 10;
    severityCheck.out === 1;
    
    // Severity must be at least 1
    component severityMin = GreaterEqThan(8);
    severityMin.in[0] <== severity;
    severityMin.in[1] <== 1;
    severityMin.out === 1;
    
    // 3. Validate timestamp range
    timestampMinCheck.in[0] <== timestamp;
    timestampMinCheck.in[1] <== minTimestamp;
    timestampMinCheck.out === 1;
    
    timestampMaxCheck.in[0] <== timestamp;
    timestampMaxCheck.in[1] <== maxTimestamp;
    timestampMaxCheck.out === 1;
    
    // 4. Ensure nonce and secret are non-zero
    nonceCheck.in <== nonce;
    nonceCheck.out === 0;
    
    secretCheck.in <== userSecret;
    secretCheck.out === 0;
    
    // 5. Generate emergency hash
    poseidon1.inputs[0] <== emergencyType;
    poseidon1.inputs[1] <== timestamp;
    poseidon1.inputs[2] <== userAddress;
    poseidon1.inputs[3] <== nonce;
    emergencyHash <== poseidon1.out;
    
    // 6. Generate commitment to emergency state
    poseidon2.inputs[0] <== emergencyType;
    poseidon2.inputs[1] <== timestamp;
    poseidon2.inputs[2] <== userSecret;
    poseidon2.inputs[3] <== nonce;
    poseidon2.inputs[4] <== severity;
    commitment <== poseidon2.out;
    
    // 7. Generate severity commitment (for risk assessment)
    poseidon3.inputs[0] <== severity;
    poseidon3.inputs[1] <== userSecret;
    poseidon3.inputs[2] <== nonce;
    severityCommitment <== poseidon3.out;
    
    // 8. Generate validity proof
    poseidon4.inputs[0] <== emergencyHash;
    poseidon4.inputs[1] <== commitment;
    isValid <== poseidon4.out;
}

// Main component
component main = EmergencyProof();