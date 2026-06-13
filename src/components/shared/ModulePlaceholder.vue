<template>
  <q-page class="module-page">
    <q-card class="module-card">
      <q-card-section class="module-card__content">
        <div class="module-card__icon">
          <q-icon :name="icon" size="28px" />
        </div>
        <div>
          <div class="module-card__eyebrow">Módulo en construcción</div>
          <div class="module-card__title">{{ title }}</div>
          <div class="module-card__subtitle">{{ description }}</div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon: string;
}>();
</script>

<style scoped>
.module-page {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 140px);
  padding: 6px 8px 0 4px;
}

.module-card {
  max-width: 760px;
  width: 100%;
}

.module-card__content {
  align-items: center;
  display: flex;
  gap: 16px;
  padding: 28px;
}

.module-card__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.12);
  border-radius: 18px;
  color: var(--app-primary);
  display: inline-flex;
  flex-shrink: 0;
  height: 64px;
  justify-content: center;
  width: 64px;
}

.module-card__eyebrow {
  color: var(--app-primary);
  font-size: 13px;
  font-weight: 800;
}

.module-card__title {
  color: var(--app-text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-top: 6px;
}

.module-card__subtitle {
  color: var(--app-text-muted);
  margin-top: 8px;
}

@media (max-width: 599px) {
  .module-card__content {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }
}
</style>
