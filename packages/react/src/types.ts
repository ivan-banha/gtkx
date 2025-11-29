import type { ReactNode } from "react";

export interface SlotProps {
    children?: ReactNode;
}

export interface ListItemProps {
    // biome-ignore lint/suspicious/noExplicitAny: needed for generic items
    item: any;
}

export interface GridChildProps extends SlotProps {
    column?: number;
    row?: number;
    columnSpan?: number;
    rowSpan?: number;
}
