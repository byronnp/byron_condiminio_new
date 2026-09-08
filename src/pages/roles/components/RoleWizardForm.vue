<template>
  <q-page class="role-wizard-page">
    <div class="page-shell">
      <header class="page-header">
        <div>
          <h1 class="page-header__title">{{ pageTitle }}</h1>
          <p class="page-header__subtitle">{{ pageSubtitle }}</p>
        </div>

        <q-btn
          flat
          no-caps
          label="Volver"
          icon="arrow_back"
          aria-label="Volver al listado de roles"
          @click="goBack"
        />
      </header>

      <q-banner v-if="!activeCondominiumId" rounded class="initial-load-error" role="alert">
        <template #avatar>
          <q-icon name="apartment" color="warning" />
        </template>
        Selecciona un condominio activo para gestionar roles.
      </q-banner>

      <q-banner v-if="initialLoadError" rounded class="initial-load-error" role="alert">
        <template #avatar>
          <q-icon name="error_outline" color="negative" />
        </template>
        <div class="initial-load-error__content">
          <span>{{ initialLoadError }}</span>
          <q-btn
            flat
            dense
            no-caps
            label="Reintentar"
            :loading="isLoadingRole"
            @click="loadRoleForEdit"
          />
        </div>
      </q-banner>

      <q-card flat bordered class="wizard-frame">
        <q-inner-loading :showing="isLoadingRole">
          <q-spinner color="primary" size="34px" />
        </q-inner-loading>

        <AppStepper :steps="steps" :current-step="activeStep" @select="handleStepSelect" />
        <q-separator class="wizard-divider" />

        <div class="wizard-layout">
          <section class="wizard-main">
            <transition name="fade-slide" mode="out-in">
              <div :key="activeStep" class="wizard-stage">
                <q-form v-if="activeStep === 'general'" ref="generalFormRef" class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Datos generales</div>
                    <div class="section-subtitle">
                      Define el nombre, el código y la descripción del rol.
                    </div>

                    <div class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="badge" size="18px" />
                        <div>
                          <div class="field-group__title">Identificación del rol</div>
                          <div class="field-group__hint">
                            El código no se podrá modificar una vez creado el rol.
                          </div>
                        </div>
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input
                          v-model="form.name"
                          dense
                          outlined
                          hide-bottom-space
                          label="Nombre *"
                          maxlength="80"
                          hint="Por ejemplo: Tesorero, Conserje, Administrador de condominio."
                          :rules="[
                            (value: string) =>
                              isRoleNameValid(value) ||
                              'Ingresa un nombre de al menos 2 caracteres',
                          ]"
                        />
                        <q-input
                          v-model="form.code"
                          dense
                          outlined
                          hide-bottom-space
                          label="Código *"
                          maxlength="40"
                          :disable="isEditMode"
                          :hint="
                            isEditMode
                              ? 'No se puede modificar en modo edición.'
                              : 'Identificador único, sin espacios. Por ejemplo: tesorero.'
                          "
                          :rules="[
                            (value: string) =>
                              isRoleCodeValid(value) ||
                              'Usa solo letras, números, guiones y guion bajo (2 a 40 caracteres)',
                          ]"
                        />
                      </div>
                    </div>

                    <div class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="description" size="18px" />
                        <div>
                          <div class="field-group__title">Descripción y estado</div>
                          <div class="field-group__hint">
                            Opcional. Ayuda a entender para qué se usa este rol.
                          </div>
                        </div>
                      </div>

                      <div class="form-grid form-grid--single q-mt-md">
                        <q-input
                          v-model="form.description"
                          dense
                          outlined
                          type="textarea"
                          autogrow
                          hide-bottom-space
                          label="Descripción"
                          maxlength="240"
                        />
                        <q-toggle v-model="form.isActive" color="primary" label="Rol activo" />
                      </div>
                    </div>
                  </div>
                </q-form>

                <div v-else-if="activeStep === 'permissions'" class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Permisos</div>
                    <div class="section-subtitle">
                      Selecciona qué puede hacer este rol en cada módulo. Marca un módulo completo o
                      expándelo para elegir acciones puntuales.
                    </div>

                    <div class="permissions-panel q-mt-md">
                      <q-banner
                        v-if="permissionsLoadError"
                        rounded
                        class="submit-error-banner q-mb-md"
                        role="alert"
                      >
                        <template #avatar>
                          <q-icon name="error_outline" color="negative" />
                        </template>
                        <div class="initial-load-error__content">
                          <span>{{ permissionsLoadError }}</span>
                          <q-btn
                            flat
                            dense
                            no-caps
                            label="Reintentar"
                            :loading="isLoadingPermissions"
                            @click="loadPermissionsCatalog"
                          />
                        </div>
                      </q-banner>

                      <div v-if="isLoadingPermissions" class="permissions-loading">
                        <q-spinner color="primary" size="28px" />
                      </div>

                      <q-tree
                        v-else-if="permissionsTree.length > 0"
                        v-model:ticked="form.permissionCodes"
                        :nodes="permissionsTree"
                        node-key="key"
                        tick-strategy="leaf"
                        dense
                      />

                      <AppEmptyState
                        v-else-if="!permissionsLoadError"
                        icon="verified_user"
                        title="No hay permisos disponibles"
                        text="El catálogo de permisos aún no tiene elementos configurados."
                        tight
                      />
                    </div>
                  </div>
                </div>

                <div v-else class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Revisión y confirmación</div>
                    <div class="section-subtitle">
                      Verifica la información antes de guardar el rol.
                    </div>

                    <q-banner
                      v-if="submitError"
                      rounded
                      class="submit-error-banner q-mt-md"
                      role="alert"
                    >
                      <template #avatar>
                        <q-icon name="error_outline" color="negative" />
                      </template>
                      {{ submitError }}
                    </q-banner>

                    <div class="review-grid q-mt-md">
                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="badge" size="18px" />
                          <span>Datos generales</span>
                        </div>
                        <div class="review-card__list">
                          <div>
                            <span>Nombre</span><strong>{{ form.name || '-' }}</strong>
                          </div>
                          <div>
                            <span>Código</span><strong>{{ form.code || '-' }}</strong>
                          </div>
                          <div>
                            <span>Descripción</span>
                            <strong>{{ form.description || 'Sin descripción' }}</strong>
                          </div>
                          <div>
                            <span>Estado</span>
                            <strong>{{ form.isActive ? 'Activo' : 'Inactivo' }}</strong>
                          </div>
                          <div>
                            <span>Condominio</span><strong>{{ selectedCondominiumName }}</strong>
                          </div>
                        </div>
                      </div>

                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="verified_user" size="18px" />
                          <span>Permisos ({{ form.permissionCodes.length }})</span>
                        </div>
                        <div v-if="form.permissionCodes.length === 0" class="review-card__empty">
                          No se seleccionó ningún permiso para este rol.
                        </div>
                        <div v-else class="review-card__list">
                          <div v-for="code in form.permissionCodes" :key="code">
                            <span>{{ findPermissionLabel(permissionsCatalogItems, code) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <div class="wizard-footer">
              <q-btn flat no-caps label="Cancelar" class="footer-btn" @click="goBack" />
              <div class="wizard-footer__actions">
                <q-btn
                  flat
                  no-caps
                  label="Anterior"
                  icon="arrow_back"
                  class="footer-btn"
                  :disable="activeStepIndex === 0 || isLoadingRole"
                  @click="previousStep"
                />
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  class="footer-btn footer-btn--primary"
                  :label="primaryActionLabel"
                  :icon="activeStep === 'review' ? 'check' : 'arrow_forward'"
                  :loading="isSubmitting"
                  :disable="
                    isSubmitting ||
                    isLoadingRole ||
                    Boolean(initialLoadError) ||
                    !activeCondominiumId
                  "
                  @click="handlePrimaryAction"
                />
              </div>
            </div>
          </section>

          <aside class="wizard-summary">
            <div class="summary-card">
              <div class="summary-card__header">
                <div class="summary-avatar">
                  <q-icon name="badge" size="20px" />
                </div>
                <div>
                  <div class="summary-title">Resumen del rol</div>
                  <div class="summary-subtitle">La información se actualiza automáticamente</div>
                </div>
              </div>

              <div class="summary-name">{{ form.name || 'Nombre del rol' }}</div>
              <div class="summary-email">{{ form.code || 'codigo-del-rol' }}</div>
              <q-separator class="summary-separator" />
              <div class="summary-meta">
                <span>Condominio</span><strong>{{ selectedCondominiumName }}</strong>
              </div>
              <div class="summary-meta">
                <span>Estado</span>
                <q-badge :color="form.isActive ? 'positive' : 'grey-6'" rounded>
                  {{ form.isActive ? 'Activo' : 'Inactivo' }}
                </q-badge>
              </div>
              <div class="summary-meta">
                <span>Permisos</span>
                <strong>{{ form.permissionCodes.length }}</strong>
              </div>
            </div>

            <div class="summary-note">
              <q-icon name="mail_lock" size="20px" />
              <div>
                <div class="summary-note__title">Contrato del backend</div>
                <div class="summary-note__text">
                  El catálogo de permisos es provisional y se define en el frontend hasta confirmar
                  el contrato real con el backend.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Notify, type QForm } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import AppStepper from '@/components/shared/AppStepper.vue';
import AppEmptyState from '@/components/shared/AppEmptyState.vue';
import {
  createCondominiumRole,
  fetchCondominiumRoleById,
  updateCondominiumRole,
  type CondominiumRoleItem,
} from '@/services/condominium-roles.service';
import {
  fetchPermissionsCatalog,
  findPermissionLabel,
  groupPermissionsCatalog,
  type PermissionCatalogItem,
} from '@/services/permissions.service';
import {
  buildCondominiumRolePayload,
  createEmptyRoleForm,
  isRoleCodeValid,
  isRoleFormValid,
  isRoleNameValid,
  type RoleFormData,
} from '@/composables/roles/roles-payload';
import { useSessionStore } from '@/stores/session.store';

type StepKey = 'general' | 'permissions' | 'review';
type PermissionTreeNode = {
  key: string;
  label: string;
  icon?: string;
  children?: PermissionTreeNode[];
};

const permissionGroupIcons: Record<string, string> = {
  condominiums: 'apartment',
  condominios: 'apartment',
  users: 'manage_accounts',
  usuarios: 'manage_accounts',
  administrators: 'admin_panel_settings',
  administradores: 'admin_panel_settings',
  roles: 'assignment_ind',
  units: 'domain',
  unidades: 'domain',
  owners: 'groups',
  propietarios: 'groups',
  residents: 'badge',
  residentes: 'badge',
  payments: 'paid',
  pagos: 'paid',
  reservations: 'event_available',
  reservas: 'event_available',
  maintenance: 'handyman',
  mantenimiento: 'handyman',
  mantenimientos: 'handyman',
  announcements: 'campaign',
  comunicados: 'campaign',
  visitors: 'badge',
  visitantes: 'badge',
  reports: 'summarize',
  reportes: 'summarize',
  settings: 'settings',
  configuracion: 'settings',
};

const props = withDefaults(defineProps<{ mode?: 'create' | 'edit' }>(), { mode: 'create' });
const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const generalFormRef = ref<QForm | null>(null);
const activeStep = ref<StepKey>('general');
const isSubmitting = ref(false);
const submitError = ref('');
const isLoadingRole = ref(false);
const initialLoadError = ref('');
const isLoadingPermissions = ref(false);
const permissionsLoadError = ref('');
const permissionsCatalogItems = ref<PermissionCatalogItem[]>([]);

const steps = [
  { key: 'general', label: 'Datos generales' },
  { key: 'permissions', label: 'Permisos' },
  { key: 'review', label: 'Revisión' },
] as const;

const form = ref<RoleFormData>(createEmptyRoleForm());
const isEditMode = computed(() => props.mode === 'edit');
const activeStepIndex = computed(() => steps.findIndex((step) => step.key === activeStep.value));
const activeCondominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});
const selectedCondominiumName = computed(
  () => session.activeCondominium?.name ?? 'Sin condominio activo',
);
const roleId = computed(() => {
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  const id = typeof rawId === 'string' ? Number(rawId) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
});
const pageTitle = computed(() => (isEditMode.value ? 'Editar rol' : 'Crear nuevo rol'));
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Actualiza la información y los permisos del rol dentro del condominio activo.'
    : 'Registra un nuevo rol y define qué puede hacer dentro del condominio activo.',
);
const primaryActionLabel = computed(() =>
  activeStep.value === 'review'
    ? isEditMode.value
      ? 'Guardar cambios'
      : 'Crear rol'
    : 'Siguiente',
);
const permissionsTree = computed<PermissionTreeNode[]>(() =>
  groupPermissionsCatalog(permissionsCatalogItems.value).map((group) => ({
    key: `group:${group.key}`,
    label: group.label,
    icon: permissionGroupIcons[group.key] ?? 'verified_user',
    children: group.permissions.map((permission) => ({
      key: permission.code,
      label: permission.label,
    })),
  })),
);

onMounted(async () => {
  await loadPermissionsCatalog();
  if (isEditMode.value) {
    await loadRoleForEdit();
  }
});

function stepIndex(step: StepKey) {
  return steps.findIndex((item) => item.key === step);
}

async function goToStep(step: StepKey) {
  const targetIndex = stepIndex(step);
  if (targetIndex <= activeStepIndex.value) {
    activeStep.value = step;
    return;
  }

  if (targetIndex === activeStepIndex.value + 1 && (await validateStep(activeStep.value))) {
    activeStep.value = step;
  }
}

function handleStepSelect(step: string | number) {
  if (typeof step === 'string') void goToStep(step as StepKey);
}

function previousStep() {
  activeStep.value = steps[Math.max(0, activeStepIndex.value - 1)]?.key ?? 'general';
}

function nextStep() {
  activeStep.value = steps[Math.min(steps.length - 1, activeStepIndex.value + 1)]?.key ?? 'review';
}

async function validateStep(step: StepKey) {
  if (step === 'general') return Boolean(await generalFormRef.value?.validate());
  if (step === 'permissions') return true;

  return isRoleFormValid(form.value) && activeCondominiumId.value !== null;
}

async function handlePrimaryAction() {
  if (!(await validateStep(activeStep.value))) return;
  if (activeStep.value === 'review') {
    await submitRole();
    return;
  }

  nextStep();
}

async function loadPermissionsCatalog() {
  isLoadingPermissions.value = true;
  permissionsLoadError.value = '';
  try {
    permissionsCatalogItems.value = await fetchPermissionsCatalog(session.accessToken);
  } catch (error) {
    permissionsCatalogItems.value = [];
    permissionsLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar el catálogo de permisos.';
  } finally {
    isLoadingPermissions.value = false;
  }
}

async function submitRole() {
  if (isSubmitting.value) return;
  if (!isRoleFormValid(form.value)) {
    submitError.value = 'Completa la información requerida antes de guardar.';
    return;
  }

  const condominiumId = activeCondominiumId.value;
  if (!condominiumId) {
    submitError.value = 'Selecciona un condominio activo para guardar.';
    return;
  }

  isSubmitting.value = true;
  submitError.value = '';

  try {
    const payload = buildCondominiumRolePayload(form.value);
    const id = roleId.value;
    const result =
      isEditMode.value && id !== null
        ? await updateCondominiumRole(condominiumId, id, payload, session.accessToken)
        : await createCondominiumRole(condominiumId, payload, session.accessToken);

    if (!result.success) throw new Error(result.message);
    Notify.create({
      type: 'positive',
      message: result.message || 'Rol guardado correctamente.',
      position: 'top-right',
    });
    await router.push({ name: 'roles' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible guardar el rol.';
    submitError.value = message;
    Notify.create({ type: 'negative', message, position: 'top-right' });
  } finally {
    isSubmitting.value = false;
  }
}

async function loadRoleForEdit() {
  const id = roleId.value;
  const condominiumId = activeCondominiumId.value;
  if (!isEditMode.value) return;
  if (id === null) {
    initialLoadError.value = 'El identificador del rol no es válido.';
    return;
  }
  if (!condominiumId) {
    initialLoadError.value = 'Selecciona un condominio activo para cargar el rol.';
    return;
  }

  isLoadingRole.value = true;
  initialLoadError.value = '';

  try {
    const detail = await fetchCondominiumRoleById(condominiumId, id, session.accessToken);
    if (!detail) throw new Error('No se encontró la información del rol.');
    applyRoleDetail(detail);
  } catch (error) {
    initialLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar el rol.';
  } finally {
    isLoadingRole.value = false;
  }
}

function applyRoleDetail(detail: CondominiumRoleItem) {
  form.value = {
    name: detail.name,
    code: detail.code,
    description: detail.description,
    isActive: detail.isActive,
    permissionCodes: [...detail.permissionCodes],
  };
}

function goBack() {
  void router.push({ name: 'roles' });
}
</script>

<style scoped>
.role-wizard-page {
  min-height: 100%;
  padding: 16px 0 0;
}

.page-shell {
  display: grid;
  gap: 18px;
  width: 100%;
}

.page-header {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.page-header__title {
  color: var(--app-text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.page-header__subtitle,
.section-subtitle,
.field-group__hint,
.summary-subtitle,
.summary-email {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.wizard-divider {
  margin-top: 16px;
}

.wizard-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
  padding: 18px;
}

.wizard-main,
.wizard-stage {
  min-width: 0;
}

.wizard-form,
.review-grid,
.wizard-summary {
  display: grid;
  gap: 12px;
}

.step-panel {
  background: rgba(248, 250, 252, 0.58);
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;
  padding: 18px;
}

.section-title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 800;
}

.field-group,
.review-card,
.summary-card,
.summary-note {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;
  padding: 16px;
}

.field-group__header,
.summary-note,
.review-card__header,
.summary-card__header {
  align-items: flex-start;
  display: flex;
  gap: 10px;
}

.field-group__header,
.review-card__header {
  color: var(--app-primary);
}

.field-group__title,
.review-card__header,
.summary-title {
  color: var(--app-text);
  font-weight: 800;
}

.form-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--single {
  grid-template-columns: 1fr;
}

.summary-note {
  background: rgba(37, 99, 235, 0.05);
  border-radius: 14px;
  color: var(--app-primary);
  padding: 14px;
}

.review-card__list {
  display: grid;
  gap: 9px;
  margin-top: 14px;
}

.review-card__empty {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 14px;
}

.review-card__list div,
.summary-meta {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  font-size: 12px;
  gap: 12px;
  justify-content: space-between;
}

.review-card__list strong,
.summary-meta strong {
  color: var(--app-text);
  text-align: right;
  word-break: break-word;
}

.summary-avatar {
  align-items: center;
  background: var(--app-primary);
  border-radius: 14px;
  color: #fff;
  display: inline-flex;
  flex: 0 0 46px;
  height: 46px;
  justify-content: center;
}

.summary-name {
  color: var(--app-text);
  font-size: 17px;
  font-weight: 800;
  margin-top: 18px;
}

.summary-separator {
  margin: 16px 0;
}

.summary-meta + .summary-meta {
  margin-top: 10px;
}

.summary-note__title {
  font-size: 12px;
  font-weight: 800;
}

.summary-note__text {
  font-size: 11px;
  line-height: 1.5;
  margin-top: 3px;
}

.permissions-panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 12px;
  padding: 12px 16px;
}

.permissions-loading {
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.wizard-footer {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  margin-top: 16px;
}

.wizard-footer__actions {
  display: flex;
  gap: 10px;
}

.footer-btn {
  min-height: 42px;
  min-width: 120px;
}

.footer-btn--primary {
  min-width: 190px;
}

.initial-load-error,
.submit-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}

.initial-load-error__content {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  width: 100%;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 1120px) {
  .wizard-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .role-wizard-page {
    padding: 12px 0 0;
  }

  .page-header,
  .wizard-footer,
  .wizard-footer__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .wizard-layout {
    padding: 14px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .footer-btn,
  .footer-btn--primary {
    width: 100%;
  }
}
</style>
