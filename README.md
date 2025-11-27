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
  <a href="https://eugeniodepalo.github.io/gtkx">Documentation</a>
</p>

---

GTKX bridges React's component model with GTK4's native widget system. Write JSX components with hooks, render them directly to native Linux desktop widgets—no Electron, no browser, no DOM.

## Features

- **React 19** — Full hooks support (`useState`, `useEffect`, `useRef`, etc.)
- **Type-safe** — Complete TypeScript definitions generated from GObject Introspection
- **Native performance** — Direct FFI calls to GTK4 via Rust, zero browser overhead
- **Familiar syntax** — JSX with camelCase props and `onEvent` handlers
- **CSS-in-JS styling** — Emotion-style `css` tagged template literals via `@gtkx/css`

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- GTK4 development libraries
- Rust toolchain

```bash
# Fedora
sudo dnf install gtk4-devel

# Ubuntu/Debian
sudo apt install libgtk-4-dev
```

### Building from Source

```bash
git clone https://github.com/eugeniodepalo/gtkx.git
cd gtkx
pnpm install
cd packages/ffi && pnpm run codegen --sync && cd ../..
pnpm build
```

### Running the Demo

```bash
cd examples/demo && pnpm build && pnpm start
```

## Example

```tsx
import { css, injectGlobal } from "@gtkx/css";
import * as Gtk from "@gtkx/ffi/gtk";
import { ApplicationWindow, Box, Button, Label, quit, render } from "@gtkx/gtkx";

injectGlobal`
  window {
    background: #3584e4;
  }
`;

const buttonStyle = css`
  padding: 16px 32px;
  border-radius: 12px;
`;

render(
  <ApplicationWindow title="Hello GTKX" defaultWidth={400} defaultHeight={300} onCloseRequest={quit}>
    <Box valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} spacing={12}>
      <Label.Root label="Hello, GTK!" />
      <Button cssClasses={[buttonStyle]} label="Click me" onClicked={() => console.log("Clicked!")} />
    </Box>
  </ApplicationWindow>,
  "com.example.app"
);
```

## Architecture

```
┌─────────────────────────────────┐
│     Your React Application      │
├─────────────────────────────────┤
│   @gtkx/gtkx (React Reconciler) │
├─────────────────────────────────┤
│   @gtkx/ffi (TypeScript FFI)    │
├─────────────────────────────────┤
│   @gtkx/native (Rust Bridge)    │
├─────────────────────────────────┤
│         GTK4 / GLib             │
└─────────────────────────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| [`@gtkx/gtkx`](packages/gtkx) | React reconciler and JSX components |
| [`@gtkx/ffi`](packages/ffi) | Generated TypeScript FFI bindings for GTK4 |
| [`@gtkx/css`](packages/css) | Emotion-style CSS-in-JS for GTK widgets |
| [`@gtkx/native`](packages/native) | Rust-based FFI bridge using libffi |
| [`@gtkx/gir`](packages/gir) | GObject Introspection XML parser |

## Examples

| Example | Description |
|---------|-------------|
| [`demo`](examples/demo) | Simple styled application |
| [`kitchen-sink`](examples/kitchen-sink) | Comprehensive widget showcase |

## Documentation

Full documentation is available at [eugeniodepalo.github.io/gtkx](https://eugeniodepalo.github.io/gtkx).

## License

[MPL-2.0](LICENSE) — Eugenio Depalo
