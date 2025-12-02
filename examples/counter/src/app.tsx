import { ApplicationWindow, quit } from "@gtkx/react";
import { Counter } from "./counter.js";

export const App = () => (
    <ApplicationWindow title="Counter" defaultWidth={300} defaultHeight={150} onCloseRequest={quit}>
        <Counter />
    </ApplicationWindow>
);
