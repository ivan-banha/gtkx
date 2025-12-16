import { mergeConfig } from "vitest/config";
import baseConfig from "../../vitest.config.js";

export default mergeConfig(baseConfig, {
    esbuild: {
        jsx: "automatic",
        jsxImportSource: "react",
    },
    test: {
        include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
        typecheck: {
            tsconfig: "tsconfig.test.json",
        },
        pool: "forks",
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
        fileParallelism: false,
        sequence: {
            hooks: "list",
        },
        globalSetup: "./tests/setup.ts",
    },
});
