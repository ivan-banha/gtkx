import { getInterface, getObject } from "@gtkx/ffi";
import * as Gio from "@gtkx/ffi/gio";
import * as GObject from "@gtkx/ffi/gobject";
import * as Gtk from "@gtkx/ffi/gtk";
import { scheduleFlush } from "../batch.js";
import { type ColumnContainer, type ItemContainer, isColumnContainer } from "../container-interfaces.js";
import type { Props } from "../factory.js";
import { Node } from "../node.js";
import type { RenderItemFn } from "../types.js";
import { connectListItemFactorySignals, type ListItemFactoryHandlers, type ListItemInfo } from "./list-item-factory.js";
import { VirtualItemNode } from "./virtual-item.js";

type ColumnViewState = {
    stringList: Gtk.StringList;
    selectionModel: Gtk.SingleSelection;
    items: unknown[];
    columns: ColumnViewColumnNode[];
    committedLength: number;
    modelDirty: boolean;
    sortColumn: string | null;
    sortOrder: Gtk.SortType;
    onSortChange: ((column: string | null, order: Gtk.SortType) => void) | null;
    sorterChangedHandlerId: number | null;
    lastNotifiedColumn: string | null;
    lastNotifiedOrder: Gtk.SortType;
};

export class ColumnViewNode
    extends Node<Gtk.ColumnView, ColumnViewState>
    implements ItemContainer<unknown>, ColumnContainer
{
    static matches(type: string): boolean {
        return type === "ColumnView.Root";
    }

    override initialize(props: Props): void {
        this.initializeStateWithPlaceholders(props);
        super.initialize(props);
        this.createGtkModels();
        this.connectSorterChangedSignal();
    }

    private initializeStateWithPlaceholders(props: Props): void {
        this.state = {
            stringList: null as unknown as Gtk.StringList,
            selectionModel: null as unknown as Gtk.SingleSelection,
            items: [],
            columns: [],
            committedLength: 0,
            modelDirty: false,
            sortColumn: (props.sortColumn as string | null) ?? null,
            sortOrder: (props.sortOrder as Gtk.SortType | undefined) ?? Gtk.SortType.ASCENDING,
            onSortChange: (props.onSortChange as ((column: string | null, order: Gtk.SortType) => void) | null) ?? null,
            sorterChangedHandlerId: null,
            lastNotifiedColumn: null,
            lastNotifiedOrder: Gtk.SortType.ASCENDING,
        };
    }

    private createGtkModels(): void {
        const stringList = new Gtk.StringList([]);
        const selectionModel = new Gtk.SingleSelection(getInterface(stringList, Gio.ListModel));
        this.widget.setModel(selectionModel);

        this.state.stringList = stringList;
        this.state.selectionModel = selectionModel;
    }

    private connectSorterChangedSignal(): void {
        const sorter = this.widget.getSorter();
        if (!sorter || !this.state.onSortChange) return;

        this.state.sorterChangedHandlerId = sorter.connect("changed", () => {
            this.notifySortChange();
        });
    }

    private disconnectSorterChangedSignal(): void {
        if (this.state.sorterChangedHandlerId === null) return;

        const sorter = this.widget.getSorter();
        if (sorter) {
            GObject.signalHandlerDisconnect(sorter, this.state.sorterChangedHandlerId);
        }
        this.state.sorterChangedHandlerId = null;
    }

    private notifySortChange(): void {
        if (!this.state.onSortChange) return;

        const baseSorter = this.widget.getSorter();
        if (!baseSorter) return;

        const sorter = getObject<Gtk.ColumnViewSorter>(baseSorter.id);
        const column = sorter.getPrimarySortColumn();
        const order = sorter.getPrimarySortOrder();
        const columnId = column?.getId() ?? null;
        const sortStateUnchanged = columnId === this.state.lastNotifiedColumn && order === this.state.lastNotifiedOrder;
        if (sortStateUnchanged) {
            return;
        }

        this.state.lastNotifiedColumn = columnId;
        this.state.lastNotifiedOrder = order;
        this.state.onSortChange(columnId, order);
    }

    getItems(): unknown[] {
        return this.state.items;
    }

    addColumn(columnNode: ColumnViewColumnNode): void {
        this.state.columns.push(columnNode);
        const column = columnNode.getColumn();
        this.widget.appendColumn(column);
        columnNode.setColumnView(this);

        if (columnNode.getId() === this.state.sortColumn && this.state.sortColumn !== null) {
            this.applySortIndicator();
        }
    }

    private applySortIndicator(): void {
        if (this.state.sortColumn === null) {
            this.widget.sortByColumn(this.state.sortOrder, null);
            return;
        }

        const column = this.state.columns.find((c) => c.getId() === this.state.sortColumn);
        if (column) {
            this.widget.sortByColumn(this.state.sortOrder, column.getColumn());
        }
    }

    findColumnById(id: string): ColumnViewColumnNode | undefined {
        return this.state.columns.find((c) => c.getId() === id);
    }

    removeColumn(column: ColumnViewColumnNode): void {
        const index = this.state.columns.indexOf(column);
        if (index !== -1) {
            this.state.columns.splice(index, 1);
            this.widget.removeColumn(column.getColumn());
            column.setColumnView(null);
        }
    }

    insertColumnBefore(column: ColumnViewColumnNode, before: ColumnViewColumnNode): void {
        const beforeIndex = this.state.columns.indexOf(before);
        if (beforeIndex === -1) {
            this.addColumn(column);
            return;
        }

        this.state.columns.splice(beforeIndex, 0, column);
        this.widget.insertColumn(beforeIndex, column.getColumn());
        column.setColumnView(this);
    }

    private syncStringList = (): void => {
        const newLength = this.state.items.length;
        const lengthChanged = newLength !== this.state.committedLength;
        const needsSync = lengthChanged || this.state.modelDirty;

        if (!needsSync) return;

        const itemIndicesForSorter = Array.from({ length: newLength }, (_, i) => String(i));
        this.state.stringList.splice(0, this.state.committedLength, itemIndicesForSorter);
        this.state.committedLength = newLength;
        this.state.modelDirty = false;
    };

    addItem(item: unknown): void {
        this.state.items.push(item);
        scheduleFlush(this.syncStringList);
    }

    insertItemBefore(item: unknown, beforeItem: unknown): void {
        const beforeIndex = this.state.items.indexOf(beforeItem);

        if (beforeIndex === -1) {
            this.state.items.push(item);
        } else {
            this.state.items.splice(beforeIndex, 0, item);
        }

        this.state.modelDirty = true;
        scheduleFlush(this.syncStringList);
    }

    removeItem(item: unknown): void {
        const index = this.state.items.indexOf(item);

        if (index !== -1) {
            this.state.items.splice(index, 1);
            this.state.modelDirty = true;
            scheduleFlush(this.syncStringList);
        }
    }

    updateItem(oldItem: unknown, newItem: unknown): void {
        const index = this.state.items.indexOf(oldItem);

        if (index !== -1) {
            this.state.items[index] = newItem;
        }
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("sortColumn");
        consumed.add("sortOrder");
        consumed.add("onSortChange");
        return consumed;
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        super.updateProps(oldProps, newProps);

        const newSortColumn = (newProps.sortColumn as string | null) ?? null;
        const newSortOrder = (newProps.sortOrder as Gtk.SortType | undefined) ?? Gtk.SortType.ASCENDING;
        const newOnSortChange =
            (newProps.onSortChange as ((column: string | null, order: Gtk.SortType) => void) | null) ?? null;

        if (oldProps.onSortChange !== newProps.onSortChange) {
            const hadCallback = this.state.onSortChange !== null;
            this.state.onSortChange = newOnSortChange;
            const hasCallback = this.state.onSortChange !== null;

            const callbackAdded = !hadCallback && hasCallback;
            const callbackRemoved = hadCallback && !hasCallback;
            if (callbackAdded) {
                this.connectSorterChangedSignal();
            } else if (callbackRemoved) {
                this.disconnectSorterChangedSignal();
            }
        }

        if (oldProps.sortColumn !== newProps.sortColumn || oldProps.sortOrder !== newProps.sortOrder) {
            this.state.sortColumn = newSortColumn;
            this.state.sortOrder = newSortOrder;
            this.applySortIndicator();
        }
    }
}

type ColumnViewColumnState = {
    column: Gtk.ColumnViewColumn;
    factory: Gtk.SignalListItemFactory;
    factoryHandlers: ListItemFactoryHandlers | null;
    renderCell: RenderItemFn<unknown>;
    columnId: string | null;
    sorter: Gtk.CustomSorter | null;
    listItemCache: Map<number, ListItemInfo>;
};

export class ColumnViewColumnNode extends Node<never, ColumnViewColumnState> {
    static matches(type: string): boolean {
        return type === "ColumnView.Column";
    }

    protected override isVirtual(): boolean {
        return true;
    }

    private columnView: ColumnViewNode | null = null;

    override initialize(props: Props): void {
        const factory = new Gtk.SignalListItemFactory();
        const column = new Gtk.ColumnViewColumn(props.title as string | undefined, factory);
        const columnId = (props.id as string | null) ?? null;

        this.state = {
            column,
            factory,
            factoryHandlers: null,
            renderCell: props.renderCell as RenderItemFn<unknown>,
            columnId,
            sorter: null,
            listItemCache: new Map(),
        };

        super.initialize(props);

        if (columnId !== null) {
            column.setId(columnId);
        }

        if (props.expand !== undefined) {
            column.setExpand(props.expand as boolean);
        }

        if (props.resizable !== undefined) {
            column.setResizable(props.resizable as boolean);
        }

        if (props.fixedWidth !== undefined) {
            column.setFixedWidth(props.fixedWidth as number);
        }

        this.state.factoryHandlers = connectListItemFactorySignals({
            factory,
            listItemCache: this.state.listItemCache,
            getRenderFn: () => this.state.renderCell,
            getItemAtPosition: (position) => this.columnView?.getItems()[position] ?? null,
        });
    }

    getColumn(): Gtk.ColumnViewColumn {
        return this.state.column;
    }

    getId(): string | null {
        return this.state.columnId;
    }

    setColumnView(columnView: ColumnViewNode | null): void {
        this.columnView = columnView;
        this.updateSorter();
    }

    updateSorter(): void {
        if (!this.columnView || this.state.columnId === null) {
            this.state.column.setSorter(null);
            this.state.sorter = null;
            return;
        }

        const noOpSortFn = (): number => 0;
        this.state.sorter = new Gtk.CustomSorter(noOpSortFn);
        this.state.column.setSorter(this.state.sorter);
    }

    override attachToParent(parent: Node): void {
        if (isColumnContainer(parent)) {
            parent.addColumn(this);
        }
    }

    override attachToParentBefore(parent: Node, before: Node): void {
        if (isColumnContainer(parent) && before instanceof ColumnViewColumnNode) {
            parent.insertColumnBefore(this, before);
        } else {
            this.attachToParent(parent);
        }
    }

    override detachFromParent(parent: Node): void {
        this.state.factoryHandlers?.disconnect();

        if (isColumnContainer(parent)) {
            parent.removeColumn(this);
        }
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("renderCell");
        consumed.add("title");
        consumed.add("expand");
        consumed.add("resizable");
        consumed.add("fixedWidth");
        consumed.add("id");
        return consumed;
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        if (oldProps.renderCell !== newProps.renderCell) {
            this.state.renderCell = newProps.renderCell as RenderItemFn<unknown>;
        }

        if (oldProps.title !== newProps.title) {
            this.state.column.setTitle(newProps.title as string | undefined);
        }
        if (oldProps.expand !== newProps.expand) {
            this.state.column.setExpand(newProps.expand as boolean);
        }
        if (oldProps.resizable !== newProps.resizable) {
            this.state.column.setResizable(newProps.resizable as boolean);
        }
        if (oldProps.fixedWidth !== newProps.fixedWidth) {
            this.state.column.setFixedWidth(newProps.fixedWidth as number);
        }
        if (oldProps.id !== newProps.id) {
            this.state.columnId = (newProps.id as string | null) ?? null;
            this.state.column.setId(this.state.columnId);
        }
    }
}

export class ColumnViewItemNode extends VirtualItemNode {
    static matches(type: string): boolean {
        return type === "ColumnView.Item";
    }
}
