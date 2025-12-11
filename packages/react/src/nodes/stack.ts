import type * as Gtk from "@gtkx/ffi/gtk";
import {
    type ChildContainer,
    isStackPageContainer,
    type StackPageContainer,
    type StackPageProps,
} from "../container-interfaces.js";
import type { Props } from "../factory.js";
import { Node } from "../node.js";

export class StackNode extends Node<Gtk.Stack> implements StackPageContainer, ChildContainer {
    static matches(type: string): boolean {
        return type === "Stack" || type === "Stack.Root";
    }

    private pendingVisibleChildName: string | null = null;

    addStackPage(child: Gtk.Widget, props: StackPageProps): void {
        const { name, title } = props;
        let stackPage: Gtk.StackPage;

        if (title !== undefined) {
            stackPage = this.widget.addTitled(child, title, name ?? null);
        } else if (name !== undefined) {
            stackPage = this.widget.addNamed(child, name);
        } else {
            stackPage = this.widget.addChild(child);
        }

        this.applyStackPageProps(stackPage, props);
        this.applyPendingVisibleChild();
    }

    private applyPendingVisibleChild(): void {
        if (this.pendingVisibleChildName !== null) {
            const child = this.widget.getChildByName(this.pendingVisibleChildName);
            if (child) {
                this.widget.setVisibleChild(child);
                this.pendingVisibleChildName = null;
            }
        }
    }

    insertStackPageBefore(child: Gtk.Widget, props: StackPageProps, _beforeChild: Gtk.Widget): void {
        this.addStackPage(child, props);
    }

    removeStackPage(child: Gtk.Widget): void {
        this.widget.remove(child);
    }

    updateStackPageProps(child: Gtk.Widget, props: StackPageProps): void {
        const stackPage = this.widget.getPage(child);
        this.applyStackPageProps(stackPage, props);
    }

    private applyStackPageProps(stackPage: Gtk.StackPage, props: StackPageProps): void {
        if (props.name !== undefined) {
            stackPage.setName(props.name);
        }
        if (props.title !== undefined) {
            stackPage.setTitle(props.title);
        }
        if (props.iconName !== undefined) {
            stackPage.setIconName(props.iconName);
        }
        if (props.needsAttention !== undefined) {
            stackPage.setNeedsAttention(props.needsAttention);
        }
        if (props.visible !== undefined) {
            stackPage.setVisible(props.visible);
        }
        if (props.useUnderline !== undefined) {
            stackPage.setUseUnderline(props.useUnderline);
        }
    }

    attachChild(child: Gtk.Widget): void {
        this.widget.addChild(child);
    }

    insertChildBefore(child: Gtk.Widget, _before: Gtk.Widget): void {
        this.widget.addChild(child);
    }

    detachChild(child: Gtk.Widget): void {
        this.widget.remove(child);
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("visibleChildName");
        return consumed;
    }

    private setVisibleChildOrDefer(name: string): void {
        const child = this.widget.getChildByName(name);

        if (child) {
            this.widget.setVisibleChild(child);
            this.pendingVisibleChildName = null;
        } else {
            this.pendingVisibleChildName = name;
        }
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        if (newProps.visibleChildName !== undefined) {
            this.setVisibleChildOrDefer(newProps.visibleChildName as string);
        }

        super.updateProps(oldProps, newProps);
    }
}

export class StackPageNode extends Node {
    static matches(type: string): boolean {
        return type === "Stack.Page";
    }

    protected override isVirtual(): boolean {
        return true;
    }

    private pageProps: StackPageProps = {};
    private childWidget: Gtk.Widget | null = null;
    private parentContainer: (Node & StackPageContainer) | null = null;

    override initialize(props: Props): void {
        this.pageProps = this.extractPageProps(props);
        super.initialize(props);
    }

    private extractPageProps(props: Props): StackPageProps {
        return {
            name: typeof props.name === "string" ? props.name : undefined,
            title: typeof props.title === "string" ? props.title : undefined,
            iconName: typeof props.iconName === "string" ? props.iconName : undefined,
            needsAttention: typeof props.needsAttention === "boolean" ? props.needsAttention : undefined,
            visible: typeof props.visible === "boolean" ? props.visible : undefined,
            useUnderline: typeof props.useUnderline === "boolean" ? props.useUnderline : undefined,
        };
    }

    getChildWidget(): Gtk.Widget | null {
        return this.childWidget;
    }

    override appendChild(child: Node): void {
        const childWidget = child.getWidget();
        if (childWidget) {
            this.childWidget = childWidget;
        }
    }

    override attachToParent(parent: Node): void {
        if (isStackPageContainer(parent) && this.childWidget) {
            this.parentContainer = parent;
            parent.addStackPage(this.childWidget, this.pageProps);
        }
    }

    override attachToParentBefore(parent: Node, before: Node): void {
        if (isStackPageContainer(parent) && this.childWidget) {
            this.parentContainer = parent;
            const beforePage = before instanceof StackPageNode ? before.getChildWidget() : before.getWidget();

            if (beforePage) {
                parent.insertStackPageBefore(this.childWidget, this.pageProps, beforePage);
            } else {
                parent.addStackPage(this.childWidget, this.pageProps);
            }
        }
    }

    override detachFromParent(parent: Node): void {
        if (isStackPageContainer(parent) && this.childWidget) {
            parent.removeStackPage(this.childWidget);
            this.parentContainer = null;
        }
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("name");
        consumed.add("title");
        consumed.add("iconName");
        consumed.add("needsAttention");
        consumed.add("visible");
        consumed.add("useUnderline");
        return consumed;
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        const newPageProps = this.extractPageProps(newProps);
        const propsChanged =
            oldProps.name !== newProps.name ||
            oldProps.title !== newProps.title ||
            oldProps.iconName !== newProps.iconName ||
            oldProps.needsAttention !== newProps.needsAttention ||
            oldProps.visible !== newProps.visible ||
            oldProps.useUnderline !== newProps.useUnderline;

        if (propsChanged) {
            this.pageProps = newPageProps;

            if (this.parentContainer && this.childWidget) {
                this.parentContainer.updateStackPageProps(this.childWidget, this.pageProps);
            }
        }

        super.updateProps(oldProps, newProps);
    }
}
