<template>
  <q-dialog v-model="openProxy" persistent>
    <q-card class="detail-dialog">
      <q-form ref="formRef" @submit.prevent="handleSubmit">
        <q-card-section class="detail-dialog__header">
          <div class="detail-dialog__eyebrow">Parqueaderos</div>
          <div class="text-h6">Crear parqueadero</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Crea un nuevo parqueadero vinculado a esta vivienda.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="detail-dialog__body">
          <div class="detail-dialog__note">
            Este registro se crea como una unidad hija de la casa seleccionada.
          </div>

          <div class="detail-dialog__grid q-mt-md">
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
            label="Crear parqueadero"
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
  number: string;
  areaM2: number | null;
};

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    saving?: boolean;
  }>(),
  {
    saving: false,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', value: CreateParkingUnitPayload): void;
}>();

const formRef = ref<{ validate: () => Promise<boolean> | boolean } | null>(null);

const form = reactive<ParkingFormModel>({
  number: '',
  areaM2: null,
});

const openProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const requiredTextRule = (value: unknown) =>
  typeof value === 'string' && value.trim() ? true : 'Campo requerido';

const generatedCode = computed(() => {
  const number = form.number.trim();
  return number ? `PARQ-${number}`.toUpperCase() : '';
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

    form.number = '';
    form.areaM2 = null;
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
    number: form.number.trim(),
    code: generatedCode.value,
    areaM2: form.areaM2,
  });
}
</script>

<style scoped lang="scss">
.detail-dialog {
  border-radius: 18px;
  min-width: min(92vw, 520px);
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

.detail-dialog__body {
  display: grid;
  gap: 12px;
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
    min-width: min(94vw, 520px);
  }

  .detail-dialog__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
