import * as Gtk from "@gtkx/ffi/gtk";
import { useCallback, useEffect, useState } from "react";
import { describe, expect, it } from "vitest";
import { ApplicationWindow, Box, Button, Label as LabelNS } from "../src/index.js";
import { renderElement, setupReactTests, unmountAll } from "./setup.js";

const Label = LabelNS.Root;

setupReactTests();

describe("React Reconciler Integration", () => {
    it("should render a simple component", () => {
        const SimpleComponent = () => <Button label="Hello" />;

        renderElement(<SimpleComponent />);
        unmountAll();
    });

    it("should render nested components", () => {
        const NestedComponent = () => (
            <Box spacing={10} orientation={Gtk.Orientation.VERTICAL}>
                <Label label="Title" />
                <Button label="Click Me" />
            </Box>
        );

        renderElement(<NestedComponent />);
        unmountAll();
    });

    it("should handle component updates", () => {
        let setCount: (value: number) => void = () => {};

        const CounterComponent = () => {
            const [count, _setCount] = useState(0);
            setCount = _setCount;
            return <Label label={`Count: ${count}`} />;
        };

        renderElement(<CounterComponent />);
        setCount(5);
        unmountAll();
    });

    it("should handle conditional rendering", () => {
        let setVisible: (value: boolean) => void = () => {};

        const ConditionalComponent = () => {
            const [visible, _setVisible] = useState(true);
            setVisible = _setVisible;
            return (
                <Box spacing={10} orientation={Gtk.Orientation.VERTICAL}>
                    {visible && <Label label="Visible" />}
                    <Button label="Toggle" />
                </Box>
            );
        };

        renderElement(<ConditionalComponent />);

        setVisible(false);
        setVisible(true);
        setVisible(false);
        unmountAll();
    });

    it("should handle list rendering", () => {
        const items = [1, 2, 3, 4, 5];

        const ListComponent = () => (
            <Box spacing={5} orientation={Gtk.Orientation.VERTICAL}>
                {items.map((item) => (
                    <Label key={item} label={`Item ${item}`} />
                ))}
            </Box>
        );

        renderElement(<ListComponent />);
        unmountAll();
    });

    it("should clean up on unmount", () => {
        const EffectComponent = () => {
            useEffect(() => {
                return () => {};
            }, []);
            return <Label label="Effect Component" />;
        };

        renderElement(<EffectComponent />);
        unmountAll();
    });

    it("should handle signal handlers in React components", () => {
        let clickCount = 0;

        const ClickableComponent = () => {
            const handleClick = useCallback(() => {
                clickCount++;
            }, []);

            return <Button label="Click Me" onClicked={handleClick} />;
        };

        renderElement(<ClickableComponent />);
        expect(clickCount).toBe(0);
        unmountAll();
    });

    it("should handle multiple windows", () => {
        const MultiWindowApp = () => (
            <>
                <ApplicationWindow title="Window 1">
                    <Label label="Content 1" />
                </ApplicationWindow>
                <ApplicationWindow title="Window 2">
                    <Label label="Content 2" />
                </ApplicationWindow>
            </>
        );

        renderElement(<MultiWindowApp />);
        unmountAll();
    });

    it("should handle dialogs", () => {
        const DialogApp = () => (
            <ApplicationWindow title="Main">
                <Box spacing={10} orientation={Gtk.Orientation.VERTICAL}>
                    <Label label="Main Window" />
                </Box>
            </ApplicationWindow>
        );

        renderElement(<DialogApp />);
        unmountAll();
    });
});
