<template>
  <!-- eslint-disable vue/no-mutating-props -->
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
          <div class="field-group__hint">Datos necesarios para identificar al administrador.</div>
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
</template>

<script setup lang="ts">
type SelectOption<T extends string | number> = { label: string; value: T };

defineProps<{
  form: {
    firstName: string;
    lastName: string;
    documentType: number | null;
    documentNumber: string;
    email: string;
    phone: string;
  };
  documentTypeOptions: SelectOption<number>[];
  documentTypeOptionsLoading: boolean;
  normalizedEmail: string;
  requiredRule: (value: unknown) => boolean | string;
  emailRule: (value: unknown) => boolean | string;
  phoneRule: (value: unknown) => boolean | string;
  documentNumberRule: (value: unknown) => boolean | string;
}>();
</script>
