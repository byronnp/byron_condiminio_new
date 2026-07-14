<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="step-panel step-panel--airy">
    <div class="section-title">Configuración</div>
    <div class="section-subtitle">
      Ajusta la estructura básica, identidad visual y características.
    </div>

    <div class="config-layout q-mt-md">
      <div class="field-group location-layout__panel location-panel config-panel">
        <div class="location-panel__header">
          <div class="location-panel__heading">
            <q-icon name="layers" size="18px" />
            <span>Estructura base</span>
          </div>
          <div class="location-panel__hint">
            Define la base operativa del condominio antes de continuar.
          </div>
        </div>

        <div class="step-grid">
          <q-select
            v-model="config.currency"
            class="step-field"
            dense
            outlined
            hide-bottom-space
            :options="currencyOptions"
            label="Moneda *"
            :rules="[requiredRule]"
          />
          <q-input
            v-model="config.towers"
            class="step-field"
            dense
            outlined
            stack-label
            hide-bottom-space
            type="number"
            label="Número de bloques o torres *"
            :rules="[requiredRule, integerMinRule(1)]"
          />
          <q-input
            v-model="config.houses"
            class="step-field"
            dense
            outlined
            stack-label
            hide-bottom-space
            type="number"
            label="Número de casas *"
            :rules="[requiredRule, integerMinRule(1)]"
          />
          <q-input
            v-model="config.totalUnits"
            class="step-field"
            dense
            outlined
            stack-label
            hide-bottom-space
            type="number"
            label="Total de unidades *"
            :rules="[requiredRule, integerMinRule(1)]"
          />
        </div>
      </div>

      <div class="field-group location-layout__panel location-panel config-panel config-panel--visual">
        <div class="location-panel__header">
          <div class="location-panel__heading">
            <q-icon name="palette" size="18px" />
            <span>Identidad visual</span>
          </div>
          <div class="location-panel__hint">
            Refuerza la identidad del condominio con una imagen reconocible.
          </div>
        </div>

        <div class="logo-upload">
          <div class="logo-upload__preview">
            <div class="logo-upload__artwork">
              <img
                v-if="logoPreviewUrl"
                :src="logoPreviewUrl"
                alt="Vista previa del logo del condominio"
              />
              <q-icon v-else name="add_photo_alternate" size="34px" />
            </div>
          </div>

          <div class="logo-upload__content">
            <div class="logo-upload__heading">
              <div class="logo-upload__title">Logo del condominio</div>
              <q-btn
                v-if="config.logo"
                flat
                round
                dense
                icon="close"
                class="logo-upload__clear"
                @click="$emit('clear-logo')"
              >
                <q-tooltip>Quitar logo</q-tooltip>
              </q-btn>
            </div>

            <q-file
              v-model="config.logo"
              class="logo-upload__dropzone"
              accept="image/*"
              dense
              outlined
              hide-bottom-space
              label="Seleccionar imagen"
            >
              <template #prepend>
                <q-icon name="cloud_upload" />
              </template>
              <template #append>
                <q-badge outline color="primary" rounded>Subir</q-badge>
              </template>
            </q-file>

            <div class="logo-upload__file-name">
              {{ logoFileName }}
            </div>
          </div>
        </div>
      </div>

      <div class="field-group location-layout__panel location-panel config-panel config-panel--features">
        <div class="location-panel__header">
          <div class="location-panel__heading">
            <q-icon name="widgets" size="18px" />
            <span>Características</span>
          </div>
          <div class="location-panel__hint">
            Selecciona las amenidades y servicios disponibles para el condominio.
          </div>
        </div>

        <div class="feature-toolbar">
          <div class="feature-toolbar__meta">
            <div class="feature-toolbar__title">Selección rápida</div>
            <div class="feature-toolbar__subtitle">
              {{ selectedCharacteristicsCount }} de {{ characteristicOptions.length }}
              características activas.
            </div>
          </div>

          <div class="feature-toolbar__actions">
            <q-btn
              flat
              no-caps
              dense
              icon="done_all"
              label="Todas"
              class="feature-toolbar__action"
              @click="$emit('select-all-features')"
            />
            <q-btn
              flat
              no-caps
              dense
              icon="close"
              label="Limpiar"
              class="feature-toolbar__action"
              @click="$emit('clear-features')"
            />
          </div>
        </div>

        <div class="feature-selected">
          <div class="feature-selected__header">
            <div class="feature-selected__title">Seleccionadas</div>
            <q-badge rounded color="primary" outline>
              {{ selectedCharacteristicsCount }}
            </q-badge>
          </div>

          <div v-if="selectedCharacteristics.length" class="feature-selected__chips">
            <q-badge
              v-for="feature in selectedCharacteristics"
              :key="feature.value"
              rounded
              color="primary"
              outline
              class="feature-selected__chip"
            >
              {{ feature.label }}
            </q-badge>
          </div>

          <div v-else class="feature-selected__empty">
            Elige una o varias amenidades para perfilar mejor el condominio.
          </div>
        </div>

        <div class="feature-grid">
          <button
            v-for="feature in characteristicOptions"
            :key="feature.value"
            type="button"
            class="feature-toggle"
            :class="{ 'feature-toggle--active': isFeatureSelected(feature.value) }"
            :aria-pressed="isFeatureSelected(feature.value)"
            @click="$emit('toggle-feature', feature.value)"
          >
            <span class="feature-toggle__icon">
              <q-icon :name="feature.icon" size="18px" />
            </span>
            <span class="feature-toggle__label">{{ feature.label }}</span>
            <q-icon
              :name="
                isFeatureSelected(feature.value)
                  ? 'check_circle'
                  : 'radio_button_unchecked'
              "
              class="feature-toggle__check"
              size="18px"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type CharacteristicOption = {
  id: number;
  value: string;
  label: string;
  icon: string;
};

const props = defineProps<{
  config: {
    currency: string;
  towers: string;
  houses: string;
  totalUnits: string;
  logo: File | null;
  characteristics: number[];
  };
  currencyOptions: string[];
  characteristicOptions: CharacteristicOption[];
  selectedCharacteristics: CharacteristicOption[];
  selectedCharacteristicsCount: number;
  logoPreviewUrl: string | null;
  logoFileName: string;
  requiredRule: (value: unknown) => boolean | string;
  integerMinRule: (min: number) => (value: unknown) => boolean | string;
}>();

defineEmits<{
  (event: 'clear-logo'): void;
  (event: 'select-all-features'): void;
  (event: 'clear-features'): void;
  (event: 'toggle-feature', value: string): void;
}>();

function isFeatureSelected(value: string) {
  return props.selectedCharacteristics.some((feature) => feature.value === value);
}
</script>

<style scoped>
.step-panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 20px;
  width: 100%;
}

.step-panel--airy {
  padding: 24px;
}

.section-title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.config-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  width: 100%;
}

.field-group {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.86)),
    rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 16px;
}

.location-layout__panel {
  min-width: 0;
}

.config-panel {
  align-content: start;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 0;
  height: 100%;
  min-width: 0;
}

.config-panel--features {
  grid-column: 1 / -1;
}

.location-panel__header {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}

.location-panel__heading {
  align-items: center;
  color: var(--app-text);
  display: inline-flex;
  font-size: 13px;
  font-weight: 800;
  gap: 8px;
  letter-spacing: -0.01em;
}

.location-panel__heading :deep(.q-icon) {
  color: var(--app-primary);
}

.location-panel__hint {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  max-width: 38rem;
}

.step-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  width: 100%;
}

.step-field {
  width: 100%;
}

.logo-upload {
  align-items: center;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.09), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.94));
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 20px;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
  display: grid;
  gap: 14px;
  grid-template-columns: 82px minmax(0, 1fr);
  padding: 16px;
  position: relative;
}

.logo-upload__preview {
  align-items: center;
  display: grid;
  justify-items: center;
  min-width: 0;
}

.logo-upload__content {
  align-content: start;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.logo-upload__heading {
  align-items: start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-width: 0;
}

.logo-upload__artwork {
  align-items: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(37, 99, 235, 0.12)),
    linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.08));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 12px 24px rgba(37, 99, 235, 0.12);
  color: var(--app-primary);
  display: inline-flex;
  height: 72px;
  justify-content: center;
  overflow: hidden;
  width: 72px;
}

.logo-upload__artwork img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.logo-upload__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.logo-upload__clear {
  color: var(--app-text-muted);
  flex: 0 0 auto;
}

.logo-upload__dropzone {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1.5px dashed rgba(37, 99, 235, 0.24);
  border-radius: 16px;
  color: var(--app-text-muted);
  display: grid;
  min-height: 42px;
  padding: 0 12px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.logo-upload__dropzone:hover {
  border-color: rgba(37, 99, 235, 0.36);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.08);
}

.logo-upload__dropzone :deep(.q-field__control) {
  background: transparent;
  border: 0;
  min-height: 42px;
  padding: 0;
}

.logo-upload__dropzone :deep(.q-field__control::before),
.logo-upload__dropzone :deep(.q-field__control::after) {
  display: none;
}

.logo-upload__dropzone :deep(.q-field__native) {
  color: var(--app-text);
  font-weight: 800;
}

.logo-upload__dropzone :deep(.q-field__label) {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.logo-upload__dropzone :deep(.q-icon) {
  color: var(--app-primary);
  flex: 0 0 auto;
}

.logo-upload__file-name {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-toolbar {
  align-items: start;
  background: rgba(248, 250, 252, 0.74);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 12px 14px;
}

.feature-toolbar__meta {
  min-width: 0;
}

.feature-toolbar__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.feature-toolbar__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.feature-toolbar__actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.feature-toolbar__action {
  min-height: 34px;
}

.feature-selected {
  background: rgba(248, 250, 252, 0.74);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px 14px;
}

.feature-selected__header {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.feature-selected__title {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.feature-selected__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-selected__chip {
  max-width: 100%;
}

.feature-selected__empty {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

.feature-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.feature-toggle {
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 13px;
  color: var(--app-text);
  cursor: pointer;
  display: grid;
  gap: 8px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-height: 38px;
  padding: 8px 10px;
  text-align: left;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease,
    color 0.18s ease;
  width: 100%;
}

.feature-toggle:hover {
  background: rgba(37, 99, 235, 0.04);
  border-color: rgba(37, 99, 235, 0.18);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.04);
  transform: translateY(-1px);
}

.feature-toggle--active {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.22);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.04);
  color: var(--app-primary);
}

.feature-toggle__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 10px;
  color: var(--app-primary);
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.feature-toggle--active .feature-toggle__icon {
  background: rgba(37, 99, 235, 0.14);
}

.feature-toggle__label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-toggle__check {
  color: var(--app-primary);
  flex: 0 0 auto;
}

@media (max-width: 1120px) {
  .config-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .step-panel,
  .field-group {
    padding: 14px;
  }

  .step-grid,
  .feature-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .feature-toolbar {
    flex-direction: column;
  }

  .feature-toolbar__actions {
    justify-content: flex-start;
    width: 100%;
  }

  .logo-upload {
    grid-template-columns: minmax(0, 1fr);
  }

  .logo-upload__heading {
    align-items: start;
  }
}
</style>
