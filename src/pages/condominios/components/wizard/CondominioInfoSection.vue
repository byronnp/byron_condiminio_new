<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="step-panel step-panel--airy">
    <div class="field-group location-layout__panel location-panel info-panel">
      <div class="location-panel__header">
        <div class="location-panel__heading">
          <q-icon name="apartment" size="18px" />
          <span>Información general</span>
        </div>
        <div class="location-panel__hint">
          Define la identidad del condominio antes de continuar.
        </div>
      </div>

      <div class="step-grid">
        <q-input
          v-model="form.name"
          class="step-field"
          dense
          outlined
          hide-bottom-space
          label="Nombre del condominio *"
          :rules="[requiredRule]"
        />
        <q-input
          v-model="form.ruc"
          class="step-field"
          dense
          outlined
          hide-bottom-space
          label="RUC del condominio *"
          :rules="[requiredRule]"
        />
        <q-select
          v-model="form.type"
          class="step-field"
          dense
          outlined
          hide-bottom-space
          :options="typeOptions"
          :loading="typeOptionsLoading"
          label="Tipo de condominio *"
          :rules="[requiredRule]"
        />
        <div class="step-field step-field--status">
          <div class="field-label">Estado *</div>
          <q-option-group
            v-model="form.status"
            :options="statusRadioOptions"
            color="primary"
            inline
            dense
            type="radio"
          />
        </div>
        <q-input
          v-model="form.description"
          class="step-field step-field--full"
          dense
          outlined
          hide-bottom-space
          type="textarea"
          autogrow
          label="Descripción"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type SelectOption<T extends string | number> = { label: string; value: T };

defineProps<{
  form: {
    name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
  };
  typeOptions: string[];
  typeOptionsLoading: boolean;
  statusRadioOptions: SelectOption<string | number>[];
  requiredRule: (value: unknown) => boolean | string;
}>();
</script>
