# Repository Guidelines

## Project Structure & Module Organization
This is a Quasar + Vue 3 + TypeScript SPA for condominium administration. Keep the modular structure already in place:

- `src/pages/`: full screens grouped by domain, e.g. `src/pages/unidades/`
- `src/pages/[modulo]/components/`: module-only components and dialogs
- `src/components/`: shared UI, split into `general/`, `dialogs/`, and `shared/`
- `src/layouts/`: app shells such as `AuthLayout.vue` and `MainLayout.vue`
- `src/composables/`: reactive logic, grouped by module
- `src/services/`: API and data access
- `src/stores/`: Pinia state
- `src/css/`: centralized theme, tokens, and global app styles
- `src/referencias/`: design reference images only

## Build, Test, and Development Commands
- `npm run dev`: starts the Quasar dev server
- `npm run build`: creates the production build
- `npm run typecheck`: runs `vue-tsc --noEmit` for TypeScript validation
- `npm run lint:check`: runs Prettier and ESLint without modifying files
- `npm run lint`: formats and auto-fixes lint issues

## Coding Style & Naming Conventions
Use Vue 3 `<script setup lang="ts">` and Composition API. Prefer ASCII unless existing files require otherwise. Use:

- `PascalCase` for component names and Vue SFC filenames
- `camelCase` for variables, functions, stores, and composables
- `kebab-case` for route paths and folder names

Keep styles centralized in `src/css/` when the rule is global. Use component-scoped styles only for local layout details. Prefer Quasar `dense`, `rounded-borders`, `flat`, and `unelevated` patterns to match the repository UI.

## Testing Guidelines
There is no separate unit test suite yet. Before merging UI or logic changes, run:

1. `npm run typecheck`
2. `npm run lint:check`

If you add tests later, place them near the feature or under a dedicated `tests/` folder and keep names descriptive, e.g. `LoginPage.spec.ts`.

## Commit & Pull Request Guidelines
The history currently starts with a single initialization commit, so use short, imperative commit messages such as `feat: update login layout` or `fix: adjust drawer background`. Pull requests should include:

- a short summary of the change
- screenshots for UI updates
- notes on any new routes, stores, or API contracts
- confirmation that `typecheck` and `lint:check` passed

## Agent Instructions
Do not reintroduce condo selection in the login screen. The backend determines role and tenant context after authentication. Keep multi-condominium behavior aligned with the current senior/admin split.
