<template>
  <q-dialog v-model="openProxy" persistent>
    <q-card class="detail-dialog">
      <q-form ref="formRef" @submit.prevent="handleSubmit">
        <q-card-section class="detail-dialog__header">
          <div class="detail-dialog__eyebrow">Unidades asociadas</div>
          <div class="text-h6">{{ dialogTitle }}</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            {{ dialogSubtitle }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="detail-dialog__body">
          <div class="detail-dialog__note">
            Este registro se administra como una unidad hija de la casa seleccionada.
          </div>

          <div class="detail-dialog__grid q-mt-md">
            <q-select
              v-model="form.kind"
              dense
              outlined
              emit-value
              map-options
              label="Tipo *"
              :options="kindOptions"
              :rules="[requiredTextRule]"
            />

            <q-input
              v-model="form.number"
              dense
              outlined
              label="Número *"
              placeholder="Ej: 01"
              maxlength="30"
              :rules="[requiredTextRule]"
            />

            <q-input
              :model-value="generatedCode"
              dense
              outlined
              disable
              readonly
              label="Código interno *"
              hint="Se genera automáticamente"
            />

            <q-input
              v-model.number="form.areaM2"
              dense
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Área"
              suffix="m²"
              placeholder="Opcional"
              :rules="[areaRule]"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="detail-dialog__actions">
          <q-btn flat no-caps label="Cancelar" @click="closeDialog" />
          <q-btn
            unelevated
            color="primary"
            no-caps
            type="submit"
            :loading="saving"
            :label="submitLabel"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import type { CreateParkingUnitPayload } from '@/services/units.service';

type ParkingFormModel = {
  kind: 'parking' | 'storage';
  number: string;
  areaM2: number | null;
};

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode?: 'create' | 'edit';
    saving?: boolean;
    initialValue?: CreateParkingUnitPayload | null;
  }>(),
  {
    mode: 'create',
    saving: false,
    initialValue: null,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', value: CreateParkingUnitPayload): void;
}>();

const formRef = ref<{ validate: () => Promise<boolean> | boolean } | null>(null);

const form = reactive<ParkingFormModel>({
  kind: 'parking',
  number: '',
  areaM2: null,
});
const kindOptions = [
  { label: 'Parqueadero', value: 'parking' },
  { label: 'Bodega', value: 'storage' },
] as const;

const openProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});
const dialogTitle = computed(() =>
  props.mode === 'edit' ? 'Editar unidad asociada' : 'Agregar unidad asociada',
);
const dialogSubtitle = computed(() =>
  props.mode === 'edit'
    ? 'Actualiza el tipo, número o área de la unidad asociada.'
    : 'Crea un parqueadero o bodega vinculado a esta vivienda.',
);
const submitLabel = computed(() =>
  props.mode === 'edit' ? 'Guardar cambios' : 'Agregar unidad asociada',
);

const requiredTextRule = (value: unknown) =>
  typeof value === 'string' && value.trim() ? true : 'Campo requerido';

const generatedCode = computed(() => {
  const number = form.number.trim();
  const prefix = form.kind === 'storage' ? 'BOD' : 'PARQ';
  return number ? `${prefix}-${number}`.toUpperCase() : '';
});

const areaRule = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 'Ingresa un valor válido';
  }

  return numericValue >= 0 ? true : 'Debe ser mayor o igual a 0';
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      return;
    }

    form.kind = props.initialValue?.kind ?? 'parking';
    form.number = props.initialValue?.number ?? '';
    form.areaM2 = props.initialValue?.areaM2 ?? null;
  },
);

function closeDialog() {
  openProxy.value = false;
}

async function handleSubmit() {
  const isValid = await formRef.value?.validate();
  if (isValid === false) {
    return;
  }

  emit('save', {
    kind: form.kind,
    number: form.number.trim(),
    code: generatedCode.value,
    areaM2: form.areaM2,
  });
}
</script>

<style scoped lang="scss">
.detail-dialog {
  border-radius: 18px;
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.18);
  max-height: calc(100vh - 32px);
  width: min(92vw, 520px);
}

.detail-dialog__header {
  display: grid;
  gap: 4px;
}

.detail-dialog__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-dialog :deep(.text-h6) {
  color: var(--app-text);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.detail-dialog__body {
  display: grid;
  gap: 12px;
  overflow-y: auto;
}

.detail-dialog__note {
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 14px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  padding: 10px 12px;
}

.detail-dialog__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-dialog__grid :deep(.q-field--error) {
  grid-column: span 1;
}

.detail-dialog__grid :deep(.q-field:nth-child(3)) {
  grid-column: 1 / -1;
}

.detail-dialog__actions {
  padding: 16px 20px 20px;
}

@media (max-width: 720px) {
  .detail-dialog {
    width: calc(100vw - 24px);
  }

  .detail-dialog__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-dialog__actions {
    flex-direction: column-reverse;
    gap: 10px;
    padding: 0 16px 16px;
  }

  .detail-dialog__actions :deep(.q-btn) {
    width: 100%;
  }
}
</style>
