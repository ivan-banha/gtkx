import type { Demo } from "../types.js";
import { aboutDialogDemo } from "./about-dialog.js";
import { dialogDemo } from "./dialog.js";
import { fileChooserDemo } from "./file-chooser.js";
import { colorChooserDemo } from "./color-chooser.js";

export const dialogsDemos: Demo[] = [
    aboutDialogDemo,
    dialogDemo,
    fileChooserDemo,
    colorChooserDemo,
];
