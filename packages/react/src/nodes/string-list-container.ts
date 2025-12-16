import { getInterface } from "@gtkx/ffi";
import * as Gio from "@gtkx/ffi/gio";
import type * as Gtk from "@gtkx/ffi/gtk";
import type { Props } from "../factory.js";
import type { Node } from "../node.js";
import { Node as NodeClass } from "../node.js";
import { StringListStore } from "./string-list-store.js";

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

export const isStringListContainer = (node: Node): node is Node & StringListContainer =>
    "addStringListItem" in node &&
    "insertStringListItemBefore" in node &&
    "removeStringListItem" in node &&
    "updateStringListItem" in node;

type StringListContainerState = {
    store: StringListStore;
    onSelectionChanged?: (id: string) => void;
    initialSelection?: string;
    hasAppliedInitialSelection: boolean;
};

type StringListWidget = Gtk.Widget & {
    setModel(model: Gio.ListModel | null): void;
    getSelected(): number;
    setSelected(position: number): void;
};

const SELECTION_SIGNAL = "notify::selected";

export abstract class StringListContainerNode<T extends StringListWidget>
    extends NodeClass<T, StringListContainerState>
    implements StringListContainer
{
    override initialize(props: Props): void {
        const store = new StringListStore();
        const onSelectionChanged = props.onSelectionChanged as ((id: string) => void) | undefined;
        const initialSelection = props.selectedId as string | undefined;

        this.state = { store, onSelectionChanged, initialSelection, hasAppliedInitialSelection: false };

        super.initialize(props);

        this.widget.setModel(getInterface(store.getModel(), Gio.ListModel));
    }

    private connectSelectionHandler(): void {
        const handler = () => {
            const index = this.widget.getSelected();
            const id = this.state.store.getIdAtIndex(index);
            if (id !== undefined) {
                this.state.onSelectionChanged?.(id);
            }
        };

        this.connectSignal(this.widget, SELECTION_SIGNAL, handler);
    }

    addStringListItem(id: string, label: string): void {
        this.state.store.append(id, label);
        this.scheduleInitialSelectionIfNeeded();
    }

    private scheduleInitialSelectionIfNeeded(): void {
        if (!this.state.hasAppliedInitialSelection) {
            this.state.hasAppliedInitialSelection = true;
            queueMicrotask(() => this.applyInitialSelection());
        }
    }

    private applyInitialSelection(): void {
        if (this.state.initialSelection !== undefined) {
            const index = this.state.store.getIndexForId(this.state.initialSelection);
            if (index !== -1) {
                this.widget.setSelected(index);
            }
        }

        if (this.state.onSelectionChanged) {
            this.connectSelectionHandler();

            const currentIndex = this.widget.getSelected();
            const id = this.state.store.getIdAtIndex(currentIndex);
            if (id !== undefined) {
                this.state.onSelectionChanged(id);
            }
        }
    }

    insertStringListItemBefore(id: string, label: string, beforeId: string): void {
        this.state.store.insertBefore(id, label, beforeId);
    }

    removeStringListItem(id: string): void {
        this.state.store.remove(id);
    }

    updateStringListItem(oldId: string, newId: string, newLabel: string): void {
        this.state.store.update(oldId, newId, newLabel);
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("onSelectionChanged");
        consumed.add("selectedId");
        return consumed;
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        const oldCallback = oldProps.onSelectionChanged as ((id: string) => void) | undefined;
        const newCallback = newProps.onSelectionChanged as ((id: string) => void) | undefined;

        if (oldCallback !== newCallback) {
            this.state.onSelectionChanged = newCallback;

            const hadCallback = oldCallback !== undefined;
            const hasCallback = newCallback !== undefined;

            if (hadCallback && !hasCallback) {
                this.disconnectSignal(SELECTION_SIGNAL);
            } else if (!hadCallback && hasCallback) {
                this.connectSelectionHandler();
            }
        }

        const oldSelected = oldProps.selectedId as string | undefined;
        const newSelected = newProps.selectedId as string | undefined;

        if (oldSelected !== newSelected && newSelected !== undefined) {
            this.state.initialSelection = newSelected;
            const index = this.state.store.getIndexForId(newSelected);
            if (index !== -1) {
                this.widget.setSelected(index);
            }
        }

        super.updateProps(oldProps, newProps);
    }
}
