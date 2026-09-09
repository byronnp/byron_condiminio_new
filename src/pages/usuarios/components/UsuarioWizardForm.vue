<template>
  <q-page class="new-user-page">
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
          aria-label="Volver al listado de usuarios"
          @click="goBack"
        />
      </header>

      <q-banner v-if="!activeCondominiumId" rounded class="initial-load-error" role="alert">
        <template #avatar>
          <q-icon name="apartment" color="warning" />
        </template>
        Selecciona un condominio activo para gestionar usuarios.
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
            :loading="isLoadingUser"
            @click="loadUserForEdit"
          />
        </div>
      </q-banner>

      <q-card flat bordered class="wizard-frame">
        <q-inner-loading :showing="isLoadingUser">
          <q-spinner color="primary" size="34px" />
        </q-inner-loading>

        <AppStepper :steps="steps" :current-step="activeStep" @select="handleStepSelect" />

        <q-separator class="wizard-divider" />

        <div class="wizard-layout">
          <section class="wizard-main">
            <transition name="fade-slide" mode="out-in">
              <div :key="activeStep" class="wizard-stage">
                <q-form v-if="activeStep === 'personal'" ref="personalFormRef" class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Información personal</div>
                    <div class="section-subtitle">
                      Registra la identidad y el contacto del usuario.
                    </div>

                    <div class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="badge" size="18px" />
                        <div>
                          <div class="field-group__title">Identificación</div>
                          <div class="field-group__hint">Información legal del usuario.</div>
                        </div>
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input
                          v-model="form.firstName"
                          dense
                          outlined
                          hide-bottom-space
                          label="Nombres *"
                          maxlength="80"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="form.lastName"
                          dense
                          outlined
                          hide-bottom-space
                          label="Apellidos *"
                          maxlength="80"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="form.documentTypeId"
                          dense
                          outlined
                          emit-value
                          map-options
                          hide-bottom-space
                          label="Tipo de identificación *"
                          option-label="label"
                          option-value="value"
                          :options="documentTypeOptions"
                          :loading="documentTypeOptionsLoading"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="form.documentNumber"
                          dense
                          outlined
                          hide-bottom-space
                          label="Número de identificación *"
                          maxlength="20"
                          :rules="[requiredRule, documentNumberRule]"
                        />
                      </div>
                    </div>

                    <div class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="contact_mail" size="18px" />
                        <div>
                          <div class="field-group__title">Contacto</div>
                          <div class="field-group__hint">
                            El backend decide si crea, reutiliza o reenvía la invitación.
                          </div>
                        </div>
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input
                          v-model="form.email"
                          dense
                          outlined
                          hide-bottom-space
                          type="email"
                          label="Correo electrónico *"
                          maxlength="120"
                          :rules="[requiredRule, emailRule]"
                        >
                          <template #prepend>
                            <q-icon name="alternate_email" />
                          </template>
                        </q-input>
                        <q-input
                          v-model="form.country"
                          dense
                          outlined
                          hide-bottom-space
                          label="País *"
                          maxlength="2"
                          :rules="[requiredRule, countryRule]"
                        />
                        <q-input
                          v-model="form.phone"
                          dense
                          outlined
                          hide-bottom-space
                          type="tel"
                          label="Teléfono *"
                          maxlength="24"
                          :rules="[requiredRule, phoneRule]"
                        >
                          <template #prepend>
                            <q-icon name="phone" />
                          </template>
                        </q-input>
                        <q-input
                          v-model="form.secondaryPhone"
                          dense
                          outlined
                          hide-bottom-space
                          type="tel"
                          label="Teléfono secundario"
                          maxlength="24"
                          :rules="[optionalPhoneRule]"
                        >
                          <template #prepend>
                            <q-icon name="phone_in_talk" />
                          </template>
                        </q-input>
                      </div>

                      <div class="invitation-note q-mt-md">
                        <q-icon name="mark_email_read" size="19px" />
                        <span>
                          El backend creará el usuario y gestionará la invitación a
                          <strong>{{ normalizedEmail || 'este correo' }}</strong
                          >.
                        </span>
                      </div>
                    </div>
                  </div>
                </q-form>

                <q-form
                  v-else-if="activeStep === 'assignment'"
                  ref="assignmentFormRef"
                  class="wizard-form"
                >
                  <div class="step-panel">
                    <div class="section-title">Condominio y rol</div>
                    <div class="section-subtitle">
                      El condominio se toma del contexto activo de la aplicación.
                    </div>

                    <div class="scope-panel q-mt-md">
                      <div class="scope-panel__icon">
                        <q-icon name="apartment" size="21px" />
                      </div>
                      <div>
                        <div class="scope-panel__title">{{ selectedCondominiumName }}</div>
                        <div class="scope-panel__text">
                          El usuario tendrá acceso únicamente a este condominio, con el rol
                          seleccionado.
                        </div>
                      </div>
                    </div>

                    <div class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="admin_panel_settings" size="18px" />
                        <div>
                          <div class="field-group__title">Rol</div>
                          <div class="field-group__hint">
                            Roles configurados para {{ selectedCondominiumName }}.
                          </div>
                        </div>
                      </div>

                      <q-select
                        v-model="form.roleId"
                        class="q-mt-md"
                        dense
                        outlined
                        emit-value
                        map-options
                        hide-bottom-space
                        label="Rol *"
                        option-label="label"
                        option-value="value"
                        :options="roleOptions"
                        :loading="isLoadingRoles"
                        :disable="isLoadingRoles || roleOptions.length === 0"
                        :rules="[requiredRule]"
                      >
                        <template #prepend>
                          <q-icon name="badge" />
                        </template>
                        <template #no-option>
                          <q-item>
                            <q-item-section class="text-grey"
                              >No hay roles activos en este condominio</q-item-section
                            >
                          </q-item>
                        </template>
                      </q-select>

                      <div v-if="rolesLoadError" class="load-error q-mt-sm">
                        <q-icon name="error_outline" size="18px" />
                        <span>{{ rolesLoadError }}</span>
                        <q-btn flat dense no-caps label="Reintentar" @click="loadRoleOptions" />
                      </div>
                    </div>
                  </div>
                </q-form>

                <div v-else class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Revisión y confirmación</div>
                    <div class="section-subtitle">
                      Verifica la información antes de guardar el usuario.
                    </div>

                    <div class="review-grid q-mt-md">
                      <q-banner v-if="submitError" rounded class="submit-error-banner" role="alert">
                        <template #avatar>
                          <q-icon name="error_outline" color="negative" />
                        </template>
                        {{ submitError }}
                      </q-banner>

                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="badge" size="18px" />
                          <span>Información personal</span>
                        </div>
                        <div class="review-card__list">
                          <div>
                            <span>Nombre</span><strong>{{ fullName || '-' }}</strong>
                          </div>
                          <div>
                            <span>Identificación</span>
                            <strong>{{ documentSummary }}</strong>
                          </div>
                          <div>
                            <span>Correo</span><strong>{{ normalizedEmail || '-' }}</strong>
                          </div>
                          <div>
                            <span>País</span><strong>{{ normalizedCountry }}</strong>
                          </div>
                          <div>
                            <span>Teléfono</span><strong>{{ form.phone || '-' }}</strong>
                          </div>
                        </div>
                      </div>

                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="admin_panel_settings" size="18px" />
                          <span>Asignación</span>
                        </div>
                        <div class="review-card__list">
                          <div>
                            <span>Condominio</span><strong>{{ selectedCondominiumName }}</strong>
                          </div>
                          <div>
                            <span>Rol</span><strong>{{ selectedRoleName || '-' }}</strong>
                          </div>
                        </div>
                      </div>

                      <div class="invitation-confirmation">
                        <q-icon name="outgoing_mail" size="22px" />
                        <div>
                          <div class="invitation-confirmation__title">
                            Invitación por correo electrónico
                          </div>
                          <div class="invitation-confirmation__text">
                            No se solicitará contraseña. El backend gestiona la activación del
                            acceso a {{ normalizedEmail || 'el correo registrado' }}.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <div class="wizard-footer">
              <q-btn
                flat
                no-caps
                label="Cancelar"
                class="footer-btn"
                aria-label="Cancelar y volver al listado de usuarios"
                @click="goBack"
              />
              <div class="wizard-footer__actions">
                <q-btn
                  flat
                  no-caps
                  label="Anterior"
                  icon="arrow_back"
                  class="footer-btn"
                  :disable="activeStepIndex === 0 || isLoadingUser"
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
                    isLoadingUser ||
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
                <div class="summary-avatar">{{ userInitials }}</div>
                <div>
                  <div class="summary-title">Resumen del usuario</div>
                  <div class="summary-subtitle">La información se actualiza automáticamente</div>
                </div>
              </div>

              <div class="summary-name">{{ fullName || 'Nombre completo' }}</div>
              <div class="summary-email">{{ normalizedEmail || 'correo@ejemplo.com' }}</div>

              <q-separator class="summary-separator" />

              <div class="summary-meta">
                <span>Documento</span>
                <strong>{{ documentSummary }}</strong>
              </div>
              <div class="summary-meta">
                <span>Teléfono</span>
                <strong>{{ form.phone || '-' }}</strong>
              </div>
              <div class="summary-meta">
                <span>Condominio</span>
                <strong>{{ selectedCondominiumName }}</strong>
              </div>
              <div class="summary-meta">
                <span>Rol</span>
                <strong>{{ selectedRoleName || '-' }}</strong>
              </div>
            </div>

            <div class="summary-note">
              <q-icon name="admin_panel_settings" size="20px" />
              <div>
                <div class="summary-note__title">Contrato del backend</div>
                <div class="summary-note__text">
                  El rol se envía como una asignación para el condominio activo (<code
                    >assignments: [ condominium_id, role_id ]</code
                  >).
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
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { Notify, type QForm } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import AppStepper from '@/components/shared/AppStepper.vue';
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import {
  fetchCondominiumRoles,
  type CondominiumRoleItem,
} from '@/services/condominium-roles.service';
import {
  createUser,
  fetchUserById,
  updateUser,
  type SaveUserPayload,
  type UpdateUserPayload,
  type UserListItem,
} from '@/services/users.service';
import { useSessionStore } from '@/stores/session.store';
import type { CatalogItem } from '@/services/catalog.service';

const DIACRITICS_PATTERN = new RegExp('[\\u0300-\\u036f]', 'g');

type StepKey = 'personal' | 'assignment' | 'review';

interface DocumentTypeOption {
  label: string;
  value: number;
  code: string;
}

interface UserForm {
  firstName: string;
  lastName: string;
  documentTypeId: number | null;
  documentNumber: string;
  email: string;
  country: string;
  phone: string;
  secondaryPhone: string;
  roleId: number | null;
}

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit';
  }>(),
  {
    mode: 'create',
  },
);

const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const personalFormRef = ref<QForm | null>(null);
const assignmentFormRef = ref<QForm | null>(null);
const activeStep = ref<StepKey>('personal');
const form = ref(createEmptyForm()) as Ref<UserForm>;
const originalForm = ref(createEmptyForm()) as Ref<UserForm>;
const isSubmitting = ref(false);
const isLoadingUser = ref(false);
const initialLoadError = ref('');
const submitError = ref('');
const roleOptions = ref<{ label: string; value: number }[]>([]);
const isLoadingRoles = ref(false);
const rolesLoadError = ref('');

const {
  options: documentTypeOptions,
  loading: documentTypeOptionsLoading,
  loadOptions: loadDocumentTypeOptionsBase,
} = useCatalogOptions<DocumentTypeOption>('document_types', {
  fallback: [],
  mapItem: mapDocumentTypeOption,
});

const steps = [
  { key: 'personal', label: 'Información', icon: 'badge' },
  { key: 'assignment', label: 'Condominio y rol', icon: 'admin_panel_settings' },
  { key: 'review', label: 'Revisión', icon: 'fact_check' },
] as const;

const isEditMode = computed(() => props.mode === 'edit');
const activeStepIndex = computed(() => steps.findIndex((item) => item.key === activeStep.value));
const activeCondominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});
const selectedCondominiumName = computed(
  () => session.activeCondominium?.name ?? 'Sin condominio activo',
);
const pageTitle = computed(() => (isEditMode.value ? 'Editar usuario' : 'Crear nuevo usuario'));
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Actualiza los datos y el rol del usuario en el condominio activo.'
    : 'Crea un usuario con acceso al condominio activo. El backend enviará la invitación.',
);
const primaryActionLabel = computed(() =>
  activeStep.value === 'review'
    ? isEditMode.value
      ? 'Guardar cambios'
      : 'Crear y enviar invitación'
    : 'Siguiente',
);
const userId = computed(() => {
  const id = Number(route.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
});
const fullName = computed(() =>
  `${form.value.firstName.trim()} ${form.value.lastName.trim()}`.trim(),
);
const normalizedEmail = computed(() => form.value.email.trim().toLowerCase());
const normalizedCountry = computed(() => form.value.country.trim().toUpperCase());
const userInitials = computed(() => {
  const firstInitial = form.value.firstName.trim().charAt(0);
  const lastInitial = form.value.lastName.trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || 'US';
});
const selectedDocumentTypeOption = computed(
  () =>
    documentTypeOptions.value.find((option) => option.value === form.value.documentTypeId) ?? null,
);
const documentSummary = computed(() => {
  const type = selectedDocumentTypeOption.value?.label;
  return [type, form.value.documentNumber.trim()].filter(Boolean).join(' · ') || '-';
});
const selectedRoleName = computed(
  () => roleOptions.value.find((option) => option.value === form.value.roleId)?.label ?? '',
);

onMounted(async () => {
  await loadDocumentTypeOptionsBase(session.accessToken);
  await loadRoleOptions();
  if (isEditMode.value) {
    await loadUserForEdit();
  }
});

watch(activeCondominiumId, () => {
  void loadRoleOptions();
});

async function loadRoleOptions() {
  const condominiumId = activeCondominiumId.value;
  if (!condominiumId) {
    roleOptions.value = [];
    return;
  }

  isLoadingRoles.value = true;
  rolesLoadError.value = '';

  try {
    const roles = await fetchCondominiumRoles(condominiumId, session.accessToken);
    roleOptions.value = roles.map(mapRoleOption);
  } catch (error) {
    roleOptions.value = [];
    rolesLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los roles del condominio.';
  } finally {
    isLoadingRoles.value = false;
  }
}

function mapRoleOption(role: CondominiumRoleItem) {
  return { label: role.name, value: role.id };
}

function handleStepSelect(step: string | number) {
  if (typeof step === 'string') {
    void goToStep(step as StepKey);
  }
}

async function goToStep(step: StepKey) {
  const targetIndex = steps.findIndex((item) => item.key === step);
  if (targetIndex <= activeStepIndex.value) {
    activeStep.value = step;
    return;
  }

  if (targetIndex === activeStepIndex.value + 1 && (await validateStep(activeStep.value))) {
    activeStep.value = step;
  }
}

function previousStep() {
  activeStep.value = steps[Math.max(0, activeStepIndex.value - 1)]?.key ?? 'personal';
}

function nextStep() {
  activeStep.value = steps[Math.min(steps.length - 1, activeStepIndex.value + 1)]?.key ?? 'review';
}

async function validateStep(step: StepKey) {
  if (step === 'personal') {
    return Boolean(await personalFormRef.value?.validate());
  }

  if (step === 'assignment') {
    return Boolean(await assignmentFormRef.value?.validate()) && activeCondominiumId.value !== null;
  }

  return isPayloadReady();
}

async function handlePrimaryAction() {
  if (!(await validateStep(activeStep.value))) return;

  if (activeStep.value === 'review') {
    await submitUser();
    return;
  }

  nextStep();
}

async function submitUser() {
  if (isSubmitting.value) return;

  if (!isPayloadReady()) {
    submitError.value = 'Completa la información requerida antes de guardar.';
    return;
  }

  isSubmitting.value = true;
  submitError.value = '';

  try {
    const id = userId.value;
    const result = isEditMode.value
      ? await (async () => {
          if (id === null) throw new Error('El identificador del usuario no es válido.');
          return updateUser(id, buildUpdatePayload(), session.accessToken);
        })()
      : await createUser(buildCreatePayload(), session.accessToken);

    if (!result.success) throw new Error(result.message);

    window.dispatchEvent(new Event('users:changed'));
    Notify.create({
      type: 'positive',
      message: result.message || 'Usuario guardado correctamente.',
      position: 'top-right',
    });
    await router.push({ name: 'usuarios' });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : isEditMode.value
          ? 'No fue posible actualizar el usuario.'
          : 'No fue posible crear el usuario.';
    submitError.value = message;
    Notify.create({ type: 'negative', message, position: 'top-right' });
  } finally {
    isSubmitting.value = false;
  }
}

async function loadUserForEdit() {
  const id = userId.value;
  if (!isEditMode.value) return;

  if (id === null) {
    initialLoadError.value = 'El identificador del usuario no es válido.';
    return;
  }

  isLoadingUser.value = true;
  initialLoadError.value = '';

  try {
    const detail = await fetchUserById(id, session.accessToken);
    if (!detail) throw new Error('No se encontró la información del usuario.');
    applyUserDetail(detail);
  } catch (error) {
    initialLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar el usuario.';
  } finally {
    isLoadingUser.value = false;
  }
}

function applyUserDetail(detail: UserListItem) {
  const assignment =
    detail.assignments.find((item) => item.condominiumId === activeCondominiumId.value) ??
    detail.assignments[0] ??
    null;

  form.value = {
    firstName: detail.firstName,
    lastName: detail.lastName,
    documentTypeId: detail.documentTypeId,
    documentNumber: detail.documentNumber,
    email: detail.email,
    country: 'EC',
    phone: detail.phone,
    secondaryPhone: '',
    roleId: assignment?.roleId ?? null,
  };
  originalForm.value = { ...form.value };
}

function isPayloadReady() {
  return Boolean(
    form.value.firstName.trim() &&
    form.value.lastName.trim() &&
    form.value.documentTypeId &&
    form.value.documentNumber.trim() &&
    normalizedEmail.value &&
    normalizedCountry.value &&
    form.value.phone.trim() &&
    form.value.roleId &&
    activeCondominiumId.value,
  );
}

function buildCreatePayload(): SaveUserPayload {
  const condominiumId = activeCondominiumId.value;
  if (!form.value.documentTypeId || !form.value.roleId || !condominiumId) {
    throw new Error('La información del usuario está incompleta.');
  }

  return {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    country: normalizedCountry.value,
    documentTypeId: form.value.documentTypeId,
    documentNumber: form.value.documentNumber,
    email: form.value.email,
    phone: form.value.phone,
    secondaryPhone: form.value.secondaryPhone,
    assignments: [{ condominiumId, roleId: form.value.roleId }],
  };
}

function buildUpdatePayload(): UpdateUserPayload {
  const original = originalForm.value;
  const condominiumId = activeCondominiumId.value;
  const payload: UpdateUserPayload = {};

  if (form.value.firstName.trim() !== original.firstName.trim()) {
    payload.firstName = form.value.firstName;
  }
  if (form.value.lastName.trim() !== original.lastName.trim()) {
    payload.lastName = form.value.lastName;
  }
  if (form.value.documentTypeId !== original.documentTypeId && form.value.documentTypeId !== null) {
    payload.documentTypeId = form.value.documentTypeId;
  }
  if (form.value.documentNumber.trim() !== original.documentNumber.trim()) {
    payload.documentNumber = form.value.documentNumber;
  }
  if (normalizedEmail.value !== original.email.trim().toLowerCase()) {
    payload.email = form.value.email;
  }
  if (form.value.phone.trim() !== original.phone.trim()) {
    payload.phone = form.value.phone;
  }
  if (form.value.roleId !== original.roleId && form.value.roleId !== null && condominiumId) {
    payload.assignments = [{ condominiumId, roleId: form.value.roleId }];
  }

  return payload;
}

function requiredRule(value: unknown) {
  return (
    (value !== null &&
      value !== undefined &&
      (typeof value !== 'string' || value.trim().length > 0)) ||
    'Campo requerido'
  );
}

function emailRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) || 'Correo electrónico inválido';
}

function phoneRule(value: unknown) {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  return digits.length >= 7 || 'Ingresa un teléfono válido';
}

function optionalPhoneRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return true;
  return phoneRule(value);
}

function countryRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return /^[A-Z]{2}$/.test(text) || 'Usa el código ISO de 2 letras';
}

function documentNumberRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return true;
  if (selectedDocumentTypeOption.value?.code === 'cedula') {
    return /^\d{8,13}$/.test(text) || 'La cédula debe contener entre 8 y 13 dígitos';
  }
  return /^[a-zA-Z0-9-]{5,20}$/.test(text) || 'Ingresa un documento válido';
}

function goBack() {
  void router.push({ name: 'usuarios' });
}

function createEmptyForm(): UserForm {
  return {
    firstName: '',
    lastName: '',
    documentTypeId: null,
    documentNumber: '',
    email: '',
    country: 'EC',
    phone: '',
    secondaryPhone: '',
    roleId: null,
  };
}

function mapDocumentTypeOption(item: CatalogItem): DocumentTypeOption {
  return {
    label: item.name.trim() || item.code.trim(),
    value: item.id,
    code: item.code.normalize('NFD').replace(DIACRITICS_PATTERN, '').trim().toLowerCase(),
  };
}
</script>

<style scoped>
.new-user-page {
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

.page-header__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
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

.section-subtitle,
.field-group__hint {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 3px;
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
.review-card__header,
.invitation-note,
.invitation-confirmation,
.summary-note,
.scope-panel {
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
.scope-panel__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.form-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.invitation-note,
.scope-panel {
  background: rgba(37, 99, 235, 0.055);
  border-radius: 12px;
  color: var(--app-primary);
  font-size: 12px;
  line-height: 1.5;
  padding: 12px 14px;
}

.scope-panel__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.09);
  border-radius: 13px;
  color: var(--app-primary);
  display: inline-flex;
  flex: 0 0 42px;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.scope-panel__text {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 2px;
}

.load-error {
  align-items: center;
  color: var(--app-negative, #dc2626);
  display: flex;
  font-size: 12px;
  gap: 8px;
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

.review-card__list {
  display: grid;
  gap: 9px;
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

.invitation-confirmation {
  background: rgba(34, 197, 94, 0.07);
  border: 1px solid rgba(34, 197, 94, 0.12);
  border-radius: 14px;
  color: #166534;
  padding: 15px;
}

.invitation-confirmation__title,
.summary-note__title {
  font-size: 12px;
  font-weight: 800;
}

.invitation-confirmation__text,
.summary-note__text {
  font-size: 11px;
  line-height: 1.5;
  margin-top: 3px;
}

.summary-note__text code {
  background: rgba(37, 99, 235, 0.08);
  border-radius: 4px;
  font-size: 10px;
  padding: 1px 4px;
}

.summary-card__header {
  align-items: center;
  display: flex;
  gap: 12px;
}

.summary-avatar {
  align-items: center;
  background: var(--app-primary);
  border-radius: 14px;
  color: #fff;
  display: inline-flex;
  flex: 0 0 46px;
  font-size: 13px;
  font-weight: 800;
  height: 46px;
  justify-content: center;
}

.summary-title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
}

.summary-subtitle,
.summary-email {
  color: var(--app-text-muted);
  font-size: 11px;
  margin-top: 2px;
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

.summary-note {
  background: rgba(37, 99, 235, 0.05);
  color: var(--app-primary);
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
  .new-user-page {
    padding: 12px 0 0;
  }

  .page-header {
    flex-direction: column;
  }

  .wizard-divider {
    margin-inline: 14px;
  }

  .wizard-layout {
    padding: 14px;
  }

  .step-panel,
  .field-group,
  .review-card,
  .summary-card,
  .summary-note {
    border-radius: 14px;
    padding: 14px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .review-card__list div,
  .summary-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .review-card__list strong,
  .summary-meta strong {
    text-align: left;
  }

  .wizard-footer,
  .wizard-footer__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .footer-btn,
  .footer-btn--primary {
    width: 100%;
  }
}
</style>
