<template>
  <q-dialog v-model="openProxy" persistent>
    <q-card class="created-dialog">
      <q-card-section class="created-dialog__content">
        <div class="created-dialog__icon">
          <q-icon name="check_circle" size="64px" />
        </div>

        <div class="created-dialog__title">¡Condominio creado!</div>
        <div class="created-dialog__subtitle">
          El condominio se registró correctamente y ya puede administrarse desde la plataforma.
        </div>

        <q-card flat bordered class="created-dialog__summary">
          <q-card-section>
            <div class="created-dialog__summary-name">{{ condoName }}</div>
            <div class="created-dialog__summary-meta">{{ condoType }} · {{ condoStatus }}</div>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-actions align="between" class="created-dialog__actions">
        <q-btn flat no-caps label="Cerrar" v-close-popup @click="emit('close')" />
        <q-btn color="primary" unelevated no-caps label="Ir al condominio" @click="emit('go-to-condominio')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  condoName: string;
  condoType: string;
  condoStatus: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'close'): void;
  (event: 'go-to-condominio'): void;
}>();

const openProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});
</script>

<style scoped>
.created-dialog {
  border-radius: 24px;
  max-width: 420px;
  width: 100%;
}

.created-dialog__content {
  align-items: center;
  display: grid;
  gap: 14px;
  justify-items: center;
  padding: 32px 28px 20px;
  text-align: center;
}

.created-dialog__icon {
  color: #16a34a;
}

.created-dialog__title {
  color: var(--app-text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.created-dialog__subtitle {
  color: var(--app-text-muted);
  line-height: 1.55;
}

.created-dialog__summary {
  border-radius: 18px;
  width: 100%;
}

.created-dialog__summary-name {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 800;
}

.created-dialog__summary-meta {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.created-dialog__actions {
  padding: 0 20px 20px;
}
</style>
