import type * as Gtk from "@gtkx/ffi/gtk";
import type {
    ChildContainer,
    GridContainer,
    ItemContainer,
    PackContainer,
    PageContainer,
    StackPageContainer,
    StringListContainer,
} from "./containers.js";
import type { Node } from "./node.js";

interface Appendable extends Gtk.Widget {
    append(child: unknown): void;
}

interface Addable extends Gtk.Widget {
    add(child: unknown): void;
}

interface SingleChild extends Gtk.Widget {
    setChild(child: unknown): void;
}

interface Removable extends Gtk.Widget {
    remove(child: unknown): void;
}

export const isAppendable = (widget: Gtk.Widget): widget is Appendable =>
    "append" in widget && typeof widget.append === "function";

export const isAddable = (widget: Gtk.Widget): widget is Addable => "add" in widget && typeof widget.add === "function";

export const isSingleChild = (widget: Gtk.Widget): widget is SingleChild =>
    "setChild" in widget && typeof widget.setChild === "function";

export const isRemovable = (widget: Gtk.Widget): widget is Removable =>
    "remove" in widget && typeof widget.remove === "function";

export const isFlowBoxChild = (widget: Gtk.Widget): widget is Gtk.FlowBoxChild =>
    "getIndex" in widget && "getChild" in widget && typeof (widget as Gtk.FlowBoxChild).getIndex === "function";

export const isListBoxRow = (widget: Gtk.Widget): widget is Gtk.ListBoxRow =>
    "getIndex" in widget && "isSelected" in widget && typeof (widget as Gtk.ListBoxRow).getIndex === "function";

const createContainerGuard =
    <T>(requiredMethods: (keyof T)[]) =>
    (node: Node): node is Node & T =>
        requiredMethods.every((method) => method in node);

export const isChildContainer = createContainerGuard<ChildContainer>([
    "attachChild",
    "detachChild",
    "insertChildBefore",
]);

export const isPageContainer = createContainerGuard<PageContainer>([
    "addPage",
    "removePage",
    "insertPageBefore",
    "updatePageLabel",
]);

export const isStackPageContainer = createContainerGuard<StackPageContainer>([
    "addStackPage",
    "removeStackPage",
    "updateStackPageProps",
]);

export const isGridContainer = createContainerGuard<GridContainer>(["attachToGrid", "removeFromGrid"]);

export const isItemContainer = createContainerGuard<ItemContainer<unknown>>([
    "addItem",
    "insertItemBefore",
    "removeItem",
    "updateItem",
]);

export const isPackContainer = createContainerGuard<PackContainer>(["packStart", "packEnd", "removeFromPack"]);

export const isStringListContainer = createContainerGuard<StringListContainer>([
    "addStringListItem",
    "insertStringListItemBefore",
    "removeStringListItem",
    "updateStringListItem",
]);
