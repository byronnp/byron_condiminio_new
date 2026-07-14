<template>
  <q-page class="usuarios-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Administradores de plataforma"
      subtitle="Administra los administradores senior de la plataforma."
      search-placeholder="Buscar por nombre, documento o correo..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nuevo usuario"
      action-icon="person_add"
      :show-filters="false"
      :show-sort="false"
      @cta-click="goToNewUser"
    >
      <template #stats>
        <AppStatsCards :cards="statsCards" />
      </template>

      <template #table>
        <q-banner v-if="loadError" rounded class="q-mb-md user-error-banner">
          <template #avatar>
            <q-icon name="error_outline" color="negative" />
          </template>
          {{ loadError }}
        </q-banner>

        <q-table
          flat
          bordered
          :rows="rows"
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
            <AppEmptyState
              icon="admin_panel_settings"
              title="No hay usuarios para mostrar"
              :text="emptyStateText"
              tight
            />
          </template>

          <template #body-cell-name="props">
            <q-td :props="props">
              <div class="entity-cell">
                <q-avatar rounded size="38px" class="entity-avatar">
                  {{ props.row.initials }}
                </q-avatar>
                <div>
                  <div class="entity-cell__title">{{ props.row.name }}</div>
                  <div class="entity-cell__subtitle">Administrador senior</div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-document="props">
            <q-td :props="props">
              <div class="stacked-cell">
                <strong>{{ props.row.documentNumber || '-' }}</strong>
                <span>{{ props.row.documentTypeName || 'Documento' }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-accessStatus="props">
            <q-td :props="props">
              <q-badge
                :color="accessStatusTone(props.row.accessStatus)"
                rounded
                class="status-badge"
              >
                {{ accessStatusLabel(props.row.accessStatus) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-invitation="props">
            <q-td :props="props">
              <div class="stacked-cell stacked-cell--center">
                <q-badge
                  :color="invitationTone(props.row.invitationStatus)"
                  outline
                  rounded
                  class="status-badge"
                >
                  {{ invitationStatusLabel(props.row.invitationStatus) }}
                </q-badge>
                <span v-if="invitationInfo(props.row)">{{ invitationInfo(props.row) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
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
                @click="showUserDetail(props.row)"
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
                @click="handleEditUser(props.row)"
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
                <q-menu anchor="bottom right" self="top right" class="table-actions-menu">
                  <q-card flat bordered class="table-actions-menu__card">
                    <q-list class="table-actions-menu__list">
                      <q-item
                        v-if="props.row.accessStatus === 'active'"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="requestUserAction('deactivate', props.row)"
                      >
                        <q-item-section avatar>
                          <q-avatar
                            size="32px"
                            class="table-actions-menu__avatar table-actions-menu__avatar--warning"
                          >
                            <q-icon name="person_off" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">
                            Desactivar acceso
                          </q-item-label>
                          <q-item-label caption>Bloquear acceso a la plataforma</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="props.row.accessStatus === 'inactive'"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="requestUserAction('activate', props.row)"
                      >
                        <q-item-section avatar>
                          <q-avatar
                            size="32px"
                            class="table-actions-menu__avatar table-actions-menu__avatar--positive"
                          >
                            <q-icon name="how_to_reg" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">
                            Reactivar acceso
                          </q-item-label>
                          <q-item-label caption>Permitir acceso a la plataforma</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-separator class="table-actions-menu__separator" />

                      <q-item
                        v-close-popup
                        clickable
                        class="table-actions-menu__item table-actions-menu__item--danger"
                        @click="requestUserAction('delete', props.row)"
                      >
                        <q-item-section avatar>
                          <q-avatar
                            size="32px"
                            class="table-actions-menu__avatar table-actions-menu__avatar--danger"
                          >
                            <q-icon name="delete_outline" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label
                            class="table-actions-menu__name table-actions-menu__name--danger"
                          >
                            Eliminar usuario
                          </q-item-label>
                          <q-item-label caption>Eliminar administrador de plataforma</q-item-label>
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
      v-model="confirmDialogOpen"
      :tone="confirmDialogTone"
      :icon="confirmDialogIcon"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :confirm-label="confirmDialogLabel"
      :loading="isProcessingAction"
      cancel-label="Cancelar"
      @confirm="confirmUserAction"
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
import AppStatsCards, { type AppStatsCard } from '@/components/shared/AppStatsCards.vue';
import {
  deletePlatformAdministrator,
  fetchPlatformAdministratorsPage,
  updatePlatformAdministratorStatus,
  type PlatformAccessStatus,
  type PlatformAdministratorListItem,
  type PlatformInvitationStatus,
} from '@/services/users.service';
import { useSessionStore } from '@/stores/session.store';

type UserRow = PlatformAdministratorListItem;
type UserAction = 'activate' | 'deactivate' | 'delete';
type DialogTone = 'primary' | 'positive' | 'negative' | 'warning';
type StatusFilter = 'all' | PlatformAccessStatus;

const router = useRouter();
const session = useSessionStore();

const search = ref('');
const statusFilter = ref<StatusFilter>('all');
const sortBy = ref('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({ page: 1, rowsPerPage: 10 });
const rows = ref<UserRow[]>([]);
const totalRows = ref(0);
const isLoadingRows = ref(false);
const loadError = ref('');
const confirmDialogOpen = ref(false);
const pendingAction = ref<UserAction | null>(null);
const pendingUser = ref<UserRow | null>(null);
const isProcessingAction = ref(false);
const alertDialogOpen = ref(false);
const alertDialog = ref<{
  tone: DialogTone;
  icon: string;
  title: string;
  message: string;
}>({
  tone: 'primary',
  icon: 'info',
  title: '',
  message: '',
});

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'document', label: 'Documento', field: 'documentNumber', align: 'left' as const },
  { name: 'email', label: 'Correo', field: 'email', align: 'left' as const },
  { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' as const },
  { name: 'accessStatus', label: 'Acceso', field: 'accessStatus', align: 'center' as const },
  { name: 'invitation', label: 'Invitación', field: 'invitationStatus', align: 'center' as const },
  { name: 'createdAt', label: 'Creado', field: 'createdAt', align: 'left' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statusOptions = [
  { label: 'Estado: Todos', value: 'all' },
  { label: 'Activo', value: 'active' },
  { label: 'Pendiente', value: 'pending_activation' },
  { label: 'Invitación expirada', value: 'invitation_expired' },
  { label: 'Invitación revocada', value: 'invitation_revoked' },
  { label: 'Inactivo', value: 'inactive' },
] as const;

const sortOptions = [{ label: 'Más recientes', value: 'recent' }] as const;

const statsCards = computed<AppStatsCard[]>(() => {
  const total = totalRows.value;
  const active = rows.value.filter((row) => row.accessStatus === 'active').length;
  const pending = rows.value.filter((row) => row.accessStatus === 'pending_activation').length;
  const inactive = rows.value.filter((row) => row.accessStatus === 'inactive').length;

  return [
    {
      label: 'Total usuarios',
      value: String(total),
      hint: 'Administradores senior',
      icon: 'manage_accounts',
    },
    {
      label: 'Activos',
      value: String(active),
      hint: 'Con acceso vigente',
      icon: 'verified_user',
    },
    {
      label: 'Pendientes',
      value: String(pending),
      hint: 'Esperando activación',
      icon: 'schedule',
    },
    {
      label: 'Inactivos',
      value: String(inactive),
      hint: 'Acceso deshabilitado',
      icon: 'person_off',
    },
  ];
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRows.value / pagination.value.rowsPerPage)),
);

const emptyStateText = computed(() => {
  if (loadError.value) return 'Revisa la conexión con el backend e intenta nuevamente.';
  if (search.value.trim() || statusFilter.value !== 'all') {
    return 'No encontramos administradores de plataforma con los criterios seleccionados.';
  }
  return 'Aún no se han registrado administradores de plataforma.';
});

const confirmDialogTitle = computed(() => {
  if (pendingAction.value === 'activate') return 'Reactivar usuario';
  if (pendingAction.value === 'deactivate') return 'Desactivar usuario';
  return 'Eliminar usuario';
});

const confirmDialogMessage = computed(() => {
  const name = pendingUser.value?.name ?? 'este usuario';

  if (pendingAction.value === 'activate') {
    return `¿Reactivar el acceso de "${name}"? Podrá ingresar nuevamente a la plataforma.`;
  }
  if (pendingAction.value === 'deactivate') {
    return `¿Desactivar el acceso de "${name}"? No podrá ingresar a la plataforma hasta ser reactivado.`;
  }

  return `¿Eliminar al administrador de plataforma "${name}"? Esta acción no se puede deshacer.`;
});

const confirmDialogTone = computed<DialogTone>(() =>
  pendingAction.value === 'activate'
    ? 'positive'
    : pendingAction.value === 'deactivate'
      ? 'warning'
      : 'negative',
);

const confirmDialogIcon = computed(() => {
  if (pendingAction.value === 'activate') return 'how_to_reg';
  if (pendingAction.value === 'deactivate') return 'person_off';
  return 'delete_outline';
});

const confirmDialogLabel = computed(() => {
  if (pendingAction.value === 'activate') return 'Reactivar';
  if (pendingAction.value === 'deactivate') return 'Desactivar';
  return 'Eliminar';
});

watch(
  () => [search.value, statusFilter.value, pagination.value.rowsPerPage] as const,
  () => {
    pagination.value.page = 1;
    void loadUsers();
  },
);

watch(
  () => pagination.value.page,
  () => {
    void loadUsers();
  },
);

onMounted(() => {
  void loadUsers();
  window.addEventListener('users:changed', handleUsersChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('users:changed', handleUsersChanged);
});

async function loadUsers() {
  isLoadingRows.value = true;
  loadError.value = '';

  try {
    const params = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      search: search.value,
      ...(statusFilter.value === 'all' ? {} : { status: statusFilter.value }),
    };
    const result = await fetchPlatformAdministratorsPage(params, session.accessToken);
    rows.value = result.items;
    totalRows.value = result.total;
    pagination.value.page = result.page;
    pagination.value.rowsPerPage = result.perPage;
  } catch (error) {
    rows.value = [];
    totalRows.value = 0;
    loadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los usuarios.';
  } finally {
    isLoadingRows.value = false;
  }
}

function handleUsersChanged() {
  void loadUsers();
}

function goToNewUser() {
  void router.push({ name: 'usuarios-nuevo' });
}

function handleEditUser(row: UserRow) {
  void router.push({ name: 'usuarios-editar', params: { id: String(row.id) } });
}

function requestUserAction(action: UserAction, row: UserRow) {
  pendingAction.value = action;
  pendingUser.value = row;
  confirmDialogOpen.value = true;
}

async function confirmUserAction() {
  const action = pendingAction.value;
  const user = pendingUser.value;

  if (!action || !user || isProcessingAction.value) return;

  isProcessingAction.value = true;

  try {
    const result =
      action === 'delete'
        ? await deletePlatformAdministrator(user.id, session.accessToken)
        : await updatePlatformAdministratorStatus(
            user.id,
            action === 'activate' ? 'active' : 'inactive',
            session.accessToken,
          );

    Notify.create({
      type: 'positive',
      message: result.message || buildActionSuccessMessage(action, user),
      position: 'top-right',
    });
    confirmDialogOpen.value = false;
    await loadUsers();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible completar la acción.',
      position: 'top-right',
    });
  } finally {
    isProcessingAction.value = false;
    if (!confirmDialogOpen.value) clearPendingAction();
  }
}

function clearPendingAction() {
  if (isProcessingAction.value) return;
  pendingAction.value = null;
  pendingUser.value = null;
}

function showUserDetail(row: UserRow) {
  openAlert({
    tone: 'primary',
    icon: 'admin_panel_settings',
    title: row.name,
    message: [
      `Documento: ${[row.documentTypeName, row.documentNumber].filter(Boolean).join(' ') || '-'}.`,
      `Correo: ${row.email}.`,
      `Teléfono: ${row.phone || '-'}.`,
      `Acceso: ${accessStatusLabel(row.accessStatus)}.`,
      `Invitación: ${invitationStatusLabel(row.invitationStatus)}.`,
    ].join(' '),
  });
}

function openAlert(config: { tone: DialogTone; icon: string; title: string; message: string }) {
  alertDialog.value = config;
  alertDialogOpen.value = true;
}

function accessStatusLabel(status: PlatformAccessStatus) {
  const labels: Record<PlatformAccessStatus, string> = {
    active: 'Activo',
    pending_activation: 'Pendiente',
    invitation_expired: 'Invitación expirada',
    invitation_revoked: 'Invitación revocada',
    inactive: 'Inactivo',
  };
  return labels[status];
}

function accessStatusTone(status: PlatformAccessStatus) {
  if (status === 'active') return 'positive';
  if (status === 'pending_activation') return 'warning';
  if (status === 'inactive') return 'grey-7';
  return 'negative';
}

function invitationStatusLabel(status: PlatformInvitationStatus) {
  const labels: Record<PlatformInvitationStatus, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    expired: 'Expirada',
    revoked: 'Revocada',
    none: 'Sin invitación',
  };
  return labels[status];
}

function invitationTone(status: PlatformInvitationStatus) {
  if (status === 'accepted') return 'positive';
  if (status === 'pending') return 'warning';
  if (status === 'expired' || status === 'revoked') return 'negative';
  return 'grey-7';
}

function invitationInfo(row: UserRow) {
  const invitation = row.invitation;
  if (!invitation) return '';

  if (invitation.acceptedAt) return `Aceptada: ${formatDate(invitation.acceptedAt)}`;
  if (invitation.revokedAt) return `Revocada: ${formatDate(invitation.revokedAt)}`;
  if (invitation.expiresAt) return `Expira: ${formatDate(invitation.expiresAt)}`;
  if (invitation.sentAt) return `Enviada: ${formatDate(invitation.sentAt)}`;
  return '';
}

function formatDate(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function buildActionSuccessMessage(action: UserAction, user: UserRow) {
  if (action === 'delete') return `${user.name} fue eliminado correctamente.`;
  if (action === 'activate') return `${user.name} fue reactivado correctamente.`;
  return `${user.name} fue desactivado correctamente.`;
}
</script>

<style scoped>
.usuarios-page {
  min-height: 100%;
}

.list-table {
  max-width: 100%;
}

.list-table :deep(.q-table__middle) {
  overflow-x: auto;
}

.list-table :deep(table) {
  min-width: 1080px;
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

.user-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
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

.entity-cell__subtitle,
.stacked-cell span {
  color: var(--app-text-muted);
  font-size: 11px;
  margin-top: 2px;
}

.stacked-cell {
  display: grid;
  gap: 2px;
}

.stacked-cell strong {
  color: var(--app-text);
  font-size: 12px;
}

.stacked-cell--center {
  justify-items: center;
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

.table-actions-menu__card {
  border: 0;
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  min-width: 300px;
  overflow: hidden;
}

.table-actions-menu__list {
  padding: 8px;
}

.table-actions-menu__item {
  border-radius: 12px;
  min-height: 54px;
}

.table-actions-menu__item--danger {
  color: var(--q-negative);
}

.table-actions-menu__avatar {
  background: rgba(37, 99, 235, 0.08);
  color: var(--app-primary);
}

.table-actions-menu__avatar--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.table-actions-menu__avatar--positive {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
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
