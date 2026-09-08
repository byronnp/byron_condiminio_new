<template>
  <q-page class="roles-page">
    <AppListPageShell
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:rowsPerPage="pagination.rowsPerPage"
      v-model:sortBy="sortBy"
      title="Roles"
      :subtitle="subtitleLabel"
      search-placeholder="Buscar rol por nombre o código..."
      :status-options="statusOptions"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-options="sortOptions"
      action-label="Nuevo rol"
      action-icon="add_moderator"
      :action-disabled="!canCreateRoles"
      :show-filters="false"
      @cta-click="goToNewRole"
    >
      <template #stats><AppStatsCards :cards="statsCards" /></template>
      <template #results>{{ resultsRangeLabel }}</template>
      <template #table>
        <q-banner v-if="!activeCondominiumId" rounded class="role-error-banner q-mb-md">
          <template #avatar> <q-icon name="apartment" color="warning" /> </template>
          Selecciona un condominio activo para gestionar sus roles.
        </q-banner>
        <q-banner v-if="loadError" rounded class="role-error-banner q-mb-md" role="alert">
          <template #avatar> <q-icon name="error_outline" color="negative" /> </template>
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
            <q-inner-loading showing> <q-spinner color="primary" size="32px" /> </q-inner-loading>
          </template>
          <template #no-data
            ><AppEmptyState
              icon="badge"
              title="No hay roles para mostrar"
              :text="
                loadError
                  ? 'Revisa la conexión con el backend e intenta nuevamente.'
                  : hasActiveFilters
                    ? 'No encontramos resultados con los criterios seleccionados.'
                    : 'Aún no se han registrado roles para este condominio.'
              "
          /></template>
          <template #body-cell-role="props">
            <q-td :props="props">
              <div class="entity-cell">
                <q-avatar rounded size="38px" class="entity-avatar">
                  <q-icon name="badge" size="20px" />
                </q-avatar>
                <div>
                  <div class="entity-cell__title">{{ props.row.name }}</div>
                  <div class="entity-cell__subtitle">{{ props.row.code }}</div>
                </div>
              </div>
            </q-td>
          </template>
          <template #body-cell-description="props">
            <q-td :props="props">
              <span class="description-cell">{{ props.value || 'Sin descripción' }}</span>
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="props.value ? 'positive' : 'grey-6'" rounded class="status-badge">
                {{ props.value ? 'Activo' : 'Inactivo' }}
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
                @click="showRoleDetail(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn
                v-if="canUpdateRoles"
                flat
                round
                dense
                icon="edit"
                class="table-icon"
                :aria-label="`Editar ${props.row.name}`"
                @click="goToEditRole(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                v-if="canUpdateRoles || canDeleteRoles"
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
                        v-if="canUpdateRoles && props.row.isActive"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="requestRoleAction('deactivate', props.row)"
                      >
                        <q-item-section avatar>
                          <span class="table-actions-menu__icon table-actions-menu__icon--warning">
                            <q-icon name="toggle_off" size="16px" />
                          </span>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name"
                            >Desactivar rol</q-item-label
                          >
                          <q-item-label caption
                            >Deja de ofrecer este rol para asignación</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="canUpdateRoles && !props.row.isActive"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="requestRoleAction('activate', props.row)"
                      >
                        <q-item-section avatar>
                          <span class="table-actions-menu__icon table-actions-menu__icon--positive">
                            <q-icon name="toggle_on" size="16px" />
                          </span>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">Activar rol</q-item-label>
                          <q-item-label caption
                            >Vuelve a ofrecer este rol para asignación</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator v-if="canDeleteRoles" class="table-actions-menu__separator" />
                      <q-item
                        v-if="canDeleteRoles"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item table-actions-menu__item--danger"
                        @click="requestRoleAction('delete', props.row)"
                      >
                        <q-item-section avatar>
                          <span class="table-actions-menu__icon table-actions-menu__icon--danger">
                            <q-icon name="delete_outline" size="16px" />
                          </span>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label
                            class="table-actions-menu__name table-actions-menu__name--danger"
                            >Eliminar rol</q-item-label
                          >
                          <q-item-label caption>Solo posible si no está en uso</q-item-label>
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
      @confirm="confirmRoleAction"
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
import { computed, onMounted, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';
import AppConfirmDialog from '@/components/general/AppConfirmDialog.vue';
import AppEntityDetailDialog from '@/components/general/AppEntityDetailDialog.vue';
import AppEmptyState from '@/components/shared/AppEmptyState.vue';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import AppStatsCards from '@/components/shared/AppStatsCards.vue';
import {
  deleteCondominiumRole,
  fetchCondominiumRolesForManagement,
  updateCondominiumRole,
  type CondominiumRoleItem,
} from '@/services/condominium-roles.service';
import { useSessionStore } from '@/stores/session.store';

type SortOption = 'name_asc' | 'name_desc' | 'code_asc';
type RoleAction = 'activate' | 'deactivate' | 'delete';
type DialogTone = 'primary' | 'positive' | 'negative' | 'warning';
type PermissionCode = 'roles.view' | 'roles.create' | 'roles.update' | 'roles.delete';

const router = useRouter();
const session = useSessionStore();

const search = ref('');
const statusFilter = ref<'Todos' | 'active' | 'inactive'>('Todos');
const sortBy = ref<SortOption>('name_asc');
const rowsPerPageOptions = [5, 10, 15, 20, 25] as const;
const pagination = ref({ page: 1, rowsPerPage: 10 });
const isLoadingRows = ref(false);
const loadError = ref('');
const rows = ref<CondominiumRoleItem[]>([]);

const confirmDialogOpen = ref(false);
const pendingAction = ref<RoleAction | null>(null);
const pendingRole = ref<CondominiumRoleItem | null>(null);
const isProcessingAction = ref(false);

const detailDialogOpen = ref(false);
const detailDialog = ref<{
  tone: DialogTone;
  icon: string;
  title: string;
  rows: { label: string; value: string }[];
}>({ tone: 'primary', icon: 'badge', title: '', rows: [] });

const columns = [
  { name: 'role', label: 'Rol', field: 'name', align: 'left' as const },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'isActive', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statusOptions = [
  { label: 'Estado: Todos', value: 'Todos' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
];

const sortOptions = [
  { label: 'Nombre A-Z', value: 'name_asc' },
  { label: 'Nombre Z-A', value: 'name_desc' },
  { label: 'Código A-Z', value: 'code_asc' },
] as const;

const activeCondominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});

const subtitleLabel = computed(() => {
  const name = session.activeCondominium?.name;
  return name
    ? `Roles configurados para ${name}.`
    : 'Selecciona un condominio para ver y administrar sus roles.';
});

const canViewRoles = computed(() => hasPermission('roles.view'));
const canCreateRoles = computed(
  () => activeCondominiumId.value !== null && hasPermission('roles.create'),
);
const canUpdateRoles = computed(() => hasPermission('roles.update'));
const canDeleteRoles = computed(() => hasPermission('roles.delete'));

const hasActiveFilters = computed(
  () => search.value.trim().length > 0 || statusFilter.value !== 'Todos',
);

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  let source = rows.value.filter((role) => {
    const matchesTerm =
      !term || role.name.toLowerCase().includes(term) || role.code.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter.value === 'Todos' ||
      (statusFilter.value === 'active' ? role.isActive : !role.isActive);
    return matchesTerm && matchesStatus;
  });

  source = [...source];
  if (sortBy.value === 'name_desc') {
    source.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortBy.value === 'code_asc') {
    source.sort((a, b) => a.code.localeCompare(b.code));
  } else {
    source.sort((a, b) => a.name.localeCompare(b.name));
  }

  return source;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pagination.value.rowsPerPage)),
);

const pagedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  return filteredRows.value.slice(start, start + pagination.value.rowsPerPage);
});

const resultsRangeLabel = computed(() => {
  const total = filteredRows.value.length;
  if (total === 0) {
    return '';
  }
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage + 1;
  const end = Math.min(total, start + pagination.value.rowsPerPage - 1);
  return `Mostrando ${start}-${end} de ${total}`;
});

const statsCards = computed(() => {
  const total = rows.value.length;
  const active = rows.value.filter((role) => role.isActive).length;
  const inactive = total - active;
  return [
    {
      label: 'Total de roles',
      value: String(total),
      hint: 'Registrados en este condominio',
      icon: 'badge',
    },
    {
      label: 'Activos',
      value: String(active),
      hint: 'Disponibles para asignar',
      icon: 'verified_user',
    },
    {
      label: 'Inactivos',
      value: String(inactive),
      hint: 'Fuera de asignación',
      icon: 'toggle_off',
    },
  ];
});

const confirmDialogTitle = computed(() => {
  if (pendingAction.value === 'activate') return 'Activar rol';
  if (pendingAction.value === 'deactivate') return 'Desactivar rol';
  return 'Eliminar rol';
});
const confirmDialogMessage = computed(() => {
  const name = pendingRole.value?.name ?? 'este rol';
  if (pendingAction.value === 'activate') {
    return `¿Activar el rol "${name}"? Volverá a estar disponible para asignarlo a administradores.`;
  }
  if (pendingAction.value === 'deactivate') {
    return `¿Desactivar el rol "${name}"? Dejará de estar disponible para nuevas asignaciones, pero no se elimina.`;
  }
  return `¿Eliminar el rol "${name}"? Esta acción no se puede deshacer. Si el rol está asignado a algún administrador, el backend puede rechazar la eliminación.`;
});
const confirmDialogTone = computed<DialogTone>(() =>
  pendingAction.value === 'activate'
    ? 'positive'
    : pendingAction.value === 'deactivate'
      ? 'warning'
      : 'negative',
);
const confirmDialogIcon = computed(() => {
  if (pendingAction.value === 'activate') return 'toggle_on';
  if (pendingAction.value === 'deactivate') return 'toggle_off';
  return 'delete_outline';
});
const confirmDialogLabel = computed(() => {
  if (pendingAction.value === 'activate') return 'Activar';
  if (pendingAction.value === 'deactivate') return 'Desactivar';
  return 'Eliminar';
});

watch(
  () => [search.value, statusFilter.value, sortBy.value] as const,
  () => {
    pagination.value.page = 1;
  },
);

watch(
  () => session.activeCondoId,
  () => {
    search.value = '';
    statusFilter.value = 'Todos';
    pagination.value.page = 1;
    void loadRoles();
  },
);

onMounted(() => {
  void loadRoles();
});

async function loadRoles() {
  const condominiumId = activeCondominiumId.value;
  if (!condominiumId) {
    rows.value = [];
    loadError.value = '';
    return;
  }

  if (!canViewRoles.value) {
    rows.value = [];
    loadError.value = 'No tienes permiso para ver los roles de este condominio.';
    return;
  }

  isLoadingRows.value = true;
  loadError.value = '';
  try {
    rows.value = await fetchCondominiumRolesForManagement(condominiumId, session.accessToken);
  } catch (error) {
    rows.value = [];
    loadError.value = error instanceof Error ? error.message : 'No fue posible cargar los roles.';
  } finally {
    isLoadingRows.value = false;
  }
}

function goToNewRole() {
  if (!canCreateRoles.value) return;
  void router.push({ name: 'roles-nuevo' });
}

function goToEditRole(role: CondominiumRoleItem) {
  if (!canUpdateRoles.value) return;
  void router.push({ name: 'roles-editar', params: { id: String(role.id) } });
}

function showRoleDetail(role: CondominiumRoleItem) {
  detailDialog.value = {
    tone: 'primary',
    icon: 'badge',
    title: role.name,
    rows: [
      { label: 'Código', value: role.code },
      { label: 'Descripción', value: role.description || 'Sin descripción' },
      { label: 'Estado', value: role.isActive ? 'Activo' : 'Inactivo' },
      {
        label: 'Permisos',
        value:
          role.permissionCodes.length > 0
            ? `${role.permissionCodes.length} asignados`
            : 'Sin permisos asignados',
      },
    ],
  };
  detailDialogOpen.value = true;
}

function requestRoleAction(action: RoleAction, role: CondominiumRoleItem) {
  if (
    (action === 'delete' && !canDeleteRoles.value) ||
    (action !== 'delete' && !canUpdateRoles.value)
  ) {
    return;
  }
  pendingAction.value = action;
  pendingRole.value = role;
  confirmDialogOpen.value = true;
}

async function confirmRoleAction() {
  const action = pendingAction.value;
  const role = pendingRole.value;
  if (!action || !role || isProcessingAction.value) return;
  isProcessingAction.value = true;
  try {
    const result = await executeRoleAction(action, role);
    Notify.create({
      type: 'positive',
      message: result.message || buildActionSuccessMessage(action, role),
      position: 'top-right',
    });
    confirmDialogOpen.value = false;
    await loadRoles();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error instanceof Error ? error.message : 'No fue posible completar la acción sobre el rol.',
      position: 'top-right',
    });
  } finally {
    isProcessingAction.value = false;
    if (!confirmDialogOpen.value) clearPendingAction();
  }
}

function executeRoleAction(action: RoleAction, role: CondominiumRoleItem) {
  const condominiumId = activeCondominiumId.value;
  if (!condominiumId) {
    throw new Error('Selecciona un condominio activo para completar la acción.');
  }

  if (action === 'delete') {
    return deleteCondominiumRole(condominiumId, role.id, session.accessToken);
  }

  return updateCondominiumRole(
    condominiumId,
    role.id,
    { isActive: action === 'activate' },
    session.accessToken,
  );
}

function buildActionSuccessMessage(action: RoleAction, role: CondominiumRoleItem) {
  if (action === 'delete') return `El rol "${role.name}" fue eliminado.`;
  if (action === 'activate') return `El rol "${role.name}" fue activado.`;
  return `El rol "${role.name}" fue desactivado.`;
}

function clearPendingAction() {
  if (isProcessingAction.value) return;
  pendingAction.value = null;
  pendingRole.value = null;
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
.roles-page {
  min-height: 100%;
}
.entity-cell {
  align-items: center;
  display: flex;
  gap: 12px;
}
.entity-cell__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
}
.entity-cell__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
}
.entity-avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}
.description-cell {
  color: var(--app-text-muted);
  font-size: 12px;
}
.status-badge {
  font-weight: 700;
}
.role-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}
.list-table :deep(table) {
  min-width: 640px;
}
.table-actions {
  white-space: nowrap;
}
.table-icon {
  color: var(--app-primary);
}
.table-footer__pagination :deep(.q-pagination__content) {
  gap: 6px;
}
</style>
