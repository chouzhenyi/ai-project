# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev       # Start Vite dev server (HMR)
pnpm build     # TypeScript type-check (tsc -b) then Vite production build
pnpm lint      # ESLint across the project
pnpm preview   # Preview production build locally
pnpm commit    # Interactive conventional commit via Commitizen
```

## Architecture

- **React 18** + **TypeScript 6** + **Vite 8**
- UI library: **Ant Design 5** (`antd`) + **@ant-design/icons**
- Routing: **react-router-dom v6** (`createBrowserRouter` + `RouterProvider`), all views are lazy-loaded
- CSS: Plain CSS with component-scoped stylesheets, LightningCSS for production

### Path aliases (defined in `vite.config.ts`)

| Alias         | Path              |
| ------------- | ----------------- |
| `@`           | `src/`            |
| `@components` | `src/components/` |
| `@views`      | `src/views/`      |
| `@assets`     | `src/assets/`     |
| `@router`     | `src/router/`     |

### Two enterprise components

Both follow a **schema-driven** pattern: consumers pass typed configuration objects, and the component renders accordingly without imperative code.

**EasyTable** (`src/components/EasyTable/`) — Configuration-driven table. Supports inline editing (row/cell mode), selection, CRUD, validation, change tracking, custom render/editRender, and pagination. Exposed via `forwardRef` + `useImperativeHandle` returning a `TableInstance`.

Directory structure:

- `types.ts` — Public type definitions (`ColumnSchema`, `ActionSchema`, `TableInstance`, etc.)
- `EditCell.tsx` — Inline editing cell component
- `PaginationBar.tsx` — Pagination component
- `styles.css` — Component-scoped styles
- `index.tsx` — Main component + re-exports

**EasyForm** (`src/components/EasyForm/`) — Configuration-driven form. Supports 17 component types (Input, Select, DatePicker, Switch, Upload, etc.), async options, infinite-scroll Select, field visibility/disabled as functions, custom validation rules, grid layout (`columns`/`span`), and `extra` data injection on Select. Exposed via `forwardRef` returning a `FormInstance`.

Directory structure:

- `types.ts` — Public type definitions (`FormSchema`, `FormInstance`, `OptionItem`, etc.)
- `utils.ts` — Utility functions (`getNestedValue`, `setNestedValue`, `executeValidation`, `isEmptyValue`)
- `SelectInfinite.tsx` — Infinite-scroll select component
- `Field.tsx` — Field rendering component (17 component types)
- `styles.css` — Component-scoped styles
- `index.tsx` — Main component + re-exports

### Routing

`src/router/index.tsx` defines the route tree. `Layout` component renders a left sidebar Menu (Ant Design `Menu` with `navigate`) and `<Outlet />`. Child routes: `/` (Home), `/form` (Form demo with 11 tabs), `/table` (Table demo with 8 tabs), `/about`.

### Build config

- Code splitting: `react-vendor` (react, react-dom, react-router) and `antd-vendor` (antd, @ant-design)
- gzip compression via `vite-plugin-compression`
- SVG icons via `vite-plugin-svg-icons` (from `src/assets/icons/`, symbolId: `icon-[dir]-[name]`)
- Terser minification: drops `console.*` and `debugger` in production
- Git hooks: Husky runs `lint-staged` (ESLint fix + Prettier on staged `.ts/.tsx`, Prettier on `.css/.less/.json/.md`), commitlint enforces conventional commits

### Key patterns

- Components use `forwardRef` + `useImperativeHandle` to expose imperative APIs
- State that must stay current inside instance methods is mirrored into refs (`dataRef`, `selectedKeysRef`, etc.) so `useMemo` dependencies stay stable
- Change tracking uses **immutable updates** via `updateChanges()` helper — never mutates `changesRef.current` arrays in place
- `getChanges()` returns deep copies of added/modified/removed arrays to prevent external mutation
- Async options in EasyForm are loaded in a `useEffect` keyed by `[schema, initialValues]`
- `componentProps` in EasyForm schema supports both static objects and dynamic functions `(formValues, formActions) => props`
- `onChange` — synchronous callback when field value changes (e.g., computed fields)
- `effect` — cascading side-effect callback executed after `onChange` (e.g., resetting dependent fields, loading new options)
