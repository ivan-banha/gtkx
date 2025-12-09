import type { Demo } from "../types.js";
import { boxDemo } from "./box.js";
import { centerBoxDemo } from "./center-box.js";
import { framesDemo } from "./frames.js";
import { gridDemo } from "./grid.js";
import { overlayDemo } from "./overlay.js";
import { panesDemo } from "./panes.js";
import { stackDemo } from "./stack.js";

export const layoutDemos: Demo[] = [boxDemo, centerBoxDemo, gridDemo, overlayDemo, panesDemo, stackDemo, framesDemo];
