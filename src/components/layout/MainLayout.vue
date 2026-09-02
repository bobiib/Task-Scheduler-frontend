<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="layout-wrapper">
    <AppSidebar />
    <div class="layout-main">
      <AppHeader />
      <main class="layout-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: var(--bg-main);
}

.layout-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}
</style>
