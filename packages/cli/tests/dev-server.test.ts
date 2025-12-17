import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockModule = {
    default: vi.fn(() => null),
    appId: "org.test.app",
    appFlags: 0,
};

const mockModuleGraph = {
    idToModuleMap: new Map([
        ["test-module", { id: "test-module" }],
        ["test-module-2", { id: "test-module-2" }],
    ]),
    invalidateModule: vi.fn(),
};

const mockWatcher = {
    on: vi.fn(),
};

const mockViteServer = {
    ssrLoadModule: vi.fn().mockResolvedValue(mockModule),
    moduleGraph: mockModuleGraph,
    watcher: mockWatcher,
    close: vi.fn(),
};

vi.mock("vite", () => ({
    createServer: vi.fn().mockResolvedValue(mockViteServer),
}));

vi.mock("@gtkx/ffi", () => ({
    events: {
        on: vi.fn(),
    },
}));

vi.mock("@gtkx/react", () => ({
    update: vi.fn(),
}));

vi.mock("@vitejs/plugin-react", () => ({
    default: vi.fn(() => ({ name: "react-plugin" })),
}));

describe("createDevServer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a vite server with correct configuration", async () => {
        const { createServer } = await import("vite");
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        expect(createServer).toHaveBeenCalledWith(
            expect.objectContaining({
                appType: "custom",
                server: expect.objectContaining({
                    middlewareMode: true,
                }),
                optimizeDeps: expect.objectContaining({
                    noDiscovery: true,
                    include: [],
                }),
                ssr: expect.objectContaining({
                    external: true,
                }),
            }),
        );
    });

    it("returns the vite server instance", async () => {
        const { createDevServer } = await import("../src/dev-server.js");

        const server = await createDevServer({
            entry: "/path/to/app.tsx",
        });

        expect(server).toBe(mockViteServer);
    });

    it("accepts custom vite configuration", async () => {
        const { createServer } = await import("vite");
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
            vite: {
                root: "/custom/root",
            },
        });

        expect(createServer).toHaveBeenCalledWith(
            expect.objectContaining({
                root: "/custom/root",
            }),
        );
    });

    it("registers file change watcher", async () => {
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        expect(mockWatcher.on).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("registers stop event handler", async () => {
        const { events } = await import("@gtkx/ffi");
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        expect(events.on).toHaveBeenCalledWith("stop", expect.any(Function));
    });

    it("loads entry module via ssrLoadModule", async () => {
        const { createDevServer } = await import("../src/dev-server.js");

        const server = await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const loadedModule = await server.ssrLoadModule("/path/to/app.tsx");
        expect(loadedModule).toEqual(mockModule);
    });

    it("provides module with default export", async () => {
        const { createDevServer } = await import("../src/dev-server.js");

        const server = await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const loadedModule = await server.ssrLoadModule("/path/to/app.tsx");
        expect(typeof loadedModule.default).toBe("function");
    });

    it("provides module with optional appId export", async () => {
        const { createDevServer } = await import("../src/dev-server.js");

        const server = await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const loadedModule = await server.ssrLoadModule("/path/to/app.tsx");
        expect(loadedModule.appId).toBe("org.test.app");
    });

    it("provides module with optional appFlags export", async () => {
        const { createDevServer } = await import("../src/dev-server.js");

        const server = await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const loadedModule = await server.ssrLoadModule("/path/to/app.tsx");
        expect(loadedModule.appFlags).toBe(0);
    });

    it("invalidates all modules on file change", async () => {
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const changeHandler = mockWatcher.on.mock.calls.find((call) => call[0] === "change")?.[1];
        expect(changeHandler).toBeDefined();

        await changeHandler("/path/to/changed-file.tsx");

        expect(mockModuleGraph.invalidateModule).toHaveBeenCalledTimes(2);
    });

    it("calls update with new component on file change", async () => {
        const { update } = await import("@gtkx/react");
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const changeHandler = mockWatcher.on.mock.calls.find((call) => call[0] === "change")?.[1];
        await changeHandler("/path/to/changed-file.tsx");

        expect(update).toHaveBeenCalled();
    });

    it("closes server on stop event", async () => {
        const { events } = await import("@gtkx/ffi");
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const stopHandler = vi.mocked(events.on).mock.calls.find((call) => call[0] === "stop")?.[1];
        expect(stopHandler).toBeDefined();

        stopHandler();

        expect(mockViteServer.close).toHaveBeenCalled();
    });

    it("includes react plugin", async () => {
        const { createServer } = await import("vite");
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const config = vi.mocked(createServer).mock.calls[0][0];
        const plugins = config?.plugins as Array<{ name: string }>;
        expect(plugins.some((p) => p.name === "react-plugin")).toBe(true);
    });

    it("includes gtkx:remove-react-dom-optimized plugin", async () => {
        const { createServer } = await import("vite");
        const { createDevServer } = await import("../src/dev-server.js");

        await createDevServer({
            entry: "/path/to/app.tsx",
        });

        const config = vi.mocked(createServer).mock.calls[0][0];
        const plugins = config?.plugins as Array<{ name: string }>;
        expect(plugins.some((p) => p.name === "gtkx:remove-react-dom-optimized")).toBe(true);
    });

    describe("error handling", () => {
        it("handles module load errors during hot reload gracefully", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            mockViteServer.ssrLoadModule.mockRejectedValueOnce(new Error("Module load failed"));

            const { createDevServer } = await import("../src/dev-server.js");

            await createDevServer({
                entry: "/path/to/app.tsx",
            });

            const changeHandler = mockWatcher.on.mock.calls.find((call) => call[0] === "change")?.[1];
            await changeHandler("/path/to/changed-file.tsx");

            expect(consoleErrorSpy).toHaveBeenCalledWith("[gtkx] Hot reload failed:", expect.any(Error));
            consoleErrorSpy.mockRestore();
        });

        it("handles non-function default export during hot reload", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            mockViteServer.ssrLoadModule.mockResolvedValueOnce({
                default: "not-a-function",
            });

            const { createDevServer } = await import("../src/dev-server.js");

            await createDevServer({
                entry: "/path/to/app.tsx",
            });

            const changeHandler = mockWatcher.on.mock.calls.find((call) => call[0] === "change")?.[1];
            await changeHandler("/path/to/changed-file.tsx");

            expect(consoleErrorSpy).toHaveBeenCalledWith("[gtkx] Entry file must export a default function component");
            consoleErrorSpy.mockRestore();
        });
    });
});
