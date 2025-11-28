import type { Demo } from "../types.js";
import { boxDemo } from "./box.js";
import { centerBoxDemo } from "./center-box.js";
import { panesDemo } from "./panes.js";
import { framesDemo } from "./frames.js";

export const layoutDemos: Demo[] = [
    boxDemo,
    centerBoxDemo,
    panesDemo,
    framesDemo,
];
