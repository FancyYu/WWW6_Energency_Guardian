# Emergency Guardian System - Deployment Guide

This guide covers the deployment of the Emergency Guardian System smart contracts to testnet and mainnet.

## Prerequisites

### Required Tools

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, cast, anvil)
- Node.js 16+ (for frontend integration)
- Git

### Required Accounts

- Ethereum wallet with sufficient ETH for deployment
- Etherscan API key for contract verification
- Infura/Alchemy API key for RPC access

## Configuration

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Network Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Contract Configuration
OWNER_ADDRESS=0x...  # Multisig wallet address for mainnet
INITIAL_GUARDIANS=0x...,0x...,0x...  # At least 3 guardians

# Timelock Configuration
EMERGENCY_TIMELOCK=3600        # 1 hour
GUARDIAN_CHANGE_TIMELOCK=86400 # 24 hours
GRACE_PERIOD=7200              # 2 hours

# Approval Thresholds
REQUIRED_APPROVALS_LEVEL1=1
REQUIRED_APPROVALS_LEVEL2=2
REQUIRED_APPROVALS_LEVEL3=3
```

### 2. Security Considerations

**For Testnet:**

- Use test ETH only
- Can use development private keys
- Shorter timelock periods for testing

**For Mainnet:**

- Use hardware wallet or secure key management
- Set owner to multisig wallet
- Use production timelock periods (minimum 1 hour)
- Minimum 3 guardians required

## Deployment Process

### Testnet Deployment (Sepolia)

1. **Prepare Environment**

   ```bash
   # Install dependencies
   forge install

   # Compile contracts
   forge build

   # Run tests
   forge test
   ```

2. **Deploy to Sepolia**

   ```bash
   ./deploy-sepolia.sh
   ```

3. **Verify Deployment**

   ```bash
   # Check deployment artifacts
   ls deployments/

   # Verify contract interaction
   forge script script/Verify.s.sol --rpc-url $SEPOLIA_RPC_URL
   ```

### Mainnet Deployment

1. **Pre-deployment Checklist**

   - [ ] All tests passing
   - [ ] Security audit completed
   - [ ] Multisig wallet prepared
   - [ ] Guardian addresses confirmed
   - [ ] Timelock periods reviewed
   - [ ] Gas price checked

2. **Deploy to Mainnet**

   ```bash
   ./deploy-mainnet.sh
   ```

3. **Post-deployment Steps**
   - [ ] Verify contracts on Etherscan
   - [ ] Transfer ownership to multisig
   - [ ] Update frontend configuration
   - [ ] Test all functionality
   - [ ] Set up monitoring

## Contract Addresses

After deployment, contracts will be deployed in this order:

1. **ZKProofVerifier** - Handles zero-knowledge proof verification
2. **EmergencyManagement Implementation** - Logic contract
3. **EmergencyManagement Proxy** - UUPS proxy for upgrades
4. **EmergencyManagement** - Main interaction address (proxy)

## Verification

### Automated Verification

The deployment scripts automatically verify contracts on Etherscan. If verification fails, you can manually verify:

```bash
forge verify-contract \
    --chain-id 11155111 \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cast abi-encode "constructor()") \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --compiler-version v0.8.26+commit.8a97fa7a \
    CONTRACT_ADDRESS \
    src/ZKProofVerifier.sol:ZKProofVerifier
```

### Manual Testing

Test contract functionality after deployment:

```bash
# Test ZK Proof Verifier
cast call ZK_VERIFIER_ADDRESS "getVersion()" --rpc-url $RPC_URL

# Test Emergency Management
cast call EMERGENCY_MGMT_ADDRESS "owner()" --rpc-url $RPC_URL
cast call EMERGENCY_MGMT_ADDRESS "getCurrentEmergencyState()" --rpc-url $RPC_URL
```

## Configuration Management

### Initial Configuration

After deployment, configure the contracts:

```bash
forge script script/Config.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### Updating Configuration

Update timelock settings:

```bash
cast send EMERGENCY_MGMT_ADDRESS \
    "updateTimelockConfig(uint256,uint256,uint256)" \
    3600 86400 7200 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY
```

Update verification keys:

```bash
cast send ZK_VERIFIER_ADDRESS \
    "updateVerificationKey(uint256,bytes32)" \
    0 0x1234... \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY
```

## Monitoring and Maintenance

### Event Monitoring

Monitor important events:

- `EmergencyProposed`
- `EmergencyActivated`
- `PaymentExecuted`
- `GuardianConfigChanged`

### Upgrade Process

The contracts use UUPS upgradeable pattern:

1. Deploy new implementation
2. Prepare upgrade transaction
3. Execute upgrade through multisig
4. Verify upgrade success

```bash
# Deploy new implementation
forge create src/EmergencyManagement.sol:EmergencyManagement --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Upgrade proxy (through multisig)
cast send EMERGENCY_MGMT_ADDRESS \
    "upgradeTo(address)" \
    NEW_IMPLEMENTATION_ADDRESS \
    --rpc-url $RPC_URL
```

## Troubleshooting

### Common Issues

1. **Deployment Fails**

   - Check gas price and limit
   - Verify RPC URL is working
   - Ensure sufficient ETH balance

2. **Verification Fails**

   - Check Etherscan API key
   - Verify compiler version matches
   - Check constructor arguments

3. **Configuration Fails**
   - Verify caller has correct permissions
   - Check timelock periods are within bounds
   - Ensure guardian addresses are valid

### Gas Optimization

For mainnet deployment, optimize gas usage:

- Deploy during low network congestion
- Use appropriate gas price
- Consider batch operations for configuration

## Security Best Practices

1. **Key Management**

   - Use hardware wallets for mainnet
   - Never commit private keys to version control
   - Use environment variables for sensitive data

2. **Access Control**

   - Transfer ownership to multisig immediately after deployment
   - Verify all guardian addresses before deployment
   - Set appropriate timelock periods

3. **Testing**
   - Test all functionality on testnet first
   - Verify upgrade mechanisms work correctly
   - Test emergency scenarios thoroughly

## Support

For deployment issues:

1. Check the troubleshooting section above
2. Review deployment logs for specific errors
3. Verify all prerequisites are met
4. Test on local network first if needed

## Deployment Checklist

### Pre-deployment

- [ ] Environment configured
- [ ] Tests passing
- [ ] Security review completed
- [ ] Guardian addresses confirmed
- [ ] Multisig wallet prepared

### Deployment

- [ ] Contracts deployed successfully
- [ ] Contracts verified on Etherscan
- [ ] Initial configuration completed
- [ ] Ownership transferred to multisig

### Post-deployment

- [ ] Frontend updated with new addresses
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified
- [ ] Functionality tested end-to-end
