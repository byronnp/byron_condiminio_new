<template>
  <q-dialog v-model="openProxy" persistent>
    <q-card class="detail-dialog">
      <q-card-section class="detail-dialog__header">
        <div class="detail-dialog__heading">
          <div class="detail-dialog__icon">
            <q-icon name="person_add_alt_1" size="24px" />
          </div>

          <div class="detail-dialog__heading-copy">
            <div class="detail-dialog__eyebrow">Nueva relación</div>
            <div class="detail-dialog__title">Agregar persona a la vivienda</div>
            <div class="detail-dialog__subtitle">
              Registra o reutiliza una persona para vincularla con esta unidad.
            </div>
          </div>
        </div>

        <q-btn flat round dense icon="close" aria-label="Cerrar diálogo" @click="closeDialog" />
      </q-card-section>

      <q-separator />

      <q-card-section class="detail-dialog__body">
        <q-banner class="info-banner" rounded>
          <template #avatar>
            <q-icon name="info" color="primary" />
          </template>
          La persona se registra sin correo ni contraseña. El acceso se gestiona después mediante
          invitación.
        </q-banner>

        <q-form ref="formRef" class="person-form">
          <section class="dialog-section">
            <div class="dialog-section__header">
              <q-icon name="badge" size="18px" />
              <div>
                <div class="dialog-section__title">Información personal</div>
                <div class="dialog-section__subtitle">Quién es la persona que vas a vincular.</div>
              </div>
            </div>

            <div class="form-grid">
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
            </div>
          </section>

          <section class="dialog-section">
            <div class="dialog-section__header">
              <q-icon name="fingerprint" size="18px" />
              <div>
                <div class="dialog-section__title">Documentación</div>
                <div class="dialog-section__subtitle">
                  Documento y datos de contacto para identificarla.
                </div>
              </div>
            </div>

            <div class="form-grid">
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
                :loading="documentTypesLoading"
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

              <q-input
                v-model="form.phone"
                dense
                outlined
                hide-bottom-space
                type="tel"
                label="Teléfono"
                maxlength="24"
                :rules="[phoneRule]"
              >
                <template #prepend>
                  <q-icon name="phone" />
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
            </div>
          </section>

          <section class="dialog-section">
            <div class="dialog-section__header">
              <q-icon name="home_work" size="18px" />
              <div>
                <div class="dialog-section__title">Relación con la vivienda</div>
                <div class="dialog-section__subtitle">
                  Define el vínculo y el periodo de ocupación.
                </div>
              </div>
            </div>

            <div class="form-grid form-grid--compact">
              <q-select
                v-model="form.relationshipTypeId"
                dense
                outlined
                emit-value
                map-options
                hide-bottom-space
                label="Relación *"
                option-label="label"
                option-value="value"
                :options="relationshipTypeOptions"
                :loading="relationshipTypesLoading"
                :rules="[requiredRule]"
              />

              <q-input
                v-model="form.startedAt"
                dense
                outlined
                hide-bottom-space
                type="date"
                label="Inicio de relación"
              />
            </div>

            <div class="toggle-grid">
              <q-checkbox v-model="form.isPrimary" dense label="Titular principal" />
              <q-checkbox
                v-model="form.isBillingResponsible"
                dense
                label="Responsable de facturación"
              />
            </div>
          </section>
        </q-form>

        <q-banner
          v-if="documentTypesError || relationshipTypesError"
          rounded
          class="load-error"
          role="alert"
        >
          <template #avatar>
            <q-icon name="error_outline" color="negative" />
          </template>
          <div class="load-error__content">
            <span>{{ documentTypesError || relationshipTypesError }}</span>
            <q-btn flat dense no-caps label="Reintentar" @click="reloadOptions" />
          </div>
        </q-banner>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="detail-dialog__actions">
        <q-btn flat no-caps label="Cancelar" :disable="saving" @click="closeDialog" />
        <q-btn
          unelevated
          color="primary"
          no-caps
          label="Guardar Persona"
          :loading="saving"
          @click="saveDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import type { CatalogItem } from '@/services/catalog.service';
import type { CreateUnitPersonPayload } from '@/services/units.service';

interface PersonFormState {
  firstName: string;
  lastName: string;
  documentTypeId: number | null;
  documentNumber: string;
  relationshipTypeId: number | null;
  country: string;
  phone: string;
  startedAt: string;
  isPrimary: boolean;
  isBillingResponsible: boolean;
}

interface SelectOption {
  label: string;
  value: number;
  code: string;
  description: string | null;
}

const props = defineProps<{
  modelValue: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', payload: CreateUnitPersonPayload): void;
}>();

const formRef = ref();
const openProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const {
  options: documentTypeOptions,
  loading: documentTypesLoading,
  error: documentTypesError,
  loadOptions: loadDocumentTypes,
} = useCatalogOptions<SelectOption>('document_types', {
  mapItem: mapSelectOption,
});

const {
  options: relationshipTypeOptions,
  loading: relationshipTypesLoading,
  error: relationshipTypesError,
  loadOptions: loadRelationshipTypes,
} = useCatalogOptions<SelectOption>('resident_relationship_types', {
  mapItem: mapSelectOption,
});

const form = reactive<PersonFormState>(createEmptyForm());

const saving = computed(() => props.saving === true);

onMounted(() => {
  void reloadOptions();
});

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  },
);

function mapSelectOption(item: CatalogItem): SelectOption | null {
  return {
    label: item.name.trim() || item.code.trim(),
    value: item.id,
    code: item.code.trim().toLowerCase(),
    description: item.description,
  };
}

function createEmptyForm(): PersonFormState {
  return {
    firstName: '',
    lastName: '',
    documentTypeId: null,
    documentNumber: '',
    relationshipTypeId: null,
    country: 'EC',
    phone: '',
    startedAt: '',
    isPrimary: true,
    isBillingResponsible: false,
  };
}

function resetForm() {
  Object.assign(form, createEmptyForm());
  form.isPrimary = true;
}

async function reloadOptions() {
  await Promise.all([loadDocumentTypes(), loadRelationshipTypes()]);
}

function closeDialog() {
  openProxy.value = false;
}

async function saveDialog() {
  const isValid = await formRef.value?.validate?.();
  if (!isValid) {
    return;
  }

  emit('save', {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    country: form.country.trim().toUpperCase(),
    documentTypeId: form.documentTypeId ?? 0,
    documentNumber: form.documentNumber.trim(),
    phone: form.phone.trim(),
    relationshipTypeId: form.relationshipTypeId ?? 0,
    startedAt: form.startedAt,
    isPrimary: form.isPrimary,
    isBillingResponsible: form.isBillingResponsible,
  });
}

function requiredRule(value: unknown) {
  return (
    (typeof value === 'number' && Number.isInteger(value)) ||
    (typeof value === 'string' && value.trim().length > 0) ||
    'Campo requerido'
  );
}

function phoneRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    return true;
  }
  const digits = text.replace(/\D/g, '');
  return digits.length >= 7 || 'Ingresa un teléfono válido';
}

function countryRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return /^[A-Z]{2}$/.test(text) || 'Usa el código ISO de 2 letras';
}

function documentNumberRule(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    return true;
  }

  const selectedType = documentTypeOptions.value.find((item) => item.value === form.documentTypeId);
  if (selectedType?.code === 'cedula') {
    return /^\d{8,13}$/.test(text) || 'La cédula debe contener entre 8 y 13 dígitos';
  }

  if (selectedType?.code === 'ruc') {
    return /^\d{13}$/.test(text) || 'El RUC debe contener 13 dígitos';
  }

  return /^[a-zA-Z0-9-]{5,20}$/.test(text) || 'Ingresa un documento válido';
}
</script>

<style scoped lang="scss">
.detail-dialog {
  border-radius: 20px;
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 32px);
  max-width: 880px;
  width: 100%;
}

.detail-dialog__header {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding-bottom: 18px;
  padding-top: 20px;
}

.detail-dialog__heading {
  align-items: flex-start;
  display: flex;
  gap: 15px;
  min-width: 0;
}

.detail-dialog__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 18px;
  color: var(--app-primary);
  display: inline-flex;
  flex: 0 0 50px;
  height: 50px;
  justify-content: center;
}

.detail-dialog__heading-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.detail-dialog__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.detail-dialog__title {
  color: var(--app-text);
  font-size: 21px;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.detail-dialog__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  max-width: 54ch;
}

.detail-dialog__body {
  display: grid;
  gap: 16px;
  overflow-y: auto;
}

.person-form {
  display: grid;
  gap: 14px;
}

.dialog-section {
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;
  display: grid;
  gap: 14px;
  padding: 16px;
}

.dialog-section__header {
  align-items: flex-start;
  display: flex;
  gap: 10px;
}

.dialog-section__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.dialog-section__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 2px;
}

.form-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--compact {
  gap: 12px;
}

.toggle-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 2px;
}

.info-banner {
  background: rgba(37, 99, 235, 0.055);
  border: 1px solid rgba(37, 99, 235, 0.12);
  color: var(--app-text);
  line-height: 1.5;
}

.load-error {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}

.load-error__content {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-width: 0;
  width: 100%;
}

.load-error__content span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.detail-dialog__actions {
  padding: 0 20px 20px;
}

.detail-dialog__actions :deep(.q-btn) {
  min-width: 132px;
}

@media (max-width: 720px) {
  .detail-dialog {
    border-radius: 18px;
    max-width: calc(100vw - 24px);
    width: calc(100vw - 24px);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .detail-dialog__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .detail-dialog__heading {
    width: 100%;
  }

  .detail-dialog__icon {
    flex-basis: 48px;
    height: 48px;
  }

  .detail-dialog__body {
    padding: 16px;
  }

  .detail-dialog__title {
    font-size: 18px;
  }

  .toggle-grid {
    flex-direction: column;
    gap: 10px;
  }

  .load-error__content {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-dialog__actions {
    flex-direction: column-reverse;
    gap: 10px;
    padding: 0 16px 16px;
  }

  .detail-dialog__actions :deep(.q-btn) {
    min-width: 0;
    width: 100%;
  }
}
</style>
