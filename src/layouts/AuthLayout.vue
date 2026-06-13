<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <q-page-container class="auth-layout__container">
      <router-view />
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
</style>
