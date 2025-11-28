import type { Demo } from "../types.js";
import { spinnerDemo } from "./spinner.js";
import { progressBarDemo } from "./progressbar.js";
import { imageDemo } from "./image.js";
import { levelBarDemo } from "./levelbar.js";

export const displayDemos: Demo[] = [
    spinnerDemo,
    progressBarDemo,
    imageDemo,
    levelBarDemo,
];
