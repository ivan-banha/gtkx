import * as Gtk from "@gtkx/ffi/gtk";
import { Box, Label } from "@gtkx/gtkx";
import type { Demo } from "../types.js";

export const PathOverviewDemo = () => {
    return (
        <Box orientation={Gtk.Orientation.VERTICAL} spacing={20} marginStart={20} marginEnd={20} marginTop={20}>
            <Label.Root label="Path" cssClasses={["title-2"]} halign={Gtk.Align.START} />

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="About GskPath" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="GskPath is GTK's modern path API for creating and manipulating vector paths. It supports lines, curves, arcs, and complex shapes."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Path Operations" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="• Path construction with GskPathBuilder\n• Bezier curves and arcs\n• Path measurement and sampling\n• Path operations (union, intersection, etc.)"
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Status" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="GskPath support requires low-level GSK bindings which are planned for future GTKX releases."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>
        </Box>
    );
};

export const pathOverviewDemo: Demo = {
    id: "path-overview",
    title: "Path Overview",
    description: "Vector path creation and manipulation with GskPath.",
    keywords: ["path", "gsk", "vector", "bezier", "curves"],
    component: PathOverviewDemo,
    source: `// GskPath support coming in future releases`,
};
