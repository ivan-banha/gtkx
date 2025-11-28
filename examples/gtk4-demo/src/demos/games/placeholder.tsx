import * as Gtk from "@gtkx/ffi/gtk";
import { Box, Label } from "@gtkx/gtkx";
import type { Demo } from "../types.js";

export const GamesPlaceholderDemo = () => {
    return (
        <Box orientation={Gtk.Orientation.VERTICAL} spacing={20} marginStart={20} marginEnd={20} marginTop={20}>
            <Label.Root label="Games" cssClasses={["title-2"]} halign={Gtk.Align.START} />

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Coming Soon" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="This category will include interactive game demos similar to the official gtk4-demo, such as 15-puzzle, sliding tiles, and more."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Planned Demos" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="• 15 Puzzle - Classic sliding tile puzzle\n• Five in a Row - Strategy board game\n• Memory Game - Card matching game"
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>
        </Box>
    );
};

export const gamesPlaceholderDemo: Demo = {
    id: "games-placeholder",
    title: "Games Overview",
    description: "Interactive game demos (coming soon).",
    keywords: ["games", "puzzle", "interactive"],
    component: GamesPlaceholderDemo,
    source: `// Games demos coming soon!`,
};
