<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="step-panel step-panel--airy">
    <div class="section-title">Ubicación</div>
    <div class="section-subtitle">
      Define la dirección y la georreferencia del condominio.
    </div>

    <div class="location-layout q-mt-md">
      <div class="field-group location-layout__panel location-panel">
        <div class="location-panel__header">
          <div class="location-panel__heading">
            <q-icon name="public" size="18px" />
            <span>Ubicación geográfica</span>
          </div>
          <div class="location-panel__hint">Completa la dirección base del condominio.</div>
        </div>

        <div class="step-grid">
          <q-select
            v-model="location.countryCode"
            class="step-field"
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :options="countryOptions"
            :loading="countryOptionsLoading"
            label="País *"
            :rules="[requiredRule]"
          />
          <q-select
            v-model="location.provinceId"
            class="step-field"
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :options="provinceOptions"
            :loading="provinceOptionsLoading"
            label="Provincia *"
            :rules="[requiredRule]"
            :disable="!location.countryCode"
          />
          <q-select
            v-model="location.cityId"
            class="step-field"
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :options="cityOptions"
            :loading="cityOptionsLoading"
            label="Ciudad *"
            :rules="[requiredRule]"
            :disable="!location.provinceId"
          />
          <q-input
            v-model="location.address"
            class="step-field step-field--full"
            dense
            outlined
            hide-bottom-space
            label="Dirección *"
            :rules="[requiredRule]"
          />
          <q-input
            v-model="location.reference"
            class="step-field step-field--full"
            dense
            outlined
            hide-bottom-space
            type="textarea"
            autogrow
            label="Referencia"
          />
        </div>
      </div>

      <div class="field-group location-layout__panel location-panel location-panel--map">
        <div class="location-panel__header">
          <div class="location-panel__heading">
            <q-icon name="place" size="18px" />
            <span>Georreferenciación</span>
          </div>
          <div class="location-panel__hint">Define el punto exacto para asociarlo al registro.</div>
        </div>

        <div class="map-preview">
          <div class="map-preview__top">
            <div>
              <div class="map-preview__title">Ubicación en mapa</div>
              <div class="map-preview__subtitle">
                {{
                  location.reference ? 'Referencia disponible' : 'Punto pendiente por definir'
                }}
              </div>
            </div>
            <q-badge outline rounded :color="location.reference ? 'positive' : 'warning'">
              {{ location.reference ? 'Referencia cargada' : 'Pendiente' }}
            </q-badge>
          </div>

          <div class="map-preview__canvas">
            <div class="map-preview__grid"></div>
            <div class="map-preview__halo"></div>
            <div class="map-preview__pin">
              <q-icon name="location_on" size="24px" />
            </div>
            <div class="map-preview__legend">Mapa interactivo de referencia</div>
          </div>

          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="place"
            label="Definir en mapa"
            class="map-preview__action"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type SelectOption<T extends string | number> = { label: string; value: T };

defineProps<{
  location: {
    countryCode: string;
    provinceId: number | null;
    cityId: number | null;
    address: string;
    reference: string;
  };
  countryOptions: SelectOption<string | number>[];
  provinceOptions: SelectOption<string | number>[];
  cityOptions: SelectOption<string | number>[];
  countryOptionsLoading: boolean;
  provinceOptionsLoading: boolean;
  cityOptionsLoading: boolean;
  requiredRule: (value: unknown) => boolean | string;
}>();
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

.location-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  width: 100%;
}

.location-layout__panel {
  min-width: 0;
}

.field-group {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.86)),
    rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 16px;
}

.location-panel {
  align-content: start;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 0;
  height: 100%;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  width: 100%;
}

.step-field {
  width: 100%;
}

.step-field--full {
  grid-column: 1 / -1;
}

.map-preview {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  display: grid;
  gap: 14px;
}

.map-preview__top {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.map-preview__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.map-preview__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.map-preview__canvas {
  align-items: center;
  background:
    radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(246, 248, 251, 0.96), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 280px;
  overflow: hidden;
  padding: 24px;
  position: relative;
}

.map-preview__grid {
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.06) 1px, transparent 1px);
  background-position: center;
  background-size: 36px 36px;
  inset: 0;
  opacity: 0.7;
  position: absolute;
}

.map-preview__halo {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.16), transparent 62%);
  border-radius: 999px;
  height: 180px;
  position: absolute;
  width: 180px;
}

.map-preview__pin {
  align-items: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.08));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  height: 58px;
  justify-content: center;
  position: relative;
  width: 58px;
  z-index: 1;
}

.map-preview__legend {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  position: relative;
  z-index: 1;
}

.map-preview__action {
  border-radius: 14px;
  min-height: 42px;
  width: 100%;
}

@media (max-width: 1120px) {
  .location-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .step-panel,
  .field-group {
    padding: 14px;
  }

  .step-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .step-field--full {
    grid-column: auto;
  }

  .map-preview__top {
    align-items: start;
    flex-direction: column;
  }
}
</style>
