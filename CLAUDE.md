# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React library package that renders interactive force-directed flow diagrams. Published as `@schubergphilis/sbp-flow-graph` with both ESM and CJS outputs.

## Development Commands

```bash
# Package manager
pnpm install              # Install dependencies

# Development
pnpm dev                  # Start Vite dev server with demo app

# Building
pnpm build                # Clean and build library (ESM + CJS + types)
pnpm clean                # Remove dist directory

# Code quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Auto-fix ESLint issues
pnpm format               # Format code with Prettier

# Release
pnpm release              # Create version bump and changelog (standard-version)
```

## Architecture

### Core Component Structure

Flow component uses composition pattern with nested providers:

```
Flow
  └─ StateProvider (Redux store per graph instance)
      └─ Pan (viewport panning)
          └─ Drag (node dragging)
              └─ Tooltip (hover tooltips)
                  └─ Click (click handlers)
                      └─ FlowPosition (auto-positioning algorithm)
                          └─ SVG Canvas
                              ├─ LineBox (renders connection lines)
                              └─ NodeBox (renders nodes)
```

Each Flow instance gets isolated Redux store via `id` prop, enabling multiple independent graphs.

### State Management

- Uses Redux Toolkit with custom localStorage middleware
- Store created dynamically per graph ID via `createAppStore(storeId)`
- LocalStorageMiddleware persists state (with blocklist for transient data like drag positions)
- SettingsSlice manages zoom, pan offset, node positions, processed data

### Auto-Positioning System

`AutoPosition` helper implements force-directed layout:

- Calculates node positions based on parent-child relationships
- Root nodes centered in viewport
- Restores saved positions from Redux store
- Uses D3-style force simulation for natural clustering
- Spacing controlled via `spacing` prop (default 125px)

### Data Flow

1. Consumer passes `ProcessModel[]` to Flow component
2. FlowPosition processes raw data into positioned NodeModel[]
3. Redux store tracks positions, visibility, relationships
4. NodeBox/LineBox render from processed state
5. User interactions (drag, pan, zoom) update store
6. Store persists to localStorage per graph ID

### Path Aliases

TypeScript paths configured for:

- `@components` → src/components
- `@models` → src/models
- `@helpers` → src/helpers
- `@datatypes` → src/datatypes
- `@store` → src/store
- `@middleware` → src/middleware
- `@styles` → src/styles
- `@hooks` → src/hooks

### Build Configuration

- **Entry**: src/build.ts (exports components, models, datatypes)
- **Outputs**:
  - ESM: dist/esm/index.mjs.js
  - CJS: dist/cjs/index.js
  - Types: dist/index.d.ts
- **Externals**: react, react-dom, styled-components, react-redux (peer deps)
- Uses tsconfig.build.json for library build (separate from dev config)

## Key Models

- **ProcessModel**: Input data format (id, name, value, parent, status, badge, etc.)
- **NodeModel**: Internal positioned node with computed coordinates
- **LineModel**: Computed line paths between nodes
- **PositionModel**: Simple {x, y} coordinate pair

## Demo App

App.tsx contains test harness with:

- Dynamic data loading
- Node addition/removal
- State changes
- Modal with embedded graph
- Example icon selector pattern

Use for local testing before library build.

## Quality & Honesty

- **No sycophancy, challenge reasoning.** Be direct — no praise, flattery, or filler. Push back on flawed assumptions or suboptimal approaches (yours and mine). Flag trade-offs honestly.
