import type { EmotionCache } from "@emotion/cache";
import createCache from "@emotion/cache";
import { StyleSheet } from "./style-sheet.js";

let gtkCache: EmotionCache | null = null;

/**
 * Creates and returns a singleton Emotion cache configured for GTK.
 * Uses StyleSheet to inject styles into GTK's CssProvider.
 *
 * Implementation note: Emotion's internal sheet type is not publicly exported,
 * so we cast our StyleSheet which implements the required interface.
 */
export const getGtkCache = (): EmotionCache => {
    if (!gtkCache) {
        const sheet = new StyleSheet({ key: "gtkx" });

        gtkCache = createCache({
            key: "gtkx",
            container: null,
        });

        gtkCache.sheet = sheet as unknown as typeof gtkCache.sheet;
    }

    return gtkCache;
};
