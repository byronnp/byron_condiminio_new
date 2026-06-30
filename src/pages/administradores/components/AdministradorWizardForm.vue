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
                      Registra la identidad y el contacto donde se enviará la invitación.
                    </div>

                    <div class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="badge" size="18px" />
                        <div>
                          <div class="field-group__title">Identificación</div>
                          <div class="field-group__hint">
                            Datos necesarios para identificar al administrador.
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
                          <div class="field-group__title">Contacto e invitación</div>
                          <div class="field-group__hint">
                            La API enviará un correo para que configure su contraseña.
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
                      </div>

                      <div class="invitation-note q-mt-md">
                        <q-icon name="mark_email_read" size="19px" />
                        <span>
                          Al crear la cuenta, se enviará una invitación a
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
                    <div class="section-title">Tipo y asignación</div>
                    <div class="section-subtitle">
                      Define si tendrá alcance global o acceso limitado a un condominio.
                    </div>

                    <div class="type-grid q-mt-md">
                      <button
                        v-for="option in administratorTypeOptions"
                        :key="option.value"
                        type="button"
                        class="type-card"
                        :class="{ 'type-card--selected': form.type === option.value }"
                        :aria-pressed="form.type === option.value"
                        @click="selectAdministratorType(option.value)"
                      >
                        <span class="type-card__icon">
                          <q-icon :name="option.icon" size="24px" />
                        </span>
                        <span class="type-card__content">
                          <span class="type-card__title">{{ option.label }}</span>
                          <span class="type-card__text">{{ option.description }}</span>
                          <span class="type-card__meta">{{ option.meta }}</span>
                        </span>
                        <q-icon
                          :name="
                            form.type === option.value
                              ? 'radio_button_checked'
                              : 'radio_button_unchecked'
                          "
                          class="type-card__check"
                          size="20px"
                        />
                      </button>
                    </div>

                    <div v-if="form.type === 'senior'" class="scope-panel q-mt-md">
                      <div class="scope-panel__icon">
                        <q-icon name="public" size="21px" />
                      </div>
                      <div>
                        <div class="scope-panel__title">Acceso global</div>
                        <div class="scope-panel__text">
                          Podrá consultar todos los condominios y cambiar el contexto activo.
                        </div>
                      </div>
                    </div>

                    <div v-else-if="form.type === 'condominium_admin'" class="field-group q-mt-md">
                      <div class="field-group__header">
                        <q-icon name="apartment" size="18px" />
                        <div>
                          <div class="field-group__title">Condominio asignado</div>
                          <div class="field-group__hint">
                            La cuenta tendrá acceso únicamente al condominio seleccionado.
                          </div>
                        </div>
                      </div>

                      <q-select
                        v-model="form.condominiumId"
                        class="q-mt-md"
                        dense
                        outlined
                        emit-value
                        map-options
                        use-input
                        input-debounce="150"
                        hide-bottom-space
                        label="Seleccionar condominio *"
                        option-label="label"
                        option-value="value"
                        :options="filteredCondominiumOptions"
                        :loading="isLoadingCondominiums"
                        :disable="isLoadingCondominiums || condominiumOptions.length === 0"
                        :rules="[requiredRule]"
                        @filter="filterCondominiums"
                      >
                        <template #prepend>
                          <q-icon name="location_city" />
                        </template>
                        <template #no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No hay condominios disponibles
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>

                      <div v-if="condominiumsLoadError" class="load-error q-mt-sm">
                        <q-icon name="error_outline" size="18px" />
                        <span>{{ condominiumsLoadError }}</span>
                        <q-btn flat dense no-caps label="Reintentar" @click="loadCondominiums" />
                      </div>
                    </div>
                  </div>
                </q-form>

                <div v-else class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Revisión y confirmación</div>
                    <div class="section-subtitle">
                      Verifica la información antes de guardar la cuenta.
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
                          <div><span>Teléfono</span><strong>{{ form.phone || '-' }}</strong></div>
                        </div>
                      </div>

                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="admin_panel_settings" size="18px" />
                          <span>Tipo y alcance</span>
                        </div>
                        <div class="review-card__list">
                          <div><span>Tipo</span><strong>{{ administratorTypeLabel }}</strong></div>
                          <div><span>Alcance</span><strong>{{ scopeLabel }}</strong></div>
                          <div><span>Condominio</span><strong>{{ selectedCondominiumName }}</strong></div>
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
                  :disable="isSubmitting || isLoadingAdministrator || Boolean(initialLoadError)"
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
              <div class="summary-meta"><span>Tipo</span><strong>{{ administratorTypeLabel }}</strong></div>
              <div class="summary-meta"><span>Alcance</span><strong>{{ scopeLabel }}</strong></div>
              <div class="summary-meta"><span>Condominio</span><strong>{{ selectedCondominiumName }}</strong></div>
              <div class="summary-meta">
                <span>Estado inicial</span>
                <q-badge color="warning" rounded>Pendiente</q-badge>
              </div>
            </div>

            <div class="summary-note">
              <q-icon name="mail_lock" size="20px" />
              <div>
                <div class="summary-note__title">Acceso seguro</div>
                <div class="summary-note__text">
                  No se generan credenciales manuales. El administrador definirá su contraseña desde
                  el correo de invitación.
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
  type AdministratorType,
  type SaveAdministratorPayload,
} from '@/services/administrators.service';
import {
  fetchCondominiumOptions,
  type CondominiumOptionItem,
} from '@/services/condominiums.service';
import { type CatalogItem } from '@/services/catalog.service';
import {
  createAdministrativeUser,
  fetchAdministrativeUserRoleOptions,
} from '@/services/users.service';
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
  phone: string;
  type: AdministratorType | null;
  condominiumId: number | null;
};

const props = withDefaults(defineProps<{ mode?: 'create' | 'edit' }>(), { mode: 'create' });
const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const personalFormRef = ref<ValidatableForm | QForm | null>(null);
const assignmentFormRef = ref<ValidatableForm | QForm | null>(null);
const activeStep = ref<StepKey>('personal');
const condominiumOptions = ref<SelectOption<number>[]>([]);
const filteredCondominiumOptions = ref<SelectOption<number>[]>([]);
const isLoadingCondominiums = ref(false);
const condominiumsLoadError = ref('');
const isSubmitting = ref(false);
const submitError = ref('');
const isLoadingAdministrator = ref(false);
const initialLoadError = ref('');
const { options: documentTypeOptions, loading: documentTypeOptionsLoading, loadOptions } =
  useCatalogOptions<DocumentTypeOption>('document_types', {
    fallback: [],
    mapItem: mapDocumentTypeOption,
  });

const steps = [
  { key: 'personal', label: 'Información personal' },
  { key: 'assignment', label: 'Tipo y asignación' },
  { key: 'review', label: 'Revisión' },
] as const;

const administratorTypeOptions = [
  {
    value: 'senior',
    label: 'Administrador senior',
    description: 'Acceso global a la plataforma y a todos los condominios.',
    meta: 'Puede cambiar el contexto activo',
    icon: 'public',
  },
  {
    value: 'condominium_admin',
    label: 'Administrador de condominio',
    description: 'Acceso operativo limitado a un único condominio.',
    meta: 'Requiere una asignación',
    icon: 'apartment',
  },
] as const;

const form = ref<AdministratorForm>(createEmptyAdministratorForm());
const isEditMode = computed(() => props.mode === 'edit');
const activeStepIndex = computed(() => steps.findIndex((step) => step.key === activeStep.value));
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
    ? 'Actualiza la identidad, el tipo y el alcance de la cuenta.'
    : 'Registra sus datos, define el alcance y envía la invitación de acceso.',
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
const administratorInitials = computed(() => {
  const firstInitial = form.value.firstName.trim().charAt(0);
  const lastInitial = form.value.lastName.trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || 'AD';
});
const administratorTypeLabel = computed(() => {
  if (form.value.type === 'senior') return 'Administrador senior';
  if (form.value.type === 'condominium_admin') return 'Administrador de condominio';
  return 'Sin definir';
});
const scopeLabel = computed(() => {
  if (form.value.type === 'senior') return 'Vista global';
  if (form.value.type === 'condominium_admin') return 'Acceso restringido';
  return 'Sin definir';
});
const selectedCondominiumName = computed(() => {
  if (form.value.type === 'senior') return 'No aplica';
  return (
    condominiumOptions.value.find((option) => option.value === form.value.condominiumId)?.label ??
    'Sin asignar'
  );
});
const selectedDocumentTypeOption = computed(
  () => documentTypeOptions.value.find((option) => option.value === form.value.documentType) ?? null,
);
const documentSummary = computed(() => {
  const type = selectedDocumentTypeOption.value?.label;
  return [type, form.value.documentNumber.trim()].filter(Boolean).join(' · ') || '-';
});

onMounted(() => {
  void loadOptions();
  void loadCondominiums();
  if (isEditMode.value) void loadAdministratorForEdit();
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
  if (step === 'assignment') {
    if (!form.value.type) return false;
    if (form.value.type === 'senior') return true;
    return Boolean(await assignmentFormRef.value?.validate()) && form.value.condominiumId !== null;
  }
  return Boolean(
    form.value.firstName.trim() &&
      form.value.lastName.trim() &&
      form.value.documentType &&
      normalizedEmail.value &&
      form.value.type &&
      (form.value.type === 'senior' || form.value.condominiumId !== null),
  );
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

  isSubmitting.value = true;
  submitError.value = '';
  try {
    const payload = buildAdministratorPayload();
    const id = administratorId.value;
    const result = isEditMode.value
      ? await (async () => {
          if (id === null) throw new Error('El identificador del administrador no es válido.');
          return updateAdministrator(id, payload, session.accessToken);
        })()
      : payload.type === 'senior'
        ? await createSeniorAdministrator(payload)
        : await createAdministrator(payload, session.accessToken);

    if (!result.success) throw new Error(result.message);
    window.dispatchEvent(new Event('administrators:changed'));
    Notify.create({
      type: 'positive',
      message: result.message || 'Administrador guardado correctamente.',
      position: 'top-right',
    });
    await router.push({ name: 'administradores' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'No fue posible guardar el administrador.';
    submitError.value = message;
    Notify.create({ type: 'negative', message, position: 'top-right' });
  } finally {
    isSubmitting.value = false;
  }
}

async function createSeniorAdministrator(payload: SaveAdministratorPayload) {
  const roles = await fetchAdministrativeUserRoleOptions(session.accessToken);
  const seniorRole = roles.find((role) => {
    const code = role.code.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const name = role.name.trim().toLowerCase();
    return ['senior', 'super_admin', 'global_admin', 'platform_admin'].includes(code) ||
      name.includes('senior');
  });

  if (!seniorRole) {
    throw new Error('No existe un rol senior activo para el condominio seleccionado.');
  }

  return createAdministrativeUser(
    {
      ...payload,
      type: 'senior',
      condominiumId: null,
      roleId: seniorRole.id,
    },
    session.accessToken,
  );
}

async function loadAdministratorForEdit() {
  const id = administratorId.value;
  if (!isEditMode.value) return;
  if (id === null) {
    initialLoadError.value = 'El identificador del administrador no es válido.';
    return;
  }

  isLoadingAdministrator.value = true;
  initialLoadError.value = '';
  try {
    const detail = await fetchAdministratorById(id, session.accessToken);
    if (!detail) throw new Error('No se encontró la información del administrador.');
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
    phone: detail.phone,
    type: detail.type,
    condominiumId: detail.type === 'condominium_admin' ? detail.condominiumId : null,
  };
}

function isReviewPayloadReady() {
  return Boolean(
    form.value.firstName.trim() &&
      form.value.lastName.trim() &&
      form.value.documentType &&
      form.value.documentNumber.trim() &&
      normalizedEmail.value &&
      form.value.phone.trim() &&
      form.value.type &&
      (form.value.type === 'senior' || form.value.condominiumId !== null),
  );
}

function buildAdministratorPayload(): SaveAdministratorPayload {
  if (!form.value.documentType || !form.value.type) {
    throw new Error('La información del administrador está incompleta.');
  }

  return {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    documentTypeId: form.value.documentType,
    documentNumber: form.value.documentNumber,
    email: form.value.email,
    phone: form.value.phone,
    type: form.value.type,
    condominiumId: form.value.type === 'condominium_admin' ? form.value.condominiumId : null,
  };
}

function selectAdministratorType(type: AdministratorType) {
  form.value.type = type;
  if (type === 'senior') form.value.condominiumId = null;
}

async function loadCondominiums() {
  isLoadingCondominiums.value = true;
  condominiumsLoadError.value = '';
  try {
    const items = await fetchCondominiumOptions(session.accessToken);
    condominiumOptions.value = items.map(mapCondominiumOption);
    filteredCondominiumOptions.value = [...condominiumOptions.value];
  } catch (error) {
    condominiumOptions.value = [];
    filteredCondominiumOptions.value = [];
    condominiumsLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los condominios.';
  } finally {
    isLoadingCondominiums.value = false;
  }
}

function mapCondominiumOption(item: CondominiumOptionItem): SelectOption<number> {
  return { label: item.name, value: item.id };
}

function filterCondominiums(value: string, update: (callback: () => void) => void) {
  update(() => {
    const query = value.trim().toLowerCase();
    filteredCondominiumOptions.value = query
      ? condominiumOptions.value.filter((option) => option.label.toLowerCase().includes(query))
      : [...condominiumOptions.value];
  });
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

function documentNumberRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return true;
  if (selectedDocumentTypeOption.value?.code === 'cedula') {
    return /^\d{8,13}$/.test(text) || 'La cédula debe contener entre 8 y 13 dígitos';
  }
  return /^[a-zA-Z0-9-]{5,20}$/.test(text) || 'Ingresa un pasaporte válido';
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
    phone: '',
    type: null,
    condominiumId: null,
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
.load-error,
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

.form-grid,
.type-grid {
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

.type-card {
  align-items: flex-start;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 16px;
  color: var(--app-text);
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-height: 138px;
  padding: 16px;
  text-align: left;
}

.type-card--selected {
  background: rgba(37, 99, 235, 0.055);
  border-color: var(--app-primary);
  box-shadow: 0 8px 22px rgba(37, 99, 235, 0.08);
}

.type-card__icon,
.scope-panel__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.09);
  border-radius: 13px;
  color: var(--app-primary);
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.type-card__content {
  display: grid;
  gap: 5px;
}

.type-card__title,
.type-card__meta {
  font-weight: 800;
}

.type-card__text {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.type-card__meta {
  color: var(--app-primary);
  font-size: 10px;
  text-transform: uppercase;
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

.load-error {
  align-items: center;
  color: var(--q-negative);
  font-size: 12px;
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

  .form-grid,
  .type-grid {
    grid-template-columns: 1fr;
  }

  .type-card {
    grid-template-columns: auto minmax(0, 1fr);
    min-height: auto;
  }

  .footer-btn,
  .footer-btn--primary {
    width: 100%;
  }
}
</style>
