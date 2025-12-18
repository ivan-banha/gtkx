import type * as Gtk from "@gtkx/ffi/gtk";

export type ChildContainer = {
    attachChild(child: Gtk.Widget): void;
    insertChildBefore(child: Gtk.Widget, before: Gtk.Widget): void;
    detachChild(child: Gtk.Widget): void;
};

export type PageContainer = {
    addPage(child: Gtk.Widget, label: string): void;
    insertPageBefore(child: Gtk.Widget, label: string, beforeChild: Gtk.Widget): void;
    removePage(child: Gtk.Widget): void;
    updatePageLabel(child: Gtk.Widget, label: string): void;
};

export type StackPageProps = {
    name?: string;
    title?: string;
    iconName?: string;
    needsAttention?: boolean;
    visible?: boolean;
    useUnderline?: boolean;
    badgeNumber?: number;
};

export type StackPageContainer = {
    addStackPage(child: Gtk.Widget, props: StackPageProps): void;
    insertStackPageBefore(child: Gtk.Widget, props: StackPageProps, beforeChild: Gtk.Widget): void;
    removeStackPage(child: Gtk.Widget): void;
    updateStackPageProps(child: Gtk.Widget, props: StackPageProps): void;
};

export type GridContainer = {
    attachToGrid(child: Gtk.Widget, column: number, row: number, colSpan: number, rowSpan: number): void;
    removeFromGrid(child: Gtk.Widget): void;
};

export type ItemContainer<T> = {
    addItem(id: string, item: T): void;
    insertItemBefore(id: string, item: T, beforeId: string): void;
    removeItem(id: string): void;
    updateItem(id: string, item: T): void;
};

export type ColumnContainer = {
    addColumn(column: unknown): void;
    insertColumnBefore(column: unknown, beforeColumn: unknown): void;
    removeColumn(column: unknown): void;
    getItems(): unknown[];
};

export type PackContainer = {
    packStart(child: Gtk.Widget): void;
    packEnd(child: Gtk.Widget): void;
    removeFromPack(child: Gtk.Widget): void;
};

export type StringListItem = {
    id: string;
    label: string;
};

export type StringListContainer = {
    addStringListItem(id: string, label: string): void;
    insertStringListItemBefore(id: string, label: string, beforeId: string): void;
    removeStringListItem(id: string): void;
    updateStringListItem(oldId: string, newId: string, newLabel: string): void;
};
