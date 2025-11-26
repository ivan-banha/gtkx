import type { Props } from "./factory.js";

/**
 * Base interface for all node types in the reconciler.
 * Each node knows how to manage its own behavior.
 */
export interface Node {
    /**
     * Append a child to this node.
     */
    appendChild(child: Node): void;

    /**
     * Remove a child from this node.
     */
    removeChild(child: Node): void;

    /**
     * Insert a child before another child in this node.
     */
    insertBefore(child: Node, before: Node): void;

    /**
     * Update properties on this node.
     */
    updateProps(oldProps: Props, newProps: Props): void;

    /**
     * Called when the node is mounted to the root.
     * For windows, this calls present(). For dialogs, this shows the dialog.
     */
    mount(): void;

    /**
     * Attach this node to a parent node.
     * Each node type knows how to attach itself.
     */
    attachToParent(parent: Node): void;

    /**
     * Detach this node from a parent node.
     * Each node type knows how to detach itself.
     */
    detachFromParent(parent: Node): void;
}
