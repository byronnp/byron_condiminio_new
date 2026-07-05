<template>
  <div class="app-empty-state" :class="{ 'app-empty-state--tight': tight }" role="status">
    <q-icon :name="icon" size="36px" />
    <div class="app-empty-state__title">{{ title }}</div>
    <div class="app-empty-state__text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    text: string;
    tight?: boolean;
  }>(),
  {
    tight: false,
  },
);
</script>

<style scoped>
.app-empty-state--tight {
  min-height: 150px;
  padding-block: 24px;
}

.app-empty-state .q-icon {
  color: var(--app-primary);
}
</style>
