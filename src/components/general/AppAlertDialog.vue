<template>
  <q-dialog v-model="openProxy" persistent>
    <q-card class="app-dialog app-dialog--alert">
      <q-card-section class="app-dialog__content">
        <div class="app-dialog__icon" :class="`app-dialog__icon--${tone}`">
          <q-icon :name="icon" size="52px" />
        </div>

        <div class="app-dialog__title">{{ title }}</div>
        <div class="app-dialog__message">{{ message }}</div>
      </q-card-section>

      <q-card-actions align="center" class="app-dialog__actions">
        <q-btn color="primary" unelevated no-caps :label="buttonLabel" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type DialogTone = 'primary' | 'positive' | 'negative' | 'warning';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    icon?: string;
    tone?: DialogTone;
    buttonLabel?: string;
  }>(),
  {
    icon: 'info',
    tone: 'primary',
    buttonLabel: 'Entendido',
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'close'): void;
}>();

const openProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

function closeDialog() {
  openProxy.value = false;
  emit('close');
}
</script>

<style scoped>
.app-dialog {
  border-radius: 24px;
  max-width: 420px;
  width: 100%;
}

.app-dialog__content {
  align-items: center;
  display: grid;
  gap: 14px;
  justify-items: center;
  padding: 32px 28px 20px;
  text-align: center;
}

.app-dialog__icon {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  height: 92px;
  justify-content: center;
  width: 92px;
}

.app-dialog__icon--primary {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.app-dialog__icon--positive {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.app-dialog__icon--negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.app-dialog__icon--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.app-dialog__title {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.app-dialog__message {
  color: var(--app-text-muted);
  line-height: 1.55;
}

.app-dialog__actions {
  padding: 0 20px 20px;
}
</style>
