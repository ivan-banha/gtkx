# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GTKX is a framework for building native GTK4 desktop applications using React and TypeScript. It renders React code as native GTK4 widgets via Rust FFI bindings, without Electron or web views.

## Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests (requires X11 - uses Xvfb in CI)
pnpm test

# Lint and format
pnpm lint

# Regenerate FFI/JSX bindings from GIR files
pnpm codegen

# Check for dead code
pnpm knip

# Run an example
cd examples/<example> && pnpm dev
```

Tests run serially due to GTK's single-threaded nature.

## Architecture

The monorepo has 7 packages in a clear dependency hierarchy:

```
@gtkx/native (Rust)
    ↓
@gtkx/ffi (TypeScript FFI bindings)
    ↓
@gtkx/react (React reconciler + JSX components)
    ↓
@gtkx/cli, @gtkx/css, @gtkx/testing

@gtkx/gir (standalone GIR parser)
```

### Key Packages

- **@gtkx/native**: Rust/Neon module providing FFI bridge to GTK4 via libffi
- **@gtkx/ffi**: Auto-generated TypeScript bindings for GTK4 libraries (30+ libs including GTK4, Adwaita, GtkSource, WebKit)
- **@gtkx/react**: Custom React reconciler with node system for GTK widgets
- **@gtkx/cli**: Project scaffolding and Vite-based dev server with HMR
- **@gtkx/css**: Emotion-style CSS-in-JS for GTK styling
- **@gtkx/testing**: Testing Library-style utilities for GTK apps

### Data Flow

```
React Code → React Reconciler → Node System → @gtkx/ffi → @gtkx/native → libffi → GTK4
```

### Node System (`packages/react/src/`)

The reconciler uses a node abstraction with these categories:
- **Virtual nodes**: No GTK widget (ListItem, MenuItem, etc.)
- **Container nodes**: Custom child management (Grid, ListView, etc.)
- **Specialized nodes**: Custom behavior (Window, AboutDialog, etc.)
- **Widget nodes**: Generic GTK widgets

Key files:
- `reconciler.ts` - Custom React reconciler
- `node.ts` - Base node class
- `factory.ts` - Node creation and type matching
- `container-interfaces.ts` - Container type abstractions (ChildContainer, PageContainer, ItemContainer, SlotContainer)
- `nodes/` - Specialized node implementations

### Container Interfaces

Widget containers implement typed interfaces:
- `ChildContainer<T>` - attach/detach children
- `PageContainer<T>` - tabbed/paged containers
- `ItemContainer<T>` - model-backed lists
- `SlotContainer<T>` - named child slots

## Code Generation

Generated code in `packages/ffi/src/generated/` and `packages/react/src/generated/jsx.ts` comes from GIR (GObject Introspection) files. Never edit generated files directly - modify the codegen scripts and run `pnpm codegen`:

- `packages/ffi/scripts/codegen.ts` - FFI bindings
- `packages/react/scripts/codegen.ts` - JSX types

## Adding a New GTK Widget

1. Create Node class in `packages/react/src/nodes/`
2. Add to appropriate array in `factory.ts` (virtualNodes, specializedNodes, containerNodes)
3. Implement required methods: `matches()`, `initialize()`, `appendChild()`, `removeChild()`
4. Run `pnpm codegen` to regenerate JSX types
5. Add tests

## Code Style

- Biome for formatting/linting (4-space indent, 120 char width)
- TypeScript strict mode with additional checks (noUncheckedIndexedAccess)
- Named exports only, no default exports
- Dasherized file names (kebab-case)

## Native Module (Rust)

The `packages/native/` package uses:
- Neon framework for Node.js bindings
- Rust 2024 edition
- libffi for dynamic FFI calls
- Build: `pnpm native-build` in that package
