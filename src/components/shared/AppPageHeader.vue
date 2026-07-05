<template>
  <header class="app-page-header">
    <div class="app-page-header__content">
      <div v-if="eyebrow" class="app-page-header__eyebrow">{{ eyebrow }}</div>
      <h1 class="app-page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="app-page-header__subtitle">{{ subtitle }}</p>
      <div v-if="$slots.badges" class="app-page-header__meta">
        <slot name="badges" />
      </div>
    </div>

    <div v-if="$slots.actions" class="app-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
}>();
</script>
