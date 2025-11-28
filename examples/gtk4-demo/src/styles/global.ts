import { injectGlobal } from "@gtkx/css";

injectGlobal`
    .demo-sidebar {
        background: alpha(@window_bg_color, 0.95);
    }

    .source-view {
        font-family: monospace;
        font-size: 0.9em;
    }

    .demo-content {
        background: @view_bg_color;
    }
`;
