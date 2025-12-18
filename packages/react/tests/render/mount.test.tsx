import * as Gtk from "@gtkx/ffi/gtk";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { AboutDialog, Box, Label, Window } from "../../src/index.js";
import { render } from "../utils.js";

describe("render - mount", () => {
    it("calls mount() after initial render", async () => {
        const windowRef = createRef<Gtk.Window>();

        await render(<Window.Root ref={windowRef} title="Mount Test" />);

        expect(windowRef.current).not.toBeNull();
        expect(windowRef.current?.getVisible()).toBe(true);
    });

    it("Window.mount() calls present()", async () => {
        const windowRef = createRef<Gtk.Window>();

        await render(<Window.Root ref={windowRef} title="Present Test" />);

        expect(windowRef.current?.getVisible()).toBe(true);
    });

    it("AboutDialog.mount() calls present()", async () => {
        const dialogRef = createRef<Gtk.AboutDialog>();

        await render(<AboutDialog ref={dialogRef} programName="Test App" />);

        expect(dialogRef.current).not.toBeNull();
        expect(dialogRef.current?.getVisible()).toBe(true);
    });

    it("regular widgets have no-op mount()", async () => {
        const labelRef = createRef<Gtk.Label>();
        const boxRef = createRef<Gtk.Box>();

        await render(
            <Box ref={boxRef} spacing={0} orientation={Gtk.Orientation.VERTICAL}>
                <Label ref={labelRef} label="Test" />
            </Box>,
        );

        expect(labelRef.current).not.toBeNull();
        expect(boxRef.current).not.toBeNull();
    });

    it("mount happens after all children are attached", async () => {
        const windowRef = createRef<Gtk.Window>();
        const labelRef = createRef<Gtk.Label>();

        await render(
            <Window.Root ref={windowRef} title="With Child">
                <Label ref={labelRef} label="Child Label" />
            </Window.Root>,
        );

        expect(windowRef.current?.getChild()?.id).toEqual(labelRef.current?.id);
    });
});
