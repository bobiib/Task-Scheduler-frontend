<script setup lang="ts">
import MainLayout from './components/layout/MainLayout.vue'
</script>

<template>
  <RouterView v-if="$route.meta.authPage" :key="$route.name" />
  <MainLayout v-else>
    <RouterView />
  </MainLayout>
</template>
