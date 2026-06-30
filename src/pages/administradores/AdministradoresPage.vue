<template>
  <q-page class="administradores-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Administradores"
      subtitle="Gestiona administradores senior y administradores asignados a condominios."
      search-placeholder="Buscar administrador..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nuevo administrador"
      action-icon="person_add"
      :filters-label="filtersButtonLabel"
      :filters-expanded="advancedFiltersOpen"
      @filters-click="toggleAdvancedFilters"
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
        <div
          v-if="advancedFiltersOpen"
          class="advanced-filters q-mb-md"
          role="region"
          aria-label="Filtros avanzados de administradores"
        >
          <div class="advanced-filters__header">
            <div>
              <div class="advanced-filters__title">Filtros avanzados</div>
              <div class="advanced-filters__hint">Refina el listado por tipo de administrador.</div>
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
            label="Tipo de administrador"
            :options="typeFilterOptions"
            class="advanced-filters__field"
          >
            <template #prepend>
              <q-icon name="admin_panel_settings" />
            </template>
          </q-select>
        </div>

        <q-banner v-if="loadError" rounded class="admin-error-banner q-mb-md" role="alert">
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
              <q-icon name="manage_accounts" size="36px" />
              <div class="empty-state__title">No hay administradores para mostrar</div>
              <div class="empty-state__text">
                {{
                  loadError
                    ? 'Revisa la conexión con el backend e intenta nuevamente.'
                    : hasActiveFilters
                      ? 'No encontramos resultados con los criterios seleccionados.'
                      : 'Aún no se han registrado administradores.'
                }}
              </div>
            </div>
          </template>

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

          <template #body-cell-type="props">
            <q-td :props="props">
              <q-badge outline color="primary" class="type-badge">
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-scope="props">
            <q-td :props="props">
              <div class="scope-cell">
                <q-icon :name="props.row.type === 'Senior' ? 'public' : 'apartment'" size="17px" />
                <div>
                  <div class="scope-cell__title">{{ props.value }}</div>
                  <div class="scope-cell__hint">
                    {{ props.row.type === 'Senior' ? 'Todos los condominios' : 'Acceso asignado' }}
                  </div>
                </div>
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

          <template #body-cell-invitationStatus="props">
            <q-td :props="props">
              <q-badge
                :color="invitationTone(props.value)"
                outline
                rounded
                class="status-badge"
              >
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
                :aria-label="`Ver detalle de ${props.row.name}`"
                @click="showAdministratorDetail(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="edit"
                class="table-icon"
                :aria-label="`Editar ${props.row.name}`"
                @click="editAdministrator(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="more_horiz"
                class="table-icon"
                :aria-label="`Más acciones para ${props.row.name}`"
              >
                <q-tooltip>Más acciones</q-tooltip>
                <q-menu anchor="bottom right" self="top right">
                  <q-list bordered class="actions-menu">
                    <q-item
                      v-if="props.row.status === 'Activo'"
                      v-close-popup
                      clickable
                      @click="requestAdministratorAction('suspend', props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="person_off" color="warning" />
                      </q-item-section>
                      <q-item-section>Suspender acceso</q-item-section>
                    </q-item>
                    <q-item
                      v-if="props.row.status === 'Inactivo'"
                      v-close-popup
                      clickable
                      @click="requestAdministratorAction('reactivate', props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="how_to_reg" color="positive" />
                      </q-item-section>
                      <q-item-section>Reactivar acceso</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      v-close-popup
                      clickable
                      class="text-negative"
                      @click="requestAdministratorAction('delete', props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete_outline" />
                      </q-item-section>
                      <q-item-section>Eliminar administrador</q-item-section>
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

    <AppConfirmDialog
      v-model="confirmDialogOpen"
      :tone="confirmDialogTone"
      :icon="confirmDialogIcon"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :confirm-label="confirmDialogLabel"
      :loading="isProcessingAction"
      cancel-label="Cancelar"
      @confirm="confirmAdministratorAction"
      @cancel="clearPendingAction"
    />

    <AppAlertDialog
      v-model="alertDialogOpen"
      :tone="alertDialog.tone"
      :icon="alertDialog.icon"
      :title="alertDialog.title"
      :message="alertDialog.message"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';

import AppAlertDialog from '@/components/general/AppAlertDialog.vue';
import AppConfirmDialog from '@/components/general/AppConfirmDialog.vue';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import {
  deleteAdministrator,
  fetchAdministrators,
  reactivateAdministrator,
  suspendAdministrator,
  type AdministratorListItem,
} from '@/services/administrators.service';
import { useSessionStore } from '@/stores/session.store';

type AdminRow = AdministratorListItem;
type SortOption = 'recent' | 'oldest' | 'name';
type AdministratorAction = 'suspend' | 'reactivate' | 'delete';
type DialogTone = 'primary' | 'positive' | 'negative' | 'warning';

const router = useRouter();
const session = useSessionStore();
const search = ref('');
const statusFilter = ref<'Todos' | 'Activo' | 'Inactivo'>('Todos');
const typeFilter = ref<'Todos' | AdminRow['type']>('Todos');
const advancedFiltersOpen = ref(false);
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({ page: 1, rowsPerPage: 10 });
const isLoadingRows = ref(false);
const loadError = ref('');
const confirmDialogOpen = ref(false);
const pendingAction = ref<AdministratorAction | null>(null);
const pendingAdministrator = ref<AdminRow | null>(null);
const isProcessingAction = ref(false);
const alertDialogOpen = ref(false);
const alertDialog = ref<{ tone: DialogTone; icon: string; title: string; message: string }>({
  tone: 'primary',
  icon: 'info',
  title: '',
  message: '',
});
const rows = ref<AdminRow[]>([]);

const columns = [
  { name: 'admin', label: 'Administrador', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
  { name: 'scope', label: 'Alcance', field: 'scope', align: 'left' as const },
  { name: 'status', label: 'Acceso', field: 'status', align: 'center' as const },
  {
    name: 'invitationStatus',
    label: 'Invitacion',
    field: 'invitationStatus',
    align: 'center' as const,
  },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
];

const typeFilterOptions = [
  { label: 'Tipo: Todos', value: 'Todos' },
  { label: 'Senior', value: 'Senior' },
  { label: 'Administrador de condominio', value: 'Administrador de condominio' },
] as const;

const sortOptions = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Más antiguos', value: 'oldest' },
  { label: 'Nombre A-Z', value: 'name' },
] as const;

const statsCards = computed(() => {
  const total = rows.value.length;
  const senior = rows.value.filter((row) => row.type === 'Senior').length;
  const condominiumAdmins = rows.value.filter(
    (row) => row.type === 'Administrador de condominio',
  ).length;
  const pending = rows.value.filter((row) => row.invitationStatus === 'Pendiente').length;
  const palette = [
    { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
    { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
    { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
  ] as const;

  return [
    { label: 'Total administradores', value: String(total), hint: 'Cuentas registradas', icon: 'manage_accounts' },
    { label: 'Senior', value: String(senior), hint: 'Con acceso global', icon: 'public' },
    { label: 'De condominio', value: String(condominiumAdmins), hint: 'Con acceso asignado', icon: 'apartment' },
    { label: 'Pendientes', value: String(pending), hint: 'Por activar', icon: 'schedule' },
  ].map((card, index) => ({ ...card, tint: palette[index % palette.length]! }));
});

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase();

  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'Todos' || row.status === statusFilter.value;
    const matchesType = typeFilter.value === 'Todos' || row.type === typeFilter.value;
    const matchesQuery =
      !query ||
      row.name.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.type.toLowerCase().includes(query) ||
      row.scope.toLowerCase().includes(query);

    return matchesStatus && matchesType && matchesQuery;
  });
});

const hasActiveFilters = computed(
  () =>
    search.value.trim().length > 0 ||
    statusFilter.value !== 'Todos' ||
    typeFilter.value !== 'Todos',
);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (search.value.trim()) count += 1;
  if (statusFilter.value !== 'Todos') count += 1;
  if (typeFilter.value !== 'Todos') count += 1;
  return count;
});

const filtersButtonLabel = computed(() =>
  activeFiltersCount.value > 0 ? `Filtros (${activeFiltersCount.value})` : 'Filtros',
);

const sortedRows = computed(() => {
  const source = [...filteredRows.value];
  if (sortBy.value === 'name') return source.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy.value === 'oldest') return source.reverse();
  return source;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage)),
);

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  return sortedRows.value.slice(start, start + pagination.value.rowsPerPage);
});

const confirmDialogTitle = computed(() => {
  if (pendingAction.value === 'suspend') return 'Suspender administrador';
  if (pendingAction.value === 'reactivate') return 'Reactivar administrador';
  return 'Eliminar administrador';
});

const confirmDialogMessage = computed(() => {
  const name = pendingAdministrator.value?.name ?? 'este administrador';
  if (pendingAction.value === 'suspend') {
    return `¿Suspender el acceso de "${name}"? No podrá iniciar sesión hasta que su cuenta sea reactivada.`;
  }
  if (pendingAction.value === 'reactivate') {
    return `¿Reactivar el acceso de "${name}"? La cuenta volverá a estar disponible.`;
  }
  return `¿Eliminar al administrador "${name}"? Esta acción no se puede deshacer.`;
});

const confirmDialogTone = computed<DialogTone>(() =>
  pendingAction.value === 'reactivate'
    ? 'positive'
    : pendingAction.value === 'suspend'
      ? 'warning'
      : 'negative',
);

const confirmDialogIcon = computed(() => {
  if (pendingAction.value === 'suspend') return 'person_off';
  if (pendingAction.value === 'reactivate') return 'how_to_reg';
  return 'delete_outline';
});

const confirmDialogLabel = computed(() => {
  if (pendingAction.value === 'suspend') return 'Suspender';
  if (pendingAction.value === 'reactivate') return 'Reactivar';
  return 'Eliminar';
});

watch(
  () => [filteredRows.value.length, pagination.value.rowsPerPage] as const,
  () => {
    const maxPage = Math.max(1, Math.ceil(sortedRows.value.length / pagination.value.rowsPerPage));
    if (pagination.value.page > maxPage) pagination.value.page = maxPage;
  },
  { immediate: true },
);

watch(
  () => [search.value, statusFilter.value, typeFilter.value] as const,
  () => {
    pagination.value.page = 1;
  },
);

onMounted(() => {
  void loadAdministrators();
  window.addEventListener('administrators:changed', handleAdministratorsChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('administrators:changed', handleAdministratorsChanged);
});

async function loadAdministrators() {
  isLoadingRows.value = true;
  loadError.value = '';
  try {
    rows.value = await fetchAdministrators(session.accessToken);
  } catch (error) {
    rows.value = [];
    loadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los administradores.';
  } finally {
    isLoadingRows.value = false;
  }
}

function handleAdministratorsChanged() {
  void loadAdministrators();
}

function statusTone(status: AdminRow['status']) {
  if (status === 'Activo') return 'positive';
  return 'negative';
}

function invitationTone(status: AdminRow['invitationStatus']) {
  if (status === 'Aceptada') return 'positive';
  if (status === 'Pendiente') return 'warning';
  if (status === 'Expirada' || status === 'Cancelada') return 'negative';
  return 'grey-7';
}

function toggleAdvancedFilters() {
  advancedFiltersOpen.value = !advancedFiltersOpen.value;
}

function clearAdvancedFilters() {
  typeFilter.value = 'Todos';
}

function goToNewAdministrator() {
  void router.push({ name: 'administradores-nuevo' });
}

function editAdministrator(row: AdminRow) {
  void router.push({ name: 'administradores-editar', params: { id: String(row.id) } });
}

function showAdministratorDetail(row: AdminRow) {
  const scopeDescription =
    row.type === 'Senior' ? 'acceso global a todos los condominios' : `asignado a ${row.scope}`;
  alertDialog.value = {
    tone: 'primary',
    icon: row.type === 'Senior' ? 'public' : 'manage_accounts',
    title: row.name,
    message: `${row.email}. ${row.type}, ${scopeDescription}. Acceso: ${row.status}. Invitacion: ${row.invitationStatus}.`,
  };
  alertDialogOpen.value = true;
}

function requestAdministratorAction(action: AdministratorAction, row: AdminRow) {
  pendingAction.value = action;
  pendingAdministrator.value = row;
  confirmDialogOpen.value = true;
}

async function confirmAdministratorAction() {
  const action = pendingAction.value;
  const administrator = pendingAdministrator.value;
  if (!action || !administrator || isProcessingAction.value) return;

  isProcessingAction.value = true;
  try {
    const result = await executeAdministratorAction(action, administrator);
    Notify.create({
      type: 'positive',
      message: result.message || buildActionSuccessMessage(action, administrator),
      position: 'top-right',
    });
    confirmDialogOpen.value = false;
    await loadAdministrators();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error instanceof Error
          ? error.message
          : 'No fue posible completar la acción sobre el administrador.',
      position: 'top-right',
    });
  } finally {
    isProcessingAction.value = false;
    if (!confirmDialogOpen.value) clearPendingAction();
  }
}

function executeAdministratorAction(action: AdministratorAction, administrator: AdminRow) {
  if (action === 'delete') return deleteAdministrator(administrator.id, session.accessToken);
  if (action === 'suspend') return suspendAdministrator(administrator.id, session.accessToken);
  return reactivateAdministrator(administrator.id, session.accessToken);
}

function buildActionSuccessMessage(action: AdministratorAction, administrator: AdminRow) {
  if (action === 'delete') return `${administrator.name} fue eliminado correctamente.`;
  if (action === 'suspend') return `${administrator.name} fue suspendido correctamente.`;
  return `${administrator.name} fue reactivado correctamente.`;
}

function clearPendingAction() {
  if (isProcessingAction.value) return;
  pendingAction.value = null;
  pendingAdministrator.value = null;
}
</script>

<style scoped>
.administradores-page {
  min-height: 100%;
}

.stat-card {
  border-radius: 16px;
}

.stat-card__content,
.entity-cell,
.scope-cell {
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

.stat-card__label,
.stat-card__hint,
.entity-cell__subtitle,
.scope-cell__hint {
  color: var(--app-text-muted);
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

.list-table :deep(.q-table__middle) {
  overflow-x: auto;
}

.list-table :deep(table) {
  min-width: 760px;
}

.list-table :deep(thead tr th),
.entity-cell__title,
.scope-cell__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
}

.list-table :deep(tbody tr td) {
  color: var(--app-text);
  font-size: 12px;
  height: 60px;
}

.admin-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
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

.empty-state .q-icon,
.scope-cell > .q-icon,
.table-icon {
  color: var(--app-primary);
}

.empty-state__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.entity-avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 800;
}

.type-badge,
.status-badge {
  font-weight: 700;
}

.table-actions {
  white-space: nowrap;
}

.table-icon {
  height: 34px;
  width: 34px;
}

.actions-menu {
  border-radius: 14px;
  min-width: 250px;
  padding: 6px;
}

.table-footer__pagination :deep(.q-pagination__content) {
  gap: 6px;
}
</style>
