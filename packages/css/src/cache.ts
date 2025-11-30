import type { EmotionCache } from "@emotion/cache";
import createCache from "@emotion/cache";
import { GtkStyleSheet } from "./gtk-style-sheet.js";

let gtkCache: EmotionCache | null = null;

/**
 * Creates and returns a singleton Emotion cache configured for GTK.
 * Uses GtkStyleSheet to inject styles into GTK's CssProvider.
 */
export const getGtkCache = (): EmotionCache => {
    if (!gtkCache) {
        const sheet = new GtkStyleSheet({ key: "gtkx" });

        gtkCache = createCache({
            key: "gtkx",
            container: null,
        });

        gtkCache.sheet = sheet as unknown as typeof gtkCache.sheet;
    }

    return gtkCache;
};

/**
 * Resets the GTK cache, flushing all styles.
 * Useful for cleanup or testing.
 */
export const resetGtkCache = (): void => {
    if (gtkCache) {
        gtkCache.sheet.flush();
        gtkCache = null;
    }
};
