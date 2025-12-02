---
sidebar_position: 8
---

# Testing

This guide covers how to test GTKX applications using `@gtkx/testing`, a Testing Library-style API for GTK widgets.

## Setup

Install the testing package:

```bash
pnpm add -D @gtkx/testing vitest
```

Configure Vitest in `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        pool: "forks",
        fileParallelism: false,
        sequence: { hooks: "list" },
        env: { GTK_A11Y: "none" },
        globalSetup: "./tests/setup.ts",
    },
});
```

Create a setup file at `tests/setup.ts`:

```typescript
import { teardown } from "@gtkx/testing";

export default () => teardown;
```

For headless testing (CI environments):

```bash
xvfb-run -a pnpm test
```

## Basic Usage

```tsx
import { AccessibleRole } from "@gtkx/ffi/gtk";
import { Button } from "@gtkx/react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, setup } from "@gtkx/testing";

setup(); // Initialize GTK once

describe("Button", () => {
    afterEach(() => {
        cleanup(); // Clean up after each test
    });

    it("renders a button", async () => {
        render(<Button label="Click me" />);

        const button = await screen.findByRole(AccessibleRole.BUTTON);
        expect(button).toBeDefined();
    });
});
```

## Rendering Components

The `render` function creates a GTK application and renders your component:

```tsx
import { render } from "@gtkx/testing";

const { container, findByRole, findByText, unmount, rerender, debug } = render(
    <Button label="Hello" />
);
```

| Return Value | Description |
|--------------|-------------|
| `container` | Root GTK widget containing rendered content |
| `findByRole` | Query by accessible role (async) |
| `findByText` | Query by text content (async) |
| `findByLabelText` | Query by label text (async) |
| `getByRole` | Query by accessible role (sync) |
| `getByText` | Query by text content (sync) |
| `getByLabelText` | Query by label text (sync) |
| `unmount` | Unmount the component |
| `rerender` | Re-render with new props |
| `debug` | Print widget tree to console |

### Rerendering

Test prop changes with `rerender`:

```tsx
const { findByText, rerender } = render(<Button label="Before" />);

await findByText("Before");

rerender(<Button label="After" />);

await findByText("After");
```

## Querying Widgets

### By Role

Query widgets by their accessible role using GTK's `AccessibleRole` enum:

```tsx
import { AccessibleRole } from "@gtkx/ffi/gtk";

// Find any button
const button = await screen.findByRole(AccessibleRole.BUTTON);

// Find button by name
const saveButton = await screen.findByRole(AccessibleRole.BUTTON, {
    name: "Save",
});

// Find with regex
const submitButton = await screen.findByRole(AccessibleRole.BUTTON, {
    name: /submit/i,
});
```

Common accessible roles:

| Role | Widgets |
|------|---------|
| `BUTTON` | Button, LinkButton |
| `TOGGLE_BUTTON` | ToggleButton |
| `CHECKBOX` | CheckButton |
| `RADIO` | CheckButton (in radio group) |
| `TEXT_BOX` | Entry |
| `SEARCH_BOX` | SearchEntry |
| `SPIN_BUTTON` | SpinButton |
| `LABEL` | Label |
| `SWITCH` | Switch |
| `SLIDER` | Scale |
| `MENU_ITEM` | MenuItem |
| `MENU_ITEM_CHECKBOX` | CheckMenuItem |
| `MENU_ITEM_RADIO` | RadioMenuItem |

### By Text

Query widgets by their visible text content:

```tsx
// Exact match
const label = await screen.findByText("Hello World");

// Regex match
const greeting = await screen.findByText(/hello/i);
```

### Sync vs Async Queries

| Method | Behavior |
|--------|----------|
| `getBy*` | Returns immediately, throws if not found |
| `findBy*` | Waits up to 1 second, throws if not found |

Use `findBy*` for components that render asynchronously or after state updates:

```tsx
// Sync - use when element exists immediately
const button = screen.getByRole(AccessibleRole.BUTTON);

// Async - use when waiting for renders
const button = await screen.findByRole(AccessibleRole.BUTTON);
```

## User Interactions

The `userEvent` object provides methods to simulate user actions:

```tsx
import { userEvent } from "@gtkx/testing";

// Click a button
await userEvent.click(button);

// Type into a text field
await userEvent.type(entry, "Hello World");
```

### Click Events

```tsx
import { useState } from "react";
import { Button } from "@gtkx/react";

const Counter = () => {
    const [count, setCount] = useState(0);
    return <Button label={`Count: ${count}`} onClicked={() => setCount(c => c + 1)} />;
};

it("increments on click", async () => {
    render(<Counter />);

    const button = await screen.findByText("Count: 0");
    await userEvent.click(button);

    await screen.findByText("Count: 1");
});
```

### Text Input

```tsx
import { Entry } from "@gtkx/react";

it("accepts text input", async () => {
    render(<Entry placeholderText="Enter name" />);

    const input = await screen.findByRole(AccessibleRole.TEXT_BOX);
    await userEvent.type(input, "Alice");

    // Verify the text was entered
    expect(input.getText()).toBe("Alice");
});
```

## Waiting for Conditions

Use `waitFor` to wait for arbitrary conditions:

```tsx
import { waitFor } from "@gtkx/testing";

await waitFor(() => {
    const button = screen.getByRole(AccessibleRole.BUTTON);
    if (button.getLabel() !== "Ready") {
        throw new Error("Not ready yet");
    }
    return button;
});
```

Options:

```tsx
await waitFor(
    () => screen.getByText("Loaded"),
    {
        timeout: 2000,  // Max wait time (default: 1000ms)
        interval: 100,  // Poll interval (default: 50ms)
    }
);
```

## Testing Complex Components

### Lists

```tsx
import { AccessibleRole, Orientation } from "@gtkx/ffi/gtk";
import { Box, Button } from "@gtkx/react";

it("finds specific button in a list", async () => {
    render(
        <Box spacing={0} orientation={Orientation.VERTICAL}>
            <Button label="First" />
            <Button label="Second" />
            <Button label="Third" />
        </Box>
    );

    const second = await screen.findByRole(AccessibleRole.BUTTON, {
        name: "Second",
    });
    expect(second).toBeDefined();
});
```

### Stateful Components

```tsx
import { useState } from "react";
import { Box, Button, Label } from "@gtkx/react";
import { Orientation } from "@gtkx/ffi/gtk";

const Toggle = () => {
    const [visible, setVisible] = useState(false);
    return (
        <Box spacing={8} orientation={Orientation.VERTICAL}>
            <Button label="Toggle" onClicked={() => setVisible(v => !v)} />
            {visible && <Label.Root label="Now you see me" />}
        </Box>
    );
};

it("shows label after toggle", async () => {
    render(<Toggle />);

    const button = await screen.findByText("Toggle");
    await userEvent.click(button);

    await screen.findByText("Now you see me");
});
```

## Debugging

Use `debug()` to print the widget tree:

```tsx
const { debug } = render(<MyComponent />);

debug(); // Prints widget hierarchy to console
```

## Best Practices

### Test Behavior, Not Implementation

Focus on what users see and do:

```tsx
// Good - tests user-visible behavior
it("shows error message on invalid input", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByRole(AccessibleRole.TEXT_BOX), "bad");
    await userEvent.click(screen.getByText("Submit"));
    await screen.findByText("Invalid email");
});

// Avoid - tests implementation details
it("sets error state", async () => {
    // Don't test internal state directly
});
```

### Use Accessible Queries

Prefer role-based queries over text when possible:

```tsx
// Good - semantic query
const button = await screen.findByRole(AccessibleRole.BUTTON, { name: "Submit" });

// Less ideal - fragile to text changes
const button = await screen.findByText("Submit");
```

### Clean Up Properly

Always call `cleanup()` after each test:

```tsx
import { afterEach } from "vitest";
import { cleanup } from "@gtkx/testing";

afterEach(() => {
    cleanup();
});
```
