# Informe de estado — condominios_admin4

**Fecha de revisión:** 20 de agosto de 2026
**Alcance:** revisión de solo lectura del repositorio local `condominios_admin4` (sin modificar archivos, sin commits, sin instalar dependencias).

## Resumen ejecutivo

El proyecto es un SPA de administración multi-condominio construido con Quasar 2 + Vue 3 (Composition API, `<script setup lang="ts">`) y TypeScript, que consume una API REST Laravel externa (no incluida en esta carpeta). El estado general del código es sólido: `vue-tsc --noEmit` y ESLint pasan sin errores, no hay `console.log`, `TODO/FIXME` ni `@ts-ignore` residuales, y existe un `AGENTS.md` inusualmente completo que documenta convenciones de UI, reglas de negocio (senior vs. administrador de condominio) y contratos de API módulo por módulo. El principal ruido detectado no es de código sino del árbol de trabajo: git marca 85 archivos como modificados, pero se confirmó que el 100% de ese diff es cambio de fin de línea (CRLF/LF), sin contenido real alterado. El resto de observaciones son de arquitectura (componentes de página muy grandes que concentran lógica que las propias convenciones del proyecto piden mover a composables) y de alcance funcional (varios módulos del menú son todavía maquetas visuales sin conexión al backend).

## Stack y configuración

- Quasar `^2.20.0` sobre `@quasar/app-vite` **`^3.0.0-rc.2`** (release candidate, no versión estable) con Vite.
- Vue `^3.5.22`, Vue Router `^5.0.6`, Pinia `^3.0.1`.
- TypeScript `^6.0.0`, `vue-tsc` `^3.3.3`, ESLint 9 (flat config) + `eslint-plugin-vue` + reglas type-checked, Prettier 3.
- `engines` exige Node `>=26 || ^24 || ^22.12`; el entorno de esta revisión corre Node `v22.23.2` / npm `10.9.8`, dentro del rango soportado.
- Enrutamiento en modo `hash` (`vueRouterMode: 'hash'`), razonable para un panel admin sin necesidad de URLs limpias indexables.
- `.env` local solo contiene `VITE_NAME` y `VITE_API_HOST=http://localhost:8001/`; no se detectaron secretos ni credenciales en el archivo.
- No hay carpeta ni indicios de backend Laravel dentro de esta carpeta: el proyecto conectado es exclusivamente el frontend, y la API se documenta como externa vía Swagger (`http://localhost:8001/api/documentation`, según `AGENTS.md`).

**Observación:** usar una release candidate de `@quasar/app-vite` junto con un salto de TypeScript a la rama `6.x` es una combinación poco convencional para un proyecto en curso; vale la pena confirmar que es una elección deliberada y no un rango de versión demasiado laxo en `package.json`, ya que un `npm install` futuro podría traer breaking changes sin aviso.

## Estado de git

- Rama activa: `feature/ajustes_merge_main`, sincronizada con `origin/feature/ajustes_merge_main`.
- Historial: 46 commits, todos de un único autor (`byronnp`) — proyecto de un solo desarrollador hasta ahora.
- `git status` reporta 85 archivos modificados (prácticamente todo el repo: configuración, componentes, servicios, stores). Al comparar con `git diff -w` (ignorando espacios/fin de línea) el diff queda **vacío**: no hay ningún cambio de contenido real pendiente, es enteramente ruido de terminación de línea (CRLF vs. LF), típico de checkouts en Windows sin `.gitattributes` que normalice el line-ending. Esto es engañoso para cualquier revisión de cambios y conviene resolverlo (ver recomendaciones).
- Se detectó una advertencia `unable to unlink '.git/index.lock': Operation not permitted` al ejecutar `git status`, señal de que otro proceso (probablemente el editor o una extensión de Git) tenía el índice bloqueado en el momento de la revisión. No es un problema de estado del repo en sí, pero indica que había actividad de git concurrente.
- No fue posible contactar `origin` desde este entorno (sin acceso de red), por lo que la relación exacta de commits por delante/detrás contra `main`/`develop` no se pudo verificar en vivo; solo se cuenta con referencias remotas cacheadas localmente.

## Calidad de código

- `npm run typecheck` (`vue-tsc --noEmit`): **sin errores**.
- `eslint -c ./eslint.config.js "./src/**/*.{ts,vue}"`: **sin errores ni advertencias**.
- Sin `console.log` en `src/`.
- Sin marcadores `TODO`, `FIXME`, `HACK` ni `@ts-ignore` / `@ts-expect-error`.
- 19 usos de `: any` y 6 comentarios `eslint-disable` — deuda de tipado menor, acotada, revisable módulo por módulo.
- No existe suite de pruebas unitarias (el propio `AGENTS.md` lo admite explícitamente); el control de calidad actual depende de `typecheck` + `lint:check` manuales antes de fusionar cambios.

## Arquitectura y organización

La estructura sigue el patrón `page + composable + service` descrito en `AGENTS.md`, con separación clara entre `src/pages/`, `src/composables/`, `src/services/` y `src/stores/` (estado Pinia puro, con persistencia de `localStorage`/`sessionStorage` aislada en `session-storage.ts`, separada de `session.store.ts`). El router centraliza los guards de sesión (autenticación, acceso senior, contexto de condominio) de forma legible en `src/router/index.ts`.

Dos puntos no siguen del todo esa misma disciplina:

- Varios componentes de página son archivos muy extensos que mezclan plantilla, lógica y estilos: `CondominioWizardForm.vue` (1622 líneas, ~54 KB), `CasaDetallePage.vue` (1853 líneas, ~51 KB), `AdministradorWizardForm.vue` (~31 KB), `MainLayout.vue` (~29 KB), `UsuarioWizardForm.vue` (~27 KB), `AdministradoresPage.vue` (~27 KB), `DashboardPage.vue` (~27 KB). Esto contradice la propia guía del proyecto de mantener la lógica en composables y las páginas livianas.
- En `src/composables/unidades/` existen tres archivos vacíos (`useHouseCreate.ts`, `useHouseEdit.ts`, `useHouseList.ts`) y `src/pages/unidades/components/CasaUpsertForm.vue` también está vacío (0 bytes). Son restos de un refactor iniciado y no terminado, o placeholders creados por adelantado; conviene limpiarlos o completarlos para que no generen confusión.

## Alcance funcional real

Revisando qué páginas importan efectivamente un `*.service.ts` (es decir, están conectadas al backend) frente a las que no:

Conectados al backend: autenticación (`ActivateAccessPage`), condominios (`CondominiosPage`), administradores (`AdministradoresPage`), usuarios (`UsuariosPage`) y unidades (`UnidadesPage`, `NuevaUnidadPage`, `EditarUnidadPage`, `CasaDetallePage`).

Sin conexión a servicio (datos estáticos/mock en el propio componente): `DashboardPage`, `PagosPage`, `PropietariosPage`, `ReportesPage`, `ReservasPage`, `MantenimientoPage`, `ComunicadosPage`, `ResidentesPage`, `VisitantesPage`, `ConfiguracionPage`. Esto es coherente con el historial de commits reciente ("diseño de pantallas", "revisión de módulo de condominios"): el producto está en una etapa donde el diseño visual de casi todos los módulos ya existe, pero la integración real con la API solo se completó para el núcleo (condominios, administradores, usuarios, unidades). `condo-catalog.ts` está documentado explícitamente en el propio código como un fixture temporal hasta que exista un endpoint real de cambio de condominio.

## Seguridad y manejo de sesión

`session-storage.ts` guarda `accessToken`/`refreshToken` en `localStorage` o `sessionStorage` según `persistMode`, con validación defensiva al leer el JSON persistido (revalida forma y tipos antes de aceptarlo). Es un patrón común en SPAs, aunque conviene tener presente el trade-off frente a cookies `httpOnly` (exposición a robo de token vía XSS) si en algún momento el proyecto maneja datos más sensibles (pagos, por ejemplo, que ya aparece como módulo planificado).

## Recomendaciones priorizadas

1. Normalizar terminación de línea: agregar `.gitattributes` (`* text=auto eol=lf`, o el criterio que prefieran) y hacer una única pasada de re-normalización, para que `git status`/`git diff` vuelvan a reflejar solo cambios reales y las revisiones de PR no se llenen de ruido.
2. Confirmar si `@quasar/app-vite@^3.0.0-rc.2` y `typescript@^6.0.0` son fijaciones intencionales; si no, considerar acotar los rangos de versión para evitar sorpresas en el próximo `npm install`.
3. Extraer lógica de los componentes más grandes (`CondominioWizardForm.vue`, `CasaDetallePage.vue`, `AdministradorWizardForm.vue`, `UsuarioWizardForm.vue`) hacia composables dedicados, siguiendo el propio patrón que el proyecto ya define en `AGENTS.md`.
4. Resolver los archivos vacíos en `src/composables/unidades/` y `CasaUpsertForm.vue`: completarlos o eliminarlos para que no queden como falsos indicios de funcionalidad ya implementada.
5. Priorizar qué módulos aún-mock (pagos, reservas, mantenimiento, comunicados, etc.) se conectan a continuación, ya que actualmente son solo maquetas visuales.
6. Evaluar incorporar una suite mínima de pruebas (unitarias para composables/servicios críticos, especialmente los que ya tocan backend real) antes de que crezca más la superficie conectada a producción.

## Lo que no se pudo verificar en esta revisión

`npm run lint:check` completo (Prettier + ESLint sobre todo el repo) no terminó dentro del tiempo disponible en este entorno remoto; se validó ESLint solo sobre `src/**/*.{ts,vue}` de forma directa, que sí pasó limpio. Tampoco se pudo contrastar el estado de la rama contra `origin` en vivo por falta de acceso de red desde esta sesión, ni se ejecutó `npm run build` para confirmar que la build de producción compila sin advertencias.
