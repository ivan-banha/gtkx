import type * as Gtk from "@gtkx/ffi/gtk";
import * as GtkEnums from "@gtkx/ffi/gtk";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Box, Button, createPortal, Label, Window } from "../src/index.js";
import { render, tick } from "./utils.js";

describe("createPortal", () => {
    it("renders children at root level when no container specified", async () => {
        const windowRef = createRef<Gtk.Window>();

        await render(createPortal(<Window.Root ref={windowRef} title="Portal Window" />));

        expect(windowRef.current).not.toBeNull();
        expect(windowRef.current?.getTitle()).toBe("Portal Window");
    });

    it("renders children into a specific container widget", async () => {
        const boxRef = createRef<Gtk.Box>();
        const labelRef = createRef<Gtk.Label>();

        function App() {
            const box = boxRef.current;
            return (
                <>
                    <Box ref={boxRef} spacing={0} orientation={GtkEnums.Orientation.VERTICAL} />
                    {box && createPortal(<Label ref={labelRef} label="In Portal" />, box)}
                </>
            );
        }

        await render(<App />);
        await render(<App />);

        expect(labelRef.current).not.toBeNull();
        expect(labelRef.current?.getParent()?.id).toEqual(boxRef.current?.id);
    });

    it("preserves key when provided", async () => {
        const labelRef = createRef<Gtk.Label>();

        await render(createPortal(<Label ref={labelRef} label="Keyed" />, undefined, "my-key"));

        await tick();
        expect(labelRef.current).not.toBeNull();
    });

    it("unmounts portal children when portal is removed", async () => {
        const windowRef = createRef<Gtk.Window>();

        function App({ showPortal }: { showPortal: boolean }) {
            return <>{showPortal && createPortal(<Window.Root ref={windowRef} title="Portal" />)}</>;
        }

        await render(<App showPortal={true} />);

        const windowId = windowRef.current?.id;
        expect(windowId).not.toBeUndefined();

        await render(<App showPortal={false} />);
    });

    it("updates portal children when props change", async () => {
        const windowRef = createRef<Gtk.Window>();

        function App({ title }: { title: string }) {
            return <>{createPortal(<Window.Root ref={windowRef} title={title} />)}</>;
        }

        await render(<App title="First" />);
        expect(windowRef.current?.getTitle()).toBe("First");

        await render(<App title="Second" />);
        expect(windowRef.current?.getTitle()).toBe("Second");
    });

    it("handles multiple portals to same container", async () => {
        const boxRef = createRef<Gtk.Box>();
        const label1Ref = createRef<Gtk.Label>();
        const label2Ref = createRef<Gtk.Label>();

        function App() {
            const box = boxRef.current;
            return (
                <>
                    <Box ref={boxRef} spacing={0} orientation={GtkEnums.Orientation.VERTICAL} />
                    {box && createPortal(<Label ref={label1Ref} label="First" />, box)}
                    {box && createPortal(<Label ref={label2Ref} label="Second" />, box)}
                </>
            );
        }

        await render(<App />);
        await render(<App />);

        expect(label1Ref.current).not.toBeNull();
        expect(label2Ref.current).not.toBeNull();
        expect(label1Ref.current?.getParent()?.id).toEqual(boxRef.current?.id);
        expect(label2Ref.current?.getParent()?.id).toEqual(boxRef.current?.id);
    });

    it("handles portal to nested container", async () => {
        const innerBoxRef = createRef<Gtk.Box>();
        const buttonRef = createRef<Gtk.Button>();

        function App() {
            const innerBox = innerBoxRef.current;
            return (
                <>
                    <Box spacing={0} orientation={GtkEnums.Orientation.VERTICAL}>
                        <Box ref={innerBoxRef} spacing={0} orientation={GtkEnums.Orientation.VERTICAL} />
                    </Box>
                    {innerBox && createPortal(<Button ref={buttonRef} label="Nested" />, innerBox)}
                </>
            );
        }

        await render(<App />);
        await render(<App />);

        expect(buttonRef.current).not.toBeNull();
        expect(buttonRef.current?.getParent()?.id).toEqual(innerBoxRef.current?.id);
    });
});
