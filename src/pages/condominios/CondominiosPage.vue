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
      @cta-click="goToNewCondominio"
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
        <q-banner v-if="loadError" rounded class="q-mb-md condo-error-banner">
          <template #avatar>
            <q-icon name="error_outline" color="negative" />
          </template>
          {{ loadError }}
        </q-banner>

        <q-table
          flat
          bordered
          :rows="paginatedRows"
          :columns="columns"
          row-key="id"
          hide-bottom
          :loading="isLoadingRows"
          class="list-table"
        >
          <template #loading>
            <q-inner-loading showing>
              <q-spinner color="primary" size="32px" />
            </q-inner-loading>
          </template>

          <template #no-data>
            <div class="empty-state">
              <q-icon name="apartment" size="36px" />
              <div class="empty-state__title">No hay condominios para mostrar</div>
              <div class="empty-state__text">
                {{
                  loadError
                    ? 'Revisa la conexión con el backend e intenta nuevamente.'
                    : 'Aún no se han registrado condominios en la plataforma.'
                }}
              </div>
            </div>
          </template>

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
              <q-badge outline color="primary" class="type-badge">{{ props.value }}</q-badge>
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
              <q-btn flat round dense icon="visibility" class="table-icon">
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="edit" class="table-icon" @click="goToEditCondominium(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="more_horiz" class="table-icon">
                <q-tooltip>Más acciones</q-tooltip>
                <q-menu
                  anchor="bottom right"
                  self="top right"
                  class="table-actions-menu"
                  content-class="table-actions-menu__popup"
                >
                  <q-card flat bordered class="table-actions-menu__card">
                    <q-list class="table-actions-menu__list">
                      <q-item clickable v-close-popup @click="goToNewAdministrator(props.row)" class="table-actions-menu__item">
                        <q-item-section avatar>
                          <q-avatar size="32px" class="table-actions-menu__avatar">
                            <q-icon name="person_add" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">Agregar administrador</q-item-label>
                          <q-item-label caption>Registrar acceso para este condominio</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="goToNewUnit(props.row)" class="table-actions-menu__item">
                        <q-item-section avatar>
                          <q-avatar size="32px" class="table-actions-menu__avatar table-actions-menu__avatar--alt">
                            <q-icon name="add_home_work" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">Agregar unidades</q-item-label>
                          <q-item-label caption>Crear nuevas unidades en este condominio</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-separator class="table-actions-menu__separator" />
                      <q-item
                        clickable
                        v-close-popup
                        :disable="deletingCondominiumId === props.row.id"
                        @click="handleDeleteCondominium(props.row)"
                        class="table-actions-menu__item table-actions-menu__item--danger"
                      >
                        <q-item-section avatar>
                          <q-avatar size="32px" class="table-actions-menu__avatar table-actions-menu__avatar--danger">
                            <q-icon name="delete_outline" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name table-actions-menu__name--danger">Eliminar condominio</q-item-label>
                          <q-item-label caption>Eliminar este registro de forma permanente</q-item-label>
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
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import AppConfirmDialog from '@/components/general/AppConfirmDialog.vue';
import {
  deleteCondominium,
  fetchCondominiums,
  type CondominiumListItem,
} from '@/services/condominiums.service';
import { useSessionStore } from '@/stores/session.store';

type CondoRow = {
  id: number;
  name: string;
  location: string;
  type: string;
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
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});
const rows = ref<CondoRow[]>([]);
const isLoadingRows = ref(false);
const deletingCondominiumId = ref<number | null>(null);
const deleteConfirmOpen = ref(false);
const pendingDeleteRow = ref<CondoRow | null>(null);
const loadError = ref('');

const columns = [
  { name: 'condominio', label: 'Condominio', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
  { name: 'units', label: 'Unidades', field: 'units', align: 'right' as const },
  { name: 'principal', label: 'Administrador principal', field: 'principal', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statsCards = computed(() => {
  const total = rows.value.length;
  const active = rows.value.filter((row) => row.status === 'Activo').length;
  const inactive = rows.value.filter((row) => row.status === 'Inactivo').length;
  const typeCount = new Set(rows.value.map((row) => row.type).filter(Boolean)).size;
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
      label: 'Tipos registrados',
      value: String(typeCount),
      hint: 'Tipos detectados en el listado',
      icon: 'category',
    },
  ].map((card, index) => ({
    ...card,
    tint: palette[index % palette.length]!,
  }));
});

const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
];

const sortOptions = [
  { label: 'Mas recientes', value: 'recent' },
  { label: 'Mas antiguos', value: 'oldest' },
  { label: 'Nombre A-Z', value: 'name' },
] as const;

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase();

  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'Todos' || row.status === statusFilter.value;
    const matchesQuery =
      !query ||
      row.name.toLowerCase().includes(query) ||
      row.location.toLowerCase().includes(query) ||
      row.principal.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });
});

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

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage)),
);

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return sortedRows.value.slice(start, end);
});

watch(
  () => [filteredRows.value.length, pagination.value.rowsPerPage] as const,
  () => {
    const maxPage = Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage));
    if (pagination.value.page > maxPage) {
      pagination.value.page = maxPage;
    }
  },
  { immediate: true },
);

function mapCondominiumRow(item: CondominiumListItem): CondoRow {
  return {
    id: item.id,
    name: item.name,
    location: item.location,
    type: item.type,
    units: item.units,
    principal: item.principal,
    status: item.status,
    image: item.image,
  };
}

async function loadCondominiums() {
  if (!session.accessToken) {
    rows.value = [];
    return;
  }

  isLoadingRows.value = true;
  loadError.value = '';

  try {
    const condominiums = await fetchCondominiums(session.accessToken);
    rows.value = condominiums.map(mapCondominiumRow);
  } catch (error) {
    rows.value = [];
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

function statusTone(status: CondoRow['status']) {
  return status === 'Activo' ? 'positive' : 'negative';
}

function goToNewCondominio() {
  void router.push('/condominios/nuevo');
}

function goToEditCondominium(row: CondoRow) {
  void router.push({
    name: 'condominios-editar',
    params: {
      id: String(row.id),
    },
  });
}

function goToNewAdministrator(row: CondoRow) {
  void router.push({
    path: '/administradores/nuevo',
    query: {
      condominioId: String(row.id),
      condominio: row.name,
    },
  });
}

function goToNewUnit(row: CondoRow) {
  void router.push({
    path: '/unidades/nueva',
    query: {
      condominioId: String(row.id),
      condominio: row.name,
    },
  });
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

.table-icon {
  border-color: rgba(37, 99, 235, 0.14);
  color: var(--app-primary);
  height: 34px;
  width: 34px;
}

.table-icon :deep(.q-icon) {
  font-size: 16px;
}

.table-actions-menu__popup {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.table-actions-menu__card {
  border: 0;
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  min-width: 280px;
  overflow: hidden;
}

.table-actions-menu__list {
  padding: 8px;
}

.table-actions-menu__item {
  border-radius: 12px;
  min-height: 52px;
}

.table-actions-menu__item--danger {
  color: var(--q-negative);
}

.table-actions-menu__avatar {
  background: rgba(37, 99, 235, 0.08);
  color: var(--app-primary);
}

.table-actions-menu__avatar--alt {
  background: rgba(15, 23, 42, 0.06);
}

.table-actions-menu__avatar--danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--q-negative);
}

.table-actions-menu__name {
  color: var(--app-text);
  font-weight: 800;
}

.table-actions-menu__name--danger {
  color: var(--q-negative);
}

.table-actions-menu__separator {
  margin: 4px 8px;
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


