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
                            Datos necesarios para identificar al usuario.
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
                    <div class="section-title">Rol y alcance</div>
                    <div class="section-subtitle">
                      El usuario se creará dentro del condominio activo seleccionado en el layout.
                    </div>

                    <div class="assignment-flow q-mt-md">
                      <div class="assignment-card">
                        <div class="assignment-card__icon">
                          <q-icon name="apartment" size="21px" />
                        </div>
                        <div class="assignment-card__content">
                          <div class="assignment-card__eyebrow">Condominio activo</div>
                          <div class="assignment-card__title">
                            {{ activeCondominiumName }}
                          </div>
                          <div class="assignment-card__text">
                            {{
                              activeCondominiumId === null
                                ? 'Selecciona un condominio desde el layout para cargar roles y crear usuarios.'
                                : 'Los roles y la invitación se aplicarán dentro de este condominio.'
                            }}
                          </div>
                        </div>
                        <q-badge
                          :color="activeCondominiumId === null ? 'warning' : 'primary'"
                          rounded
                          class="assignment-card__badge"
                        >
                          {{ activeCondominiumId === null ? 'Requerido' : 'Contexto actual' }}
                        </q-badge>
                      </div>

                      <div class="field-group">
                        <div class="field-group__header">
                          <q-icon name="admin_panel_settings" size="18px" />
                          <div>
                            <div class="field-group__title">Rol del usuario</div>
                            <div class="field-group__hint">
                              Selecciona un rol activo disponible para el condominio actual.
                            </div>
                          </div>
                        </div>

                        <q-select
                          v-model="form.selectedRoleId"
                          class="q-mt-md"
                          dense
                          outlined
                          emit-value
                          map-options
                          hide-bottom-space
                          label="Rol dentro del condominio *"
                          option-label="name"
                          option-value="id"
                          :options="condominiumRoleOptions"
                          :loading="isLoadingCondominiumRoles"
                          :disable="
                            activeCondominiumId === null ||
                            isLoadingCondominiumRoles ||
                            condominiumRoleOptions.length === 0
                          "
                          :rules="[requiredRule]"
                        >
                          <template #prepend>
                            <q-icon name="verified_user" />
                          </template>
                          <template #option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label>{{ scope.opt.name }}</q-item-label>
                                <q-item-label class="text-caption text-grey-7" lines="2">
                                  {{
                                    scope.opt.description ||
                                    'Rol disponible para el condominio seleccionado.'
                                  }}
                                </q-item-label>
                              </q-item-section>
                              <q-item-section side>
                                <q-badge
                                  v-if="normalizeAdministratorTypeCode(scope.opt.code)"
                                  color="primary"
                                  outline
                                  class="text-uppercase"
                                >
                                  {{ getRoleScopeLabel(scope.opt.code) }}
                                </q-badge>
                              </q-item-section>
                            </q-item>
                          </template>
                          <template #no-option>
                            <q-item>
                              <q-item-section class="text-grey">
                                No hay roles activos para este condominio
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>

                        <div v-if="isLoadingCondominiumRoles" class="load-state q-mt-md">
                          <q-spinner size="18px" color="primary" />
                          <span>Cargando roles del condominio...</span>
                        </div>

                        <div v-else-if="condominiumRolesLoadError" class="load-error q-mt-md">
                          <q-icon name="error_outline" size="18px" />
                          <span>{{ condominiumRolesLoadError }}</span>
                          <q-btn
                            flat
                            dense
                            no-caps
                            label="Reintentar"
                            @click="refreshCondominiumRoles"
                          />
                        </div>
                      </div>

                      <div class="scope-panel">
                        <div class="scope-panel__icon">
                          <q-icon :name="form.type === 'senior' ? 'public' : 'lock_person'" size="21px" />
                        </div>
                        <div>
                          <div class="scope-panel__title">Alcance resultante</div>
                          <div class="scope-panel__text">
                            {{ assignmentScopeDescription }}
                          </div>
                          <div v-if="selectedCondominiumRole" class="scope-panel__role">
                            {{ selectedCondominiumRole.name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-form>

                <div v-else class="wizard-form">
                  <div class="step-panel">
                    <div class="section-title">Revisión y confirmación</div>
                    <div class="section-subtitle">
                      Verifica la información antes de crear la cuenta y enviar la invitación.
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
                            <span>Teléfono</span><strong>{{ form.phone || '-' }}</strong>
                          </div>
                        </div>
                      </div>

                      <div class="review-card">
                        <div class="review-card__header">
                          <q-icon name="admin_panel_settings" size="18px" />
                          <span>Tipo y alcance</span>
                        </div>
                        <div class="review-card__list">
                          <div>
                            <span>Tipo</span><strong>{{ administratorTypeLabel }}</strong>
                          </div>
                          <div>
                            <span>Alcance</span><strong>{{ scopeLabel }}</strong>
                          </div>
                          <div>
                            <span>Condominio</span>
                            <strong>{{ selectedCondominiumName }}</strong>
                          </div>
                          <div v-if="form.type === 'condominium_admin'">
                            <span>Rol</span>
                            <strong>{{ selectedCondominiumRole?.name || '-' }}</strong>
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
                            La API creará la cuenta en estado pendiente y enviará las instrucciones
                            de acceso a {{ normalizedEmail || 'el correo registrado' }}.
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
                  <div class="summary-title">Resumen del usuario</div>
                  <div class="summary-subtitle">La información se actualiza automáticamente</div>
                </div>
              </div>

              <div class="summary-name">{{ fullName || 'Nombre completo' }}</div>
              <div class="summary-email">{{ normalizedEmail || 'correo@ejemplo.com' }}</div>

              <q-separator class="summary-separator" />

              <div class="summary-meta">
                <span>Tipo</span>
                <strong>{{ administratorTypeLabel }}</strong>
              </div>
              <div class="summary-meta">
                <span>Alcance</span>
                <strong>{{ scopeLabel }}</strong>
              </div>
              <div class="summary-meta">
                <span>Condominio</span>
                <strong>{{ selectedCondominiumName }}</strong>
              </div>
              <div class="summary-meta" v-if="form.type === 'condominium_admin'">
                <span>Rol</span>
                <strong>{{ selectedCondominiumRole?.name || 'Sin definir' }}</strong>
              </div>
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
                  No se generan credenciales manuales. El usuario definirá su contraseña desde
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
import { computed, onMounted, ref, watch } from 'vue';
import { Notify, type QForm } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import AppStepper from '@/components/shared/AppStepper.vue';
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import { type CatalogItem } from '@/services/catalog.service';
import {
  fetchAdministratorById,
  type AdministratorDetail,
} from '@/services/administrators.service';
import {
  fetchCondominiumRoles,
  type CondominiumRoleItem,
} from '@/services/condominium-roles.service';
import {
  createAdministrativeUser,
  updateAdministrativeUser,
  type SaveAdministrativeUserPayload,
} from '@/services/users.service';
import { useSessionStore } from '@/stores/session.store';

type StepKey = 'personal' | 'assignment' | 'review';
type AdministratorType = 'senior' | 'condominium_admin';
type SelectOption<T extends string | number> = { label: string; value: T };
type DocumentTypeOption = SelectOption<number> & {
  code: string;
};

type ValidatableForm = {
  validate: () => Promise<boolean> | boolean;
};

type AdministratorForm = {
  firstName: string;
  lastName: string;
  documentType: number | null;
  documentNumber: string;
  email: string;
  phone: string;
  type: AdministratorType | null;
  selectedRoleId: number | null;
  condominiumId: number | null;
};

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
const personalFormRef = ref<ValidatableForm | QForm | null>(null);
const assignmentFormRef = ref<ValidatableForm | QForm | null>(null);
const activeStep = ref<StepKey>('personal');
const condominiumRoleOptions = ref<CondominiumRoleItem[]>([]);
const {
  options: documentTypeOptions,
  loading: documentTypeOptionsLoading,
  loadOptions: loadDocumentTypeOptionsBase,
} = useCatalogOptions<DocumentTypeOption>('document_types', {
  fallback: [],
  mapItem: mapDocumentTypeOption,
});
const isLoadingCondominiumRoles = ref(false);
const condominiumRolesLoadError = ref('');
const isSubmitting = ref(false);
const submitError = ref('');
const isLoadingAdministrator = ref(false);
const initialLoadError = ref('');

const steps = [
  {
    key: 'personal',
    label: 'Información personal',
  },
  {
    key: 'assignment',
    label: 'Tipo y asignación',
  },
  {
    key: 'review',
    label: 'Revisión',
  },
] as const;

const activeCondominiumId = computed(() => {
  const rawId = activeSessionCondominium.value?.id;
  const id = typeof rawId === 'string' ? Number(rawId) : NaN;
  return Number.isInteger(id) ? id : null;
});
const activeCondominiumName = computed(
  () => activeSessionCondominium.value?.name ?? 'Sin condominio seleccionado',
);

const form = ref<AdministratorForm>(createEmptyAdministratorForm());

const activeStepIndex = computed(() => steps.findIndex((step) => step.key === activeStep.value));
const isEditMode = computed(() => props.mode === 'edit');
const administratorId = computed(() => {
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  const id = typeof rawId === 'string' ? Number(rawId) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
});
const activeSessionCondominium = computed(() => session.activeCondominium);
const pageTitle = computed(() =>
  isEditMode.value ? 'Editar usuario' : 'Crear nuevo usuario',
);
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Actualiza la identidad, el tipo y la asignación de la cuenta.'
    : 'Registra sus datos, define el alcance y envía la invitación de acceso.',
);
const primaryActionLabel = computed(() =>
  activeStep.value === 'review'
    ? isEditMode.value
      ? 'Actualizar usuario'
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
  if (form.value.type === 'senior') return 'Usuario senior';
  if (form.value.type === 'condominium_admin') return 'Usuario de condominio';
  return 'Sin definir';
});
const scopeLabel = computed(() => {
  if (form.value.type === 'senior') return 'Vista global';
  if (form.value.type === 'condominium_admin') return 'Acceso restringido';
  return 'Sin definir';
});
const selectedCondominiumName = computed(() => {
  if (form.value.type === 'senior') return 'No aplica';
  return activeCondominiumName.value;
});
const selectedDocumentTypeOption = computed(
  () => documentTypeOptions.value.find((option) => option.value === form.value.documentType) ?? null,
);
const documentSummary = computed(() => {
  const type = selectedDocumentTypeOption.value?.label;
  return [type, form.value.documentNumber.trim()].filter(Boolean).join(' · ') || '-';
});
const selectedCondominiumIdForRoles = computed(() => {
  const condominiumId = activeCondominiumId.value;
  return Number.isInteger(condominiumId ?? NaN) ? condominiumId : null;
});
const selectedCondominiumRole = computed(
  () => condominiumRoleOptions.value.find((role) => role.id === form.value.selectedRoleId) ?? null,
);
const assignmentScopeDescription = computed(() => {
  if (activeCondominiumId.value === null) {
    return 'Selecciona un condominio en el layout para habilitar la creación de usuarios.';
  }

  if (!selectedCondominiumRole.value) {
    return `Selecciona un rol para definir el alcance dentro de ${activeCondominiumName.value}.`;
  }

  if (form.value.type === 'senior') {
    return `El rol ${selectedCondominiumRole.value.name} otorga alcance global desde el contexto ${activeCondominiumName.value}.`;
  }

  return `El usuario tendrá acceso restringido a ${activeCondominiumName.value} con el rol seleccionado.`;
});

onMounted(() => {
  void loadDocumentTypeOptions();
  if (isEditMode.value) {
    void loadAdministratorForEdit();
  }
});

watch(
  selectedCondominiumIdForRoles,
  (condominiumId) => {
    void loadCondominiumRolesForCondominium(condominiumId);
  },
  { immediate: true },
);

watch(
  selectedCondominiumRole,
  () => {
    applySelectedRoleAssignment();
  },
  { immediate: true },
);

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
  if (typeof step === 'string') {
    void goToStep(step as StepKey);
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
    if (activeCondominiumId.value === null) {
      return false;
    }

    return Boolean(await assignmentFormRef.value?.validate()) && form.value.selectedRoleId !== null;
  }

  return Boolean(
    form.value.firstName.trim() &&
      form.value.lastName.trim() &&
      normalizedEmail.value &&
      activeCondominiumId.value !== null &&
      form.value.selectedRoleId !== null,
  );
}

async function handlePrimaryAction() {
  if (!(await validateStep(activeStep.value))) {
    return;
  }

  if (activeStep.value === 'review') {
    await submitAdministrator();
    return;
  }

  nextStep();
}

async function submitAdministrator() {
  if (isSubmitting.value) {
    return;
  }

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
          if (id === null) {
            throw new Error('El identificador del usuario no es válido.');
          }

          return updateAdministrativeUser(id, payload, session.accessToken);
        })()
      : await createAdministrativeUser(payload, session.accessToken);

    if (!result.success) {
      throw new Error(result.message);
    }

    window.dispatchEvent(new Event('administrators:changed'));

    if (isEditMode.value) {
      Notify.create({
        type: 'positive',
        message: result.message || 'Usuario actualizado correctamente.',
        position: 'top-right',
      });
      await router.push({ name: 'usuarios' });
    } else {
      Notify.create({
        type: 'positive',
        message: result.message || 'Usuario creado correctamente.',
        position: 'top-right',
      });
      await router.push({ name: 'usuarios' });
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : isEditMode.value
          ? 'No fue posible actualizar el usuario.'
          : 'No fue posible crear el usuario.';
    submitError.value = message;
    Notify.create({
      type: 'negative',
      message,
      position: 'top-right',
    });
  } finally {
    isSubmitting.value = false;
  }
}

async function loadAdministratorForEdit() {
  const id = administratorId.value;
  if (!isEditMode.value) {
    return;
  }

  if (id === null) {
    initialLoadError.value = 'El identificador del usuario no es válido.';
    return;
  }

  isLoadingAdministrator.value = true;
  initialLoadError.value = '';

  try {
    const detail = await fetchAdministratorById(id, session.accessToken);
    if (!detail) {
      throw new Error('No se encontró la información del usuario.');
    }

    applyAdministratorDetail(detail);
  } catch (error) {
    initialLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar el usuario.';
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
    selectedRoleId: null,
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
      activeCondominiumId.value !== null &&
      form.value.selectedRoleId !== null,
  );
}

function buildAdministratorPayload(): SaveAdministrativeUserPayload {
  if (
    !form.value.documentType ||
    form.value.selectedRoleId === null ||
    activeCondominiumId.value === null
  ) {
    throw new Error('La información del usuario está incompleta.');
  }

  return {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    documentTypeId: form.value.documentType,
    documentNumber: form.value.documentNumber,
    email: form.value.email,
    phone: form.value.phone,
    type: form.value.type ?? 'condominium_admin',
    condominiumId: activeCondominiumId.value,
    roleId: form.value.selectedRoleId,
  };
}

async function loadCondominiumRolesForCondominium(condominiumId: number | null) {
  condominiumRolesLoadError.value = '';

  if (condominiumId === null) {
    condominiumRoleOptions.value = [];
    form.value.selectedRoleId = null;
    return;
  }

  isLoadingCondominiumRoles.value = true;

  try {
    const roles = await fetchCondominiumRoles(condominiumId, session.accessToken);
    condominiumRoleOptions.value = roles;

    const hasSelectedRole = roles.some((role) => role.id === form.value.selectedRoleId);
    if (!hasSelectedRole) {
      form.value.selectedRoleId = roles[0]?.id ?? null;
    }

    applySelectedRoleAssignment();
  } catch (error) {
    condominiumRoleOptions.value = [];
    form.value.selectedRoleId = null;
    form.value.type = null;
    form.value.condominiumId = activeCondominiumId.value;
    condominiumRolesLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los roles del condominio.';
  } finally {
    isLoadingCondominiumRoles.value = false;
  }
}

function refreshCondominiumRoles() {
  void loadCondominiumRolesForCondominium(selectedCondominiumIdForRoles.value);
}

function getRoleScopeLabel(code: string) {
  const type = normalizeAdministratorTypeCode(code);

  if (type === 'senior') {
    return 'Global';
  }

  if (type === 'condominium_admin') {
    return 'Condominio';
  }

  return code;
}

function applySelectedRoleAssignment() {
  const roleType = selectedCondominiumRole.value
    ? normalizeAdministratorTypeCode(selectedCondominiumRole.value.code)
    : null;

  form.value.type = roleType ?? 'condominium_admin';
  form.value.condominiumId = activeCondominiumId.value;
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
  void router.push({ name: 'usuarios' });
}

function normalizeAdministratorTypeCode(value: string): AdministratorType | null {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (
    normalized === 'senior' ||
    normalized === 'super_admin' ||
    normalized === 'global_admin' ||
    normalized.includes('senior') ||
    normalized.includes('super_admin') ||
    normalized.includes('global_admin')
  ) {
    return 'senior';
  }

  if (
    normalized === 'condominium_admin' ||
    normalized === 'condominio_admin' ||
    normalized === 'administrator' ||
    normalized === 'admin' ||
    normalized.includes('condominium_admin') ||
    normalized.includes('condominio_admin')
  ) {
    return 'condominium_admin';
  }

  return null;
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
    selectedRoleId: null,
    condominiumId: null,
  };
}

async function loadDocumentTypeOptions() {
  await loadDocumentTypeOptionsBase();
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

.wizard-form {
  display: grid;
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

.field-group {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 14px;
  padding: 16px;
}

.field-group__header {
  align-items: flex-start;
  color: var(--app-primary);
  display: flex;
  gap: 10px;
}

.field-group__title {
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
.scope-panel,
.load-error,
.load-state,
.invitation-confirmation,
.summary-note {
  align-items: flex-start;
  display: flex;
  gap: 10px;
}

.invitation-note {
  background: rgba(37, 99, 235, 0.055);
  border-radius: 12px;
  color: var(--app-primary);
  font-size: 12px;
  line-height: 1.5;
  padding: 12px 14px;
}

.assignment-flow {
  display: grid;
  gap: 14px;
}

.assignment-card {
  align-items: flex-start;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;
  display: grid;
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 16px;
}

.assignment-card__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.09);
  border-radius: 13px;
  color: var(--app-primary);
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.assignment-card__content {
  min-width: 0;
}

.assignment-card__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.assignment-card__title {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 800;
  margin-top: 3px;
}

.assignment-card__text {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
}

.assignment-card__badge {
  align-self: flex-start;
  white-space: nowrap;
}

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

.scope-panel__title {
  font-size: 13px;
  font-weight: 800;
}

.scope-panel__text {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.scope-panel {
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 14px;
  padding: 16px;
}

.scope-panel__role {
  color: var(--app-primary);
  font-size: 11px;
  font-weight: 800;
  margin-top: 6px;
  text-transform: uppercase;
}

.load-error {
  align-items: center;
  color: var(--q-negative);
  font-size: 12px;
}

.load-state {
  align-items: center;
  color: var(--app-text-muted);
  font-size: 12px;
}

.initial-load-error {
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

.submit-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}

.review-grid,
.wizard-summary {
  display: grid;
  gap: 12px;
}

.review-card,
.summary-card,
.summary-note {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;
  padding: 16px;
}

.review-card__header {
  align-items: center;
  color: var(--app-primary);
  display: flex;
  font-size: 13px;
  font-weight: 800;
  gap: 8px;
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

  .assignment-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .assignment-card__badge {
    grid-column: 1 / -1;
    justify-self: start;
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


