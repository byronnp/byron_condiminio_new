<template>
  <q-page class="unidades-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Unidades"
      subtitle="Gestiona unidades, propietarios y estados operativos."
      search-placeholder="Buscar unidad, bloque o propietario..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nueva unidad"
      action-icon="add"
      @cta-click="goToNewUnit"
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
          <template #body-cell-numero="props">
            <q-td :props="props">
              <div class="entity-cell">
                <q-avatar rounded size="38px" class="entity-avatar">
                  <q-icon name="domain" size="18px" />
                </q-avatar>
                <div>
                  <div class="entity-cell__title">{{ props.row.numero }}</div>
                  <div class="entity-cell__subtitle">{{ props.row.bloque }} · Piso {{ props.row.piso }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-propietario="props">
            <q-td :props="props">
              <div class="table-primary">{{ props.row.propietario }}</div>
              <div class="table-secondary">{{ props.row.observaciones }}</div>
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-badge :color="statusTone(props.row.estado)" rounded class="status-badge">
                {{ props.row.estado }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-alDia="props">
            <q-td :props="props">
              <q-icon
                :name="props.row.alDia ? 'check_circle' : 'cancel'"
                :class="props.row.alDia ? 'text-positive' : 'text-negative'"
                size="18px"
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="table-actions">
              <q-btn flat round dense icon="edit" class="table-icon" @click="openEditDialog(props.row)">
                <q-tooltip>Editar unidad</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="more_horiz" class="table-icon">
                <q-tooltip>Más acciones</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </template>

      <template #footer>
        <q-pagination
          v-model="pagination.page"
          :max="totalPages"
          :max-pages="4"
          boundary-links
          direction-links
          color="primary"
          active-design="flat"
          active-color="primary"
          class="table-footer__pagination"
        />
      </template>
    </AppListPageShell>

    <UnidadFormDialog
      v-model="dialogOpen"
      :form-data="form"
      :title="editingId === null ? 'Nueva unidad' : 'Editar unidad'"
      :save-label="editingId === null ? 'Guardar unidad' : 'Actualizar unidad'"
      @save="saveUnit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import UnidadFormDialog from './components/UnidadFormDialog.vue';
import { type UnidadRow, useUnidades } from '@/composables/unidades/useUnidades';

const router = useRouter();
const { search, statusFilter, dialogOpen, editingId, form, stats, filteredRows, openEditDialog, saveUnit } =
  useUnidades();

const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({ page: 1, rowsPerPage: 10 });
const sortBy = ref<'recent' | 'area' | 'numero'>('recent');

const columns = [
  { name: 'numero', label: 'Unidad', field: 'numero', align: 'left' as const, sortable: true },
  { name: 'propietario', label: 'Propietario', field: 'propietario', align: 'left' as const },
  { name: 'area', label: 'Área', field: 'area', align: 'right' as const },
  { name: 'habitaciones', label: 'Hab.', field: 'habitaciones', align: 'center' as const },
  { name: 'banos', label: 'Baños', field: 'banos', align: 'center' as const },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const },
  { name: 'alDia', label: 'Al día', field: 'alDia', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statusOptions = [
  { label: 'Estado: Todas', value: 'Todas' },
  { label: 'Disponibles', value: 'Disponible' },
  { label: 'Ocupadas', value: 'Ocupada' },
  { label: 'Mora', value: 'Mora' },
  { label: 'Exoneradas', value: 'Exonerada' },
];

const sortOptions = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Mayor área', value: 'area' },
  { label: 'Número A-Z', value: 'numero' },
] as const;

const statsCards = computed(() => {
  const palette = [
    { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
    { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
    { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
  ] as const;

  return stats.value.map((card, index) => ({ ...card, tint: palette[index % palette.length]! }));
});

const sortedRows = computed(() => {
  const source = [...filteredRows.value];
  if (sortBy.value === 'area') return source.sort((a, b) => b.area - a.area);
  if (sortBy.value === 'numero') return source.sort((a, b) => a.numero.localeCompare(b.numero));
  return source;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage)));

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  return sortedRows.value.slice(start, start + pagination.value.rowsPerPage);
});

watch(
  () => [sortedRows.value.length, pagination.value.rowsPerPage] as const,
  () => {
    const maxPage = Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage));
    if (pagination.value.page > maxPage) pagination.value.page = maxPage;
  },
  { immediate: true },
);

function statusTone(status: UnidadRow['estado']) {
  if (status === 'Disponible') return 'positive';
  if (status === 'Ocupada') return 'primary';
  if (status === 'Mora') return 'negative';
  return 'warning';
}

function goToNewUnit() {
  void router.push('/unidades/nueva');
}
</script>

<style scoped>
.unidades-page {
  min-height: 100%;
}

.stat-card {
  border-radius: 16px;
}

.stat-card__content {
  align-items: center;
  display: flex;
  gap: 12px;
  min-height: 94px;
}

.stat-card__icon {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  flex-shrink: 0;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.stat-card__label {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.stat-card__value {
  color: var(--app-text);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin-top: 2px;
}

.stat-card__hint {
  color: var(--app-text-muted);
  font-size: 11px;
  margin-top: 1px;
}

.list-table :deep(.q-table__container) {
  border-radius: 16px;
}

.list-table :deep(thead tr th) {
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  height: 50px;
  letter-spacing: -0.01em;
}

.list-table :deep(tbody tr td) {
  color: var(--app-text);
  font-size: 12px;
  height: 60px;
}

.list-table :deep(tbody tr:hover td) {
  background: rgba(37, 99, 235, 0.025);
}

.entity-cell {
  align-items: center;
  display: flex;
  gap: 12px;
}

.entity-avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.entity-cell__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
}

.entity-cell__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  margin-top: 2px;
}

.table-primary {
  color: var(--app-text);
  font-weight: 700;
}

.table-secondary {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.3;
  margin-top: 2px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  font-weight: 700;
}

.table-actions {
  white-space: nowrap;
}

.table-icon {
  border-color: rgba(37, 99, 235, 0.14);
  color: var(--app-primary);
  height: 34px;
  width: 34px;
}

.table-icon :deep(.q-icon) {
  font-size: 16px;
}

.table-footer__pagination :deep(.q-pagination__content) {
  gap: 6px;
}

.table-footer__pagination :deep(.q-btn) {
  border-radius: 10px;
  font-weight: 700;
  min-height: 34px;
  min-width: 34px;
}

.table-footer__pagination :deep(.q-btn--active) {
  background: var(--app-primary);
  color: #fff;
}
</style>
