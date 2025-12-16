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

type SelectionCallback = (ids: string[]) => void;

type ColumnViewState = {
    selectionHandlerId: number | null;
    stringList: Gtk.StringList;
    selectionModel: Gtk.SingleSelection | Gtk.MultiSelection;
    ids: string[];
    items: Map<string, unknown>;
    columns: ColumnViewColumnNode[];
    committedLength: number;
    modelDirty: boolean;
    sortColumn: string | null;
    sortOrder: Gtk.SortType;
    onSortChange: ((column: string | null, order: Gtk.SortType) => void) | null;
    sorterChangedHandlerId: number | null;
    lastNotifiedColumn: string | null;
    lastNotifiedOrder: Gtk.SortType;
    onSelectionChanged?: SelectionCallback;
    selected: string[];
    hasAppliedInitialSelection: boolean;
    selectionMode: Gtk.SelectionMode;
};

const SELECTION_SIGNAL = "selection-changed";

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
        const selectionMode = (props.selectionMode as Gtk.SelectionMode | undefined) ?? Gtk.SelectionMode.SINGLE;
        const selected = (props.selected as string[] | undefined) ?? [];
        const onSelectionChanged = props.onSelectionChanged as SelectionCallback | undefined;

        this.state = {
            stringList: null as unknown as Gtk.StringList,
            selectionModel: null as unknown as Gtk.SingleSelection,
            ids: [],
            items: new Map(),
            columns: [],
            committedLength: 0,
            modelDirty: false,
            sortColumn: (props.sortColumn as string | null) ?? null,
            sortOrder: (props.sortOrder as Gtk.SortType | undefined) ?? Gtk.SortType.ASCENDING,
            onSortChange: (props.onSortChange as ((column: string | null, order: Gtk.SortType) => void) | null) ?? null,
            sorterChangedHandlerId: null,
            lastNotifiedColumn: null,
            lastNotifiedOrder: Gtk.SortType.ASCENDING,
            onSelectionChanged,
            selected,
            hasAppliedInitialSelection: false,
            selectionMode,
            selectionHandlerId: null,
        };
    }

    private createGtkModels(): void {
        const stringList = new Gtk.StringList([]);
        const listModel = getInterface(stringList, Gio.ListModel);

        const selectionModel =
            this.state.selectionMode === Gtk.SelectionMode.MULTIPLE
                ? new Gtk.MultiSelection(listModel)
                : new Gtk.SingleSelection(listModel);

        if (selectionModel instanceof Gtk.SingleSelection) {
            selectionModel.setAutoselect(false);
            selectionModel.setCanUnselect(true);
        }

        this.widget.setModel(selectionModel);

        this.state.stringList = stringList;
        this.state.selectionModel = selectionModel;
    }

    private connectSelectionHandler(): void {
        if (this.state.selectionHandlerId !== null) return;

        const handler = () => {
            const selectedIds = this.getSelectedIds();
            this.state.onSelectionChanged?.(selectedIds);
        };

        this.state.selectionHandlerId = this.state.selectionModel.connect(SELECTION_SIGNAL, handler);
    }

    private disconnectSelectionHandler(): void {
        if (this.state.selectionHandlerId !== null) {
            GObject.signalHandlerDisconnect(this.state.selectionModel, this.state.selectionHandlerId);
            this.state.selectionHandlerId = null;
        }
    }

    private getSelectedIds(): string[] {
        const selection = this.state.selectionModel.getSelection();
        const count = Number(selection.getSize());
        const selectedIds: string[] = [];

        for (let i = 0; i < count; i++) {
            const position = selection.getNth(i);
            const id = this.state.ids[position];
            if (id !== undefined) {
                selectedIds.push(id);
            }
        }

        return selectedIds;
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
        return this.state.ids.map((id) => this.state.items.get(id));
    }

    getItemById(id: string): unknown {
        return this.state.items.get(id);
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
        const newLength = this.state.ids.length;
        const lengthChanged = newLength !== this.state.committedLength;
        const needsSync = lengthChanged || this.state.modelDirty;

        if (!needsSync) return;

        const itemIndicesForSorter = Array.from({ length: newLength }, (_, i) => String(i));
        this.state.stringList.splice(0, this.state.committedLength, itemIndicesForSorter);
        this.state.committedLength = newLength;
        this.state.modelDirty = false;
    };

    addItem(id: string, item: unknown): void {
        this.state.ids.push(id);
        this.state.items.set(id, item);
        scheduleFlush(this.syncStringList);
        this.scheduleInitialSelectionIfNeeded();
    }

    private scheduleInitialSelectionIfNeeded(): void {
        if (!this.state.hasAppliedInitialSelection) {
            this.state.hasAppliedInitialSelection = true;
            queueMicrotask(() => this.applyInitialSelection());
        }
    }

    private applyInitialSelection(): void {
        this.applySelection(this.state.selected);

        if (this.state.onSelectionChanged) {
            this.connectSelectionHandler();
            const selectedIds = this.getSelectedIds();
            this.state.onSelectionChanged(selectedIds);
        }
    }

    private applySelection(ids: string[]): void {
        if (this.state.selectionMode === Gtk.SelectionMode.MULTIPLE) {
            const multiSelection = this.state.selectionModel as Gtk.MultiSelection;
            multiSelection.unselectAll();
            for (const id of ids) {
                const index = this.state.ids.indexOf(id);
                if (index !== -1) {
                    multiSelection.selectItem(index, false);
                }
            }
        } else {
            const singleSelection = this.state.selectionModel as Gtk.SingleSelection;
            const firstId = ids[0];
            if (firstId !== undefined) {
                const index = this.state.ids.indexOf(firstId);
                if (index !== -1) {
                    singleSelection.setSelected(index);
                }
            } else {
                singleSelection.setSelected(Gtk.INVALID_LIST_POSITION);
            }
        }
    }

    insertItemBefore(id: string, item: unknown, beforeId: string): void {
        const beforeIndex = this.state.ids.indexOf(beforeId);

        if (beforeIndex === -1) {
            this.state.ids.push(id);
        } else {
            this.state.ids.splice(beforeIndex, 0, id);
        }

        this.state.items.set(id, item);
        this.state.modelDirty = true;
        scheduleFlush(this.syncStringList);
    }

    removeItem(id: string): void {
        const index = this.state.ids.indexOf(id);

        if (index !== -1) {
            this.state.ids.splice(index, 1);
            this.state.items.delete(id);
            this.state.modelDirty = true;
            scheduleFlush(this.syncStringList);
        }
    }

    updateItem(id: string, item: unknown): void {
        if (this.state.items.has(id)) {
            this.state.items.set(id, item);
        }
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("sortColumn");
        consumed.add("sortOrder");
        consumed.add("onSortChange");
        consumed.add("selected");
        consumed.add("onSelectionChanged");
        consumed.add("selectionMode");
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

        const oldSelectionCallback = oldProps.onSelectionChanged as SelectionCallback | undefined;
        const newSelectionCallback = newProps.onSelectionChanged as SelectionCallback | undefined;

        if (oldSelectionCallback !== newSelectionCallback) {
            this.state.onSelectionChanged = newSelectionCallback;

            const hadCallback = oldSelectionCallback !== undefined;
            const hasCallback = newSelectionCallback !== undefined;

            if (hadCallback && !hasCallback) {
                this.disconnectSelectionHandler();
            } else if (!hadCallback && hasCallback) {
                this.connectSelectionHandler();
            }
        }

        const oldSelected = oldProps.selected as string[] | undefined;
        const newSelected = newProps.selected as string[] | undefined;

        if (oldSelected !== newSelected && newSelected !== undefined) {
            this.state.selected = newSelected;
            this.applySelection(newSelected);
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
