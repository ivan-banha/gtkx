import { getInterface } from "@gtkx/ffi";
import * as Gio from "@gtkx/ffi/gio";
import * as GObject from "@gtkx/ffi/gobject";
import * as Gtk from "@gtkx/ffi/gtk";
import { scheduleFlush } from "../batch.js";
import type { ItemContainer } from "../container-interfaces.js";
import type { Props } from "../factory.js";
import { Node } from "../node.js";
import type { RenderItemFn } from "../types.js";
import { connectListItemFactorySignals, type ListItemFactoryHandlers, type ListItemInfo } from "./list-item-factory.js";
import { VirtualItemNode } from "./virtual-item.js";

type SelectionCallback = (ids: string[]) => void;

type ListViewState = {
    stringList: Gtk.StringList;
    selectionModel: Gtk.SingleSelection | Gtk.MultiSelection;
    factory: Gtk.SignalListItemFactory;
    factoryHandlers: ListItemFactoryHandlers | null;
    renderItem: RenderItemFn<unknown>;
    listItemCache: Map<number, ListItemInfo>;
    ids: string[];
    items: Map<string, unknown>;
    committedLength: number;
    modelDirty: boolean;
    onSelectionChanged?: SelectionCallback;
    selected: string[];
    hasAppliedInitialSelection: boolean;
    selectionMode: Gtk.SelectionMode;
    selectionHandlerId: number | null;
};

const SELECTION_SIGNAL = "selection-changed";

export class ListViewNode extends Node<Gtk.ListView | Gtk.GridView, ListViewState> implements ItemContainer<unknown> {
    static matches(type: string): boolean {
        return type === "ListView.Root" || type === "GridView.Root";
    }

    override initialize(props: Props): void {
        this.initializeStateWithPlaceholders(props);
        super.initialize(props);
        this.createGtkModels();
        this.connectFactorySignals();
        this.widget.setModel(this.state.selectionModel);
        this.widget.setFactory(this.state.factory);
    }

    private initializeStateWithPlaceholders(props: Props): void {
        const selectionMode = (props.selectionMode as Gtk.SelectionMode | undefined) ?? Gtk.SelectionMode.SINGLE;
        const selected = (props.selected as string[] | undefined) ?? [];
        const onSelectionChanged = props.onSelectionChanged as SelectionCallback | undefined;

        this.state = {
            stringList: null as unknown as Gtk.StringList,
            selectionModel: null as unknown as Gtk.SingleSelection,
            factory: null as unknown as Gtk.SignalListItemFactory,
            factoryHandlers: null,
            renderItem: props.renderItem as RenderItemFn<unknown>,
            listItemCache: new Map(),
            ids: [],
            items: new Map(),
            committedLength: 0,
            modelDirty: false,
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

        const factory = new Gtk.SignalListItemFactory();

        this.state.stringList = stringList;
        this.state.selectionModel = selectionModel;
        this.state.factory = factory;
    }

    private connectFactorySignals(): void {
        this.state.factoryHandlers = connectListItemFactorySignals({
            factory: this.state.factory,
            listItemCache: this.state.listItemCache,
            getRenderFn: () => this.state.renderItem,
            getItemAtPosition: (position) => {
                const id = this.state.ids[position];
                return id !== undefined ? this.state.items.get(id) : undefined;
            },
        });
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

    override detachFromParent(parent: Node): void {
        this.state.factoryHandlers?.disconnect();
        this.disconnectSelectionHandler();
        super.detachFromParent(parent);
    }

    private syncStringList = (): void => {
        const newLength = this.state.ids.length;
        const lengthChanged = newLength !== this.state.committedLength;
        const needsSync = lengthChanged || this.state.modelDirty;

        if (!needsSync) return;

        const placeholders = Array.from({ length: newLength }, () => "");
        this.state.stringList.splice(0, this.state.committedLength, placeholders);
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

    getItems(): unknown[] {
        return this.state.ids.map((id) => this.state.items.get(id));
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("renderItem");
        consumed.add("selected");
        consumed.add("onSelectionChanged");
        consumed.add("selectionMode");
        return consumed;
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        if (oldProps.renderItem !== newProps.renderItem) {
            this.state.renderItem = newProps.renderItem as RenderItemFn<unknown>;
        }

        const oldCallback = oldProps.onSelectionChanged as SelectionCallback | undefined;
        const newCallback = newProps.onSelectionChanged as SelectionCallback | undefined;

        if (oldCallback !== newCallback) {
            this.state.onSelectionChanged = newCallback;

            const hadCallback = oldCallback !== undefined;
            const hasCallback = newCallback !== undefined;

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

        super.updateProps(oldProps, newProps);
    }
}

export class ListItemNode extends VirtualItemNode {
    static matches(type: string): boolean {
        return type === "ListView.Item" || type === "GridView.Item";
    }
}
