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

- Senior users can see all condominiums and switch context.
- Condominium admins only see their assigned condominium.
- Preserve the established list-page shell and visual rhythm when adding new list screens.
