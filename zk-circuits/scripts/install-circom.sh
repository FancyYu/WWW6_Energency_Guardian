#!/bin/bash

# Install Circom compiler for Emergency Guardian ZK circuits
# This script installs circom and related tools

set -e

echo "🔧 Installing Circom compiler..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check if we're on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS"
    
    # Install circom via Homebrew if available
    if command -v brew &> /dev/null; then
        echo "🍺 Installing circom via Homebrew..."
        brew install circom
    else
        echo "📦 Homebrew not found, installing circom from source..."
        install_from_source
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux"
    install_from_source
else
    echo "❓ Unknown OS: $OSTYPE"
    install_from_source
fi

function install_from_source() {
    echo "🔨 Installing circom from source..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Clone circom repository
    git clone https://github.com/iden3/circom.git
    cd circom
    
    # Build and install
    cargo build --release
    cargo install --path circom
    
    # Cleanup
    cd /
    rm -rf "$TEMP_DIR"
}

# Verify installation
if command -v circom &> /dev/null; then
    echo "✅ Circom installed successfully!"
    circom --version
else
    echo "❌ Circom installation failed"
    exit 1
fi

echo ""
echo "🎉 Installation complete!"
echo "📋 Next steps:"
echo "   1. cd zk-circuits"
echo "   2. npm run compile"
echo "   3. npm run setup"