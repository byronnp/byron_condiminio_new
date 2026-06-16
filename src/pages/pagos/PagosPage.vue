<template>
  <q-page class="pagos-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Pagos y cobros"
      subtitle="Estado de pagos, deudas, recaudacion y comprobantes."
      search-placeholder="Buscar pago..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nuevo pago"
      action-icon="add"
    >
      <template #stats>
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
      </template>

      <template #table>
        <q-table flat bordered :rows="paginatedRows" :columns="columns" row-key="id" hide-bottom class="list-table">
          <template #body-cell-item="props">
            <q-td :props="props">
              <div class="entity-cell">
                <q-avatar rounded size="38px" class="entity-avatar">{{ props.row.initials }}</q-avatar>
                <div>
                  <div class="entity-cell__title">{{ props.row.concept }}</div>
                  <div class="entity-cell__subtitle">{{ props.row.detail }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-amount="props"><q-td :props="props">{{ props.value }}</q-td></template>

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
      </template>

      <template #footer>
        <q-pagination v-model="pagination.page" :max="totalPages" :max-pages="4" boundary-links direction-links color="primary" active-design="flat" active-color="primary" class="table-footer__pagination" />
      </template>
    </AppListPageShell>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
type PaymentRow = { id: number; concept: string; detail: string; amount: string; status: 'Pagado' | 'Pendiente' | 'Vencido'; initials: string };
type SortOption = 'recent' | 'oldest' | 'name';
const search = ref(''); const statusFilter = ref<'Todos' | 'Pagado' | 'Pendiente' | 'Vencido'>('Todos'); const sortBy = ref<SortOption>('recent'); const rowsPerPageOptions = [10, 20, 50] as const; const pagination = ref({ page: 1, rowsPerPage: 10 });
const rows: PaymentRow[] = [
  { id: 1, concept: 'Cuota ordinaria', detail: 'Condominio Aurora - Enero', amount: '$120.00', status: 'Pagado', initials: 'CO' },
  { id: 2, concept: 'Fondo comun', detail: 'Residencial Pacific - Enero', amount: '$35.00', status: 'Pendiente', initials: 'FC' },
  { id: 3, concept: 'Mora', detail: 'Torres del Verde - Diciembre', amount: '$48.50', status: 'Vencido', initials: 'MO' },
  { id: 4, concept: 'Cuota ordinaria', detail: 'Marina Bay - Enero', amount: '$98.00', status: 'Pagado', initials: 'CO' },
  { id: 5, concept: 'Reserva salon', detail: 'Condominio Aurora - Evento', amount: '$20.00', status: 'Pendiente', initials: 'RS' },
  { id: 6, concept: 'Multa', detail: 'Residencial Pacific - Acceso', amount: '$15.00', status: 'Vencido', initials: 'MU' },
  { id: 7, concept: 'Cuota ordinaria', detail: 'Torres del Verde - Febrero', amount: '$110.00', status: 'Pagado', initials: 'CO' },
  { id: 8, concept: 'Aporte extraordinario', detail: 'Marina Bay - Reparacion', amount: '$75.00', status: 'Pendiente', initials: 'AE' },
  { id: 9, concept: 'Cuota ordinaria', detail: 'Condominio Aurora - Febrero', amount: '$120.00', status: 'Pagado', initials: 'CO' },
  { id: 10, concept: 'Mora', detail: 'Residencial Pacific - Enero', amount: '$52.00', status: 'Vencido', initials: 'MO' },
  { id: 11, concept: 'Cuota ordinaria', detail: 'Torres del Verde - Enero', amount: '$105.00', status: 'Pagado', initials: 'CO' },
  { id: 12, concept: 'Reserva piscina', detail: 'Marina Bay - Fin de semana', amount: '$18.00', status: 'Pendiente', initials: 'RP' },
];
const columns = [{ name: 'item', label: 'Concepto', field: 'concept', align: 'left' as const }, { name: 'amount', label: 'Monto', field: 'amount', align: 'right' as const }, { name: 'status', label: 'Estado', field: 'status', align: 'center' as const }, { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const }];
const statsBase = [
  { label: 'Total movimientos', value: '12', hint: 'Cargos y pagos registrados', icon: 'paid' },
  { label: 'Pagados', value: '6', hint: 'Comprobantes validados', icon: 'verified' },
  { label: 'Pendientes', value: '4', hint: 'Requieren gestion', icon: 'schedule' },
  { label: 'Vencidos', value: '2', hint: 'Cobro prioritario', icon: 'warning' },
];
const statsCards = computed(() => { const palette = [{ bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' }, { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' }, { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' }, { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' }] as const; return statsBase.map((card, index) => ({ ...card, tint: palette[index % palette.length]! })); });
const statusOptions = [{ label: 'Estado: Todos', value: 'Todos' }, { label: 'Pagados', value: 'Pagado' }, { label: 'Pendientes', value: 'Pendiente' }, { label: 'Vencidos', value: 'Vencido' }];
const sortOptions = [{ label: 'Mas recientes', value: 'recent' }, { label: 'Mas antiguos', value: 'oldest' }, { label: 'Nombre A-Z', value: 'name' }] as const;
const filteredRows = computed(() => { const query = search.value.trim().toLowerCase(); return rows.filter((row) => { const matchesStatus = statusFilter.value === 'Todos' || row.status === statusFilter.value; const matchesQuery = !query || row.concept.toLowerCase().includes(query) || row.detail.toLowerCase().includes(query); return matchesStatus && matchesQuery; }); });
const sortedRows = computed(() => { const source = [...filteredRows.value]; if (sortBy.value === 'name') return source.sort((a, b) => a.concept.localeCompare(b.concept)); if (sortBy.value === 'oldest') return source.reverse(); return source; });
const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage)));
const paginatedRows = computed(() => sortedRows.value.slice((pagination.value.page - 1) * pagination.value.rowsPerPage, pagination.value.page * pagination.value.rowsPerPage));
watch(() => [filteredRows.value.length, pagination.value.rowsPerPage] as const, () => { const maxPage = Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage)); if (pagination.value.page > maxPage) pagination.value.page = maxPage; }, { immediate: true });
function statusTone(status: PaymentRow['status']) { if (status === 'Pagado') return 'positive'; if (status === 'Pendiente') return 'warning'; return 'negative'; }
</script>

<style scoped>
.pagos-page { min-height: 100%; }
.stat-card { border-radius: 16px; }.stat-card__content { align-items: center; display: flex; gap: 12px; min-height: 94px; }.stat-card__icon { align-items: center; border-radius: 999px; display: inline-flex; flex-shrink: 0; height: 44px; justify-content: center; width: 44px; }.stat-card__label { color: var(--app-text-muted); font-size: 11px; font-weight: 700; }.stat-card__value { color: var(--app-text); font-size: 22px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; margin-top: 2px; }.stat-card__hint { color: var(--app-text-muted); font-size: 11px; margin-top: 1px; }.list-table :deep(.q-table__container) { border-radius: 16px; }.list-table :deep(thead tr th) { color: #334155; font-size: 12px; font-weight: 800; height: 50px; letter-spacing: -0.01em; }.list-table :deep(tbody tr td) { color: var(--app-text); font-size: 12px; height: 60px; }.list-table :deep(tbody tr:hover td) { background: rgba(37, 99, 235, 0.025); }.entity-cell { align-items: center; display: flex; gap: 12px; }.entity-avatar { background: rgba(37, 99, 235, 0.1); color: var(--app-primary); font-size: 12px; font-weight: 800; }.entity-cell__title { color: var(--app-text); font-size: 12px; font-weight: 800; line-height: 1.2; }.entity-cell__subtitle { color: var(--app-text-muted); font-size: 11px; margin-top: 2px; }.status-badge { font-weight: 700; }.table-actions { white-space: nowrap; }.table-icon { border-color: rgba(37, 99, 235, 0.14); color: var(--app-primary); height: 34px; width: 34px; }.table-icon :deep(.q-icon) { font-size: 16px; }.table-footer__pagination :deep(.q-pagination__content) { gap: 6px; }.table-footer__pagination :deep(.q-btn) { border-radius: 10px; font-weight: 700; min-height: 34px; min-width: 34px; }.table-footer__pagination :deep(.q-btn--active) { background: var(--app-primary); color: #fff; }
</style>
