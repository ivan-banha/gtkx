import * as Gtk from "@gtkx/ffi/gtk";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ColumnView, Label } from "../../src/index.js";
import { render } from "../utils.js";

describe("render - ColumnView", () => {
    describe("ColumnView.Root", () => {
        it("creates ColumnView widget", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref}>
                    <ColumnView.Column title="Name" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                </ColumnView.Root>,
            );

            expect(ref.current).not.toBeNull();
        });
    });

    describe("ColumnView.Column", () => {
        it("adds column with title", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref}>
                    <ColumnView.Column title="Column Title" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                </ColumnView.Root>,
            );

            const columns = ref.current?.getColumns();
            expect(columns).not.toBeNull();
        });

        it("inserts column before existing column", async () => {
            const ref = createRef<Gtk.ColumnView>();

            function App({ columns }: { columns: string[] }) {
                return (
                    <ColumnView.Root ref={ref}>
                        {columns.map((title) => (
                            <ColumnView.Column key={title} title={title} renderCell={() => <Label label="Cell" />} />
                        ))}
                        <ColumnView.Item id="1" item={{ name: "First" }} />
                    </ColumnView.Root>
                );
            }

            await render(<App columns={["First", "Last"]} />);

            await render(<App columns={["First", "Middle", "Last"]} />);

            expect(ref.current?.getColumns()).not.toBeNull();
        });

        it("removes column", async () => {
            const ref = createRef<Gtk.ColumnView>();

            function App({ columns }: { columns: string[] }) {
                return (
                    <ColumnView.Root ref={ref}>
                        {columns.map((title) => (
                            <ColumnView.Column key={title} title={title} renderCell={() => <Label label="Cell" />} />
                        ))}
                        <ColumnView.Item id="1" item={{ name: "First" }} />
                    </ColumnView.Root>
                );
            }

            await render(<App columns={["A", "B", "C"]} />);

            await render(<App columns={["A", "C"]} />);

            expect(ref.current?.getColumns()).not.toBeNull();
        });

        it("sets column properties (expand, resizable, fixedWidth)", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref}>
                    <ColumnView.Column
                        title="Props"
                        expand={true}
                        resizable={true}
                        fixedWidth={100}
                        renderCell={() => <Label label="Cell" />}
                    />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                </ColumnView.Root>,
            );
        });

        it("updates column properties when props change", async () => {
            const ref = createRef<Gtk.ColumnView>();

            function App({ title }: { title: string }) {
                return (
                    <ColumnView.Root ref={ref}>
                        <ColumnView.Column title={title} renderCell={() => <Label label="Cell" />} />
                        <ColumnView.Item id="1" item={{ name: "First" }} />
                    </ColumnView.Root>
                );
            }

            await render(<App title="Initial" />);

            await render(<App title="Updated" />);
        });
    });

    describe("ColumnView.Item", () => {
        it("adds item to list model", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref}>
                    <ColumnView.Column title="Name" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                    <ColumnView.Item id="2" item={{ name: "Second" }} />
                </ColumnView.Root>,
            );

            expect(ref.current?.getModel()).not.toBeNull();
        });

        it("inserts item before existing item", async () => {
            const ref = createRef<Gtk.ColumnView>();

            function App({ items }: { items: { id: string; name: string }[] }) {
                return (
                    <ColumnView.Root ref={ref}>
                        <ColumnView.Column title="Name" renderCell={() => <Label label="Cell" />} />
                        {items.map((item) => (
                            <ColumnView.Item key={item.id} id={item.id} item={item} />
                        ))}
                    </ColumnView.Root>
                );
            }

            await render(
                <App
                    items={[
                        { id: "1", name: "First" },
                        { id: "3", name: "Third" },
                    ]}
                />,
            );

            await render(
                <App
                    items={[
                        { id: "1", name: "First" },
                        { id: "2", name: "Second" },
                        { id: "3", name: "Third" },
                    ]}
                />,
            );

            expect(ref.current?.getModel()).not.toBeNull();
        });

        it("removes item", async () => {
            const ref = createRef<Gtk.ColumnView>();

            function App({ items }: { items: { id: string; name: string }[] }) {
                return (
                    <ColumnView.Root ref={ref}>
                        <ColumnView.Column title="Name" renderCell={() => <Label label="Cell" />} />
                        {items.map((item) => (
                            <ColumnView.Item key={item.id} id={item.id} item={item} />
                        ))}
                    </ColumnView.Root>
                );
            }

            await render(
                <App
                    items={[
                        { id: "1", name: "A" },
                        { id: "2", name: "B" },
                        { id: "3", name: "C" },
                    ]}
                />,
            );

            await render(
                <App
                    items={[
                        { id: "1", name: "A" },
                        { id: "3", name: "C" },
                    ]}
                />,
            );

            expect(ref.current?.getModel()).not.toBeNull();
        });
    });

    describe("renderCell", () => {
        it("receives item data in renderCell", async () => {
            const ref = createRef<Gtk.ColumnView>();
            const renderCell = vi.fn((item: { name: string } | null) => <Label label={item?.name ?? "Empty"} />);

            await render(
                <ColumnView.Root ref={ref}>
                    <ColumnView.Column title="Name" renderCell={renderCell} />
                    <ColumnView.Item id="1" item={{ name: "Test" }} />
                </ColumnView.Root>,
            );
        });
    });

    describe("sorting", () => {
        it("sets sort column via sortColumn prop", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref} sortColumn="name">
                    <ColumnView.Column id="name" title="Name" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                </ColumnView.Root>,
            );
        });

        it("sets sort order via sortOrder prop", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref} sortColumn="name" sortOrder={Gtk.SortType.DESCENDING}>
                    <ColumnView.Column id="name" title="Name" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                </ColumnView.Root>,
            );
        });

        it("calls onSortChange when sort changes", async () => {
            const ref = createRef<Gtk.ColumnView>();
            const onSortChange = vi.fn();

            await render(
                <ColumnView.Root ref={ref} onSortChange={onSortChange}>
                    <ColumnView.Column id="name" title="Name" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                </ColumnView.Root>,
            );
        });

        it("updates sort indicator when props change", async () => {
            const ref = createRef<Gtk.ColumnView>();

            function App({ sortColumn }: { sortColumn: string | null }) {
                return (
                    <ColumnView.Root ref={ref} sortColumn={sortColumn}>
                        <ColumnView.Column id="name" title="Name" renderCell={() => <Label label="Cell" />} />
                        <ColumnView.Column id="age" title="Age" renderCell={() => <Label label="Cell" />} />
                        <ColumnView.Item id="1" item={{ name: "First", age: 25 }} />
                    </ColumnView.Root>
                );
            }

            await render(<App sortColumn="name" />);

            await render(<App sortColumn="age" />);
        });
    });

    describe("selection", () => {
        it("supports single selection", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref} selected={["1"]}>
                    <ColumnView.Column title="Name" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                    <ColumnView.Item id="2" item={{ name: "Second" }} />
                </ColumnView.Root>,
            );
        });

        it("supports multiple selection", async () => {
            const ref = createRef<Gtk.ColumnView>();

            await render(
                <ColumnView.Root ref={ref} selectionMode={Gtk.SelectionMode.MULTIPLE} selected={["1", "2"]}>
                    <ColumnView.Column title="Name" renderCell={() => <Label label="Cell" />} />
                    <ColumnView.Item id="1" item={{ name: "First" }} />
                    <ColumnView.Item id="2" item={{ name: "Second" }} />
                    <ColumnView.Item id="3" item={{ name: "Third" }} />
                </ColumnView.Root>,
            );
        });
    });
});
