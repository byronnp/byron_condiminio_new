<template>
  <q-page class="unidades-page">
    <div class="unidades-shell">
      <section class="unidades-shell__main">
        <div class="page-hero">
          <div>
            <div class="page-hero__eyebrow">Módulo / Unidades</div>
            <div class="page-hero__title">Gestión de unidades</div>
            <div class="page-hero__subtitle">
              Visualiza, filtra y administra las unidades del condominio.
            </div>
          </div>

          <div class="page-hero__actions">
            <q-btn flat no-caps icon="download" label="Exportar" class="hero-action hero-action--ghost" />
            <q-btn
              color="primary"
              unelevated
              no-caps
              icon="add"
              label="Nueva unidad"
              class="hero-action"
              @click="openCreateDialog"
            />
          </div>
        </div>

        <div class="stats-grid">
          <q-card v-for="card in stats" :key="card.label" class="stat-card">
            <q-card-section class="stat-card__content">
              <div class="stat-card__icon">
                <q-icon :name="card.icon" size="22px" />
              </div>
              <div>
                <div class="stat-card__label">{{ card.label }}</div>
                <div class="stat-card__value">{{ card.value }}</div>
                <div class="stat-card__hint">{{ card.hint }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-card class="panel-card">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__title">Listado de unidades</div>
              <div class="panel-card__subtitle">Filtra por estado y busca por número o propietario.</div>
            </div>
            <q-chip dense outline color="primary">{{ filteredRows.length }} unidades</q-chip>
          </q-card-section>

          <q-card-section class="filters-bar">
            <q-input
              v-model="search"
              dense
              outlined
              clearable
              debounce="250"
              placeholder="Buscar unidad, bloque o propietario..."
              class="filters-bar__search"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <div class="filters-bar__chips">
              <q-btn
                v-for="status in statusFilters"
                :key="status.label"
                flat
                dense
                no-caps
                :label="status.label"
                :class="['status-chip', { 'status-chip--active': statusFilter === status.value }]"
                @click="statusFilter = status.value"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="table-wrap">
            <q-table
              flat
              bordered
              :rows="filteredRows"
              :columns="columns"
              row-key="id"
              hide-pagination
              :rows-per-page-options="[0]"
              no-data-label="No hay unidades para mostrar"
              :pagination="{ rowsPerPage: 0 }"
              class="units-table"
            >
              <template #body-cell-numero="props">
                <q-td :props="props">
                  <div class="unit-code">{{ props.row.numero }}</div>
                  <div class="unit-code__sub">{{ props.row.bloque }} · Piso {{ props.row.piso }}</div>
                </q-td>
              </template>

              <template #body-cell-estado="props">
                <q-td :props="props">
                  <q-badge :color="statusTone(props.row.estado)" rounded>
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
                  <q-btn flat round dense icon="visibility" @click="selectUnit(props.row)">
                    <q-tooltip>Ver detalle</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="edit" @click="openEditDialog(props.row)">
                    <q-tooltip>Editar unidad</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="more_vert">
                    <q-tooltip>Más acciones</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </section>

      <aside class="unidades-shell__aside">
        <q-card class="panel-card panel-card--sticky">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__title">Detalle de unidad</div>
              <div class="panel-card__subtitle">Vista rápida de la selección actual.</div>
            </div>
          </q-card-section>

          <q-card-section v-if="selectedUnit" class="detail-card">
            <div class="detail-card__badge">
              <q-icon name="domain" size="18px" />
              {{ selectedUnit.numero }}
            </div>

            <div class="detail-card__grid">
              <div>
                <div class="detail-card__label">Propietario</div>
                <div class="detail-card__value">{{ selectedUnit.propietario }}</div>
              </div>
              <div>
                <div class="detail-card__label">Estado</div>
                <q-badge :color="statusTone(selectedUnit.estado)" rounded>
                  {{ selectedUnit.estado }}
                </q-badge>
              </div>
              <div>
                <div class="detail-card__label">Área</div>
                <div class="detail-card__value">{{ selectedUnit.area }} m²</div>
              </div>
              <div>
                <div class="detail-card__label">Habitaciones</div>
                <div class="detail-card__value">{{ selectedUnit.habitaciones }}</div>
              </div>
              <div>
                <div class="detail-card__label">Baños</div>
                <div class="detail-card__value">{{ selectedUnit.banos }}</div>
              </div>
              <div>
                <div class="detail-card__label">Estacionamientos</div>
                <div class="detail-card__value">{{ selectedUnit.estacionamientos }}</div>
              </div>
            </div>

            <div class="detail-card__note">
              <div class="detail-card__label">Observaciones</div>
              <div class="detail-card__text">{{ selectedUnit.observaciones }}</div>
            </div>

            <div class="detail-card__footer">
              <q-btn flat no-caps label="Editar" icon="edit" @click="openEditDialog(selectedUnit)" />
              <q-btn color="primary" unelevated no-caps label="Nueva unidad" icon="add" @click="openCreateDialog" />
            </div>
          </q-card-section>
        </q-card>
      </aside>
    </div>

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
import UnidadFormDialog from './components/UnidadFormDialog.vue';
import { type UnidadRow, useUnidades } from '@/composables/unidades/useUnidades';

const {
  search,
  statusFilter,
  dialogOpen,
  editingId,
  form,
  stats,
  filteredRows,
  selectedUnit,
  openCreateDialog,
  openEditDialog,
  selectUnit,
  saveUnit,
} = useUnidades();

const columns = [
  {
    name: 'numero',
    label: 'Unidad',
    field: 'numero',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'propietario', label: 'Propietario', field: 'propietario', align: 'left' as const },
  { name: 'area', label: 'Área', field: 'area', align: 'right' as const },
  { name: 'habitaciones', label: 'Hab.', field: 'habitaciones', align: 'center' as const },
  { name: 'banos', label: 'Baños', field: 'banos', align: 'center' as const },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center' as const,
  },
  { name: 'alDia', label: 'Al día', field: 'alDia', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statusFilters = [
  { label: 'Todas', value: 'Todas' as const },
  { label: 'Disponible', value: 'Disponible' as const },
  { label: 'Ocupada', value: 'Ocupada' as const },
  { label: 'Mora', value: 'Mora' as const },
  { label: 'Exonerada', value: 'Exonerada' as const },
];

function statusTone(status: UnidadRow['estado']) {
  if (status === 'Disponible') return 'positive';
  if (status === 'Ocupada') return 'primary';
  if (status === 'Mora') return 'negative';
  return 'warning';
}
</script>

<style scoped>
.unidades-page {
  min-height: 100%;
  padding: 6px 8px 0 4px;
}

.unidades-shell {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 340px;
}

.unidades-shell__main,
.unidades-shell__aside {
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
  background: rgba(37, 99, 235, 0.12);
  border-radius: 18px;
  color: var(--app-primary);
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

.panel-card--sticky {
  position: sticky;
  top: 20px;
}

.panel-card__header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 12px;
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

.filters-bar {
  display: grid;
  gap: 14px;
}

.filters-bar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.status-chip {
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  color: var(--app-text-muted);
}

.status-chip--active {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(37, 99, 235, 0.18);
  color: var(--app-primary);
}

.table-wrap {
  overflow-x: auto;
}

.units-table :deep(.q-table__container) {
  border-radius: 16px;
}

.unit-code {
  color: var(--app-text);
  font-weight: 800;
}

.unit-code__sub {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.table-actions {
  white-space: nowrap;
}

.detail-card {
  display: grid;
  gap: 16px;
}

.detail-card__badge {
  align-items: center;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 14px;
  color: var(--app-primary);
  display: inline-flex;
  gap: 8px;
  font-weight: 800;
  padding: 10px 12px;
  width: fit-content;
}

.detail-card__grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-card__label {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.detail-card__value {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  margin-top: 4px;
}

.detail-card__note {
  background: rgba(15, 23, 42, 0.03);
  border-radius: 16px;
  padding: 14px;
}

.detail-card__text {
  color: var(--app-text);
  line-height: 1.6;
  margin-top: 6px;
}

.detail-card__footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 1439px) {
  .unidades-shell {
    grid-template-columns: 1fr;
  }
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
  .stats-grid,
  .detail-card__grid {
    grid-template-columns: 1fr;
  }

  .detail-card__footer {
    flex-direction: column;
  }
}
</style>
