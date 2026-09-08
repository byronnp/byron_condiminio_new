<template>
  <q-page class="condominios-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Condominios"
      subtitle="Gestiona el catalogo de condominios registrados en la plataforma."
      search-placeholder="Buscar condominio..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nuevo condominio"
      action-icon="add_home_work"
      :filters-label="filtersButtonLabel"
      :filters-expanded="advancedFiltersOpen"
      @filters-click="toggleAdvancedFilters"
      @cta-click="goToNewCondominio"
    >
      <template #stats><AppStatsCards :cards="statsCards" /></template>
      <template #results>{{ resultsRangeLabel }}</template>
      <template #table>
        <div
          v-if="advancedFiltersOpen"
          class="advanced-filters q-mb-md"
          role="region"
          aria-label="Filtros avanzados de condominios"
        >
          <div class="advanced-filters__header">
            <div>
              <div class="advanced-filters__title">Filtros avanzados</div>
              <div class="advanced-filters__hint">Refina el listado por tipo de condominio.</div>
            </div>
            <q-btn
              flat
              dense
              no-caps
              icon="restart_alt"
              label="Limpiar filtros"
              :disable="typeFilter === 'Todos'"
              @click="clearAdvancedFilters"
            />
          </div>
          <q-select
            v-model="typeFilter"
            dense
            outlined
            emit-value
            map-options
            label="Tipo de condominio"
            :options="typeFilterOptions"
            class="advanced-filters__field"
          >
            <template #prepend><q-icon name="category" /></template>
          </q-select>
        </div>
        <q-banner v-if="loadError" rounded class="q-mb-md condo-error-banner">
          <template #avatar> <q-icon name="error_outline" color="negative" /> </template>
          {{ loadError }}
        </q-banner>
        <q-table
          flat
          bordered
          :rows="pagedRows"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 0 }"
          hide-bottom
          :loading="isLoadingRows"
          class="list-table"
        >
          <template #loading>
            <q-inner-loading showing> <q-spinner color="primary" size="32px" /> </q-inner-loading>
          </template>
          <template #no-data
            ><AppEmptyState
              icon="apartment"
              title="No hay condominios para mostrar"
              :text="
                loadError
                  ? 'Revisa la conexión con el backend e intenta nuevamente.'
                  : hasActiveFilters
                    ? 'No encontramos resultados con los criterios seleccionados.'
                    : 'Aún no se han registrado condominios en la plataforma.'
              "
          /></template>
          <template #body-cell-condominio="props">
            <q-td :props="props">
              <div class="entity-cell">
                <q-avatar rounded size="38px" class="entity-avatar">
                  <img v-if="props.row.image" :src="props.row.image" :alt="props.row.name" />
                  <q-icon v-else name="apartment" size="20px" />
                </q-avatar>
                <div>
                  <div class="entity-cell__title">{{ props.row.name }}</div>
                  <div class="entity-cell__subtitle">{{ props.row.location }}</div>
                </div>
              </div>
            </q-td>
          </template>
          <template #body-cell-type="props">
            <q-td :props="props">
              <q-badge outline :color="colorForLabel(props.value)" class="type-badge">{{
                props.value
              }}</q-badge>
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="statusTone(props.value)" rounded class="status-badge">
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="table-actions">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                class="table-icon"
                @click="showCondominiumDetail(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="edit"
                class="table-icon"
                @click="goToEditCondominium(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="more_horiz" class="table-icon">
                <q-tooltip>Más acciones</q-tooltip>
                <q-menu
                  anchor="bottom right"
                  self="top right"
                  transition-show="scale"
                  transition-hide="scale"
                  class="table-actions-menu"
                  content-class="table-actions-menu__popup"
                >
                  <q-card flat class="table-actions-menu__card">
                    <q-list class="table-actions-menu__list">
                      <q-item
                        clickable
                        v-close-popup
                        :disable="deletingCondominiumId === props.row.id"
                        @click="handleDeleteCondominium(props.row)"
                        class="table-actions-menu__item table-actions-menu__item--danger"
                      >
                        <q-item-section avatar>
                          <span class="table-actions-menu__icon table-actions-menu__icon--danger">
                            <q-icon name="delete_outline" size="16px" />
                          </span>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label
                            class="table-actions-menu__name table-actions-menu__name--danger"
                            >Eliminar condominio</q-item-label
                          >
                          <q-item-label caption
                            >Eliminar este registro de forma permanente</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </q-menu>
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
    <AppConfirmDialog
      v-model="deleteConfirmOpen"
      tone="negative"
      icon="delete_outline"
      title="Eliminar condominio"
      :message="deleteConfirmMessage"
      confirm-label="Eliminar"
      cancel-label="Cancelar"
      :loading="deletingCondominiumId !== null"
      @confirm="confirmDeleteCondominium"
      @cancel="clearDeleteConfirmation"
    />
    <AppEntityDetailDialog
      v-model="detailDialogOpen"
      tone="primary"
      icon="apartment"
      :title="detailDialog.title"
      :rows="detailDialog.rows"
    />
  </q-page>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import AppConfirmDialog from '@/components/general/AppConfirmDialog.vue';
import AppEntityDetailDialog from '@/components/general/AppEntityDetailDialog.vue';
import AppEmptyState from '@/components/shared/AppEmptyState.vue';
import AppStatsCards from '@/components/shared/AppStatsCards.vue';
import {
  deleteCondominium,
  fetchCondominiums,
  type CondominiumListItem,
} from '@/services/condominiums.service';
import { useSessionStore } from '@/stores/session.store';
import { colorForLabel } from '@/utils/badge-color';
type CondoRow = {
  id: number;
  name: string;
  location: string;
  type: string;
  country: string;
  province: string;
  city: string;
  units: number;
  principal: string;
  status: 'Activo' | 'Inactivo';
  image: string;
};
type SortOption = 'recent' | 'oldest' | 'name';
const router = useRouter();
const session = useSessionStore();
const search = ref('');
const statusFilter = ref<'Todos' | 'Activo' | 'Inactivo'>('Todos');
const typeFilter = ref('Todos');
const advancedFiltersOpen = ref(false);
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [5, 10, 15, 20, 25] as const;
const pagination = ref({ page: 1, rowsPerPage: 10 });
const allRows = ref<CondoRow[]>([]);
const isLoadingRows = ref(false);
const deletingCondominiumId = ref<number | null>(null);
const deleteConfirmOpen = ref(false);
const pendingDeleteRow = ref<CondoRow | null>(null);
const loadError = ref('');
const detailDialogOpen = ref(false);
const detailDialog = ref<{ title: string; rows: { label: string; value: string }[] }>({
  title: '',
  rows: [],
});
const columns = [
  { name: 'condominio', label: 'Condominio', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
  { name: 'units', label: 'Unidades', field: 'units', align: 'right' as const },
  {
    name: 'principal',
    label: 'Administrador principal',
    field: 'principal',
    align: 'left' as const,
  },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];
const statsCards = computed(() => {
  const total = allRows.value.length;
  const active = allRows.value.filter((row) => row.status === 'Activo').length;
  const inactive = allRows.value.filter((row) => row.status === 'Inactivo').length;
  const units = allRows.value.reduce((total, row) => total + row.units, 0);
  const palette = [
    { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
    { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
    { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
  ] as const;
  return [
    {
      label: 'Total condominios',
      value: String(total),
      hint: 'Todos los condominios registrados',
      icon: 'apartment',
    },
    {
      label: 'Condominios activos',
      value: String(active),
      hint: 'Con acceso al sistema',
      icon: 'domain',
    },
    {
      label: 'Condominios inactivos',
      value: String(inactive),
      hint: 'Sin acceso al sistema',
      icon: 'groups',
    },
    {
      label: 'Total de unidades',
      value: String(units),
      hint: 'Unidades registradas',
      icon: 'home_work',
    },
  ].map((card, index) => ({ ...card, tint: palette[index % palette.length]! }));
});
const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
];
const typeFilterOptions = computed(() => [
  { label: 'Tipo: Todos', value: 'Todos' },
  ...[...new Set(allRows.value.map((row) => row.type).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((type) => ({ label: type, value: type })),
]);
const sortOptions = [
  { label: 'Mas recientes', value: 'recent' },
  { label: 'Mas antiguos', value: 'oldest' },
  { label: 'Nombre A-Z', value: 'name' },
] as const;
const normalizedSearch = computed(() => search.value.trim().toLowerCase());
const filteredRows = computed(() => {
  return allRows.value.filter((row) => {
    if (statusFilter.value !== 'Todos' && row.status !== statusFilter.value) {
      return false;
    }
    if (typeFilter.value !== 'Todos' && row.type !== typeFilter.value) {
      return false;
    }
    if (normalizedSearch.value) {
      const haystack = `${row.name} ${row.location} ${row.principal}`.toLowerCase();
      if (!haystack.includes(normalizedSearch.value)) {
        return false;
      }
    }
    return true;
  });
});
const hasActiveFilters = computed(
  () =>
    normalizedSearch.value.length > 0 ||
    statusFilter.value !== 'Todos' ||
    typeFilter.value !== 'Todos',
);
const activeFiltersCount = computed(
  () =>
    [
      normalizedSearch.value.length > 0,
      statusFilter.value !== 'Todos',
      typeFilter.value !== 'Todos',
    ].filter(Boolean).length,
);
const filtersButtonLabel = computed(() =>
  activeFiltersCount.value ? `Filtros (${activeFiltersCount.value})` : 'Filtros',
);
const sortedRows = computed(() => {
  const source = [...filteredRows.value];
  if (sortBy.value === 'name') {
    return source.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortBy.value === 'oldest') {
    return source.reverse();
  }
  return source;
});
const totalItems = computed(() => sortedRows.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pagination.value.rowsPerPage)),
);
const pagedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  return sortedRows.value.slice(start, start + pagination.value.rowsPerPage);
});
const resultsRangeLabel = computed(() => {
  const total = totalItems.value;
  if (total === 0) {
    return 'Sin resultados';
  }
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage + 1;
  const end = Math.min(start + pagination.value.rowsPerPage - 1, total);
  return `Mostrando ${start}-${end} de ${total}`;
});
watch(
  () => [search.value, statusFilter.value, typeFilter.value, pagination.value.rowsPerPage] as const,
  () => {
    pagination.value.page = 1;
  },
);
watch(totalPages, (pages) => {
  if (pagination.value.page > pages) {
    pagination.value.page = pages;
  }
});
function mapCondominiumRow(item: CondominiumListItem): CondoRow {
  return {
    id: item.id,
    name: item.name,
    location: item.location,
    type: item.type,
    country: item.country,
    province: item.province,
    city: item.city,
    units: item.units,
    principal: item.principal,
    status: item.status,
    image: item.image,
  };
}
async function loadCondominiums() {
  if (!session.accessToken) {
    allRows.value = [];
    return;
  }
  isLoadingRows.value = true;
  loadError.value = '';
  try {
    const items = await fetchCondominiums(session.accessToken);
    allRows.value = items.map(mapCondominiumRow);
  } catch (error) {
    allRows.value = [];
    loadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los condominios.';
  } finally {
    isLoadingRows.value = false;
  }
}
function handleDeleteCondominium(row: CondoRow) {
  pendingDeleteRow.value = row;
  deleteConfirmOpen.value = true;
}
async function confirmDeleteCondominium() {
  if (!pendingDeleteRow.value) {
    deleteConfirmOpen.value = false;
    return;
  }
  deletingCondominiumId.value = pendingDeleteRow.value.id;
  try {
    await deleteCondominium(pendingDeleteRow.value.id, session.accessToken);
    deleteConfirmOpen.value = false;
    pendingDeleteRow.value = null;
    await loadCondominiums();
    window.dispatchEvent(new Event('condominiums:changed'));
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : 'No fue posible eliminar el condominio.';
  } finally {
    deletingCondominiumId.value = null;
  }
}
function clearDeleteConfirmation() {
  pendingDeleteRow.value = null;
}
onMounted(() => {
  void loadCondominiums();
});
watch(
  () => session.accessToken,
  () => {
    void loadCondominiums();
  },
);
watch(
  () => session.activeCondoId,
  () => {
    search.value = '';
    statusFilter.value = 'Todos';
    typeFilter.value = 'Todos';
    pagination.value.page = 1;
    void loadCondominiums();
  },
);
function statusTone(status: CondoRow['status']) {
  return status === 'Activo' ? 'positive' : 'negative';
}
function toggleAdvancedFilters() {
  advancedFiltersOpen.value = !advancedFiltersOpen.value;
}
function clearAdvancedFilters() {
  typeFilter.value = 'Todos';
}
function showCondominiumDetail(row: CondoRow) {
  detailDialog.value = {
    title: row.name,
    rows: [
      { label: 'Ubicación', value: `${row.city}, ${row.province}, ${row.country}` },
      { label: 'Tipo', value: row.type },
      { label: 'Unidades', value: String(row.units) },
      { label: 'Administrador principal', value: row.principal },
      { label: 'Estado', value: row.status },
    ],
  };
  detailDialogOpen.value = true;
}
function goToNewCondominio() {
  void router.push('/condominios/nuevo');
}
function goToEditCondominium(row: CondoRow) {
  void router.push({ name: 'condominios-editar', params: { id: String(row.id) } });
}
const deleteConfirmMessage = computed(() => {
  const condoName = pendingDeleteRow.value?.name ?? 'este condominio';
  return `¿Eliminar el condominio "${condoName}"? Esta acción no se puede deshacer.`;
});
</script>
<style scoped>
.condominios-page {
  min-height: 100%;
}
.advanced-filters {
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;
  display: grid;
  gap: 14px;
  padding: 14px;
}
.advanced-filters__header {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.advanced-filters__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}
.advanced-filters__hint {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 2px;
}
.advanced-filters__field {
  max-width: 360px;
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
.list-table :deep(table) {
  min-width: 820px;
}
.condo-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}
.empty-state {
  align-items: center;
  color: var(--app-text-muted);
  display: grid;
  gap: 6px;
  justify-items: center;
  min-height: 180px;
  padding: 32px 16px;
  text-align: center;
}
.empty-state .q-icon {
  color: var(--app-primary);
}
.empty-state__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}
.empty-state__text {
  font-size: 11px;
  line-height: 1.45;
  max-width: 360px;
}
.entity-cell {
  align-items: center;
  display: flex;
  gap: 12px;
}
.entity-avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 800;
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
.type-badge,
.status-badge {
  font-weight: 700;
}
.table-actions {
  white-space: nowrap;
}
.table-actions-menu__popup {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
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
