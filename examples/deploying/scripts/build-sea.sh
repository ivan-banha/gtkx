#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_DIR/dist"
REPO_ROOT="$(cd "$PROJECT_DIR/../.." && pwd)"

echo "=== Building GTKX deploying SEA ==="
echo "Project: $PROJECT_DIR"
echo "Output: $DIST_DIR"

mkdir -p "$DIST_DIR"

echo ""
echo "Step 1: Compiling TypeScript..."
pnpm build

echo ""
echo "Step 2: Bundling with esbuild..."
pnpm bundle

echo ""
echo "Step 3: Generating SEA blob..."
node --experimental-sea-config "$PROJECT_DIR/sea-config.json"

echo ""
echo "Step 4: Copying Node.js binary..."
SYSTEM_NODE_BIN=$(command -v node)
NODE_VERSION=$(node -v)

# Check if Node binary supports SEA injection
# Not all Node.js binaries support SEA. The binary must contain a specific "fuse" signature
# (NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2) that marks where the blob should be injected.
# Some package managers strip this signature or build without it.
if ! grep -a -q "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2" "$SYSTEM_NODE_BIN"; then
    echo "Current Node binary does not support SEA injection. Downloading compatible version..."

    NODE_DIST="node-$NODE_VERSION-linux-x64"
    NODE_ARCHIVE_URL="https://nodejs.org/dist/$NODE_VERSION/$NODE_DIST.tar.gz"
    DOWNLOADED_NODE_BIN="$DIST_DIR/$NODE_DIST/bin/node"

    wget -q "$NODE_ARCHIVE_URL" -O "$DIST_DIR/node.tar.gz"
    tar -xf "$DIST_DIR/node.tar.gz" -C "$DIST_DIR"
    cp "$DOWNLOADED_NODE_BIN" "$DIST_DIR/app"

    rm -rf "$DIST_DIR/$NODE_DIST"
    rm "$DIST_DIR/node.tar.gz"

    echo "Using extracted Node binary: $SYSTEM_NODE_BIN"
else
    echo "Node binary supports SEA injection. Using: $SYSTEM_NODE_BIN"
    cp "$SYSTEM_NODE_BIN" "$DIST_DIR/app"
fi


echo ""
echo "Step 5: Injecting SEA blob..."
# Inject the blob into the Node binary.
# This uses the 'postject' tool to insert the JS bundle into the executable.
# The sentinel fuse is a magic string that Node.js uses to find the injected code.
npx postject "$DIST_DIR/app" NODE_SEA_BLOB "$DIST_DIR/sea-prep.blob" \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

echo ""
echo "Step 6: Copying native module..."
# The native module cannot be bundled into the SEA blob.
# It must be placed alongside the executable so the native loader can find it.
NATIVE_MODULE="$REPO_ROOT/packages/native/dist/index.node"

if [ ! -f "$NATIVE_MODULE" ]; then
    echo "Native module not found at $NATIVE_MODULE"
    echo "Building native module..."
    (cd "$REPO_ROOT/packages/native" && pnpm native-build && pnpm build)
fi

cp "$NATIVE_MODULE" "$DIST_DIR/"

echo ""
echo "=== Build complete ==="
echo ""
echo "Output files:"
echo "  Executable: $DIST_DIR/app"
echo "  Native:     $DIST_DIR/index.node"
echo ""
echo "To run: cd $DIST_DIR && ./app"
