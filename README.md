<p align="center">
  <img src="logo.svg" alt="GTKX Logo" width="128" height="128">
</p>

<h1 align="center">GTKX</h1>

<p align="center">
  <strong>Build native GTK4 desktop applications with React and TypeScript</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#example">Example</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#license">License</a>
</p>

---

GTKX brings the React developer experience to native Linux desktop development. Write familiar JSX components, use hooks for state management, and render directly to GTK4 widgets through a custom React reconciler.

## Features

- **React 19 Support** — Full hooks support including `useState`, `useEffect`, and more
- **Type-Safe** — Complete TypeScript definitions for all GTK4 widgets
- **Native Performance** — Direct FFI calls to GTK4 via Rust, no Electron overhead
- **Familiar API** — JSX syntax with camelCase props and `onEvent` handlers
- **Comprehensive Widgets** — Buttons, inputs, lists, dialogs, layouts, and more

## Quick Start

```bash
# Clone the repository
git clone https://github.com/eugeniodepalo/gtkx.git
cd gtkx

# Install dependencies
pnpm install

# Sync GIR files and build
cd packages/ffi && pnpm run codegen --sync
cd ../..
pnpm build

# Run the demo
cd examples/demo && pnpm build && pnpm start
```

### Requirements

- Node.js 20+
- pnpm 10+
- GTK4 development libraries
- Rust toolchain

## Example

```tsx
import { ApplicationWindow, Button, quit, render } from "@gtkx/gtkx";

render(
  <ApplicationWindow
    title="Hello, GTK with React!"
    defaultWidth={800}
    defaultHeight={600}
    onCloseRequest={quit}
  >
    <Button
      label="Click me!"
      onClicked={() => console.log("Button clicked!")}
    />
  </ApplicationWindow>,
  "com.example.app"
);
```

<!-- Screenshot placeholder - add screenshot here -->
<!-- ![Demo Screenshot](docs/demo-screenshot.png) -->

## Documentation

See the [full documentation](packages/gtkx/README.md) for:

- Installation guide
- Widget reference
- Architecture overview
- API documentation

## Packages

| Package | Description |
|---------|-------------|
| [`@gtkx/gtkx`](packages/gtkx) | React integration layer and JSX components |
| [`@gtkx/ffi`](packages/ffi) | Generated TypeScript FFI bindings for GTK |
| [`@gtkx/gir`](packages/gir) | GObject Introspection file parser |
| [`@gtkx/native`](packages/native) | Rust FFI bridge to GTK4 |

## Examples

- **[demo](examples/demo)** — Simple hello world application
- **[kitchen-sink](examples/kitchen-sink)** — Comprehensive widget showcase

## License

[MPL-2.0](LICENSE) — Eugenio Depalo
