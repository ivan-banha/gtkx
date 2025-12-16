# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (excluding website)
pnpm test             # Run all tests (serially, GTK is single-threaded)
pnpm lint             # Run Biome linter
pnpm codegen          # Regenerate FFI/JSX bindings from GIR files
pnpm knip             # Check for unused code

# Package-specific
cd packages/<package> && pnpm build    # Build single package
cd packages/<package> && pnpm test     # Test single package
cd packages/react && pnpm test tests/specific.test.tsx  # Run specific test

# Run examples
cd examples/gtk4-demo && pnpm dev
```

## Architecture

GTKX is a React renderer for native GTK4 desktop applications on Linux. It uses a custom React reconciler to map JSX elements to GTK widgets.

### Package Structure

- **@gtkx/react** - React reconciler and JSX components. The reconciler (`reconciler.ts`) uses react-reconciler to bridge React's virtual DOM to GTK widgets.
- **@gtkx/ffi** - Auto-generated TypeScript FFI bindings for GTK4/Adwaita/etc. Generated from GIR files.
- **@gtkx/native** - Rust native module using Neon. Provides the low-level libffi bridge to call GTK functions.
- **@gtkx/cli** - Vite-based CLI for project scaffolding and hot-reload dev server.
- **@gtkx/css** - CSS-in-JS styling (Emotion-style `css` template literals).
- **@gtkx/testing** - Testing Library-style utilities (`screen`, `userEvent`, queries).
- **@gtkx/gir** - GObject Introspection XML parser for codegen.

### React Reconciler Design

The reconciler maps JSX types to Node subclasses via `factory.ts`:

- **VIRTUAL_NODES** - Nodes without GTK widgets (list items, menu items, slots)
- **SPECIALIZED_NODES** - Nodes with custom behavior (windows, dialogs)
- **CONTAINER_NODES** - Nodes that manage children specially (grids, lists)
- **WidgetNode** - Default fallback for standard GTK widgets

Node lifecycle: `matches()` → constructor → `initialize(props)` → `appendChild()`/`removeChild()` → `updateProps()`

### Generated Code

Files in `packages/ffi/src/generated/` and `packages/react/src/generated/` are auto-generated. Never edit them directly. Modify generators in `packages/ffi/src/codegen/` or `packages/react/src/codegen/`, then run `pnpm codegen`.

### Adding Widget Support

1. Create Node class in `packages/react/src/nodes/`
2. Add to appropriate array in `factory.ts` (VIRTUAL_NODES, SPECIALIZED_NODES, or CONTAINER_NODES)
3. Implement `matches()`, `initialize()`, and child management methods
4. Run `pnpm codegen` to regenerate JSX types
5. Add tests in `packages/react/tests/`

## Code Style

- Biome for formatting/linting (4-space indent, 120 char line width)
- TypeScript strict mode
- Tests require GTK4 and X11 (CI uses Xvfb)
