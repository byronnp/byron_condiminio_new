<template>
  <q-page class="usuarios-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Usuarios"
      subtitle="Administra los usuarios con acceso al condominio activo."
      search-placeholder="Buscar por nombre, documento o correo..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nuevo usuario"
      action-icon="person_add"
      :action-disabled="!activeCondominiumId"
      :show-filters="false"
      :show-sort="false"
      @cta-click="goToNewUser"
    >
      <template #stats>
        <AppStatsCards :cards="statsCards" />
      </template>

      <template #results>{{ resultsRangeLabel }}</template>

      <template #table>
        <q-banner v-if="!activeCondominiumId" rounded class="user-error-banner q-mb-md">
          <template #avatar>
            <q-icon name="apartment" color="warning" />
          </template>
          Selecciona un condominio activo para gestionar sus usuarios.
        </q-banner>

        <q-banner v-if="loadError" rounded class="user-error-banner q-mb-md">
          <template #avatar>
            <q-icon name="error_outline" color="negative" />
          </template>
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
            <q-inner-loading showing>
              <q-spinner color="primary" size="32px" />
            </q-inner-loading>
          </template>

          <template #no-data>
            <AppEmptyState
              icon="manage_accounts"
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
                  <div class="entity-cell__subtitle">{{ props.row.email }}</div>
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

          <template #body-cell-role="props">
            <q-td :props="props">
              <q-badge outline color="primary" class="status-badge">
                {{ roleLabel(props.row) }}
              </q-badge>
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
                <q-menu
                  anchor="bottom right"
                  self="top right"
                  transition-show="scale"
                  transition-hide="scale"
                  class="table-actions-menu"
                >
                  <q-card flat class="table-actions-menu__card">
                    <q-list class="table-actions-menu__list">
                      <q-item
                        v-if="props.row.accessStatus === 'active'"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="requestUserAction('deactivate', props.row)"
                      >
                        <q-item-section avatar>
                          <span class="table-actions-menu__icon table-actions-menu__icon--warning">
                            <q-icon name="person_off" size="16px" />
                          </span>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">
                            Desactivar acceso
                          </q-item-label>
                          <q-item-label caption>Bloquear acceso al condominio</q-item-label>
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
                          <span class="table-actions-menu__icon table-actions-menu__icon--positive">
                            <q-icon name="how_to_reg" size="16px" />
                          </span>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">
                            Reactivar acceso
                          </q-item-label>
                          <q-item-label caption>Permitir acceso al condominio</q-item-label>
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

    <AppEntityDetailDialog
      v-model="detailDialogOpen"
      :tone="detailDialog.tone"
      :icon="detailDialog.icon"
      :title="detailDialog.title"
      :rows="detailDialog.rows"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';

import AppConfirmDialog from '@/components/general/AppConfirmDialog.vue';
import AppEntityDetailDialog from '@/components/general/AppEntityDetailDialog.vue';
import AppEmptyState from '@/components/shared/AppEmptyState.vue';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import AppStatsCards, { type AppStatsCard } from '@/components/shared/AppStatsCards.vue';
import {
  fetchUsers,
  updateUserStatus,
  type UserAccessStatus,
  type UserListItem,
} from '@/services/users.service';
import { useSessionStore } from '@/stores/session.store';

type UserRow = UserListItem;
type UserAction = 'activate' | 'deactivate';
type DialogTone = 'primary' | 'positive' | 'negative' | 'warning';
type StatusFilter = 'Todos' | UserAccessStatus;

const router = useRouter();
const session = useSessionStore();

const search = ref('');
const statusFilter = ref<StatusFilter>('Todos');
const sortBy = ref('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({ page: 1, rowsPerPage: 10 });
const allRows = ref<UserRow[]>([]);
const isLoadingRows = ref(false);
const loadError = ref('');
const confirmDialogOpen = ref(false);
const pendingAction = ref<UserAction | null>(null);
const pendingUser = ref<UserRow | null>(null);
const isProcessingAction = ref(false);
const detailDialogOpen = ref(false);
const detailDialog = ref<{
  tone: DialogTone;
  icon: string;
  title: string;
  rows: { label: string; value: string }[];
}>({
  tone: 'primary',
  icon: 'info',
  title: '',
  rows: [],
});

const activeCondominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'document', label: 'Documento', field: 'documentNumber', align: 'left' as const },
  { name: 'role', label: 'Rol', field: 'role', align: 'left' as const },
  { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' as const },
  { name: 'accessStatus', label: 'Acceso', field: 'accessStatus', align: 'center' as const },
  { name: 'createdAt', label: 'Creado', field: 'createdAt', align: 'left' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
];

const sortOptions = [{ label: 'Más recientes', value: 'recent' }] as const;

const statsCards = computed<AppStatsCard[]>(() => {
  const total = allRows.value.length;
  const active = allRows.value.filter((row) => row.accessStatus === 'active').length;
  const inactive = allRows.value.filter((row) => row.accessStatus === 'inactive').length;

  return [
    {
      label: 'Total usuarios',
      value: String(total),
      hint: 'En el condominio activo',
      icon: 'manage_accounts',
    },
    {
      label: 'Activos',
      value: String(active),
      hint: 'Con acceso vigente',
      icon: 'verified_user',
    },
    {
      label: 'Inactivos',
      value: String(inactive),
      hint: 'Acceso deshabilitado',
      icon: 'person_off',
    },
  ];
});

const normalizedSearch = computed(() => search.value.trim().toLowerCase());
const filteredRows = computed(() => {
  return allRows.value.filter((row) => {
    if (statusFilter.value !== 'Todos' && row.accessStatus !== statusFilter.value) {
      return false;
    }
    if (normalizedSearch.value) {
      const haystack = `${row.name} ${row.email} ${row.documentNumber}`.toLowerCase();
      if (!haystack.includes(normalizedSearch.value)) {
        return false;
      }
    }
    return true;
  });
});

const totalItems = computed(() => filteredRows.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pagination.value.rowsPerPage)),
);
const pagedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  return filteredRows.value.slice(start, start + pagination.value.rowsPerPage);
});
const resultsRangeLabel = computed(() => {
  const total = totalItems.value;
  if (total === 0) return 'Sin resultados';
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage + 1;
  const end = Math.min(start + pagination.value.rowsPerPage - 1, total);
  return `Mostrando ${start}-${end} de ${total}`;
});

const emptyStateText = computed(() => {
  if (loadError.value) return 'Revisa la conexión con el backend e intenta nuevamente.';
  if (search.value.trim() || statusFilter.value !== 'Todos') {
    return 'No encontramos usuarios con los criterios seleccionados.';
  }
  return 'Aún no se han registrado usuarios en este condominio.';
});

const confirmDialogTitle = computed(() =>
  pendingAction.value === 'activate' ? 'Reactivar usuario' : 'Desactivar usuario',
);

const confirmDialogMessage = computed(() => {
  const name = pendingUser.value?.name ?? 'este usuario';

  if (pendingAction.value === 'activate') {
    return `¿Reactivar el acceso de "${name}"? Podrá ingresar nuevamente al condominio.`;
  }
  return `¿Desactivar el acceso de "${name}"? No podrá ingresar al condominio hasta ser reactivado.`;
});

const confirmDialogTone = computed<DialogTone>(() =>
  pendingAction.value === 'activate' ? 'positive' : 'warning',
);

const confirmDialogIcon = computed(() =>
  pendingAction.value === 'activate' ? 'how_to_reg' : 'person_off',
);

const confirmDialogLabel = computed(() =>
  pendingAction.value === 'activate' ? 'Reactivar' : 'Desactivar',
);

watch(
  () => [search.value, statusFilter.value, pagination.value.rowsPerPage] as const,
  () => {
    pagination.value.page = 1;
  },
);

watch(totalPages, (pages) => {
  if (pagination.value.page > pages) {
    pagination.value.page = pages;
  }
});

watch(activeCondominiumId, () => {
  void loadUsers();
});

onMounted(() => {
  void loadUsers();
  window.addEventListener('users:changed', handleUsersChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('users:changed', handleUsersChanged);
});

async function loadUsers() {
  const condominiumId = activeCondominiumId.value;
  if (!condominiumId) {
    allRows.value = [];
    return;
  }

  isLoadingRows.value = true;
  loadError.value = '';

  try {
    const result = await fetchUsers({ condominiumId }, session.accessToken);
    allRows.value = result.items;
  } catch (error) {
    allRows.value = [];
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
    const result = await updateUserStatus(user.id, action === 'activate', session.accessToken);

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
  detailDialog.value = {
    tone: 'primary',
    icon: 'manage_accounts',
    title: row.name,
    rows: [
      {
        label: 'Documento',
        value: [row.documentTypeName, row.documentNumber].filter(Boolean).join(' ') || '-',
      },
      { label: 'Correo', value: row.email },
      { label: 'Teléfono', value: row.phone || '-' },
      { label: 'Rol', value: roleLabel(row) },
      { label: 'Acceso', value: accessStatusLabel(row.accessStatus) },
    ],
  };
  detailDialogOpen.value = true;
}

function roleLabel(row: UserRow) {
  const assignment =
    row.assignments.find((item) => item.condominiumId === activeCondominiumId.value) ??
    row.assignments[0];
  return assignment?.roleName || 'Sin rol';
}

function accessStatusLabel(status: UserAccessStatus) {
  return status === 'active' ? 'Activo' : 'Inactivo';
}

function accessStatusTone(status: UserAccessStatus) {
  return status === 'active' ? 'positive' : 'grey-7';
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

.list-table :deep(table) {
  min-width: 1000px;
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

.status-badge {
  font-weight: 700;
}

.table-actions {
  white-space: nowrap;
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
