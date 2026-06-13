<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="unidad-dialog">
      <q-card-section class="unidad-dialog__header">
        <div>
          <div class="unidad-dialog__eyebrow">Crear / editar unidad</div>
          <div class="unidad-dialog__title">{{ title }}</div>
        </div>
        <q-btn flat round dense icon="close" @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-form class="unidad-dialog__form" @submit.prevent="submitForm">
        <q-card-section class="unidad-dialog__body">
          <div class="unidad-dialog__grid">
            <q-input
              v-model="localForm.bloque"
              dense
              outlined
              label="Bloque *"
              placeholder="Ej: A"
              :rules="[requiredRule]"
              maxlength="10"
            />
            <q-input
              v-model="localForm.numero"
              dense
              outlined
              label="Número de unidad *"
              placeholder="Ej: A-101"
              :rules="[requiredRule]"
              maxlength="20"
            />
            <q-input
              v-model.number="localForm.piso"
              dense
              outlined
              type="number"
              label="Piso *"
              min="0"
              :rules="[requiredNumberRule]"
            />
            <q-input
              v-model.number="localForm.area"
              dense
              outlined
              type="number"
              label="Área (m²) *"
              min="0"
              :rules="[requiredNumberRule]"
            />
            <q-input
              v-model.number="localForm.habitaciones"
              dense
              outlined
              type="number"
              label="Habitaciones *"
              min="0"
              :rules="[requiredNumberRule]"
            />
            <q-input
              v-model.number="localForm.banos"
              dense
              outlined
              type="number"
              label="Baños *"
              min="0"
              :rules="[requiredNumberRule]"
            />
            <q-input
              v-model.number="localForm.estacionamientos"
              dense
              outlined
              type="number"
              label="Estacionamientos *"
              min="0"
              :rules="[requiredNumberRule]"
            />
            <q-select
              v-model="localForm.estado"
              dense
              outlined
              :options="statusOptions"
              label="Estado *"
              :rules="[requiredRule]"
            />
          </div>

          <q-select
            v-model="localForm.propietario"
            dense
            outlined
            use-input
            input-debounce="0"
            label="Propietario asignado *"
            placeholder="Buscar propietario..."
            :options="ownerOptions"
            :rules="[requiredRule]"
            class="q-mt-md"
          />

          <q-input
            v-model="localForm.observaciones"
            dense
            outlined
            type="textarea"
            autogrow
            label="Observaciones"
            placeholder="Notas adicionales sobre la unidad..."
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="unidad-dialog__actions">
          <q-btn flat no-caps label="Cancelar" @click="$emit('update:modelValue', false)" />
          <q-btn color="primary" unelevated no-caps :label="saveLabel" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { UnidadFormState, UnidadStatus } from '@/composables/unidades/useUnidades';

const props = defineProps<{
  modelValue: boolean;
  formData: UnidadFormState;
  title: string;
  saveLabel: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', value: UnidadFormState): void;
}>();

const localForm = reactive<UnidadFormState>({
  bloque: '',
  numero: '',
  piso: null,
  area: null,
  habitaciones: null,
  banos: null,
  estacionamientos: null,
  propietario: '',
  estado: 'Disponible',
  observaciones: '',
});

watch(
  () => props.formData,
  (value) => {
    Object.assign(localForm, value);
  },
  { deep: true, immediate: true },
);

const statusOptions: UnidadStatus[] = ['Disponible', 'Ocupada', 'Mora', 'Exonerada'];
const ownerOptions = [
  'María González',
  'Juan Pérez',
  'Ana Rodríguez',
  'Carlos López',
  'Laura Martínez',
];

const requiredRule = (value: string) => !!value || 'Campo requerido';
const requiredNumberRule = (value: number | null) =>
  value !== null && value !== undefined ? true : 'Campo requerido';

function submitForm() {
  emit('save', { ...localForm });
}
</script>

<style scoped>
.unidad-dialog {
  max-width: 960px;
  width: 100%;
}

.unidad-dialog__header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
}

.unidad-dialog__eyebrow {
  color: var(--app-primary);
  font-size: 13px;
  font-weight: 800;
}

.unidad-dialog__title {
  color: var(--app-text);
  font-size: 20px;
  font-weight: 800;
  margin-top: 4px;
}

.unidad-dialog__form {
  display: grid;
}

.unidad-dialog__body {
  padding-top: 10px;
}

.unidad-dialog__grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.unidad-dialog__actions {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  padding: 16px 20px 20px;
}

@media (max-width: 599px) {
  .unidad-dialog__grid {
    grid-template-columns: 1fr;
  }
}
</style>
