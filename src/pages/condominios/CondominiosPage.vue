<template>
  <q-page class="condominios-page">
    <div class="page-shell">
      <header class="page-hero">
        <div>
          <div class="page-hero__eyebrow">Listado de condominios</div>
          <h1 class="page-hero__title">Condominios</h1>
          <p class="page-hero__subtitle">
            Gestiona el catálogo de condominios registrados en la plataforma.
          </p>
        </div>

        <div class="page-hero__actions">
          <q-btn flat no-caps icon="filter_alt" label="Filtros" class="hero-action hero-action--ghost" />
          <q-btn
            color="primary"
            unelevated
            no-caps
            icon="add_home_work"
            label="Nuevo condominio"
            class="hero-action"
            @click="goToNewCondominio"
          />
        </div>
      </header>

      <section class="stats-grid">
        <q-card v-for="card in stats" :key="card.label" flat bordered class="stat-card">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon" :style="{ background: card.tint.bg, color: card.tint.fg }">
              <q-icon :name="card.icon" size="24px" />
            </div>
            <div>
              <div class="stat-card__label">{{ card.label }}</div>
              <div class="stat-card__value">{{ card.value }}</div>
              <div class="stat-card__hint">{{ card.hint }}</div>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <q-card flat bordered class="panel-card">
        <q-card-section class="panel-card__header">
          <div>
            <div class="panel-card__title">Condominios registrados</div>
            <div class="panel-card__subtitle">
              Vista resumida de los condominios activos en la plataforma.
            </div>
          </div>

          <div class="panel-card__actions">
            <q-input
              v-model="search"
              dense
              outlined
              debounce="250"
              placeholder="Buscar condominio..."
              class="search-field"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              dense
              outlined
              emit-value
              map-options
              class="status-field"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="panel-card__body">
          <q-table
            flat
            bordered
            :rows="filteredRows"
            :columns="columns"
            row-key="id"
            hide-pagination
            :rows-per-page-options="[0]"
            class="condominios-table"
          >
            <template #body-cell-condominio="props">
              <q-td :props="props">
                <div class="condo-cell">
                  <q-avatar rounded size="42px">
                    <img :src="props.row.image" :alt="props.row.name" />
                  </q-avatar>
                  <div>
                    <div class="condo-cell__title">{{ props.row.name }}</div>
                    <div class="condo-cell__subtitle">{{ props.row.location }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-type="props">
              <q-td :props="props">
                <q-badge outline color="primary">{{ props.value }}</q-badge>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="statusTone(props.value)" rounded>{{ props.value }}</q-badge>
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
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

type CondoRow = {
  id: number;
  name: string;
  location: string;
  type: string;
  units: number;
  owners: number;
  principal: string;
  status: 'Activo' | 'Inactivo';
  plan: string;
  income: string;
  delinquency: string;
  image: string;
};

const router = useRouter();
const search = ref('');
const statusFilter = ref<'Todos' | 'Activo' | 'Inactivo'>('Todos');

const rows: CondoRow[] = [
  {
    id: 1,
    name: 'Condominio Vista Real',
    location: 'Quito, Pichincha',
    type: 'Condominio',
    units: 320,
    owners: 428,
    principal: 'Carlos Pérez',
    status: 'Activo',
    plan: 'Enterprise',
    income: '$46,850',
    delinquency: '$1,250',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'Urbanización Los Pinos',
    location: 'Guayaquil, Guayas',
    type: 'Urbanización',
    units: 180,
    owners: 256,
    principal: 'María González',
    status: 'Activo',
    plan: 'Profesional',
    income: '$10,420',
    delinquency: '$2,180',
    image:
      'https://images.unsplash.com/photo-1560448070-20b9a0c4a843?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'Torre Empresarial Norte',
    location: 'Cuenca, Azuay',
    type: 'Edificio',
    units: 96,
    owners: 120,
    principal: 'Juan Rodríguez',
    status: 'Activo',
    plan: 'Profesional',
    income: '$15,600',
    delinquency: '$980',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 4,
    name: 'Condominio Jardines del Valle',
    location: 'Samborondón, Guayas',
    type: 'Condominio',
    units: 250,
    owners: 312,
    principal: 'Ana Torres',
    status: 'Activo',
    plan: 'Enterprise',
    income: '$22,150',
    delinquency: '$1,040',
    image:
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 5,
    name: 'Residencial El Bosque',
    location: 'Manta, Manabí',
    type: 'Condominio',
    units: 150,
    owners: 198,
    principal: 'Luis Ramírez',
    status: 'Inactivo',
    plan: 'Básico',
    income: '$3,200',
    delinquency: '$1,120',
    image:
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=300&q=80',
  },
];

const columns = [
  { name: 'condominio', label: 'Condominio', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
  { name: 'units', label: 'Unidades', field: 'units', align: 'right' as const },
  { name: 'owners', label: 'Propietarios', field: 'owners', align: 'right' as const },
  { name: 'principal', label: 'Administrador principal', field: 'principal', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'plan', label: 'Plan', field: 'plan', align: 'center' as const },
  { name: 'income', label: 'Ingresos (mes)', field: 'income', align: 'right' as const },
  { name: 'delinquency', label: 'Morosidad (mes)', field: 'delinquency', align: 'right' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const stats = [
  {
    label: 'Total condominios',
    value: '24',
    hint: '+2 este mes',
    icon: 'apartment',
    tint: { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
  },
  {
    label: 'Unidades totales',
    value: '5,842',
    hint: '+128 este mes',
    icon: 'domain',
    tint: { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
  },
  {
    label: 'Administradores',
    value: '38',
    hint: '+4 este mes',
    icon: 'manage_accounts',
    tint: { bg: 'rgba(168, 85, 247, 0.12)', fg: '#7c3aed' },
  },
  {
    label: 'Ingresos (mes)',
    value: '$248,850',
    hint: '+12.6% vs mes anterior',
    icon: 'payments',
    tint: { bg: 'rgba(249, 115, 22, 0.12)', fg: '#ea580c' },
  },
];

const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
];

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

function statusTone(status: CondoRow['status']) {
  return status === 'Activo' ? 'positive' : 'grey-6';
}

function goToNewCondominio() {
  void router.push('/condominios/nuevo');
}
</script>

<style scoped>
.condominios-page {
  min-height: 100%;
  padding: 6px 8px 0 4px;
}

.page-shell {
  display: grid;
  gap: 20px;
}

.page-hero {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.page-hero__eyebrow {
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.page-hero__title {
  color: var(--app-text);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-top: 6px;
}

.page-hero__subtitle {
  color: var(--app-text-muted);
  margin-top: 8px;
  max-width: 720px;
}

.page-hero__actions {
  display: flex;
  gap: 10px;
}

.hero-action {
  min-height: 42px;
}

.hero-action--ghost {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.stats-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card__content {
  align-items: center;
  display: flex;
  gap: 14px;
  min-height: 108px;
}

.stat-card__icon {
  align-items: center;
  border-radius: 18px;
  display: inline-flex;
  flex-shrink: 0;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.stat-card__label {
  color: var(--app-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.stat-card__value {
  color: var(--app-text);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-top: 4px;
}

.stat-card__hint {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.panel-card {
  overflow: hidden;
}

.panel-card__header {
  display: grid;
  gap: 16px;
}

.panel-card__title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 800;
}

.panel-card__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.panel-card__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 220px;
}

.status-field {
  min-width: 180px;
}

.panel-card__body {
  padding-top: 0;
}

.condominios-table :deep(.q-table__container) {
  border-radius: 16px;
}

.condo-cell {
  align-items: center;
  display: flex;
  gap: 12px;
}

.condo-cell__title {
  color: var(--app-text);
  font-weight: 800;
}

.condo-cell__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.table-actions {
  white-space: nowrap;
}

.table-icon {
  color: var(--app-text-muted);
}

@media (max-width: 1180px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .page-hero {
    flex-direction: column;
  }

  .page-hero__actions {
    width: 100%;
  }

  .hero-action {
    flex: 1;
  }
}

@media (max-width: 599px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
