<template>
  <q-form ref="formRef" class="form-column" @submit.prevent="handleSubmit">
    <q-card flat bordered class="section-card">
      <q-inner-loading :showing="loadingHouse">
        <q-spinner color="primary" size="34px" />
      </q-inner-loading>

      <q-card-section class="section-card__section">
        <section class="context-panel">
          <div class="context-panel__icon">
            <q-icon name="apartment" size="22px" />
          </div>
          <div class="context-panel__copy">
            <span>Condominio seleccionado</span>
            <strong>{{ condominiumName }}</strong>
          </div>
        </section>

        <div class="section-heading q-mt-sm">
          <div class="section-heading__icon">
            <q-icon name="tag" size="18px" />
          </div>
          <div class="section-heading__copy">
            <strong>Identificación</strong>
            <span>{{ identificationHint }}</span>
          </div>
        </div>

        <div class="form-grid q-mt-md">
          <template v-if="blockOptions.length">
            <q-select
              v-model="form.blockId"
              dense
              outlined
              clearable
              emit-value
              map-options
              label="Bloque, manzana o sector (opcional)"
              :options="blockOptions"
              :loading="loadingBlocks"
            />
          </template>
          <q-input
            v-else
            :model-value="emptyBlockValue"
            dense
            outlined
            disable
            readonly
            label="Bloque, manzana o sector (opcional)"
          />
          <q-input
            v-model="form.number"
            dense
            outlined
            label="Número de casa *"
            placeholder="Ej: 12"
            maxlength="30"
            :rules="[requiredTextRule]"
            @update:model-value="handleNumberUpdate"
          />
          <q-input
            v-model="form.code"
            dense
            outlined
            label="Código interno *"
            placeholder="Ej: CASA-12"
            maxlength="40"
            :rules="[requiredTextRule]"
            @update:model-value="handleCodeUpdate"
          />
        </div>

        <div v-if="blocksLoadError" class="options-error q-mt-md">
          <q-icon name="error_outline" size="18px" />
          <span>{{ blocksLoadError }}</span>
          <q-btn flat dense no-caps label="Reintentar" @click="$emit('reload-blocks')" />
        </div>

        <div v-else-if="!loadingBlocks && !blockOptions.length" class="empty-options-note q-mt-md">
          <q-icon name="info_outline" size="18px" />
          <span>{{ emptyBlocksText }}</span>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="section-card">
      <q-card-section class="section-card__section">
        <div class="section-heading">
          <div class="section-heading__icon">
            <q-icon name="straighten" size="18px" />
          </div>
          <div class="section-heading__copy">
            <strong>Características</strong>
            <span>{{ characteristicsHint }}</span>
          </div>
        </div>

        <div class="form-grid form-grid--compact q-mt-md">
          <q-input
            v-model.number="form.areaM2"
            dense
            outlined
            type="number"
            min="0.01"
            step="0.01"
            label="Área *"
            suffix="m²"
            :rules="[positiveNumberRule]"
          />
        </div>

        <div class="switch-list q-mt-md">
          <q-item tag="label" class="switch-list__item">
            <q-item-section>
              <q-item-label>Permitir asignar personas</q-item-label>
              <q-item-label caption>
                Habilita propietarios, residentes y responsables de facturación.
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="form.isAssignable" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label" class="switch-list__item">
            <q-item-section>
              <q-item-label>Casa activa</q-item-label>
              <q-item-label caption>
                Permite utilizarla en las operaciones del condominio.
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="form.isActive" />
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-if="submitError" rounded class="submit-error">
      {{ submitError }}
    </q-banner>

    <div class="form-actions">
      <q-btn flat no-caps label="Cancelar" @click="$emit('cancel')" />
      <q-btn
        color="primary"
        unelevated
        no-caps
        :icon="submitIcon"
        :label="submitLabel"
        type="submit"
        :loading="saving"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { type QForm } from 'quasar';

interface HouseFormModel {
  blockId: number | null;
  unitTypeId: number | null;
  number: string;
  code: string;
  areaM2: number | null;
  isAssignable: boolean;
  isActive: boolean;
}

interface BlockOption {
  label: string;
  value: number;
}

const props = withDefaults(
  defineProps<{
    form: HouseFormModel;
    condominiumName: string;
    blockOptions: BlockOption[];
    loadingBlocks?: boolean;
    blocksLoadError?: string;
    loadingHouse?: boolean;
    submitError?: string;
    saving?: boolean;
    submitLabel: string;
    submitIcon: string;
    mode: 'create' | 'edit';
    autoSuggestCode?: boolean;
  }>(),
  {
    loadingBlocks: false,
    blocksLoadError: '',
    loadingHouse: false,
    submitError: '',
    saving: false,
    autoSuggestCode: false,
  },
);

const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
  (event: 'reload-blocks'): void;
}>();

const formRef = ref<QForm | null>(null);
const codeWasEdited = ref(false);
const form = toRef(props, 'form');

const identificationHint = computed(() =>
  props.mode === 'create'
    ? 'Define dónde se encuentra y cómo reconocerla.'
    : 'Revisa dónde se encuentra y cómo reconocerla.',
);

const characteristicsHint = computed(() =>
  props.mode === 'create'
    ? 'Configura únicamente los datos propios de la casa.'
    : 'Conserva los datos propios de la casa con la misma jerarquía visual.',
);

const emptyBlocksText = computed(() =>
  props.mode === 'create'
    ? 'No hay bloques asignados a este condominio.'
    : 'No hay bloques asignados a este condominio.',
);
const emptyBlockValue = computed(() => 'No hay bloques asignados a este condominio');

function requiredTextRule(value: unknown) {
  return typeof value === 'string' && value.trim() ? true : 'Campo requerido';
}

function positiveNumberRule(value: unknown) {
  return Number(value) > 0 || 'Debe ser mayor que cero';
}

function handleNumberUpdate(value: string | number | null) {
  if (!props.autoSuggestCode || codeWasEdited.value) return;
  form.value.code = value ? `CASA-${String(value).trim()}`.toUpperCase() : '';
}

function handleCodeUpdate() {
  codeWasEdited.value = true;
}

async function handleSubmit() {
  if (!form.value.unitTypeId || !form.value.areaM2) return;

  const isValid = await formRef.value?.validate();
  if (!isValid) return;

  emit('submit');
}
</script>

<style scoped>
.form-column {
  display: grid;
  gap: 16px;
}

.section-card {
  background: #fff;
  border-color: rgba(15, 23, 42, 0.08);
  border-radius: 16px;
}

.section-card__section {
  display: grid;
  gap: 14px;
  padding: 20px;
}

.context-panel {
  align-items: center;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 14px;
  color: var(--app-primary);
  display: flex;
  gap: 12px;
  padding: 13px 16px;
}

.context-panel__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 12px;
  display: inline-flex;
  flex: 0 0 38px;
  height: 38px;
  justify-content: center;
}

.context-panel__copy {
  display: grid;
  min-width: 0;
}

.context-panel__copy span {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.context-panel__copy strong {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
}

.section-heading {
  align-items: flex-start;
  display: flex;
  gap: 12px;
}

.section-heading__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 12px;
  color: var(--app-primary);
  display: inline-flex;
  flex: 0 0 36px;
  height: 36px;
  justify-content: center;
}

.section-heading__copy {
  display: grid;
  min-width: 0;
}

.section-heading__copy strong {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-heading__copy span {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
}

.form-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-grid--compact {
  grid-template-columns: minmax(220px, 360px);
}

.switch-list {
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 14px;
  overflow: hidden;
}

.switch-list__item {
  min-height: 64px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.submit-error {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}

.options-error,
.empty-options-note {
  align-items: center;
  border-radius: 12px;
  display: flex;
  font-size: 11px;
  gap: 8px;
  min-height: 44px;
  padding: 10px 12px;
}

.options-error {
  background: rgba(239, 68, 68, 0.07);
  color: #b91c1c;
}

.options-error .q-btn {
  margin-left: auto;
}

.empty-options-note {
  background: rgba(37, 99, 235, 0.06);
  color: var(--app-text-muted);
}

@media (max-width: 650px) {
  .section-card__section {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions > * {
    width: 100%;
  }
}
</style>
