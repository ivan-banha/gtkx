import type { Demo } from "../types.js";
import { applicationMenuDemo } from "./application-menu.js";
import { menuButtonDemo } from "./menu-button.js";
import { popoverDemo } from "./popover.js";
import { popoverMenuDemo } from "./popover-menu.js";
import { popoverMenuBarDemo } from "./popover-menu-bar.js";

export const menusDemos: Demo[] = [
    applicationMenuDemo,
    popoverDemo,
    menuButtonDemo,
    popoverMenuDemo,
    popoverMenuBarDemo,
];
