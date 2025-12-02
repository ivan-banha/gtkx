import { Orientation } from "@gtkx/ffi/gtk";
import { Box, Button, Label } from "@gtkx/react";
import { useState } from "react";

export const Counter = () => {
    const [count, setCount] = useState(0);

    return (
        <Box
            spacing={12}
            orientation={Orientation.VERTICAL}
            marginTop={20}
            marginBottom={20}
            marginStart={20}
            marginEnd={20}
        >
            <Label.Root label={`Count: ${count}`} />
            <Box spacing={8} orientation={Orientation.HORIZONTAL} halign={2}>
                <Button label="Decrement" onClicked={() => setCount((c) => c - 1)} />
                <Button label="Reset" onClicked={() => setCount(0)} />
                <Button label="Increment" onClicked={() => setCount((c) => c + 1)} />
            </Box>
        </Box>
    );
};
