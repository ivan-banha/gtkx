import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["tests/**/*.test.ts"],
        typecheck: {
            tsconfig: "tsconfig.test.json",
        },
        setupFiles: ["tests/setup.ts"],
        pool: "forks",
        bail: 1,
        execArgv: ["--expose-gc"],
    },
});
