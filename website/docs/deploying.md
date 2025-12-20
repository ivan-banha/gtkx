---
sidebar_position: 9
---

# Deploying

This guide explains how to bundle your GTKX application using
the [Node.js Single Executable Application (SEA)](https://nodejs.org/api/single-executable-applications.html) and
package it as **[Flatpak](https://docs.flatpak.org/)** or **[Snap](https://snapcraft.io/)**.

A complete working example is available in the
`examples/deploying` [directory](https://github.com/eugeniodepalo/gtkx/tree/main/examples/deploying) of the GTKX
repository.

## Overview

The deployment process has three main stages:

1. **Transpile Source Code**: Converting your TypeScript/React code into a JavaScript bundle.
2. **Build SEA**: Creating a standalone binary
   using [Node.js Single Executable Applications (SEA)](https://nodejs.org/api/single-executable-applications.html).
3. **Package**: Wrapping the binary with the required files and runtime dependencies into Flatpak or Snap package.

## GTKX-Specific Considerations

:::warning Native Module Requirement
Node.js Single Executable Applications (SEA) **cannot** embed native `.node` module inside the executable blob.
:::

The main challenge when bundling GTKX apps is that `@gtkx/native` contains a native `.node` module which cannot be
embedded into a Node.js SEA blob. To solve this problem:

1. Replace `@gtkx/native` imports with a loader that finds the native module at runtime.
2. Copy `index.node` and distribute it alongside the executable during packaging.

## Building the Node.js Executable

:::warning CommonJS Only
Node.js SEA currently supports only **[CommonJS](https://nodejs.org/api/modules.html)**
modules; [ESM](https://nodejs.org/api/esm.html) is not supported. So, you must bundle the application into a single
CommonJS file before injection. Make sure your code does not use ESM features that cannot be converted.
:::

### Step 1: Bundle with Native Loader

The application is bundled using [`esbuild`](https://esbuild.github.io/). A custom plugin is required to manage the
native module import. This plugin finds the native `index.node` module and imports it at runtime.

The loader detects whether it's running inside a SEA and loads `index.node` from either:

- Next to the executable (SEA mode)
- The normal `node_modules` path (development mode)

**`examples/deploying/scripts/bundle.ts`**:

```typescript
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {build, type Plugin} from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const nativeLoaderCode = `
const { createRequire } = require('node:module');
const { dirname, join } = require('node:path');

let nativeModule = null;

function getNativeModule() {
    if (nativeModule) return nativeModule;

    let nativePath;
    let isSea = false;

    try {
        const sea = require('node:sea');
        isSea = sea.isSea();
    } catch {}

    // If running as SEA, look for index.node next to the executable
    if (isSea) {
        nativePath = join(dirname(process.execPath), 'index.node');
    } else {
        nativePath = require.resolve('@gtkx/native/dist/index.node');
    }

    const nativeRequire = createRequire(nativePath);
    nativeModule = nativeRequire(nativePath);
    return nativeModule;
}

module.exports = getNativeModule();
module.exports.default = module.exports;
`;

const nativePlugin: Plugin = {
    name: "native-loader",
    setup(build) {
        // Intercept imports of @gtkx/native
        build.onResolve({filter: /^@gtkx\/native$/}, () => {
            return {
                path: "@gtkx/native",
                namespace: "native-loader",
            };
        });

        // Replace with our custom loader code
        build.onLoad({filter: /.*/, namespace: "native-loader"}, () => {
            return {
                contents: nativeLoaderCode,
                loader: "js",
            };
        });
    },
};

await build({
    entryPoints: [join(projectRoot, "dist/index.js")],
    bundle: true,
    platform: "node",
    target: "node22",
    format: "cjs", // Must be CommonJS for SEA
    outfile: join(projectRoot, "dist/bundle.cjs"),
    plugins: [nativePlugin],
    logLevel: "info",
});
```

### Step 2: SEA Configuration

Create a `sea-config.json` file to define the input bundle and output blob.

**`examples/deploying/sea-config.json`**:

```json
{
  "main": "dist/bundle.cjs",
  "output": "dist/sea-prep.blob",
  "disableExperimentalSEAWarning": true,
  "useCodeCache": false
}
```

### Step 3: Build SEA executable

The build process is written in a shell script and has several steps.

The script can be found here: `examples/deploying/scripts/build-sea.sh`

1. **Compile**: TypeScript to JavaScript.
2. **Bundle**: Create a single `.cjs` file with the native loader.
3. **Generate SEA Blob**: Create the SEA blob from the bundle.
4. **Prepare Node Binary**: Get a copy of the `node` executable. The SEA blob will be injected into it later on.
5. **Inject**: Inject the blob into the `node` binary using [`postject`](https://github.com/nodejs/postject).
6. **Copy Native Module**: Place `index.node` next to the new executable.

:::warning Node.js Binary Compatibility
Not all Node.js binaries support SEA injection. The binary must contain a specific "fuse" signature
(`NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`) that marks where the blob should be injected. Some package managers
strip this signature or build without it. The build script below handles this by checking for the signature and
downloading a compatible binary if necessary.
:::

**`examples/deploying/scripts/build-sea.sh`**:

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_DIR/dist"
REPO_ROOT="$(cd "$PROJECT_DIR/../.." && pwd)"

mkdir -p "$DIST_DIR"

# Step 1: Compiling TypeScript...
pnpm build

# Step 2: Bundling with esbuild...
pnpm bundle

# Step 3: Generating SEA blob...
node --experimental-sea-config "$PROJECT_DIR/sea-config.json"

# Step 4: Copying Node.js binary...
SYSTEM_NODE_BIN=$(command -v node)
NODE_VERSION=$(node -v)

# Check if Node binary supports SEA injection
if ! grep -a -q "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2" "$SYSTEM_NODE_BIN"; then
    NODE_DIST="node-$NODE_VERSION-linux-x64"
    NODE_ARCHIVE_URL="https://nodejs.org/dist/$NODE_VERSION/$NODE_DIST.tar.gz"
    DOWNLOADED_NODE_BIN="$DIST_DIR/$NODE_DIST/bin/node"

    wget -q "$NODE_ARCHIVE_URL" -O "$DIST_DIR/node.tar.gz"
    tar -xf "$DIST_DIR/node.tar.gz" -C "$DIST_DIR"
    cp "$DOWNLOADED_NODE_BIN" "$DIST_DIR/gtkx-demo"

    rm -rf "$DIST_DIR/$NODE_DIST"
    rm "$DIST_DIR/node.tar.gz"
else
    cp "$SYSTEM_NODE_BIN" "$DIST_DIR/gtkx-demo"
fi


# Step 5: Injecting SEA blob...
# Inject the blob into the Node binary.
# This uses the 'postject' tool to insert the JS bundle into the executable.
# The sentinel fuse is a magic string that Node.js uses to find the injected code.
npx postject "$DIST_DIR/gtkx-demo" NODE_SEA_BLOB "$DIST_DIR/sea-prep.blob" \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# Step 6: Copying native module...
# The native module cannot be bundled into the SEA blob.
# It must be placed alongside the executable so the native loader can find it.
NATIVE_MODULE="$REPO_ROOT/packages/native/dist/index.node"

if [ ! -f "$NATIVE_MODULE" ]; then
    (cd "$REPO_ROOT/packages/native" && pnpm native-build && pnpm build)
fi

cp "$NATIVE_MODULE" "$DIST_DIR/"
```

#### Build Output

After the script executes, the `dist/` directory will contain the following files which are essential for the next
packaging steps:

* **`gtkx-demo`**: The standalone executable binary.
* **`index.node`**: The native module.

## Building Flatpak package

Flatpak runs applications in a sandboxed environment.

### Manifest

The Flatpak manifest describes how to build and install the app. Since the binary is already built, the "build" step
just copies files to the correct locations in the sandbox (`/app/bin`). You can also describe the build process in the
manifest file if you want.

**`examples/deploying/flatpak/org.gtkx.flatpak.yaml`**:

```yaml
app-id: org.gtkx.flatpak
runtime: org.gnome.Platform
runtime-version: '48'
sdk: org.gnome.Sdk
sdk-extensions:
  - org.freedesktop.Sdk.Extension.node22
command: gtkx-flatpak-demo
finish-args:
  - --share=ipc
  - --socket=fallback-x11
  - --socket=wayland
  - --device=dri
build-options:
  append-path: /usr/lib/sdk/node22/bin
  env:
    npm_config_nodedir: /usr/lib/sdk/node22
  no-debuginfo: true
  strip: false
modules:
  - name: gtkx-flatpak
    buildsystem: simple
    build-options:
      build-args:
        - --share=network
    build-commands:
      - install -Dm755 dist/gtkx-demo /app/bin/gtkx-flatpak-demo
      - install -Dm755 dist/index.node /app/bin/index.node
      - install -Dm644 flatpak/org.gtkx.flatpak.desktop /app/share/applications/org.gtkx.flatpak.desktop
      - install -Dm644 flatpak/org.gtkx.flatpak.png /app/share/icons/hicolor/256x256/apps/org.gtkx.flatpak.png
    sources:
      - type: dir
        path: ..
        skip:
          - .flatpak-builder
          - build-dir
          - node_modules
          - node-v22.12.0-linux-x64
          - node-v22.12.0-linux-x64.tar.xz
          - generated-sources.json
          - additional-sources.json
```

**Key Configuration Details:**

- **`sdk-extensions`**: Adds Node.js support to the SDK, ensuring the environment matches the build requirements.
- **`finish-args`**: Defines the sandbox permissions:
    - `--socket=fallback-x11` / `--socket=wayland`: Allows the app to show a GUI.
    - `--device=dri`: Enables hardware acceleration.
- **`modules`**:
    - **`buildsystem: simple`**: Indicates that we are running shell commands directly.
    - **`build-commands`**: These commands install the pre-built binary (`gtkx-demo`) and the native module (
      `index.node`) into `/app/bin`.
    - **`sources`**: Points to the local directory (`..`) but excludes build artifacts to keep the context clean.

### Build Command

The package is created using [`flatpak-builder`](https://docs.flatpak.org/en/latest/flatpak-builder.html).

**`examples/deploying/flatpak/build.sh`**:

```bash
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
```

## Building Snap package

Snap is another popular packaging format.

### Snapcraft Configuration

The [`snapcraft.yaml`](https://snapcraft.io/docs/snapcraft-yaml-reference) file configures the package. The `nil` plugin
is used to copy the pre-built binaries manually.

**`examples/deploying/snap/snapcraft.yaml`**:

```yaml
name: gtkx-snap
base: core24
version: '0.1'
summary: GTKX Snap
description: GTKX Snap

grade: devel
confinement: devmode

platforms:
  amd64:

parts:
  gtkx-snap-part:
    plugin: nil
    source: .
    # We need the Node snap for the build tools (npm/node)
    build-snaps:
      - node/24/stable
    build-packages:
      - wget
    #      - ca-certificates

    # We do this during the build phase so it doesn't end up in the final snap
    override-build: |
      NODE_VERSION=$(node -v)
      NODE_DIST="node-$NODE_VERSION-linux-x64"
      NODE_URL="https://nodejs.org/dist/$NODE_VERSION/$NODE_DIST.tar.gz"

      mkdir -p $CRAFT_PART_INSTALL/bin
      mkdir -p $CRAFT_PART_INSTALL/gui

      cp ./snap/icon.png $CRAFT_PART_INSTALL/gui/
      cp ./snap/gtkx-snap.desktop $CRAFT_PART_INSTALL/gui/

      # 6. Copy native module
      cp ./dist/index.node $CRAFT_PART_INSTALL/bin/index.node
      cp ./dist/gtkx-demo $CRAFT_PART_INSTALL/bin/gtkx-demo

    # CRITICAL: This acts like the "clean" step in Docker
    # We only include the final binary. nothing else.
    prime:
      - bin/gtkx-demo
      - bin/index.node
      - gui/

apps:
  gtkx-demo:
    command: bin/gtkx-demo
    desktop: gui/gtkx-snap.desktop
    extensions: [ gnome ]
    environment:
      # This fixes the libpxbackend-1.0.so missing error
      LD_LIBRARY_PATH: $SNAP_DESKTOP_RUNTIME/usr/lib/$CRAFT_ARCH_TRIPLET/libproxy:$LD_LIBRARY_PATH
```

**Key Configuration Details:**

- **`confinement: devmode`**: Allows the application to access system resources without strict confinement (useful for
  development).
- **`parts`**:
    - **`plugin: nil`**: We use a custom build script (`override-build`) instead of a standard plugin.
    - **`build-snaps`**: Pulls in Node.js to ensure tools are available during the build.
    - **`override-build`**: This script manually copies the pre-built `gtkx-demo` binary and `index.node` into the
      snap's installation directory (`$CRAFT_PART_INSTALL`).
    - **`prime`**: Acts like a filter (similar to Docker's final stage), ensuring only the specified files (`bin/`,
      `gui/`) are included in the final package.
- **`apps`**:
    - **`extensions: [ gnome ]`**: Automatically configures the environment for a GNOME application.
    - **`environment`**: Sets `LD_LIBRARY_PATH` to ensure the application can find necessary shared libraries at
      runtime.

### Build Command

**`examples/deploying/snap/build.sh`**:

```bash
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
```

### Installing the Snap Package

The generated snap package can be installed using the following command:

```bash
sudo snap install dist/snap/gtkx-demo_0.1_amd64.snap --devmode --dangerous
```

* **`--dangerous`**: Required because the package is not signed by the Snap Store.
* **`--devmode`**: Required because the snap is built with `confinement: devmode`.

## ESM Workarounds

If you want to keep using ESM or cannot bundle to CommonJS for SEA, you must use a different deployment strategy,
because Node.js SEA does not support ESM.

### 1. Running Transpiled Source

It is possible to run the transpiled ESM source code directly using Node.js. However, you must copy the native module (
`index.node`) to the folder with the transpiled source code.

```bash
# Copy the native module
cp node_modules/@gtkx/native/dist/index.node dist/

# Run the application
node ./dist/index.js
```

### 2. Bundling to ESM

It is also possible to bundle your ESM code into a single `bundle.mjs` file. This needs a special loader to handle
native module imports in ESM.

```typescript
/* ... Imports ... */

const nativeLoaderCode = `
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nativePath = require.resolve('./index.node');
const nativeModule = require(nativePath);

export default nativeModule;

// Dynamically re-export all properties from native module
for (const key of Object.keys(nativeModule)) {
  if (key !== 'default') {
    globalThis[key] = nativeModule[key];
  }
}

export const alloc = nativeModule.alloc;
export const read = nativeModule.read;
export const write = nativeModule.write;
export const batchCall = nativeModule.batchCall;
export const call = nativeModule.call;
export const getObjectId = nativeModule.getObjectId;
export const start = nativeModule.start;
export const stop = nativeModule.stop;
export const createRef = nativeModule.createRef;
`;

/* ... Plugin code ... */

await build({
    entryPoints: [join(projectRoot, "dist/index.js")],
    bundle: true,
    platform: "node",
    target: "node22",
    format: "esm",
    outfile: join(projectRoot, "dist/bundle.mjs"),
    plugins: [nativePlugin],
    logLevel: "info",
});
```

### 3. Deployment without SEA

Since Node.js SEA cannot be used with ESM bundles, your packaging strategy must change. Instead of a single executable,
you must distribute the Node.js runtime and your code together.

For Flatpak or Snap, this means:

1. Copy the transpiled source code (or `bundle.mjs`) to the package directory.
2. If not using a bundle, copy `node_modules` (production dependencies).
3. Copy the native module (`index.node`) to the same directory.
4. Configure the package command to run `node ./bundle.mjs` (or `node ./index.js`).
