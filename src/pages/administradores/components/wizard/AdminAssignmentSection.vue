<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <div class="step-panel">
    <div class="section-title">Tipo y asignación</div>
    <div class="section-subtitle">
      Define si tendrá alcance global o acceso limitado a un condominio.
    </div>

    <div v-if="sessionIsSenior" class="type-grid q-mt-md">
      <button
        v-for="option in administratorTypeOptions"
        :key="option.value"
        type="button"
        class="type-card"
        :class="{ 'type-card--selected': form.type === option.value }"
        :aria-pressed="form.type === option.value"
        @click="$emit('select-administrator-type', option.value)"
      >
        <span class="type-card__icon">
          <q-icon :name="option.icon" size="24px" />
        </span>
        <span class="type-card__content">
          <span class="type-card__title">{{ option.label }}</span>
          <span class="type-card__text">{{ option.description }}</span>
          <span class="type-card__meta">{{ option.meta }}</span>
        </span>
        <q-icon
          :name="form.type === option.value ? 'radio_button_checked' : 'radio_button_unchecked'"
          class="type-card__check"
          size="20px"
        />
      </button>
    </div>

    <div v-else class="scope-panel q-mt-md">
      <div class="scope-panel__icon">
        <q-icon name="apartment" size="21px" />
      </div>
      <div>
        <div class="scope-panel__title">Administrador de condominio</div>
        <div class="scope-panel__text">
          La nueva cuenta se asignará automáticamente a
          <strong>{{ selectedCondominiumName }}</strong>.
        </div>
      </div>
    </div>

    <div v-if="form.type === 'senior'" class="scope-panel q-mt-md">
      <div class="scope-panel__icon">
        <q-icon name="public" size="21px" />
      </div>
      <div>
        <div class="scope-panel__title">Acceso global</div>
        <div class="scope-panel__text">
          Podrá consultar todos los condominios y cambiar el contexto activo.
        </div>
      </div>
    </div>

    <div v-else-if="form.type === 'condominium_admin'" class="field-group q-mt-md">
      <div class="field-group__header">
        <q-icon name="apartment" size="18px" />
        <div>
          <div class="field-group__title">Condominio asignado</div>
          <div class="field-group__hint">
            La cuenta tendrá acceso únicamente al condominio seleccionado.
          </div>
        </div>
      </div>

      <q-select
        v-if="sessionIsSenior"
        v-model="form.condominiumId"
        class="q-mt-md"
        dense
        outlined
        emit-value
        map-options
        use-input
        input-debounce="150"
        hide-bottom-space
        label="Seleccionar condominio *"
        option-label="label"
        option-value="value"
        :options="filteredCondominiumOptions"
        :loading="isLoadingCondominiums"
        :disable="isLoadingCondominiums || condominiumOptions.length === 0"
        :rules="[requiredRule]"
        @filter="(value, update) => $emit('filter-condominiums', value, update)"
      >
        <template #prepend>
          <q-icon name="location_city" />
        </template>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">No hay condominios disponibles</q-item-section>
          </q-item>
        </template>
      </q-select>

      <div v-else class="scope-panel q-mt-md">
        <div class="scope-panel__icon">
          <q-icon name="domain" size="21px" />
        </div>
        <div>
          <div class="scope-panel__title">{{ selectedCondominiumName }}</div>
          <div class="scope-panel__text">Condominio definido por tu sesión.</div>
        </div>
      </div>

      <div v-if="condominiumsLoadError" class="load-error q-mt-sm">
        <q-icon name="error_outline" size="18px" />
        <span>{{ condominiumsLoadError }}</span>
        <q-btn flat dense no-caps label="Reintentar" @click="$emit('retry-condominiums')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type SelectOption<T extends string | number> = { label: string; value: T };

defineProps<{
  form: {
    type: 'senior' | 'condominium_admin' | null;
    condominiumId: number | null;
  };
  sessionIsSenior: boolean;
  administratorTypeOptions: Array<{
    value: 'senior' | 'condominium_admin';
    label: string;
    description: string;
    meta: string;
    icon: string;
  }>;
  filteredCondominiumOptions: SelectOption<number>[];
  condominiumOptions: SelectOption<number>[];
  isLoadingCondominiums: boolean;
  condominiumsLoadError: string;
  selectedCondominiumName: string;
  requiredRule: (value: unknown) => boolean | string;
}>();

defineEmits<{
  (event: 'select-administrator-type', value: 'senior' | 'condominium_admin'): void;
  (
    event: 'filter-condominiums',
    value: string,
    update: (callback: () => void) => void,
  ): void;
  (event: 'retry-condominiums'): void;
}>();
</script>
