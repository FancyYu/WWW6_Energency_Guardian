#!/bin/bash

# Deploy Emergency Guardian System to Mainnet

set -e

echo "🚀 Deploying Emergency Guardian System to Mainnet..."
echo "⚠️  WARNING: This is a MAINNET deployment!"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ] || [ -z "$MAINNET_RPC_URL" ]; then
    echo "❌ Missing required environment variables. Please check your .env file."
    exit 1
fi

# Additional mainnet safety checks
if [ -z "$OWNER_ADDRESS" ]; then
    echo "❌ OWNER_ADDRESS must be set for mainnet deployment"
    exit 1
fi

if [ -z "$INITIAL_GUARDIANS" ]; then
    echo "❌ INITIAL_GUARDIANS must be set for mainnet deployment"
    exit 1
fi

echo "📋 Mainnet Deployment Configuration:"
echo "  Network: Ethereum Mainnet"
echo "  RPC URL: $MAINNET_RPC_URL"
echo "  Owner: $OWNER_ADDRESS"
echo "  Emergency Timelock: ${EMERGENCY_TIMELOCK:-3600} seconds"
echo "  Guardian Change Timelock: ${GUARDIAN_CHANGE_TIMELOCK:-86400} seconds"
echo "  Initial Guardians: $INITIAL_GUARDIANS"

# Confirmation prompt
echo ""
read -p "⚠️  Are you sure you want to deploy to MAINNET? This will cost real ETH! (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Create deployments directory
mkdir -p deployments

# Deploy contracts
echo "🔨 Deploying contracts to MAINNET..."
forge script script/DeployMainnet.s.sol:DeployMainnetScript \
    --rpc-url $MAINNET_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --gas-price ${GAS_PRICE:-20}000000000 \
    -vvvv

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ MAINNET Deployment successful!"
    echo "📁 Deployment artifacts saved to deployments/"
    echo "🔍 Contracts verified on Etherscan"
    echo ""
    echo "🚨 CRITICAL NEXT STEPS:"
    echo "1. Transfer contract ownership to multisig wallet"
    echo "2. Update all frontend and backend configurations"
    echo "3. Perform comprehensive testing"
    echo "4. Set up monitoring and alerts"
    echo "5. Notify all stakeholders"
else
    echo "❌ MAINNET Deployment failed!"
    exit 1
fi