<template>
  <q-page class="new-admin-page">
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
          aria-label="Volver al listado de administradores"
          @click="goBack"
        />
      </header>

      <q-banner v-if="!activeCondominiumId" rounded class="initial-load-error" role="alert">
        <template #avatar>
          <q-icon name="apartment" color="warning" />
        </template>
        Selecciona un condominio activo para gestionar administradores.
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
            :loading="isLoadingAdministrator"
            @click="loadAdministratorForEdit"
          />
        </div>
      </q-banner>

      <q-card flat bordered class="wizard-frame">
        <q-inner-loading :showing="isLoadingAdministrator">
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
                      Registra la identidad y el contacto del administrador del condominio.
                    </div>

                    <div class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="badge" size="18px" />
                        <div>
                          <div class="field-group__title">Identificación</div>
                          <div class="field-group__hint">
                            Datos requeridos por el backend para identificar al usuario.
                          </div>
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
                          v-model="form.documentType"
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
                          Se usará el endpoint del condominio activo. El frontend no distingue si el
                          usuario ya existe; mostrará la respuesta devuelta por el backend.
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
                    <div class="section-title">Condominio</div>
                    <div class="section-subtitle">
                      La asignación se toma del contexto activo de la aplicación.
                    </div>

                    <div class="scope-panel q-mt-md">
                      <div class="scope-panel__icon">
                        <q-icon name="apartment" size="21px" />
                      </div>
                      <div>
                        <div class="scope-panel__title">{{ selectedCondominiumName }}</div>
                        <div class="scope-panel__text">
                          Todas las llamadas usan
                          <strong>/api/condominiums/{{ activeCondominiumId ?? '{id}' }}/administrators</strong>.
                          El payload no incluye identificadores de condominio.
                        </div>
                      </div>
                    </div>
                  </div>
                </q-form>

                <div v-else class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Revisión y confirmación</div>
                    <div class="section-subtitle">
                      Verifica la información antes de guardar el administrador.
                    </div>

                    <q-banner v-if="submitError" rounded class="submit-error-banner q-mt-md" role="alert">
                      <template #avatar>
                        <q-icon name="error_outline" color="negative" />
                      </template>
                      {{ submitError }}
                    </q-banner>

                    <div class="review-grid q-mt-md">
                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="badge" size="18px" />
                          <span>Información personal</span>
                        </div>
                        <div class="review-card__list">
                          <div><span>Nombre</span><strong>{{ fullName || '-' }}</strong></div>
                          <div><span>Identificación</span><strong>{{ documentSummary }}</strong></div>
                          <div><span>Correo</span><strong>{{ normalizedEmail || '-' }}</strong></div>
                          <div><span>País</span><strong>{{ normalizedCountry }}</strong></div>
                          <div><span>Teléfono</span><strong>{{ form.phone || '-' }}</strong></div>
                          <div>
                            <span>Teléfono secundario</span>
                            <strong>{{ form.secondaryPhone || '-' }}</strong>
                          </div>
                        </div>
                      </div>

                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="admin_panel_settings" size="18px" />
                          <span>Asignación</span>
                        </div>
                        <div class="review-card__list">
                          <div><span>Condominio</span><strong>{{ selectedCondominiumName }}</strong></div>
                          <div><span>Contrato</span><strong>Administrador de condominio</strong></div>
                          <div>
                            <span>Invitación</span>
                            <strong>{{ isEditMode ? 'Según cambios enviados' : 'Gestionada por backend' }}</strong>
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
                  :disable="activeStepIndex === 0 || isLoadingAdministrator"
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
                    isLoadingAdministrator ||
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
                <div class="summary-avatar">{{ administratorInitials }}</div>
                <div>
                  <div class="summary-title">Resumen del administrador</div>
                  <div class="summary-subtitle">La información se actualiza automáticamente</div>
                </div>
              </div>

              <div class="summary-name">{{ fullName || 'Nombre completo' }}</div>
              <div class="summary-email">{{ normalizedEmail || 'correo@ejemplo.com' }}</div>
              <q-separator class="summary-separator" />
              <div class="summary-meta"><span>Condominio</span><strong>{{ selectedCondominiumName }}</strong></div>
              <div class="summary-meta"><span>País</span><strong>{{ normalizedCountry }}</strong></div>
              <div class="summary-meta">
                <span>Estado inicial</span>
                <q-badge color="warning" rounded>Pendiente</q-badge>
              </div>
            </div>

            <div class="summary-note">
              <q-icon name="mail_lock" size="20px" />
              <div>
                <div class="summary-note__title">Contrato del backend</div>
                <div class="summary-note__text">
                  No se envían contraseña, rol, estado de acceso, invitación ni condominio en el
                  payload.
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
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import {
  createAdministrator,
  fetchAdministratorById,
  updateAdministrator,
  type AdministratorDetail,
  type SaveAdministratorPayload,
  type UpdateAdministratorPayload,
} from '@/services/administrators.service';
import { type CatalogItem } from '@/services/catalog.service';
import { useSessionStore } from '@/stores/session.store';

type StepKey = 'personal' | 'assignment' | 'review';
type SelectOption<T extends string | number> = { label: string; value: T };
type DocumentTypeOption = SelectOption<number> & { code: string };
type ValidatableForm = { validate: () => Promise<boolean> | boolean };
type AdministratorForm = {
  firstName: string;
  lastName: string;
  documentType: number | null;
  documentNumber: string;
  email: string;
  country: string;
  phone: string;
  secondaryPhone: string;
};

const props = withDefaults(defineProps<{ mode?: 'create' | 'edit' }>(), { mode: 'create' });
const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const personalFormRef = ref<ValidatableForm | QForm | null>(null);
const assignmentFormRef = ref<ValidatableForm | QForm | null>(null);
const activeStep = ref<StepKey>('personal');
const isSubmitting = ref(false);
const submitError = ref('');
const isLoadingAdministrator = ref(false);
const initialLoadError = ref('');
const originalDetail = ref<AdministratorDetail | null>(null);
const {
  options: documentTypeOptions,
  loading: documentTypeOptionsLoading,
  loadOptions,
} = useCatalogOptions<DocumentTypeOption>('document_types', {
  fallback: [],
  mapItem: mapDocumentTypeOption,
});

const steps = [
  { key: 'personal', label: 'Información personal' },
  { key: 'assignment', label: 'Condominio' },
  { key: 'review', label: 'Revisión' },
] as const;

const form = ref<AdministratorForm>(createEmptyAdministratorForm());
const isEditMode = computed(() => props.mode === 'edit');
const activeStepIndex = computed(() => steps.findIndex((step) => step.key === activeStep.value));
const activeCondominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});
const selectedCondominiumName = computed(
  () => session.activeCondominium?.name ?? 'Sin condominio activo',
);
const administratorId = computed(() => {
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  const id = typeof rawId === 'string' ? Number(rawId) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
});
const pageTitle = computed(() =>
  isEditMode.value ? 'Editar administrador' : 'Crear nuevo administrador',
);
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Actualiza la información del administrador dentro del condominio activo.'
    : 'Registra sus datos y deja que el backend gestione la invitación o reutilización.',
);
const primaryActionLabel = computed(() =>
  activeStep.value === 'review'
    ? isEditMode.value
      ? 'Actualizar administrador'
      : 'Crear y enviar invitación'
    : 'Siguiente',
);
const fullName = computed(() =>
  `${form.value.firstName.trim()} ${form.value.lastName.trim()}`.trim(),
);
const normalizedEmail = computed(() => form.value.email.trim().toLowerCase());
const normalizedCountry = computed(() => form.value.country.trim().toUpperCase());
const administratorInitials = computed(() => {
  const firstInitial = form.value.firstName.trim().charAt(0);
  const lastInitial = form.value.lastName.trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || 'AD';
});
const selectedDocumentTypeOption = computed(
  () => documentTypeOptions.value.find((option) => option.value === form.value.documentType) ?? null,
);
const documentSummary = computed(() => {
  const type = selectedDocumentTypeOption.value?.label;
  return [type, form.value.documentNumber.trim()].filter(Boolean).join(' · ') || '-';
});

onMounted(async () => {
  await loadOptions();
  if (isEditMode.value) {
    await loadAdministratorForEdit();
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
  activeStep.value = steps[Math.max(0, activeStepIndex.value - 1)]?.key ?? 'personal';
}

function nextStep() {
  activeStep.value = steps[Math.min(steps.length - 1, activeStepIndex.value + 1)]?.key ?? 'review';
}

async function validateStep(step: StepKey) {
  if (step === 'personal') return Boolean(await personalFormRef.value?.validate());
  if (step === 'assignment') return activeCondominiumId.value !== null;

  return isReviewPayloadReady();
}

async function handlePrimaryAction() {
  if (!(await validateStep(activeStep.value))) return;
  if (activeStep.value === 'review') {
    await submitAdministrator();
    return;
  }

  nextStep();
}

async function submitAdministrator() {
  if (isSubmitting.value) return;
  if (!isReviewPayloadReady()) {
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
    const id = administratorId.value;
    const result = isEditMode.value
      ? await (async () => {
          if (id === null) throw new Error('El identificador del administrador no es válido.');
          const payload = buildAdministratorUpdatePayload();
          if (Object.keys(payload).length === 0) {
            return {
              success: true,
              message: 'No hay cambios para guardar.',
              data: originalDetail.value,
            };
          }

          return updateAdministrator(condominiumId, id, payload, session.accessToken);
        })()
      : await createAdministrator(condominiumId, buildAdministratorPayload(), session.accessToken);

    if (!result.success) throw new Error(result.message);
    window.dispatchEvent(new Event('administrators:changed'));
    Notify.create({
      type: 'positive',
      message: result.message || 'Administrador guardado correctamente.',
      position: 'top-right',
    });
    await router.push({ name: 'administradores' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible guardar el administrador.';
    submitError.value = message;
    Notify.create({ type: 'negative', message, position: 'top-right' });
  } finally {
    isSubmitting.value = false;
  }
}

async function loadAdministratorForEdit() {
  const id = administratorId.value;
  const condominiumId = activeCondominiumId.value;
  if (!isEditMode.value) return;
  if (id === null) {
    initialLoadError.value = 'El identificador del administrador no es válido.';
    return;
  }
  if (!condominiumId) {
    initialLoadError.value = 'Selecciona un condominio activo para cargar el administrador.';
    return;
  }

  isLoadingAdministrator.value = true;
  initialLoadError.value = '';

  try {
    const detail = await fetchAdministratorById(condominiumId, id, session.accessToken);
    if (!detail) throw new Error('No se encontró la información del administrador.');
    originalDetail.value = detail;
    applyAdministratorDetail(detail);
  } catch (error) {
    initialLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar el administrador.';
  } finally {
    isLoadingAdministrator.value = false;
  }
}

function applyAdministratorDetail(detail: AdministratorDetail) {
  form.value = {
    firstName: detail.firstName,
    lastName: detail.lastName,
    documentType: detail.documentTypeId,
    documentNumber: detail.documentNumber,
    email: detail.email,
    country: detail.country || 'EC',
    phone: detail.phone,
    secondaryPhone: detail.secondaryPhone,
  };
}

function isReviewPayloadReady() {
  return Boolean(
    activeCondominiumId.value &&
      form.value.firstName.trim() &&
      form.value.lastName.trim() &&
      form.value.documentType &&
      form.value.documentNumber.trim() &&
      normalizedEmail.value &&
      normalizedCountry.value &&
      form.value.phone.trim(),
  );
}

function buildAdministratorPayload(): SaveAdministratorPayload {
  if (!form.value.documentType) {
    throw new Error('La información del administrador está incompleta.');
  }

  return {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    country: normalizedCountry.value,
    documentTypeId: form.value.documentType,
    documentNumber: form.value.documentNumber,
    phone: form.value.phone,
    secondaryPhone: form.value.secondaryPhone,
  };
}

function buildAdministratorUpdatePayload(): UpdateAdministratorPayload {
  const original = originalDetail.value;
  const fullPayload = buildAdministratorPayload();
  if (!original) {
    return fullPayload;
  }

  const payload: UpdateAdministratorPayload = {};
  if (fullPayload.firstName.trim() !== original.firstName) payload.firstName = fullPayload.firstName;
  if (fullPayload.lastName.trim() !== original.lastName) payload.lastName = fullPayload.lastName;
  if (fullPayload.email.trim().toLowerCase() !== original.email.trim().toLowerCase()) {
    payload.email = fullPayload.email;
  }
  if (fullPayload.country.trim().toUpperCase() !== original.country.trim().toUpperCase()) {
    payload.country = fullPayload.country;
  }
  if (fullPayload.documentTypeId !== original.documentTypeId) {
    payload.documentTypeId = fullPayload.documentTypeId;
  }
  if (fullPayload.documentNumber.trim() !== original.documentNumber) {
    payload.documentNumber = fullPayload.documentNumber;
  }
  if (fullPayload.phone.trim() !== original.phone) payload.phone = fullPayload.phone;
  if ((fullPayload.secondaryPhone ?? '').trim() !== original.secondaryPhone) {
    payload.secondaryPhone = fullPayload.secondaryPhone ?? '';
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
  void router.push({ name: 'administradores' });
}

function createEmptyAdministratorForm(): AdministratorForm {
  return {
    firstName: '',
    lastName: '',
    documentType: null,
    documentNumber: '',
    email: '',
    country: 'EC',
    phone: '',
    secondaryPhone: '',
  };
}

function mapDocumentTypeOption(item: CatalogItem): DocumentTypeOption {
  return {
    label: item.name.trim() || item.code.trim(),
    value: item.id,
    code: normalizeCatalogText(item.code || item.name),
  };
}

function normalizeCatalogText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
</script>

<style scoped>
.new-admin-page {
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
.scope-panel__text,
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
.invitation-note,
.scope-panel,
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
.scope-panel__title,
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

.invitation-note,
.scope-panel,
.summary-note {
  background: rgba(37, 99, 235, 0.05);
  border-radius: 14px;
  color: var(--app-primary);
  padding: 14px;
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
  .new-admin-page {
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
