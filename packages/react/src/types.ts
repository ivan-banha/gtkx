import type { ReactElement, ReactNode } from "react";

export interface SlotProps {
    children?: ReactNode;
}

export interface ListItemProps<I = unknown> {
    item: I;
}

export interface GridChildProps extends SlotProps {
    column?: number;
    row?: number;
    columnSpan?: number;
    rowSpan?: number;
}

/**
 * Render function for ListView/GridView items.
 * Called with null during setup (for loading state) and with the actual item during bind.
 */
export type RenderItemFn<T> = (item: T | null) => ReactElement;

export interface ListViewRenderProps<T = unknown> {
    renderItem: RenderItemFn<T>;
}

export interface ColumnViewColumnProps {
    title?: string;
    expand?: boolean;
    resizable?: boolean;
    fixedWidth?: number;
    /**
     * Render function for column cells.
     * Called with null during setup (for loading state) and with the actual item during bind.
     * Always annotate your callback parameter type to include null, e.g.: `(item: MyItem | null) => ...`
     */
    // biome-ignore lint/suspicious/noExplicitAny: Using any allows users to specify their own item type
    renderCell: (item: any) => ReactElement;
}

export interface NotebookPageProps extends SlotProps {
    label: string;
}
