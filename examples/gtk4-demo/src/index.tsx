import { events } from "@gtkx/ffi";
import * as Adw from "@gtkx/ffi/adw";
import * as GtkSource from "@gtkx/ffi/gtksource";
import { render } from "@gtkx/react";
import { App } from "./app.js";

events.on("start", () => {
    try {
        Adw.init();
    } catch {
        // Adwaita not available on this system
    }

    GtkSource.init();
});

events.on("stop", () => {
    GtkSource.finalize();
});

render(<App />, "org.gtkx.Demo");
