import type { ComponentType } from "react";

export interface Demo {
    id: string;
    title: string;
    description: string;
    keywords: string[];
    component: ComponentType;
    source: string;
}

export interface Category {
    id: string;
    title: string;
    demos: Demo[];
}
