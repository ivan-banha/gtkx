import type * as Gtk from "@gtkx/ffi/gtk";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Label, Notebook } from "../../src/index.js";
import { render } from "../utils.js";

const getPageLabels = (notebook: Gtk.Notebook): string[] => {
    const labels: string[] = [];
    const nPages = notebook.getNPages();
    for (let i = 0; i < nPages; i++) {
        const page = notebook.getNthPage(i);
        if (page) {
            const tabLabel = notebook.getTabLabel(page);
            if (tabLabel && "getLabel" in tabLabel && typeof tabLabel.getLabel === "function") {
                labels.push((tabLabel as Gtk.Label).getLabel() ?? "");
            }
        }
    }
    return labels;
};

describe("render - Notebook", () => {
    describe("Notebook.Root", () => {
        it("creates Notebook widget", async () => {
            const ref = createRef<Gtk.Notebook>();

            await render(<Notebook.Root ref={ref} />);

            expect(ref.current).not.toBeNull();
        });
    });

    describe("Notebook.Page", () => {
        it("adds page with label", async () => {
            const notebookRef = createRef<Gtk.Notebook>();

            await render(
                <Notebook.Root ref={notebookRef}>
                    <Notebook.Page label="Tab 1">
                        <Label label="Page 1 Content" />
                    </Notebook.Page>
                </Notebook.Root>,
            );

            expect(notebookRef.current?.getNPages()).toBe(1);
            const labels = getPageLabels(notebookRef.current as Gtk.Notebook);
            expect(labels).toEqual(["Tab 1"]);
        });

        it("adds page with empty label", async () => {
            const notebookRef = createRef<Gtk.Notebook>();

            await render(
                <Notebook.Root ref={notebookRef}>
                    <Notebook.Page label="">
                        <Label label="No Tab Label" />
                    </Notebook.Page>
                </Notebook.Root>,
            );

            expect(notebookRef.current?.getNPages()).toBe(1);
        });
    });

    describe("page management", () => {
        it("inserts page before existing page", async () => {
            const notebookRef = createRef<Gtk.Notebook>();

            function App({ pages }: { pages: string[] }) {
                return (
                    <Notebook.Root ref={notebookRef}>
                        {pages.map((label) => (
                            <Notebook.Page key={label} label={label}>
                                <Label label={`Content: ${label}`} />
                            </Notebook.Page>
                        ))}
                    </Notebook.Root>
                );
            }

            await render(<App pages={["First", "Last"]} />);

            await render(<App pages={["First", "Middle", "Last"]} />);

            const labels = getPageLabels(notebookRef.current as Gtk.Notebook);
            expect(labels).toEqual(["First", "Middle", "Last"]);
        });

        it("removes page", async () => {
            const notebookRef = createRef<Gtk.Notebook>();

            function App({ pages }: { pages: string[] }) {
                return (
                    <Notebook.Root ref={notebookRef}>
                        {pages.map((label) => (
                            <Notebook.Page key={label} label={label}>
                                <Label label={`Content: ${label}`} />
                            </Notebook.Page>
                        ))}
                    </Notebook.Root>
                );
            }

            await render(<App pages={["A", "B", "C"]} />);

            await render(<App pages={["A", "C"]} />);

            const labels = getPageLabels(notebookRef.current as Gtk.Notebook);
            expect(labels).toEqual(["A", "C"]);
        });

        it("updates tab label when prop changes", async () => {
            const notebookRef = createRef<Gtk.Notebook>();

            function App({ label }: { label: string }) {
                return (
                    <Notebook.Root ref={notebookRef}>
                        <Notebook.Page label={label}>
                            <Label label="Content" />
                        </Notebook.Page>
                    </Notebook.Root>
                );
            }

            await render(<App label="Initial" />);

            expect(getPageLabels(notebookRef.current as Gtk.Notebook)).toEqual(["Initial"]);

            await render(<App label="Updated" />);

            expect(getPageLabels(notebookRef.current as Gtk.Notebook)).toEqual(["Updated"]);
        });
    });

    describe("direct children", () => {
        it("appends child without Page wrapper", async () => {
            const notebookRef = createRef<Gtk.Notebook>();

            await render(
                <Notebook.Root ref={notebookRef}>
                    <Label label="Direct Child" />
                </Notebook.Root>,
            );

            expect(notebookRef.current?.getNPages()).toBe(1);
        });
    });
});
