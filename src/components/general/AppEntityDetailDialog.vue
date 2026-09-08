<template>
  <q-dialog v-model="openProxy" transition-show="scale" transition-hide="scale">
    <q-card class="entity-detail-dialog">
      <q-btn
        flat
        round
        dense
        icon="close"
        class="entity-detail-dialog__close"
        aria-label="Cerrar"
        @click="closeDialog"
      />

      <q-card-section
        class="entity-detail-dialog__header"
        :class="`entity-detail-dialog__header--${tone}`"
      >
        <div class="entity-detail-dialog__icon" :class="`entity-detail-dialog__icon--${tone}`">
          <q-icon :name="icon" size="22px" />
        </div>
        <div class="entity-detail-dialog__heading">
          <div class="entity-detail-dialog__title">{{ title }}</div>
          <div v-if="subtitle" class="entity-detail-dialog__subtitle">{{ subtitle }}</div>
        </div>
      </q-card-section>

      <q-card-section class="entity-detail-dialog__body">
        <div class="entity-detail-dialog__rows">
          <div v-for="row in rows" :key="row.label" class="entity-detail-dialog__row">
            <span>{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="entity-detail-dialog__actions">
        <q-btn
          flat
          no-caps
          :label="closeLabel"
          class="entity-detail-dialog__close-btn"
          @click="closeDialog"
        />
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
    subtitle?: string;
    icon?: string;
    tone?: DialogTone;
    rows: { label: string; value: string }[];
    closeLabel?: string;
  }>(),
  {
    icon: 'info',
    tone: 'primary',
    closeLabel: 'Cerrar',
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
.entity-detail-dialog {
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  max-width: 420px;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.entity-detail-dialog__close {
  color: var(--app-text-muted);
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
}

.entity-detail-dialog__header {
  align-items: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.07), rgba(37, 99, 235, 0) 100%);
  display: flex;
  gap: 14px;
  padding: 24px 44px 18px 22px;
}

.entity-detail-dialog__header--positive {
  background: linear-gradient(180deg, rgba(22, 163, 74, 0.07), rgba(22, 163, 74, 0) 100%);
}

.entity-detail-dialog__header--negative {
  background: linear-gradient(180deg, rgba(220, 38, 38, 0.07), rgba(220, 38, 38, 0) 100%);
}

.entity-detail-dialog__header--warning {
  background: linear-gradient(180deg, rgba(217, 119, 6, 0.08), rgba(217, 119, 6, 0) 100%);
}

.entity-detail-dialog__icon {
  align-items: center;
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  display: inline-flex;
  flex: 0 0 auto;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.entity-detail-dialog__icon--primary {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.entity-detail-dialog__icon--positive {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.entity-detail-dialog__icon--negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.entity-detail-dialog__icon--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.entity-detail-dialog__heading {
  min-width: 0;
}

.entity-detail-dialog__title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.entity-detail-dialog__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.entity-detail-dialog__body {
  padding: 4px 18px 0;
}

.entity-detail-dialog__rows {
  background: rgba(248, 250, 252, 0.76);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

.entity-detail-dialog__row {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(92px, 0.78fr) minmax(0, 1.22fr);
  padding: 12px 14px;
  transition: background-color 0.16s ease;
}

.entity-detail-dialog__row:hover {
  background: rgba(37, 99, 235, 0.045);
}

.entity-detail-dialog__row + .entity-detail-dialog__row {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.entity-detail-dialog__row span {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.4;
  text-transform: uppercase;
}

.entity-detail-dialog__row strong {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.4;
  overflow-wrap: anywhere;
  text-align: right;
}

.entity-detail-dialog__actions {
  padding: 14px 20px 20px;
}

.entity-detail-dialog__close-btn {
  border-radius: 12px;
}
</style>
