# Repository Guidelines

## Project Structure & Module Organization
This is a Quasar + Vue 3 + TypeScript SPA for multi-condominium administration.

- `src/pages/`: full screens grouped by domain, e.g. `src/pages/condominios/`
- `src/pages/[modulo]/components/`: module-only dialogs and local UI
- `src/components/shared/`: reusable shells and UI primitives, including `AppListPageShell.vue`
- `src/layouts/`: `AuthLayout.vue` for public access and `MainLayout.vue` for authenticated views
- `src/composables/`: reactive logic grouped by module
- `src/services/`: API and data access
- `src/stores/`: Pinia state, including session and tenant context
- `src/css/`: centralized theme, tokens, and global styles
- `src/referencias/`: design reference images only

List screens should follow the shared shell pattern: header, search, status filter, CTA, stats cards, table controls, table, and pagination.

## UI Design Guidelines
Use the current `NuevoCondominioPage.vue` implementation as a reference for future form-heavy screens and new module screens.

- Prefer a clean `page-shell` structure with a concise header, subtle actions, and clear section hierarchy.
- New pages should use the full width provided by `MainLayout`: set the page shell to `width: 100%`, avoid local side padding, and use only top spacing such as `padding: 16px 0 0` on desktop and `padding: 12px 0 0` on mobile.
- For multi-step forms, use compact custom steps with progressive connectors; avoid full-width progress bars when the step navigation already communicates progress.
- Keep form content grouped by intent using light panels, subtle borders, moderate radii, and small icon-led headers.
- Separate functional sections clearly, as in the condominium creation flow: base data, location, configuration, administrator, and review.
- Use executive summary side panels only when they help the user review or validate a long workflow.
- Preserve restrained spacing, dense Quasar controls, and low-contrast surfaces instead of decorative or marketing-style layouts.
- On mobile, reduce visual noise: compact headers, one-column forms, horizontally scrollable step navigation when needed, and fewer always-visible actions.
- Do not nest UI cards inside other cards unless the nested element is a repeated item or a true modal/tool surface.

## Build, Test, and Development Commands
- `npm run dev`: start the Quasar dev server
- `npm run build`: create the production build
- `npm run typecheck`: run `vue-tsc --noEmit`
- `npm run lint:check`: run Prettier and ESLint without writing files
- `npm run lint`: auto-format and fix lint issues

## Coding Style & Naming Conventions
Use Vue 3 `<script setup lang="ts">` and Composition API. Prefer ASCII unless an existing file already uses other characters.

- `PascalCase` for Vue SFC filenames and component names
- `camelCase` for variables, functions, stores, and composables
- `kebab-case` for route paths and folders

Keep global styles in `src/css/`. Use scoped styles only for page-specific layout details. Prefer Quasar `dense`, `rounded-borders`, `flat`, and `unelevated` variants to match the current UI.

## Testing Guidelines
There is no separate unit test suite yet. Before merging UI or logic changes, run:

1. `npm run typecheck`
2. `npm run lint:check`

If tests are added later, place them near the feature or under `tests/` and keep descriptive names, e.g. `LoginPage.spec.ts`.

## Commit & Pull Request Guidelines
Use short, imperative commit messages such as `feat: update login layout` or `fix: adjust drawer background`. Pull requests should include:

- a short summary of the change
- screenshots for UI updates
- notes on new routes, stores, or API contracts
- confirmation that `typecheck` and `lint:check` passed

## Agent Instructions
Do not reintroduce condo selection in the login screen. The backend determines role and tenant context after authentication.
Backend documentation: `http://localhost:8001/api/documentation`

- Senior users can see all condominiums and switch context.
- Condominium admins only see their assigned condominium.
- Preserve the established list-page shell and visual rhythm when adding new list screens.
