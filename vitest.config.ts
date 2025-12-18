import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["tests/**/*.test.{ts,tsx}"],
        typecheck: {
            tsconfig: "tsconfig.test.json",
        },
        setupFiles: [path.join(import.meta.dirname, "vitest.setup.ts")],
        pool: "forks",
        bail: 1,
    },
});
