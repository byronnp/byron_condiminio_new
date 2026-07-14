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
          v-model="form.email"
          class="step-field"
          dense
          outlined
          hide-bottom-space
          type="email"
          label="Correo del condominio"
        />
        <q-input
          v-model="form.phone"
          class="step-field"
          dense
          outlined
          hide-bottom-space
          label="Teléfono del condominio"
        />
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
  email: string;
  phone: string;
  };
  typeOptions: string[];
  typeOptionsLoading: boolean;
  statusRadioOptions: SelectOption<string | number>[];
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

.field-group {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.86)),
    rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
  padding: 16px;
}

.location-panel {
  align-content: start;
  display: grid;
  gap: 0;
  height: 100%;
  min-width: 0;
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

.step-field--full,
.step-field--status {
  grid-column: 1 / -1;
}

.step-field--status {
  display: grid;
  gap: 10px;
}

.step-field--status :deep(.q-option-group) {
  width: 100%;
}

.field-label {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .step-panel,
  .field-group {
    padding: 14px;
  }

  .step-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .step-field--full,
  .step-field--status {
    grid-column: auto;
  }
}
</style>
