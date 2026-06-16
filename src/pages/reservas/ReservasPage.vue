<template>
  <q-page class="reservas-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="page-hero__heading">
          <h1 class="page-hero__title">Reservas</h1>
          <p class="page-hero__subtitle">
            Agenda de reservas, disponibilidad y control de espacios.
          </p>
        </div>

        <div class="page-hero__actions">
          <q-input v-model="search" dense outlined debounce="250" placeholder="Buscar reserva..." class="search-field">
            <template #prepend><q-icon name="search" /></template>
          </q-input>

          <q-select v-model="statusFilter" :options="statusOptions" dense outlined emit-value map-options class="status-field" />
          <q-btn outline no-caps icon="filter_alt" label="Filtros" class="header-action" />
          <q-btn color="primary" unelevated no-caps icon="event_available" label="Nueva reserva" class="header-action header-action--primary" />
        </div>
      </header>

      <section class="stats-grid">
        <q-card v-for="card in statsCards" :key="card.label" flat bordered class="stat-card">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon" :style="{ background: card.tint.bg, color: card.tint.fg }">
              <q-icon :name="card.icon" size="22px" />
            </div>
            <div>
              <div class="stat-card__label">{{ card.label }}</div>
              <div class="stat-card__value">{{ card.value }}</div>
              <div class="stat-card__hint">{{ card.hint }}</div>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <q-card flat bordered class="table-card">
        <q-card-section class="table-controls">
          <div class="table-controls__left">
            <span>Mostrar</span>
            <q-select v-model="pagination.rowsPerPage" :options="rowsPerPageOptions" dense outlined emit-value map-options class="rows-select" @update:model-value="handleRowsPerPageChange" />
            <span>registros</span>
          </div>

          <div class="table-controls__right">
            <span>Ordenar por:</span>
            <q-select v-model="sortBy" :options="sortOptions" dense outlined emit-value map-options class="order-select" @update:model-value="handleSortChange" />
          </div>
        </q-card-section>

        <q-separator class="page-divider" />

        <q-card-section class="table-wrap">
          <q-table flat bordered :rows="paginatedRows" :columns="columns" row-key="id" hide-bottom class="list-table">
            <template #body-cell-space="props">
              <q-td :props="props">
                <div class="entity-cell">
                  <q-avatar rounded size="38px" class="entity-avatar">{{ props.row.initials }}</q-avatar>
                  <div>
                    <div class="entity-cell__title">{{ props.row.space }}</div>
                    <div class="entity-cell__subtitle">{{ props.row.detail }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="statusTone(props.value)" rounded class="status-badge">{{ props.value }}</q-badge>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props" class="table-actions">
                <q-btn flat round dense icon="visibility" class="table-icon"><q-tooltip>Ver detalle</q-tooltip></q-btn>
                <q-btn flat round dense icon="edit" class="table-icon"><q-tooltip>Editar</q-tooltip></q-btn>
                <q-btn flat round dense icon="more_horiz" class="table-icon"><q-tooltip>Mas acciones</q-tooltip></q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-section class="table-footer">
          <q-pagination v-model="pagination.page" :max="totalPages" :max-pages="4" boundary-links direction-links color="primary" active-design="flat" active-color="primary" class="table-footer__pagination" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type ReservationRow = { id: number; space: string; detail: string; status: 'Confirmada' | 'Pendiente' | 'Cancelada'; initials: string };
type SortOption = 'recent' | 'oldest' | 'name';

const search = ref('');
const statusFilter = ref<'Todos' | 'Confirmada' | 'Pendiente' | 'Cancelada'>('Todos');
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({ page: 1, rowsPerPage: 10 });

const rows: ReservationRow[] = [
  { id: 1, space: 'Salon social', detail: 'Condominio Aurora - 18 Ene', status: 'Confirmada', initials: 'SS' },
  { id: 2, space: 'Piscina', detail: 'Residencial Pacific - 19 Ene', status: 'Pendiente', initials: 'PI' },
  { id: 3, space: 'Cancha multiple', detail: 'Torres del Verde - 20 Ene', status: 'Cancelada', initials: 'CM' },
  { id: 4, space: 'Area BBQ', detail: 'Marina Bay - 22 Ene', status: 'Confirmada', initials: 'BB' },
  { id: 5, space: 'Salon social', detail: 'Condominio Aurora - 24 Ene', status: 'Pendiente', initials: 'SS' },
  { id: 6, space: 'Gimnasio', detail: 'Residencial Pacific - 25 Ene', status: 'Confirmada', initials: 'GI' },
  { id: 7, space: 'Cancha multiple', detail: 'Torres del Verde - 26 Ene', status: 'Confirmada', initials: 'CM' },
  { id: 8, space: 'Coworking', detail: 'Marina Bay - 27 Ene', status: 'Pendiente', initials: 'CW' },
  { id: 9, space: 'Piscina', detail: 'Condominio Aurora - 28 Ene', status: 'Confirmada', initials: 'PI' },
  { id: 10, space: 'Area BBQ', detail: 'Residencial Pacific - 29 Ene', status: 'Cancelada', initials: 'BB' },
  { id: 11, space: 'Salon social', detail: 'Torres del Verde - 30 Ene', status: 'Confirmada', initials: 'SS' },
  { id: 12, space: 'Gimnasio', detail: 'Marina Bay - 31 Ene', status: 'Pendiente', initials: 'GI' },
];

const columns = [
  { name: 'space', label: 'Espacio', field: 'space', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statsBase = [
  { label: 'Total reservas', value: '12', hint: 'Reservas registradas', icon: 'event_available' },
  { label: 'Confirmadas', value: '6', hint: 'Aprobadas para uso', icon: 'verified' },
  { label: 'Pendientes', value: '4', hint: 'En espera de aprobacion', icon: 'schedule' },
  { label: 'Canceladas', value: '2', hint: 'Sin uso programado', icon: 'block' },
];

const statsCards = computed(() => {
  const palette = [
    { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
    { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
    { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
  ] as const;
  return statsBase.map((card, index) => ({ ...card, tint: palette[index % palette.length]! }));
});

const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Confirmadas', value: 'Confirmada' },
  { label: 'Pendientes', value: 'Pendiente' },
  { label: 'Canceladas', value: 'Cancelada' },
];

const sortOptions = [
  { label: 'Mas recientes', value: 'recent' },
  { label: 'Mas antiguos', value: 'oldest' },
  { label: 'Nombre A-Z', value: 'name' },
] as const;

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesStatus = statusFilter.value === 'Todos' || row.status === statusFilter.value;
    const matchesQuery = !query || row.space.toLowerCase().includes(query) || row.detail.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });
});
const sortedRows = computed(() => {
  const source = [...filteredRows.value];
  if (sortBy.value === 'name') return source.sort((a, b) => a.space.localeCompare(b.space));
  if (sortBy.value === 'oldest') return source.reverse();
  return source;
});
const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage)));
const paginatedRows = computed(() => sortedRows.value.slice((pagination.value.page - 1) * pagination.value.rowsPerPage, pagination.value.page * pagination.value.rowsPerPage));

watch(
  () => [filteredRows.value.length, pagination.value.rowsPerPage] as const,
  () => {
    const maxPage = Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage));
    if (pagination.value.page > maxPage) pagination.value.page = maxPage;
  },
  { immediate: true },
);

function statusTone(status: ReservationRow['status']) {
  if (status === 'Confirmada') return 'positive';
  if (status === 'Pendiente') return 'warning';
  return 'negative';
}
function handleRowsPerPageChange() { pagination.value.page = 1; }
function handleSortChange() { pagination.value.page = 1; }
</script>

<style scoped>
.reservas-page { min-height: 100%; }
.page-shell { display: grid; gap: 12px; }
.page-hero { align-items: flex-start; display: flex; justify-content: space-between; gap: 16px; }
.page-hero__heading { min-width: 0; }
.page-hero__title { color: var(--app-text); font-size: 26px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; }
.page-hero__subtitle { color: var(--app-text-muted); font-size: 12px; line-height: 1.4; margin-top: 4px; max-width: 720px; }
.page-hero__actions { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; padding-top: 10px; }
.table-card { border-radius: 18px; overflow: hidden; }
.page-divider { margin-inline: 22px; opacity: 0.45; }
.search-field { width: 248px; }
.status-field { width: 154px; }
.header-action { min-height: 40px; }
.header-action--primary { min-width: 160px; }
.stats-grid { display: grid; gap: 14px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.stat-card { border-radius: 16px; }
.stat-card__content { align-items: center; display: flex; gap: 12px; min-height: 94px; }
.stat-card__icon { align-items: center; border-radius: 999px; display: inline-flex; flex-shrink: 0; height: 44px; justify-content: center; width: 44px; }
.stat-card__label { color: var(--app-text-muted); font-size: 11px; font-weight: 700; }
.stat-card__value { color: var(--app-text); font-size: 22px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; margin-top: 2px; }
.stat-card__hint { color: var(--app-text-muted); font-size: 11px; margin-top: 1px; }
.table-controls { align-items: center; color: var(--app-text-muted); display: flex; justify-content: space-between; gap: 18px; padding: 14px 22px; }
.table-controls__left, .table-controls__right { align-items: center; display: flex; gap: 10px; }
.rows-select { width: 92px; }
.order-select { width: 200px; }
.table-wrap { padding: 8px 22px 2px; }
.list-table :deep(.q-table__container) { border-radius: 16px; }
.list-table :deep(thead tr th) { color: #334155; font-size: 12px; font-weight: 800; height: 50px; letter-spacing: -0.01em; }
.list-table :deep(tbody tr td) { color: var(--app-text); font-size: 12px; height: 60px; }
.list-table :deep(tbody tr:hover td) { background: rgba(37, 99, 235, 0.025); }
.entity-cell { align-items: center; display: flex; gap: 12px; }
.entity-avatar { background: rgba(37, 99, 235, 0.1); color: var(--app-primary); font-size: 12px; font-weight: 800; }
.entity-cell__title { color: var(--app-text); font-size: 12px; font-weight: 800; line-height: 1.2; }
.entity-cell__subtitle { color: var(--app-text-muted); font-size: 11px; margin-top: 2px; }
.status-badge { font-weight: 700; }
.table-actions { white-space: nowrap; }
.table-icon { border-color: rgba(37, 99, 235, 0.14); color: var(--app-primary); height: 34px; width: 34px; }
.table-icon :deep(.q-icon) { font-size: 16px; }
.table-footer { align-items: center; display: flex; justify-content: center; padding: 10px 22px 18px; }
.table-footer__pagination :deep(.q-pagination__content) { gap: 6px; }
.table-footer__pagination :deep(.q-btn) { border-radius: 10px; font-weight: 700; min-height: 34px; min-width: 34px; }
.table-footer__pagination :deep(.q-btn--active) { background: var(--app-primary); color: #fff; }
@media (max-width: 1180px) { .page-hero, .table-controls, .table-footer { align-items: flex-start; flex-direction: column; } .page-hero__actions { justify-content: flex-start; padding-top: 0; width: 100%; } .search-field { width: 100%; } .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 767px) { .page-hero__title { font-size: 24px; } .header-action--primary { flex: 1 1 100%; width: 100%; } .status-field, .rows-select, .order-select { width: 100%; } }
@media (max-width: 599px) { .stats-grid { grid-template-columns: 1fr; } .page-divider { margin-inline: 16px; } .table-controls, .table-wrap, .table-footer { padding-inline: 16px; } .table-card { border-radius: 16px; } .table-footer__pagination { width: 100%; } }
</style>
