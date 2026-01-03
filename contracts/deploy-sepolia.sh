#!/bin/bash

# Deploy Emergency Guardian System to Sepolia Testnet

set -e

echo "🚀 Deploying Emergency Guardian System to Sepolia Testnet..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ] || [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "❌ Missing required environment variables. Please check your .env file."
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "  Network: Sepolia Testnet"
echo "  RPC URL: $SEPOLIA_RPC_URL"
echo "  Owner: ${OWNER_ADDRESS:-"Same as deployer"}"
echo "  Emergency Timelock: ${EMERGENCY_TIMELOCK:-3600} seconds"
echo "  Guardian Change Timelock: ${GUARDIAN_CHANGE_TIMELOCK:-86400} seconds"

# Create deployments directory
mkdir -p deployments

# Deploy contracts
echo "🔨 Deploying contracts..."
forge script script/DeployTestnet.s.sol:DeployTestnetScript \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    -vvvv

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "📁 Deployment artifacts saved to deployments/"
    echo "🔍 Contracts verified on Etherscan"
    echo ""
    echo "Next steps:"
    echo "1. Update frontend configuration with new contract addresses"
    echo "2. Test all functionality on testnet"
    echo "3. Configure monitoring and alerts"
else
    echo "❌ Deployment failed!"
    exit 1
fi