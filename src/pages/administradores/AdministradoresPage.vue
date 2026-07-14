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
      :action-disabled="!canCreateAdministrators"
      filters-label="Filtros"
      :filters-expanded="false"
      :show-filters="false"
      @cta-click="goToNewAdministrator"
    >
      <template #stats><AppStatsCards :cards="statsCards" /></template>
      <template #table>
        <q-banner v-if="!activeCondominiumId" rounded class="admin-error-banner q-mb-md">
          <template #avatar> <q-icon name="apartment" color="warning" /> </template>
          Selecciona un condominio activo para gestionar sus administradores.
        </q-banner>
        <q-banner v-if="loadError" rounded class="admin-error-banner q-mb-md" role="alert">
          <template #avatar> <q-icon name="error_outline" color="negative" /> </template>
          {{ loadError }}
        </q-banner>
        <q-table
          flat
          bordered
          :rows="sortedRows"
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
              icon="manage_accounts"
              title="No hay administradores para mostrar"
              :text="
                loadError
                  ? 'Revisa la conexi?n con el backend e intenta nuevamente.'
                  : hasActiveFilters
                    ? 'No encontramos resultados con los criterios seleccionados.'
                    : 'A?n no se han registrado administradores.'
              "
          /></template>
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
              <q-badge outline color="primary" class="type-badge">Administrador</q-badge>
            </q-td>
          </template>
          <template #body-cell-scope="props">
            <q-td :props="props">
              <div class="scope-cell">
                <q-icon :name="props.row.type === 'Senior' ? 'public' : 'apartment'" size="17px" />
                <div>
                  <div class="scope-cell__title">{{ props.value }}</div>
                  <div class="scope-cell__hint">
                    Acceso asignado
                  </div>
                </div>
              </div>
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="statusTone(props.value)" rounded class="status-badge">
                {{ statusLabel(props.value) }}
              </q-badge>
            </q-td>
          </template>
          <template #body-cell-invitationStatus="props">
            <q-td :props="props">
              <div class="invitation-cell">
                <q-badge :color="invitationTone(props.value)" outline rounded class="status-badge">
                  {{ props.value || 'Sin invitación' }}
                </q-badge>
                <div v-if="props.row.invitationInfo" class="invitation-cell__info">
                  {{ props.row.invitationInfo }}
                </div>
              </div>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="table-actions">
              <q-btn
                v-if="canUpdateAdministrators"
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
                v-if="canUpdateAdministrators || canDeleteAdministrators"
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
                      v-if="canUpdateAdministrators && props.row.status === 'active'"
                      v-close-popup
                      clickable
                      @click="requestAdministratorAction('suspend', props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="person_off" color="warning" />
                      </q-item-section>
                      <q-item-section>Deshabilitar acceso global</q-item-section>
                    </q-item>
                    <q-item
                      v-if="canUpdateAdministrators && props.row.status === 'inactive'"
                      v-close-popup
                      clickable
                      @click="requestAdministratorAction('reactivate', props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="how_to_reg" color="positive" />
                      </q-item-section>
                      <q-item-section>Habilitar acceso global</q-item-section>
                    </q-item>
                    <q-separator v-if="canDeleteAdministrators" />
                    <q-item
                      v-if="canDeleteAdministrators"
                      v-close-popup
                      clickable
                      class="text-negative"
                      @click="requestAdministratorAction('delete', props.row)"
                    >
                      <q-item-section avatar> <q-icon name="delete_outline" /> </q-item-section>
                      <q-item-section>Desvincular administrador del condominio</q-item-section>
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
import AppEmptyState from '@/components/shared/AppEmptyState.vue';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import AppStatsCards from '@/components/shared/AppStatsCards.vue';
import {
  deleteAdministrator,
  fetchAdministratorsPage,
  reactivateAdministrator,
  suspendAdministrator,
  type AdministratorListItem,
} from '@/services/administrators.service';
import { useSessionStore } from '@/stores/session.store';
type AdminRow = AdministratorListItem;
type SortOption = 'recent' | 'oldest' | 'name';
type AdministratorAction = 'suspend' | 'reactivate' | 'delete';
type DialogTone = 'primary' | 'positive' | 'negative' | 'warning';
type PermissionCode =
  | 'administrators.view'
  | 'administrators.create'
  | 'administrators.update'
  | 'administrators.delete';
const router = useRouter();
const session = useSessionStore();
const search = ref('');
const statusFilter = ref<'Todos' | 'active' | 'inactive'>('Todos');
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [5, 10, 15, 20, 25] as const;
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
const serverTotalPages = ref(1);
const serverTotalItems = ref(0);
const columns = [
  { name: 'admin', label: 'Administrador', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'id', align: 'left' as const },
  { name: 'scope', label: 'Alcance', field: 'scope', align: 'left' as const },
  { name: 'status', label: 'Acceso', field: 'status', align: 'center' as const },
  {
    name: 'invitationStatus',
    label: 'Invitación',
    field: 'invitationStatus',
    align: 'center' as const,
  },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];
const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
];
const sortOptions = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Más antiguos', value: 'oldest' },
  { label: 'Nombre A-Z', value: 'name' },
] as const;
const statsCards = computed(() => {
  const total = serverTotalItems.value;
  const active = rows.value.filter((row) => row.status === 'active').length;
  const inactive = rows.value.filter((row) => row.status === 'inactive').length;
  const pending = rows.value.filter((row) => row.status === 'pending_activation').length;
  const palette = [
    { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
    { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
    { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
  ] as const;
  return [
    {
      label: 'Total administradores',
      value: String(total),
      hint: 'Cuentas registradas',
      icon: 'manage_accounts',
    },
    { label: 'Activos', value: String(active), hint: 'Acceso disponible', icon: 'verified_user' },
    {
      label: 'Inactivos',
      value: String(inactive),
      hint: 'Acceso deshabilitado',
      icon: 'person_off',
    },
    { label: 'Pendientes', value: String(pending), hint: 'Por activar', icon: 'schedule' },
  ].map((card, index) => ({ ...card, tint: palette[index % palette.length]! }));
});
const hasActiveFilters = computed(
  () => search.value.trim().length > 0 || statusFilter.value !== 'Todos',
);
const sortedRows = computed(() => {
  const source = [...rows.value];
  if (sortBy.value === 'name') return source.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy.value === 'oldest') return source.reverse();
  return source;
});
const totalPages = computed(() => serverTotalPages.value);
const activeCondominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});
const canViewAdministrators = computed(() => hasPermission('administrators.view'));
const canCreateAdministrators = computed(
  () => activeCondominiumId.value !== null && hasPermission('administrators.create'),
);
const canUpdateAdministrators = computed(() => hasPermission('administrators.update'));
const canDeleteAdministrators = computed(() => hasPermission('administrators.delete'));
const confirmDialogTitle = computed(() => {
  if (pendingAction.value === 'suspend') return 'Deshabilitar acceso global';
  if (pendingAction.value === 'reactivate') return 'Habilitar acceso global';
  return 'Desvincular administrador del condominio';
});
const confirmDialogMessage = computed(() => {
  const name = pendingAdministrator.value?.name ?? 'este administrador';
  if (pendingAction.value === 'suspend') {
    return `¿Deshabilitar el acceso global de "${name}"? Este cambio afecta todos los condominios donde el usuario tenga acceso, no solo el condominio activo.`;
  }
  if (pendingAction.value === 'reactivate') {
    return `¿Habilitar el acceso global de "${name}"? Este cambio afecta todos los condominios donde el usuario tenga acceso, no solo el condominio activo.`;
  }
  return `¿Desvincular administrador del condominio "${name}"? Esta acción no elimina el usuario ni deshabilita su acceso global; solo retira su relación con este condominio.`;
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
  if (pendingAction.value === 'suspend') return 'Deshabilitar';
  if (pendingAction.value === 'reactivate') return 'Habilitar';
  return 'Desvincular';
});
watch(
  () => [search.value, statusFilter.value] as const,
  () => {
    if (pagination.value.page !== 1) {
      pagination.value.page = 1;
      return;
    }
    void loadAdministrators();
  },
);
watch(
  () => [pagination.value.page, pagination.value.rowsPerPage] as const,
  ([page, rowsPerPage], previous) => {
    if (previous && rowsPerPage !== previous[1] && page !== 1) {
      pagination.value.page = 1;
      return;
    }
    void loadAdministrators();
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
  const condominiumId = activeCondominiumId.value;
  if (!condominiumId) {
    rows.value = [];
    serverTotalItems.value = 0;
    serverTotalPages.value = 1;
    loadError.value = '';
    return;
  }

  if (!canViewAdministrators.value) {
    rows.value = [];
    serverTotalItems.value = 0;
    serverTotalPages.value = 1;
    loadError.value = 'No tienes permiso para ver administradores en este condominio.';
    return;
  }

  isLoadingRows.value = true;
  loadError.value = '';
  try {
    const result = await fetchAdministratorsPage(
      {
        condominiumId,
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
        search: search.value,
        ...(statusFilter.value === 'Todos' ? {} : { status: statusFilter.value }),
      },
      session.accessToken,
    );
    rows.value = result.items;
    serverTotalItems.value = result.total;
    serverTotalPages.value = result.lastPage;
    if (pagination.value.page !== result.page) pagination.value.page = result.page;
  } catch (error) {
    rows.value = [];
    loadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los administradores.';
  } finally {
    isLoadingRows.value = false;
  }
}
watch(
  () => session.activeCondoId,
  () => {
    const hadActiveFilters =
      Boolean(search.value.trim()) || statusFilter.value !== 'Todos';
    search.value = '';
    statusFilter.value = 'Todos';
    if (pagination.value.page !== 1) {
      pagination.value.page = 1;
      return;
    }
    if (!hadActiveFilters) void loadAdministrators();
  },
);
function handleAdministratorsChanged() {
  void loadAdministrators();
}
function statusTone(status: AdminRow['status']) {
  if (status === 'active') return 'positive';
  if (status === 'pending_activation') return 'warning';
  if (status === 'invitation_expired' || status === 'invitation_revoked') return 'orange';
  return 'negative';
}
function statusLabel(status: AdminRow['status']) {
  if (status === 'active') return 'Activo';
  if (status === 'pending_activation') return 'Pendiente de activación';
  if (status === 'invitation_expired') return 'Invitación expirada';
  if (status === 'invitation_revoked') return 'Invitación revocada';
  return 'Inactivo';
}
function invitationTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('accepted') || normalized.includes('acept')) return 'positive';
  if (normalized.includes('pending') || normalized.includes('pend')) return 'warning';
  if (normalized.includes('expired') || normalized.includes('revoked')) return 'negative';
  return 'grey-7';
}
function goToNewAdministrator() {
  if (!canCreateAdministrators.value) return;
  void router.push({ name: 'administradores-nuevo' });
}
function editAdministrator(row: AdminRow) {
  if (!canUpdateAdministrators.value) return;
  void router.push({ name: 'administradores-editar', params: { id: String(row.id) } });
}
function showAdministratorDetail(row: AdminRow) {
  alertDialog.value = {
    tone: 'primary',
    icon: 'manage_accounts',
    title: row.name,
    message: `${row.email}. Asignado a ${row.scope}. Acceso: ${statusLabel(row.status)}.${
      row.invitationInfo ? ` Invitación: ${row.invitationInfo}.` : ''
    }`,
  };
  alertDialogOpen.value = true;
}
function requestAdministratorAction(action: AdministratorAction, row: AdminRow) {
  if ((action === 'delete' && !canDeleteAdministrators.value) || (action !== 'delete' && !canUpdateAdministrators.value)) {
    return;
  }
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
  const condominiumId = activeCondominiumId.value;
  if (!condominiumId) {
    throw new Error('Selecciona un condominio activo para completar la acción.');
  }

  if (action === 'delete') return deleteAdministrator(condominiumId, administrator.id, session.accessToken);
  if (action === 'suspend') return suspendAdministrator(condominiumId, administrator.id, session.accessToken);
  return reactivateAdministrator(condominiumId, administrator.id, session.accessToken);
}
function buildActionSuccessMessage(action: AdministratorAction, administrator: AdminRow) {
  if (action === 'delete') return `${administrator.name} fue desvinculado del condominio.`;
  if (action === 'suspend') return `El acceso global de ${administrator.name} fue deshabilitado.`;
  return `El acceso global de ${administrator.name} fue habilitado.`;
}
function clearPendingAction() {
  if (isProcessingAction.value) return;
  pendingAction.value = null;
  pendingAdministrator.value = null;
}
function hasPermission(permission: PermissionCode) {
  const user = session.user as unknown as { permissions?: unknown };
  if (!Array.isArray(user?.permissions)) {
    return true;
  }

  return user.permissions.includes(permission);
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
.invitation-cell {
  display: grid;
  gap: 4px;
  justify-items: center;
}
.invitation-cell__info {
  color: var(--app-text-muted);
  font-size: 10px;
  line-height: 1.35;
  max-width: 210px;
  white-space: normal;
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
