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
