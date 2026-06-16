<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <q-page-container class="auth-layout__container">
      <router-view v-slot="{ Component, route }">
        <transition name="auth-fade" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
//
</script>

<style scoped>
.auth-layout {
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 22%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.08), transparent 18%),
    var(--app-bg);
}

.auth-layout__container {
  min-height: 100vh;
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.auth-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.auth-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
