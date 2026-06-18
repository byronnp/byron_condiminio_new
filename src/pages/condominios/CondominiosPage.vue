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
        <q-table
          flat
          bordered
          :rows="paginatedRows"
          :columns="columns"
          row-key="id"
          hide-bottom
          class="list-table"
        >
          <template #body-cell-condominio="props">
            <q-td :props="props">
              <div class="entity-cell">
                <q-avatar rounded size="38px" class="entity-avatar">
                  <img :src="props.row.image" :alt="props.row.name" />
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
              <q-btn flat round dense icon="edit" class="table-icon">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="more_horiz" class="table-icon">
                <q-tooltip>Más acciones</q-tooltip>
                <q-menu anchor="bottom right" self="top right">
                  <q-list dense style="min-width: 220px">
                    <q-item clickable v-close-popup @click="goToNewAdministrator(props.row)">
                      <q-item-section avatar>
                        <q-icon name="person_add" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Agregar administrador</q-item-label>
                        <q-item-label caption>Registrar acceso para este condominio</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="goToNewUnit(props.row)">
                      <q-item-section avatar>
                        <q-icon name="add_home_work" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Agregar unidades</q-item-label>
                        <q-item-label caption>Crear nuevas unidades en este condominio</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
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
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AppListPageShell from '@/components/shared/AppListPageShell.vue';

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
const search = ref('');
const statusFilter = ref<'Todos' | 'Activo' | 'Inactivo'>('Todos');
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const rows: CondoRow[] = [
  {
    id: 1,
    name: 'Condominio Vista Real',
    location: 'Quito, Pichincha',
    type: 'Condominio',
    units: 320,
    principal: 'Carlos Perez',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'Urbanizacion Los Pinos',
    location: 'Guayaquil, Guayas',
    type: 'Urbanizacion',
    units: 180,
    principal: 'Maria Gonzalez',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1560448070-20b9a0c4a843?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'Torre Empresarial Norte',
    location: 'Cuenca, Azuay',
    type: 'Edificio',
    units: 96,
    principal: 'Juan Rodriguez',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 4,
    name: 'Condominio Jardines del Valle',
    location: 'Samborondon, Guayas',
    type: 'Condominio',
    units: 250,
    principal: 'Ana Torres',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 5,
    name: 'Residencial El Bosque',
    location: 'Manta, Manabi',
    type: 'Condominio',
    units: 150,
    principal: 'Luis Ramirez',
    status: 'Inactivo',
    image:
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 6,
    name: 'Altos del Sol',
    location: 'Machala, El Oro',
    type: 'Urbanizacion',
    units: 142,
    principal: 'Pedro Morales',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 7,
    name: 'Marina Bay',
    location: 'Manta, Manabi',
    type: 'Edificio',
    units: 84,
    principal: 'Sofia Castillo',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 8,
    name: 'Costa Azul',
    location: 'Salinas, Santa Elena',
    type: 'Condominio',
    units: 210,
    principal: 'Diego Viteri',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 9,
    name: 'Portales del Lago',
    location: 'Ibarra, Imbabura',
    type: 'Urbanizacion',
    units: 116,
    principal: 'Karla Cedeno',
    status: 'Inactivo',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 10,
    name: 'Ciudadela Central',
    location: 'Ambato, Tungurahua',
    type: 'Condominio',
    units: 174,
    principal: 'Ricardo Vega',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 11,
    name: 'Terraza Norte',
    location: 'Loja, Loja',
    type: 'Edificio',
    units: 68,
    principal: 'Paola Mena',
    status: 'Inactivo',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 12,
    name: 'Nuevo Horizonte',
    location: 'Duran, Guayas',
    type: 'Condominio',
    units: 198,
    principal: 'Jorge Almeida',
    status: 'Activo',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80',
  },
];

const columns = [
  { name: 'condominio', label: 'Condominio', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
  { name: 'units', label: 'Unidades', field: 'units', align: 'right' as const },
  { name: 'principal', label: 'Administrador principal', field: 'principal', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statsBase = [
  { label: 'Total condominios', value: '12', hint: 'Todos los condominios registrados', icon: 'apartment' },
  { label: 'Condominios activos', value: '9', hint: 'Con acceso al sistema', icon: 'domain' },
  { label: 'Condominios inactivos', value: '3', hint: 'Sin acceso al sistema', icon: 'groups' },
  { label: 'Tipos registrados', value: '3', hint: 'Condominio, urbanizacion y edificio', icon: 'category' },
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
  { label: 'Inactivos', value: 'Inactivo' },
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

function statusTone(status: CondoRow['status']) {
  return status === 'Activo' ? 'positive' : 'negative';
}

function goToNewCondominio() {
  void router.push('/condominios/nuevo');
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


