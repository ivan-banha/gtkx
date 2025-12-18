import { stop } from "@gtkx/ffi";
import { afterAll, afterEach } from "vitest";
import { cleanup } from "./utils.js";

afterEach(async () => {
    await cleanup();
});

afterAll(() => {
    stop();
});
