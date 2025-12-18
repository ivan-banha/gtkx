import * as Gtk from "@gtkx/ffi/gtk";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Box, Frame, Label, Window } from "../../src/index.js";
import { render } from "../utils.js";

const getChildWidgets = (parent: Gtk.Widget): Gtk.Widget[] => {
    const children: Gtk.Widget[] = [];
    let child = parent.getFirstChild();
    while (child) {
        children.push(child);
        child = child.getNextSibling();
    }
    return children;
};

const getChildLabels = (parent: Gtk.Widget): string[] => {
    return getChildWidgets(parent)
        .filter((w): w is Gtk.Label => "getLabel" in w && typeof w.getLabel === "function")
        .map((l) => l.getLabel() ?? "");
};

describe("render - children", () => {
    describe("appendChild", () => {
        it("appends child to appendable widget (Box)", async () => {
            const boxRef = createRef<Gtk.Box>();
            const labelRef = createRef<Gtk.Label>();

            await render(
                <Box ref={boxRef} spacing={0} orientation={Gtk.Orientation.VERTICAL}>
                    <Label ref={labelRef} label="Child" />
                </Box>,
            );

            expect(labelRef.current?.getParent()?.id).toEqual(boxRef.current?.id);
        });

        it("sets child on single-child widget", async () => {
            const frameRef = createRef<Gtk.Frame>();
            const labelRef = createRef<Gtk.Label>();

            await render(
                <Frame.Root ref={frameRef}>
                    <Label ref={labelRef} label="Single Child" />
                </Frame.Root>,
            );

            expect(frameRef.current?.getChild()?.id).toEqual(labelRef.current?.id);
        });
    });

    describe("removeChild", () => {
        it("removes child from parent", async () => {
            const boxRef = createRef<Gtk.Box>();

            function App({ showChild }: { showChild: boolean }) {
                return (
                    <Box ref={boxRef} spacing={0} orientation={Gtk.Orientation.VERTICAL}>
                        {showChild && <Label label="Removable" />}
                    </Box>
                );
            }

            await render(<App showChild={true} />);

            expect(getChildWidgets(boxRef.current as Gtk.Box).length).toBe(1);

            await render(<App showChild={false} />);

            expect(getChildWidgets(boxRef.current as Gtk.Box).length).toBe(0);
        });

        it("clears child on single-child widget", async () => {
            const frameRef = createRef<Gtk.Frame>();

            function App({ showChild }: { showChild: boolean }) {
                return <Frame.Root ref={frameRef}>{showChild && <Label label="Child" />}</Frame.Root>;
            }

            await render(<App showChild={true} />);

            expect(frameRef.current?.getChild()).not.toBeNull();

            await render(<App showChild={false} />);

            expect(frameRef.current?.getChild()).toBeNull();
        });
    });

    describe("insertBefore", () => {
        it("inserts child before sibling", async () => {
            const boxRef = createRef<Gtk.Box>();

            function App({ items }: { items: string[] }) {
                return (
                    <Box ref={boxRef} spacing={0} orientation={Gtk.Orientation.VERTICAL}>
                        {items.map((item) => (
                            <Label key={item} label={item} />
                        ))}
                    </Box>
                );
            }

            await render(<App items={["A", "C"]} />);

            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["A", "C"]);

            await render(<App items={["A", "B", "C"]} />);

            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["A", "B", "C"]);
        });

        it("falls back to append when before not found", async () => {
            const boxRef = createRef<Gtk.Box>();

            function App({ items }: { items: string[] }) {
                return (
                    <Box ref={boxRef} spacing={0} orientation={Gtk.Orientation.VERTICAL}>
                        {items.map((item) => (
                            <Label key={item} label={item} />
                        ))}
                    </Box>
                );
            }

            await render(<App items={["A", "B"]} />);

            await render(<App items={["A", "B", "C"]} />);

            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["A", "B", "C"]);
        });
    });

    describe("container operations", () => {
        it("appendChildToContainer works with root container", async () => {
            const windowRef = createRef<Gtk.Window>();

            await render(<Window.Root ref={windowRef} title="Root Container" />);

            expect(windowRef.current).not.toBeNull();
        });

        it("removeChildFromContainer works with root container", async () => {
            const windowRef = createRef<Gtk.Window>();

            function App({ showWindow }: { showWindow: boolean }) {
                return showWindow ? <Window.Root ref={windowRef} title="Window" /> : null;
            }

            await render(<App showWindow={true} />);

            expect(windowRef.current).not.toBeNull();

            await render(<App showWindow={false} />);
        });

        it("insertInContainerBefore works with root container", async () => {
            const window1Ref = createRef<Gtk.Window>();
            const window2Ref = createRef<Gtk.Window>();

            function App({ windows }: { windows: string[] }) {
                return (
                    <>
                        {windows.map((title, i) => (
                            <Window.Root key={title} ref={i === 0 ? window1Ref : window2Ref} title={title} />
                        ))}
                    </>
                );
            }

            await render(<App windows={["First"]} />);

            await render(<App windows={["Second", "First"]} />);
        });
    });

    describe("child ordering", () => {
        it("maintains correct order after multiple operations", async () => {
            const boxRef = createRef<Gtk.Box>();

            function App({ items }: { items: string[] }) {
                return (
                    <Box ref={boxRef} spacing={0} orientation={Gtk.Orientation.VERTICAL}>
                        {items.map((item) => (
                            <Label key={item} label={item} />
                        ))}
                    </Box>
                );
            }

            await render(<App items={["A", "B", "C"]} />);
            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["A", "B", "C"]);

            await render(<App items={["A", "D", "B", "C"]} />);
            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["A", "D", "B", "C"]);

            await render(<App items={["D", "C"]} />);
            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["D", "C"]);
        });

        it("handles reordering via key changes", async () => {
            const boxRef = createRef<Gtk.Box>();

            function App({ items }: { items: string[] }) {
                return (
                    <Box ref={boxRef} spacing={0} orientation={Gtk.Orientation.VERTICAL}>
                        {items.map((item) => (
                            <Label key={item} label={item} />
                        ))}
                    </Box>
                );
            }

            await render(<App items={["A", "B", "C"]} />);
            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["A", "B", "C"]);

            await render(<App items={["C", "B", "A"]} />);
            expect(getChildLabels(boxRef.current as Gtk.Box)).toEqual(["C", "B", "A"]);
        });
    });
});
