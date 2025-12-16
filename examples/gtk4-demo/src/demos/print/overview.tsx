import * as Gtk from "@gtkx/ffi/gtk";
import { Box, Label } from "@gtkx/react";
import { getSourcePath } from "../source-path.js";
import type { Demo } from "../types.js";

const PrintOverviewDemo = () => {
    return (
        <Box orientation={Gtk.Orientation.VERTICAL} spacing={20} marginStart={20} marginEnd={20} marginTop={20}>
            <Label label="Printing" cssClasses={["title-2"]} halign={Gtk.Align.START} />

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label label="About Printing" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label
                    label="GTK provides comprehensive printing support through GtkPrintOperation. This high-level API handles printer selection, page setup, and integrates with the native system print dialog."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label label="Print Components" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label
                    label={`• GtkPrintOperation - Main print job controller
• GtkPrintContext - Provides Cairo context for page rendering
• GtkPageSetup - Page size, margins, and orientation
• GtkPrintSettings - Printer preferences and options`}
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label label="Print Signals" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label
                    label={`• begin-print - Called before printing starts
• draw-page - Render each page with Cairo
• end-print - Called after all pages are printed
• done - Print job completion status`}
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label label="Features" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label
                    label={`• Native system print dialog
• Print to file (PDF export)
• Page setup dialog
• Print preview support
• Asynchronous printing
• Progress indication`}
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
    keywords: ["print", "printer", "document", "paper", "pdf"],
    component: PrintOverviewDemo,
    sourcePath: getSourcePath(import.meta.url, "overview.tsx"),
};
