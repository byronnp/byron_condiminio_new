<template>
  <q-dialog v-model="openProxy">
    <q-card class="detail-dialog">
      <q-card-section>
        <div class="text-h6">Gestionar parqueaderos</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          Esta acción abre el flujo para asociar un parqueadero a la vivienda.
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancelar" @click="closeDialog" />
        <q-btn unelevated color="primary" no-caps label="Guardar" @click="saveDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save'): void;
}>();

const openProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

function closeDialog() {
  openProxy.value = false;
}

function saveDialog() {
  emit('save');
  openProxy.value = false;
}
</script>

<style scoped lang="scss">
.detail-dialog {
  min-width: 320px;
  border-radius: 18px;
}
</style>

