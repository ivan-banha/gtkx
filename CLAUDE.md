# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

GTKX is a framework for building GTK4 desktop applications using React and TypeScript. It bridges the GTK4 C library with React's component model through FFI, enabling developers to write native Linux desktop applications using familiar React patterns.

## Package Structure

This is a pnpm monorepo:

- **`packages/native`**: Rust-based Neon module providing FFI bindings to GTK
- **`packages/gir`**: GIR (GObject Introspection) XML parser for GTK API definitions
- **`packages/ffi`**: Generated TypeScript FFI bindings for GTK libraries
- **`packages/gtkx`**: React integration layer with custom reconciler and JSX types
- **`packages/css`**: Emotion-style CSS-in-JS for styling GTK widgets
- **`website`**: Docusaurus documentation site
- **`examples/`**: Demo applications

## Usage Examples

### Basic Application

```tsx
import { ApplicationWindow, Box, Button, Label, quit, render } from "@gtkx/gtkx";
import * as Gtk from "@gtkx/ffi/gtk";

render(
    <ApplicationWindow title="My App" defaultWidth={400} defaultHeight={300} onCloseRequest={quit}>
        <Box valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} spacing={12}>
            <Label.Root label="Hello, GTKX!" />
            <Button label="Click me" onClicked={() => console.log("Clicked!")} />
        </Box>
    </ApplicationWindow>,
    "com.example.myapp",
);
```

### Styling with CSS-in-JS

```tsx
import { css, injectGlobal } from "@gtkx/css";

injectGlobal`
    window { background: #3584e4; }
`;

const buttonStyle = css`
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: bold;
`;

<Button cssClasses={[buttonStyle]} label="Styled Button" />
<Button cssClasses={["suggested-action"]} label="System Style" />
```

### State Management with React Hooks

```tsx
const Counter = () => {
    const [count, setCount] = useState(0);
    return (
        <Button label={`Clicked ${count} times`} onClicked={() => setCount(c => c + 1)} />
    );
};
```

### Widgets with Named Slots

Some widgets use `.Root` with slot children for complex layouts:

```tsx
<HeaderBar.Root>
    <HeaderBar.TitleWidget>
        <Label.Root label="App Title" />
    </HeaderBar.TitleWidget>
</HeaderBar.Root>

<Frame.Root>
    <Frame.LabelWidget>
        <Label.Root label="Section Title" />
    </Frame.LabelWidget>
    <Frame.Child>
        <Box>Content here</Box>
    </Frame.Child>
</Frame.Root>

<CenterBox.Root hexpand>
    <CenterBox.StartWidget><Button label="Left" /></CenterBox.StartWidget>
    <CenterBox.CenterWidget><Label.Root label="Center" /></CenterBox.CenterWidget>
    <CenterBox.EndWidget><Button label="Right" /></CenterBox.EndWidget>
</CenterBox.Root>

<Paned.Root wideHandle vexpand>
    <Paned.StartChild><Box>Left pane</Box></Paned.StartChild>
    <Paned.EndChild><Box>Right pane</Box></Paned.EndChild>
</Paned.Root>
```

### Form Inputs

```tsx
<Entry placeholderText="Type something..." />
<SearchEntry placeholderText="Search..." />
<CheckButton.Root label="Enable feature" active={checked} onToggled={() => setChecked(c => !c)} />
<Switch active={switchOn} onStateSet={() => { setSwitchOn(s => !s); return true; }} />
<SpinButton adjustment={adjustment.ptr} onValueChanged={() => setValue(adjustment.getValue())} />
<Scale hexpand drawValue adjustment={adjustment.ptr} />
```

### Lists and Collections

```tsx
<ListBox selectionMode={Gtk.SelectionMode.SINGLE}>
    <ListBoxRow><Label.Root label="Row 1" /></ListBoxRow>
    <ListBoxRow><Label.Root label="Row 2" /></ListBoxRow>
</ListBox>

<DropDown.Root
    itemLabel={(item) => item.label}
    onSelectionChanged={(item) => setSelected(item)}
>
    {options.map(opt => <DropDown.Item key={opt.id} item={opt} />)}
</DropDown.Root>

<ListView.Root renderItem={(item) => { /* return GTK widget */ }}>
    {items.map(item => <ListView.Item item={item} key={item.id} />)}
</ListView.Root>
```

### Dialogs

```tsx
const [showAbout, setShowAbout] = useState(false);

<Button label="About" onClicked={() => setShowAbout(true)} />
{showAbout && (
    <AboutDialog
        programName="My App"
        version="1.0.0"
        comments="Description here"
        onCloseRequest={() => { setShowAbout(false); return false; }}
    />
)}
```

### Popovers and Menus

```tsx
<MenuButton.Root label="Open Menu">
    <MenuButton.Popover>
        <Popover.Root>
            <Popover.Child>
                <Box spacing={5}>
                    <Button label="Action 1" onClicked={() => {}} />
                    <Button label="Action 2" onClicked={() => {}} />
                </Box>
            </Popover.Child>
        </Popover.Root>
    </MenuButton.Popover>
</MenuButton.Root>
```

### Animations and Transitions

```tsx
<Revealer revealChild={revealed} transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
    <Label.Root label="Revealed content" />
</Revealer>

<Expander.Root label="Click to expand">
    <Expander.Child>
        <Box>Hidden content</Box>
    </Expander.Child>
</Expander.Root>
```

### Grid Layout

```tsx
<Grid.Root rowSpacing={10} columnSpacing={10}>
    <Grid.Child column={0} row={0}><Button label="Top Left" /></Grid.Child>
    <Grid.Child column={1} row={0}><Button label="Top Right" /></Grid.Child>
    <Grid.Child column={0} row={1} columnSpan={2}>
        <Button label="Spans 2 columns" hexpand />
    </Grid.Child>
</Grid.Root>
```

## Key Patterns

- **Event handlers**: Use `on{EventName}` pattern (e.g., `onClicked`, `onToggled`, `onCloseRequest`)
- **GTK enums**: Import from `@gtkx/ffi/gtk` (e.g., `Gtk.Align.CENTER`, `Gtk.Orientation.VERTICAL`)
- **Text children**: Automatically wrapped in `<Label>` widgets
- **Property names**: Use camelCase (GTK's snake_case is converted)

### Error Handling

Native GTK/GLib errors are thrown as `NativeError`, which wraps GLib's `GError`:

```tsx
import { NativeError } from "@gtkx/ffi";

try {
    keyFile.getString("NonExistentGroup", "key");
} catch (err) {
    if (err instanceof NativeError) {
        console.error(err.message);  // Human-readable error message
        console.error(err.domain);   // GLib error domain (GQuark)
        console.error(err.code);     // Error code within domain
    }
}
```

## Build Commands

```bash
pnpm install
cd packages/ffi && pnpm run codegen --sync  # Sync GIR files (first time)
pnpm build                                   # Full build
cd examples/demo && pnpm build && pnpm start # Run demo
pnpm knip                                    # Find unused code
pnpm test                                    # Run tests
```

## Working with Generated Code

- **Never edit `src/generated/` directories** - they are regenerated on build
- To modify generated code, edit the generators:
  - `packages/ffi/src/codegen/ffi-generator.ts` for FFI bindings
  - `packages/gtkx/src/codegen/jsx-generator.ts` for JSX types
- GIR files are synced to `/girs/` from `/usr/share/gir-1.0`

## Coding Guidelines

**Functional Programming:**
- Prefer functional programming over imperative/OOP
- Only use classes when encapsulation is absolutely necessary
- Prefer pure functions, immutable data, and composition

**Code Cleanliness:**
- Zero tolerance for unused variables, imports, or exports
- Run `pnpm knip` regularly to detect dead code
- Prefix intentionally unused parameters with `_`

**Modern TypeScript:**
- Use all ESNext features freely (Node.js 20+)
- Use `import` with `.js` extensions (ESM)
- Prefer `??` over `||`, use optional chaining (`?.`)
- Avoid `as` casts - use type guards and runtime checks instead
- Define named types rather than inline types

**File Naming:**
- All files use dash-case: `my-component.ts`
- Never use camelCase for filenames

**Documentation:**
- No inline comments - code should be self-documenting
- Use TSDoc only for public API that needs explanation

**Architecture:**
- Maximize code reuse through composition
- Keep functions small and focused
- No dependency injection unless absolutely necessary

**Documentation Files:**
- Never create README.md or other markdown files unless explicitly requested
