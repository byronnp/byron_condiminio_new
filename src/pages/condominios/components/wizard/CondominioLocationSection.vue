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
            v-model="location.direction"
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
    direction: string;
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
