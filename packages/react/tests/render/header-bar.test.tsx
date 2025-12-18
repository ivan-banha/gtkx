import type * as Adw from "@gtkx/ffi/adw";
import type * as Gtk from "@gtkx/ffi/gtk";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { AdwHeaderBar, Button, HeaderBar, Label } from "../../src/index.js";
import { render } from "../utils.js";

describe("render - HeaderBar", () => {
    describe("HeaderBar.Root", () => {
        it("creates HeaderBar widget", async () => {
            const ref = createRef<Gtk.HeaderBar>();

            await render(<HeaderBar.Root ref={ref} />);

            expect(ref.current).not.toBeNull();
        });
    });

    describe("HeaderBar.TitleWidget", () => {
        it("sets custom title widget", async () => {
            const headerBarRef = createRef<Gtk.HeaderBar>();
            const labelRef = createRef<Gtk.Label>();

            await render(
                <HeaderBar.Root ref={headerBarRef}>
                    <HeaderBar.TitleWidget>
                        <Label ref={labelRef} label="Custom Title" />
                    </HeaderBar.TitleWidget>
                </HeaderBar.Root>,
            );

            expect(headerBarRef.current?.getTitleWidget()?.id).toEqual(labelRef.current?.id);
        });

        it("clears title widget when removed", async () => {
            const headerBarRef = createRef<Gtk.HeaderBar>();

            function App({ showTitle }: { showTitle: boolean }) {
                return (
                    <HeaderBar.Root ref={headerBarRef}>
                        {showTitle && (
                            <HeaderBar.TitleWidget>
                                <Label label="Title" />
                            </HeaderBar.TitleWidget>
                        )}
                    </HeaderBar.Root>
                );
            }

            await render(<App showTitle={true} />);

            expect(headerBarRef.current?.getTitleWidget()).not.toBeNull();

            await render(<App showTitle={false} />);

            expect(headerBarRef.current?.getTitleWidget()).toBeNull();
        });
    });

    describe("direct children", () => {
        it("packs direct children", async () => {
            const headerBarRef = createRef<Gtk.HeaderBar>();
            const buttonRef = createRef<Gtk.Button>();

            await render(
                <HeaderBar.Root ref={headerBarRef}>
                    <Button ref={buttonRef} label="Direct Child" />
                </HeaderBar.Root>,
            );

            expect(buttonRef.current?.getParent()?.id).toEqual(headerBarRef.current?.id);
        });

        it("adds multiple direct children", async () => {
            const headerBarRef = createRef<Gtk.HeaderBar>();
            const button1Ref = createRef<Gtk.Button>();
            const button2Ref = createRef<Gtk.Button>();

            await render(
                <HeaderBar.Root ref={headerBarRef}>
                    <Button ref={button1Ref} label="Button 1" />
                    <Button ref={button2Ref} label="Button 2" />
                </HeaderBar.Root>,
            );

            expect(button1Ref.current?.getParent()?.id).toEqual(headerBarRef.current?.id);
            expect(button2Ref.current?.getParent()?.id).toEqual(headerBarRef.current?.id);
        });
    });

    describe("removal", () => {
        it("removes direct children", async () => {
            const headerBarRef = createRef<Gtk.HeaderBar>();

            function App({ showButton }: { showButton: boolean }) {
                return <HeaderBar.Root ref={headerBarRef}>{showButton && <Button label="Removable" />}</HeaderBar.Root>;
            }

            await render(<App showButton={true} />);

            expect(headerBarRef.current?.getFirstChild()).not.toBeNull();

            await render(<App showButton={false} />);
        });
    });

    describe("AdwHeaderBar", () => {
        it("creates Adw.HeaderBar", async () => {
            const ref = createRef<Adw.HeaderBar>();

            await render(<AdwHeaderBar.Root ref={ref} />);

            expect(ref.current).not.toBeNull();
        });

        it("supports AdwHeaderBar.TitleWidget", async () => {
            const headerBarRef = createRef<Adw.HeaderBar>();
            const labelRef = createRef<Gtk.Label>();

            await render(
                <AdwHeaderBar.Root ref={headerBarRef}>
                    <AdwHeaderBar.TitleWidget>
                        <Label ref={labelRef} label="Adw Title" />
                    </AdwHeaderBar.TitleWidget>
                </AdwHeaderBar.Root>,
            );

            expect(headerBarRef.current?.getTitleWidget()?.id).toEqual(labelRef.current?.id);
        });

        it("packs direct children", async () => {
            const headerBarRef = createRef<Adw.HeaderBar>();
            const buttonRef = createRef<Gtk.Button>();

            await render(
                <AdwHeaderBar.Root ref={headerBarRef}>
                    <Button ref={buttonRef} label="Child" />
                </AdwHeaderBar.Root>,
            );

            expect(buttonRef.current?.getParent()?.id).toEqual(headerBarRef.current?.id);
        });
    });
});
