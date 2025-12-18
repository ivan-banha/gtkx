import type { StringListContainer, StringListItem } from "../containers.js";
import type { Props } from "../factory.js";
import type { Node } from "../node.js";
import { Node as NodeClass } from "../node.js";
import { isStringListContainer } from "../predicates.js";

export abstract class StringListItemNode extends NodeClass<never> {
    static override consumedPropNames = ["id", "label"];

    protected override isVirtual(): boolean {
        return true;
    }

    private id = "";
    private label = "";
    private parentContainer: (Node & StringListContainer) | null = null;

    override initialize(props: Props): void {
        this.id = props.id as string;
        this.label = props.label as string;
        super.initialize(props);
    }

    getId(): string {
        return this.id;
    }

    getStringListItem(): StringListItem {
        return { id: this.id, label: this.label };
    }

    setParentContainer(container: Node & StringListContainer): void {
        this.parentContainer = container;
    }

    addToContainer(container: StringListContainer): void {
        container.addStringListItem(this.id, this.label);
    }

    insertBeforeInContainer(container: StringListContainer, beforeId: string): void {
        container.insertStringListItemBefore(this.id, this.label, beforeId);
    }

    override unmount(): void {
        if (this.parentContainer) {
            this.parentContainer.removeStringListItem(this.id);
        }
        this.parentContainer = null;
        super.unmount();
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        const oldId = oldProps.id as string;
        const newId = newProps.id as string;
        const oldLabel = oldProps.label as string;
        const newLabel = newProps.label as string;

        if ((oldId !== newId || oldLabel !== newLabel) && this.parent && isStringListContainer(this.parent)) {
            this.parent.updateStringListItem(this.id, newId, newLabel);
            this.id = newId;
            this.label = newLabel;
        }

        super.updateProps(oldProps, newProps);
    }
}
