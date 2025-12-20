import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, type Plugin } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// Custom loader code that will be injected into the bundle.
// It handles finding the native module 'index.node' at runtime.
const nativeLoaderCode = `
const { createRequire } = require('node:module');
const { dirname, join } = require('node:path');

let nativeModule = null;

function getNativeModule() {
    if (nativeModule) return nativeModule;

    let nativePath;
    let isSea = false;

    try {
        // Check if running inside a Node.js Single Executable Application
        const sea = require('node:sea');
        isSea = sea.isSea();
    } catch {}

    if (isSea) {
        // In SEA, the native module is expected to be next to the executable
        nativePath = join(dirname(process.execPath), 'index.node');
    } else {
        // In development, resolve from node_modules
        nativePath = require.resolve('@gtkx/native/dist/index.node');
    }

    const nativeRequire = createRequire(nativePath);
    nativeModule = nativeRequire(nativePath);
    return nativeModule;
}

module.exports = getNativeModule();
module.exports.default = module.exports;
`;

// esbuild plugin to intercept imports of @gtkx/native and replace them with our custom loader
const nativePlugin: Plugin = {
    name: "native-loader",
    setup(build) {
        // Intercept imports of @gtkx/native
        build.onResolve({ filter: /^@gtkx\/native$/ }, () => {
            return {
                path: "@gtkx/native",
                namespace: "native-loader",
            };
        });

        // Load the custom loader code instead of the actual package
        build.onLoad({ filter: /.*/, namespace: "native-loader" }, () => {
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
    format: "cjs",
    outfile: join(projectRoot, "dist/bundle.cjs"),
    plugins: [nativePlugin],
    logLevel: "info",
});

console.log("Bundle created: dist/bundle.cjs");
