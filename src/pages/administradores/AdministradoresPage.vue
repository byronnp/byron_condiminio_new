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
        <q-banner v-if="loadError" rounded class="q-mb-md admin-error-banner">
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
                    ? 'Revisa la conexion con el backend e intenta nuevamente.'
                    : hasActiveFilters
                      ? 'No encontramos resultados con los criterios seleccionados.'
                      : 'Aun no se han registrado administradores en la plataforma.'
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

          <template #body-cell-actions="props">
            <q-td :props="props" class="table-actions">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                class="table-icon"
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
                @click="handleEditAdministrator(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="more_horiz" class="table-icon">
                <q-tooltip>Más acciones</q-tooltip>
                <q-menu
                  anchor="bottom right"
                  self="top right"
                  class="table-actions-menu"
                  content-class="table-actions-menu__popup"
                >
                  <q-card flat bordered class="table-actions-menu__card">
                    <q-list class="table-actions-menu__list">
                      <q-item
                        v-if="props.row.status === 'Pendiente'"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="resendInvitation(props.row)"
                      >
                        <q-item-section avatar>
                          <q-avatar size="32px" class="table-actions-menu__avatar">
                            <q-icon name="forward_to_inbox" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="table-actions-menu__name">
                            Reenviar invitación
                          </q-item-label>
                          <q-item-label caption>
                            Enviar nuevamente el acceso al correo
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="props.row.status === 'Activo'"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="requestAdministratorAction('suspend', props.row)"
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
                            Suspender acceso
                          </q-item-label>
                          <q-item-label caption> Bloquear temporalmente esta cuenta </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="props.row.status === 'Suspendido'"
                        v-close-popup
                        clickable
                        class="table-actions-menu__item"
                        @click="requestAdministratorAction('reactivate', props.row)"
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
                          <q-item-label caption> Habilitar nuevamente esta cuenta </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-separator class="table-actions-menu__separator" />

                      <q-item
                        v-close-popup
                        clickable
                        class="table-actions-menu__item table-actions-menu__item--danger"
                        @click="requestAdministratorAction('delete', props.row)"
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
                            Eliminar administrador
                          </q-item-label>
                          <q-item-label caption>
                            Eliminar esta cuenta de forma permanente
                          </q-item-label>
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
import { useRouter } from 'vue-router';

import AppAlertDialog from '@/components/general/AppAlertDialog.vue';
import AppConfirmDialog from '@/components/general/AppConfirmDialog.vue';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import {
  fetchAdministrators,
  type AdministratorListItem,
} from '@/services/administrators.service';
import { useSessionStore } from '@/stores/session.store';

type AdminRow = AdministratorListItem;

type SortOption = 'recent' | 'oldest' | 'name';
type AdministratorAction = 'suspend' | 'reactivate' | 'delete';
type DialogTone = 'primary' | 'positive' | 'negative' | 'warning';

const search = ref('');
const router = useRouter();
const session = useSessionStore();
const statusFilter = ref<'Todos' | 'Activo' | 'Pendiente' | 'Suspendido'>('Todos');
const sortBy = ref<SortOption>('recent');
const rowsPerPageOptions = [10, 20, 50] as const;
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});
const isLoadingRows = ref(false);
const loadError = ref('');
const confirmDialogOpen = ref(false);
const pendingAction = ref<AdministratorAction | null>(null);
const pendingAdministrator = ref<AdminRow | null>(null);
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

const rows = ref<AdminRow[]>([]);

const columns = [
  { name: 'admin', label: 'Administrador', field: 'name', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
  { name: 'scope', label: 'Alcance', field: 'scope', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const },
];

const statsCards = computed(() => {
  const total = rows.value.length;
  const senior = rows.value.filter((row) => row.type === 'Senior').length;
  const condominiumAdmins = rows.value.filter(
    (row) => row.type === 'Administrador de condominio',
  ).length;
  const pending = rows.value.filter((row) => row.status === 'Pendiente').length;
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
      hint: 'Todas las cuentas registradas',
      icon: 'manage_accounts',
    },
    {
      label: 'Administradores senior',
      value: String(senior),
      hint: 'Con acceso global',
      icon: 'public',
    },
    {
      label: 'Admins. de condominio',
      value: String(condominiumAdmins),
      hint: 'Con acceso asignado',
      icon: 'apartment',
    },
    {
      label: 'Invitaciones pendientes',
      value: String(pending),
      hint: 'Por completar activacion',
      icon: 'schedule',
    },
  ].map((card, index) => ({
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

  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'Todos' || row.status === statusFilter.value;
    const matchesQuery =
      !query ||
      row.name.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.type.toLowerCase().includes(query) ||
      row.scope.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });
});

const hasActiveFilters = computed(
  () => search.value.trim().length > 0 || statusFilter.value !== 'Todos',
);

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
    return `¿Reactivar el acceso de "${name}"? La cuenta volverá a estar disponible inmediatamente.`;
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
  if (status === 'Pendiente') return 'warning';
  return 'negative';
}

function goToNewAdministrator() {
  void router.push({ name: 'administradores-nuevo' });
}

function openAlert(config: { tone: DialogTone; icon: string; title: string; message: string }) {
  alertDialog.value = config;
  alertDialogOpen.value = true;
}

function showAdministratorDetail(row: AdminRow) {
  const scopeDescription =
    row.type === 'Senior' ? 'acceso global a todos los condominios' : `asignado a ${row.scope}`;

  openAlert({
    tone: 'primary',
    icon: row.type === 'Senior' ? 'public' : 'manage_accounts',
    title: row.name,
    message: `${row.email}. ${row.type}, ${scopeDescription}. Estado actual: ${row.status}.`,
  });
}

function handleEditAdministrator(row: AdminRow) {
  void router.push({
    name: 'administradores-editar',
    params: {
      id: String(row.id),
    },
  });
}

function resendInvitation(row: AdminRow) {
  openAlert({
    tone: 'positive',
    icon: 'mark_email_read',
    title: 'Invitación reenviada',
    message: `Se preparó una nueva invitación para ${row.email}. La integración con el envío real se conectará mediante el servicio de administradores.`,
  });
}

function requestAdministratorAction(action: AdministratorAction, row: AdminRow) {
  pendingAction.value = action;
  pendingAdministrator.value = row;
  confirmDialogOpen.value = true;
}

function confirmAdministratorAction() {
  const action = pendingAction.value;
  const administrator = pendingAdministrator.value;

  if (!action || !administrator) {
    confirmDialogOpen.value = false;
    clearPendingAction();
    return;
  }

  if (action === 'delete') {
    const index = rows.value.findIndex((row) => row.id === administrator.id);
    if (index >= 0) {
      rows.value.splice(index, 1);
    }

    showActionResult(
      'Administrador eliminado',
      `${administrator.name} fue eliminado del listado local.`,
      'delete_sweep',
    );
  } else {
    administrator.status = action === 'suspend' ? 'Suspendido' : 'Activo';
    showActionResult(
      action === 'suspend' ? 'Acceso suspendido' : 'Acceso reactivado',
      `${administrator.name} ahora se encuentra ${administrator.status.toLowerCase()}.`,
      action === 'suspend' ? 'person_off' : 'how_to_reg',
    );
  }

  confirmDialogOpen.value = false;
  clearPendingAction();
}

function showActionResult(title: string, message: string, icon: string) {
  openAlert({
    tone: 'positive',
    icon,
    title,
    message,
  });
}

function clearPendingAction() {
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

.admin-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
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

.empty-state .q-icon {
  color: var(--app-primary);
}

.empty-state__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.empty-state__text {
  font-size: 11px;
  line-height: 1.45;
  max-width: 360px;
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

.scope-cell {
  align-items: center;
  display: flex;
  gap: 9px;
}

.scope-cell > .q-icon {
  color: var(--app-primary);
  flex-shrink: 0;
}

.scope-cell__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.scope-cell__hint {
  color: var(--app-text-muted);
  font-size: 10px;
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

.table-actions-menu__popup {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
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
