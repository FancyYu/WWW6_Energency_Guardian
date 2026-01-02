#!/bin/bash

# Install dependencies for ZK circuits development
set -e

echo "🔧 Installing dependencies for ZK circuits..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo "✅ Rust installed successfully"
else
    echo "✅ Rust is already installed"
fi

# Install circom from source
if ! command -v circom &> /dev/null; then
    echo "🔨 Installing circom from source..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Clone and build circom
    git clone https://github.com/iden3/circom.git
    cd circom
    cargo build --release
    cargo install --path circom
    
    # Cleanup
    cd /
    rm -rf "$TEMP_DIR"
    
    echo "✅ Circom installed successfully"
else
    echo "✅ Circom is already installed"
fi

# Verify installations
echo ""
echo "🔍 Verifying installations..."
rustc --version
cargo --version
circom --version

echo ""
echo "🎉 All dependencies installed successfully!"
echo "📋 Next steps:"
echo "   1. npm run compile"
echo "   2. npm run setup"