import type * as Adw from "@gtkx/ffi/adw";
import type * as Gtk from "@gtkx/ffi/gtk";
import type { ChildContainer, StackPageContainer, StackPageProps } from "../container-interfaces.js";
import type { Props } from "../factory.js";
import { Node } from "../node.js";

export class ViewStackNode extends Node<Adw.ViewStack> implements StackPageContainer, ChildContainer {
    static matches(type: string): boolean {
        return type === "AdwViewStack" || type === "AdwViewStack.Root";
    }

    private pendingVisibleChildName: string | null = null;

    addStackPage(child: Gtk.Widget, props: StackPageProps): void {
        const { name, title, iconName } = props;
        let page: Adw.ViewStackPage;

        if (title !== undefined && iconName !== undefined) {
            page = this.widget.addTitledWithIcon(child, title, iconName, name ?? null);
        } else if (title !== undefined) {
            page = this.widget.addTitled(child, title, name ?? null);
        } else if (name !== undefined) {
            page = this.widget.addNamed(child, name);
        } else {
            page = this.widget.add(child);
        }

        this.applyViewStackPageProps(page, props);
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
        const page = this.widget.getPage(child);
        this.applyViewStackPageProps(page, props);
    }

    private applyViewStackPageProps(page: Adw.ViewStackPage, props: StackPageProps): void {
        if (props.name !== undefined) {
            page.setName(props.name);
        }

        if (props.title !== undefined) {
            page.setTitle(props.title);
        }

        if (props.iconName !== undefined) {
            page.setIconName(props.iconName);
        }

        if (props.needsAttention !== undefined) {
            page.setNeedsAttention(props.needsAttention);
        }

        if (props.visible !== undefined) {
            page.setVisible(props.visible);
        }

        if (props.useUnderline !== undefined) {
            page.setUseUnderline(props.useUnderline);
        }

        if (props.badgeNumber !== undefined) {
            page.setBadgeNumber(props.badgeNumber);
        }
    }

    attachChild(child: Gtk.Widget): void {
        this.widget.add(child);
    }

    insertChildBefore(child: Gtk.Widget, _before: Gtk.Widget): void {
        this.widget.add(child);
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
