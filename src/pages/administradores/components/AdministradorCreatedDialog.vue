<template>
  <q-dialog v-model="openProxy" persistent>
    <q-card class="created-dialog">
      <q-card-section class="created-dialog__content">
        <div class="created-dialog__icon">
          <q-icon name="mark_email_read" size="64px" />
        </div>

        <div class="created-dialog__title">Administrador creado</div>
        <div class="created-dialog__subtitle">
          La cuenta se registró correctamente y la API enviará la invitación de acceso por correo
          electrónico.
        </div>

        <q-card flat bordered class="created-dialog__summary">
          <q-card-section>
            <div class="created-dialog__summary-name">{{ administratorName }}</div>
            <div class="created-dialog__summary-email">{{ administratorEmail }}</div>
            <div class="created-dialog__summary-meta">
              {{ administratorType }} · {{ administratorScope }}
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-actions align="between" class="created-dialog__actions">
        <q-btn
          flat
          no-caps
          label="Crear otro"
          aria-label="Crear otro administrador"
          @click="createAnother"
        />
        <q-btn
          color="primary"
          unelevated
          no-caps
          label="Volver al listado"
          aria-label="Volver al listado de administradores"
          @click="goToAdministrators"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  administratorName: string;
  administratorEmail: string;
  administratorType: string;
  administratorScope: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'create-another'): void;
  (event: 'go-to-administrators'): void;
}>();

const openProxy = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

function createAnother() {
  openProxy.value = false;
  emit('create-another');
}

function goToAdministrators() {
  emit('go-to-administrators');
}
</script>

<style scoped>
.created-dialog {
  border-radius: 24px;
  max-width: 440px;
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

.created-dialog__summary-email {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 3px;
}

.created-dialog__summary-meta {
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 800;
  margin-top: 8px;
}

.created-dialog__actions {
  padding: 0 20px 20px;
}

@media (max-width: 599px) {
  .created-dialog {
    border-radius: 20px;
    max-width: calc(100vw - 24px);
  }

  .created-dialog__content {
    padding: 26px 20px 18px;
  }

  .created-dialog__actions {
    align-items: stretch;
    flex-direction: column;
    padding: 0 18px 18px;
  }

  .created-dialog__actions .q-btn {
    width: 100%;
  }
}
</style>
