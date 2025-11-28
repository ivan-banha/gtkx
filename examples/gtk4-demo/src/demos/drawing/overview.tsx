import * as Gtk from "@gtkx/ffi/gtk";
import { Box, Label } from "@gtkx/gtkx";
import type { Demo } from "../types.js";

export const DrawingOverviewDemo = () => {
    return (
        <Box orientation={Gtk.Orientation.VERTICAL} spacing={20} marginStart={20} marginEnd={20} marginTop={20}>
            <Label.Root label="Drawing" cssClasses={["title-2"]} halign={Gtk.Align.START} />

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="About Drawing" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="GTK's drawing system uses Cairo and GtkSnapshot for 2D graphics. GtkDrawingArea provides a canvas for custom rendering."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Drawing APIs" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="• Cairo - 2D vector graphics library\n• GtkSnapshot - Modern GPU-accelerated rendering\n• GtkDrawingArea - Widget for custom drawing"
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Status" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="Drawing APIs require direct access to Cairo context which is planned for future GTKX releases. For now, use CSS for styling and built-in widgets for UI."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>
        </Box>
    );
};

export const drawingOverviewDemo: Demo = {
    id: "drawing-overview",
    title: "Drawing Overview",
    description: "Custom 2D graphics with Cairo and GtkSnapshot.",
    keywords: ["drawing", "cairo", "graphics", "canvas"],
    component: DrawingOverviewDemo,
    source: `// Drawing APIs coming in future releases`,
};
