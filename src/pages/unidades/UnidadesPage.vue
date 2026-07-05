<template>
  <q-page class="houses-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="status"
      v-model:rowsPerPage="rowsPerPage"
      v-model:sortBy="sortBy"
      title="Casas"
      :subtitle="subtitle"
      search-placeholder="Buscar por código o número..."
      :status-options="statusOptions"
      :rows-per-page-options="[5, 10, 15, 20, 25]"
      :sort-options="sortOptions"
      action-label="Nueva casa"
      action-icon="add_home"
      :action-disabled="!condominiumId"
      @cta-click="goToCreate"
    >
      <template #stats>
        <AppStatsCards :cards="stats" />
      </template>

      <template #table>
        <div class="houses-page__surface q-mb-md">
          <q-banner v-if="!condominiumId" rounded class="context-banner" role="status">
            <template #avatar>
              <q-icon name="apartment" />
            </template>
            Selecciona un condominio en el layout para consultar sus casas.
          </q-banner>

          <q-banner v-else-if="error" rounded class="error-banner" role="alert">
            <template #avatar>
              <q-icon name="error_outline" color="negative" />
            </template>
            {{ error }}
          </q-banner>

          <q-banner v-else rounded class="page-meta" role="status">
            <template #avatar>
              <q-icon name="dataset" />
            </template>
            {{ pageMeta }}
          </q-banner>
        </div>

        <q-table
          v-if="condominiumId && !error"
          flat
          bordered
          :rows="visibleRows"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 0 }"
          hide-bottom
          :loading="loading"
          class="list-table"
        >
          <template #loading>
            <q-inner-loading showing>
              <q-spinner color="primary" size="32px" />
            </q-inner-loading>
          </template>

          <template #body-cell-code="props">
            <q-td :props="props">
              <div class="house-cell">
                <q-avatar rounded size="38px" class="house-avatar">
                  <q-icon name="home" />
                </q-avatar>
                <div>
                  <strong>{{ props.row.code }}</strong>
                  <span>Casa {{ props.row.number }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-assignable="props">
            <q-td :props="props">
              <q-badge
                outline
                rounded
                class="type-badge"
                :color="props.row.isAssignable ? 'primary' : 'grey-7'"
              >
                {{ props.row.isAssignable ? 'Asignable' : 'No asignable' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-active="props">
            <q-td :props="props">
              <q-badge
                rounded
                class="status-badge"
                :color="props.row.isActive ? 'positive' : 'grey-7'"
              >
                {{ props.row.isActive ? 'Activa' : 'Inactiva' }}
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
                @click="goToDetail(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="edit" class="table-icon" disable>
                <q-tooltip>Edición pendiente de soporte del API</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #no-data>
            <div class="empty-state">
              <q-icon name="home_work" size="38px" />
              <strong>No hay casas para mostrar</strong>
              <span>
                {{
                  hasFilters
                    ? 'Limpia los filtros para ver más resultados.'
                    : 'Crea la primera casa de este condominio.'
                }}
              </span>
            </div>
          </template>
        </q-table>
      </template>

      <template #body-cell-block="props">
        <q-td :props="props">
          <div class="table-primary">{{ props.row.blockName }}</div>
        </q-td>
      </template>

      <template #body-cell-owner="props">
        <q-td :props="props">
          <div class="table-primary">{{ props.row.ownerName }}</div>
          <div class="table-secondary">
            {{
              props.row.ownerName === 'Sin propietario'
                ? 'Pendiente de asignación'
                : 'Propietario principal'
            }}
          </div>
        </q-td>
      </template>

      <template #body-cell-people="props">
        <q-td :props="props">
          <div class="count-cell">
            <q-icon name="group" size="17px" />
            <strong>{{ props.row.peopleCount }}</strong>
          </div>
        </q-td>
      </template>

      <template #body-cell-parking="props">
        <q-td :props="props">
          <div class="count-cell">
            <q-icon name="local_parking" size="17px" />
            <strong>{{ props.row.parkingCount }}</strong>
          </div>
        </q-td>
      </template>

      <template #footer>
        <q-pagination
          v-if="condominiumId"
          v-model="page"
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
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import AppStatsCards from '@/components/shared/AppStatsCards.vue';
import { fetchUnitsPage, type UnitListItem } from '@/services/units.service';
import { useSessionStore } from '@/stores/session.store';

const router = useRouter();
const session = useSessionStore();
const rows = ref<UnitListItem[]>([]);
const search = ref('');
const status = ref<'Todas' | 'Activa' | 'Inactiva'>('Todas');
const sortBy = ref<'recent' | 'code' | 'area'>('recent');
const page = ref(1);
const rowsPerPage = ref(10);
const serverTotal = ref(0);
const serverLastPage = ref(1);
const loading = ref(false);
const error = ref('');

const condominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});

const subtitle = computed(() =>
  condominiumId.value
    ? `Gestiona las casas de ${session.activeCondominium?.name ?? 'este condominio'}.`
    : 'Selecciona un condominio para gestionar sus casas.',
);

const statusOptions = [
  { label: 'Estado: Todas', value: 'Todas' },
  { label: 'Activas', value: 'Activa' },
  { label: 'Inactivas', value: 'Inactiva' },
];

const sortOptions = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Código A-Z', value: 'code' },
  { label: 'Mayor área', value: 'area' },
] as const;

const columns = [
  { name: 'code', label: 'Casa', field: 'code', align: 'left' as const },
  { name: 'block', label: 'Bloque o sector', field: 'blockName', align: 'left' as const },
  {
    name: 'area',
    label: 'Área',
    field: (row: UnitListItem) => `${row.areaM2} m²`,
    align: 'right' as const,
  },
  { name: 'owner', label: 'Propietario', field: 'ownerName', align: 'left' as const },
  { name: 'people', label: 'Personas', field: 'peopleCount', align: 'center' as const },
  { name: 'parking', label: 'Parqueaderos', field: 'parkingCount', align: 'center' as const },
  { name: 'active', label: 'Estado', field: 'isActive', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const filtered = computed(() =>
  rows.value.filter((row) => {
    const q = search.value.trim().toLowerCase();
    return (
      (!q || row.code.toLowerCase().includes(q) || row.number.toLowerCase().includes(q)) &&
      (status.value === 'Todas' || row.isActive === (status.value === 'Activa'))
    );
  }),
);

const sorted = computed(() => {
  const list = [...filtered.value];
  if (sortBy.value === 'code') return list.sort((a, b) => a.code.localeCompare(b.code));
  if (sortBy.value === 'area') return list.sort((a, b) => b.areaM2 - a.areaM2);
  return list.reverse();
});

const totalPages = computed(() => serverLastPage.value);
const visibleRows = computed(() => sorted.value);
const hasFilters = computed(() => Boolean(search.value) || status.value !== 'Todas');

const pageMeta = computed(() =>
  hasFilters.value
    ? `Se muestran ${visibleRows.value.length} casas filtradas sobre la página ${page.value} del servidor.`
    : `Página ${page.value} de ${totalPages.value} con ${rows.value.length} casas cargadas.`,
);

const stats = computed(() => {
  const palette = [
    { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
    { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
    { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
  ] as const;

  return [
    {
      label: 'Total de casas',
      value: String(serverTotal.value),
      hint: 'Registradas',
      icon: 'home_work',
    },
    {
      label: 'Activas',
      value: String(filtered.value.filter((x) => x.isActive).length),
      hint: 'Operativas',
      icon: 'check_circle',
    },
    {
      label: 'Asignables',
      value: String(filtered.value.filter((x) => x.isAssignable).length),
      hint: 'Admiten personas',
      icon: 'group_add',
    },
    {
      label: 'Sin asignación',
      value: String(filtered.value.filter((x) => !x.isAssignable).length),
      hint: 'No asignables',
      icon: 'person_off',
    },
  ].map((card, index) => ({ ...card, tint: palette[index % palette.length]! }));
});

async function load() {
  if (!condominiumId.value) {
    rows.value = [];
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await fetchUnitsPage(
      condominiumId.value,
      page.value,
      rowsPerPage.value,
      session.accessToken,
    );
    rows.value = result.items.filter((unit) => unit.parentUnitId === null);
    serverTotal.value = result.total;
    serverLastPage.value = result.lastPage;
    if (page.value !== result.page) page.value = result.page;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No fue posible cargar las casas.';
  } finally {
    loading.value = false;
  }
}

function goToCreate() {
  if (condominiumId.value) void router.push('/unidades/nueva');
}

function goToDetail(row: UnitListItem) {
  void router.push({ name: 'unidades-detalle', params: { id: String(row.id) } });
}

watch(
  () => session.activeCondoId,
  () => {
    search.value = '';
    status.value = 'Todas';
    if (page.value !== 1) {
      page.value = 1;
      return;
    }
    void load();
  },
);

watch([search, status], () => {
  page.value = 1;
});

watch([page, rowsPerPage], ([currentPage, currentSize], previous) => {
  if (previous && currentSize !== previous[1] && currentPage !== 1) {
    page.value = 1;
    return;
  }
  void load();
});

onMounted(() => void load());
</script>

<style scoped>
.houses-page {
  min-height: 100%;
  padding-top: 2px;
}

.houses-page__surface {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 10px 12px;
}

.page-meta,
.context-banner,
.error-banner {
  align-items: center;
  background: transparent;
  border: 0;
  margin: 0;
  min-height: 28px;
  padding: 0;
}

.page-meta {
  color: var(--app-text-muted);
}

.context-banner {
  color: var(--app-text-muted);
}

.error-banner {
  color: #b91c1c;
}

.context-banner :deep(.q-banner__avatar),
.error-banner :deep(.q-banner__avatar),
.page-meta :deep(.q-banner__avatar) {
  margin-right: 10px;
}

.stat-card {
  border-radius: 16px;
}

.stat-card__content,
.house-cell {
  align-items: center;
  display: flex;
  gap: 12px;
}

.stat-card__content {
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

.house-avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.stat-card__label,
.stat-card__hint,
.house-cell span {
  color: var(--app-text-muted);
  display: block;
  font-size: 11px;
}

.stat-card__value {
  color: var(--app-text);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin-top: 2px;
}

.list-table :deep(.q-table__container) {
  border-radius: 16px;
  overflow: hidden;
}

.list-table :deep(.q-table__middle) {
  overflow-x: auto;
}

.list-table :deep(table) {
  min-width: 1120px;
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

.type-badge,
.status-badge {
  font-weight: 700;
  letter-spacing: -0.01em;
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

.table-primary {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
}

.table-secondary {
  color: var(--app-text-muted);
  font-size: 11px;
  margin-top: 2px;
}

.count-cell {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  gap: 6px;
}

.count-cell strong {
  color: var(--app-text);
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

.house-cell strong {
  display: block;
  font-size: 12px;
}

.empty-state {
  align-items: center;
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  color: var(--app-text-muted);
  display: grid;
  gap: 7px;
  justify-items: center;
  min-height: 220px;
  padding: 42px;
  width: 100%;
}

.empty-state strong {
  color: var(--app-text);
  font-size: 14px;
}

.empty-state span {
  max-width: 28rem;
  text-align: center;
}

@media (max-width: 1180px) {
  .houses-page__surface {
    padding: 10px 10px 12px;
  }
}

@media (max-width: 767px) {
  .stat-card__content {
    min-height: 88px;
  }

  .list-table :deep(table) {
    min-width: 980px;
  }
}

@media (max-width: 599px) {
  .houses-page {
    padding-top: 0;
  }

  .houses-page__surface {
    border-radius: 14px;
    padding: 10px;
  }

  .page-meta,
  .context-banner,
  .error-banner {
    line-height: 1.45;
  }

  .empty-state {
    min-height: 180px;
    padding: 32px 20px;
  }
}
</style>
