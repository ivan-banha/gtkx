#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Build the SEA (Single Executable Application) first
pnpm build:sea

# Create output directory
mkdir -p dist/flatpak

# Create temporary repo directory
TEMP_REPO=$(mktemp -d)

# Build the flatpak and install it locally
# --user: Install to user's home directory
# --install: Install the app after building
# --force-clean: Clean up build directory before starting
# --repo: Specify the repository to export to
flatpak-builder --user --install --force-clean --repo="$TEMP_REPO" build-dir flatpak/org.gtkx.flatpak.yaml

# Export as a distributable .flatpak bundle
flatpak build-bundle "$TEMP_REPO" dist/flatpak/org.gtkx.flatpak.flatpak org.gtkx.flatpak

# Clean up temporary repo
rm -rf "$TEMP_REPO"

echo "Flatpak bundle created at: dist/flatpak/org.gtkx.flatpak.flatpak"
