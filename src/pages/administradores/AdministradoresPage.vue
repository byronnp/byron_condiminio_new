<template>
  <q-page class="administradores-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Administradores"
      subtitle="Gestiona las cuentas senior, sus permisos y el alcance por condominio."
      search-placeholder="Buscar administrador..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nuevo administrador"
      action-icon="person_add"
      @cta-click="goToNewAdministrator"
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
        <q-table
          flat
          bordered
          :rows="paginatedRows"
          :columns="columns"
          row-key="id"
          hide-bottom
          class="list-table"
        >
          <template #body-cell-admin="props">
            <q-td :props="props">
              <div class="entity-cell">
                <q-avatar rounded size="38px" class="entity-avatar">
                  {{ props.row.initials }}
                </q-avatar>
                <div>
                  <div class="entity-cell__title">{{ props.row.name }}</div>
                  <div class="entity-cell__subtitle">{{ props.row.email }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-roles="props">
            <q-td :props="props">
              <div class="roles-cell">
                <q-badge
                  v-for="role in props.row.roles"
                  :key="role"
                  outline
                  color="primary"
                  class="type-badge"
                >
                  {{ role }}
                </q-badge>
              </div>
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
              <q-btn flat round dense icon="edit" class="table-icon">
                <q-tooltip>Editar</q-tooltip>
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
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AppListPageShell from '@/components/shared/AppListPageShell.vue';

type AdminRow = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  condoScope: string;
  status: 'Activo' | 'Pendiente' | 'Suspendido';
  initials: string;
};

type SortOption = 'recent' | 'oldest' | 'name';

const search = ref('');
const router = useRouter();
const statusFilter = ref<'Todos' | 'Activo' | 'Pendiente' | 'Suspendido'>('Todos');
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const rows: AdminRow[] = [
  { id: 1, name: 'Carlos Perez', email: 'carlos.perez@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'CP' },
  { id: 2, name: 'Maria Gonzalez', email: 'maria.gonzalez@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'MG' },
  { id: 3, name: 'Juan Rodriguez', email: 'juan.rodriguez@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Pendiente', initials: 'JR' },
  { id: 4, name: 'Ana Torres', email: 'ana.torres@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'AT' },
  { id: 5, name: 'Luis Ramirez', email: 'luis.ramirez@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Suspendido', initials: 'LR' },
  { id: 6, name: 'Sofia Castillo', email: 'sofia.castillo@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'SC' },
  { id: 7, name: 'Diego Viteri', email: 'diego.viteri@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'DV' },
  { id: 8, name: 'Paola Mena', email: 'paola.mena@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Pendiente', initials: 'PM' },
  { id: 9, name: 'Ricardo Vega', email: 'ricardo.vega@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'RV' },
  { id: 10, name: 'Jorge Almeida', email: 'jorge.almeida@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Suspendido', initials: 'JA' },
  { id: 11, name: 'Karla Cedeno', email: 'karla.cedeno@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'KC' },
  { id: 12, name: 'Fernando Ibarra', email: 'fernando.ibarra@condominios.com', roles: ['Senior'], condoScope: 'Vista global', status: 'Activo', initials: 'FI' },
];

const columns = [
  { name: 'admin', label: 'Administrador', field: 'name', align: 'left' as const },
  { name: 'roles', label: 'Rol', field: 'roles', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statsBase = [
  { label: 'Total administradores', value: '12', hint: 'Cuentas senior registradas', icon: 'manage_accounts' },
  { label: 'Activos', value: '8', hint: 'Con acceso habilitado', icon: 'verified' },
  { label: 'Pendientes', value: '2', hint: 'Por completar activacion', icon: 'schedule' },
  { label: 'Suspendidos', value: '2', hint: 'Temporalmente bloqueados', icon: 'block' },
];

const statsCards = computed(() => {
  const palette = [
    { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
    { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
    { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
  ] as const;

  return statsBase.map((card, index) => ({
    ...card,
    tint: palette[index % palette.length]!,
  }));
});

const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activos', value: 'Activo' },
  { label: 'Pendientes', value: 'Pendiente' },
  { label: 'Suspendidos', value: 'Suspendido' },
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
    const matchesQuery =
      !query ||
      row.name.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.condoScope.toLowerCase().includes(query);

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

function statusTone(status: AdminRow['status']) {
  if (status === 'Activo') return 'positive';
  if (status === 'Pendiente') return 'warning';
  return 'negative';
}

function goToNewAdministrator() {
  void router.push({ name: 'administradores-nuevo' });
}
</script>

<style scoped>
.administradores-page {
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

.roles-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
