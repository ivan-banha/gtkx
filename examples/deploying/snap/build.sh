#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Build the SEA (Single Executable Application) first
pnpm build:sea

# Create output directory
mkdir -p dist/snap

# Build the snap package
# This uses 'snapcraft pack' which reads snapcraft.yaml
# It runs in a VM or container by default (LXD/Multipass) unless --destructive-mode is used
# Here we assume the environment is set up or it will prompt for provider
snapcraft -v pack --output ./dist/snap/gtkx-demo_0.1_amd64.snap

# Clean up snapcraft build artifacts
snapcraft clean

echo "Snap package created at: dist/snap/gtkx-demo_0.1_amd64.snap"

