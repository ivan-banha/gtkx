import * as Gtk from "@gtkx/ffi/gtk";
import { Box, Label } from "@gtkx/gtkx";
import type { Demo } from "../types.js";

export const PrintOverviewDemo = () => {
    return (
        <Box orientation={Gtk.Orientation.VERTICAL} spacing={20} marginStart={20} marginEnd={20} marginTop={20}>
            <Label.Root label="Printing" cssClasses={["title-2"]} halign={Gtk.Align.START} />

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="About Printing" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="GTK provides comprehensive printing support through GtkPrintOperation and related classes."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Print APIs" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="• GtkPrintOperation - High-level print API\n• GtkPrintDialog - Modern print dialog\n• GtkPageSetup - Page size and orientation\n• GtkPrintSettings - Print preferences"
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Status" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="Print support requires GtkPrintOperation bindings which are planned for future GTKX releases."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>
        </Box>
    );
};

export const printOverviewDemo: Demo = {
    id: "print-overview",
    title: "Printing Overview",
    description: "Document printing with GtkPrintOperation.",
    keywords: ["print", "printer", "document", "paper"],
    component: PrintOverviewDemo,
    source: `// Print support coming in future releases`,
};
