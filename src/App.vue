<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavigationLayout from '@/components/layout/NavigationLayout.vue'

const route = useRoute()

// Determine if the current route should show NavigationLayout
const showNavigationLayout = computed(() => {
  return route.name !== 'Login' && route.path !== '/login'
})
</script>

<template>
  <NavigationLayout v-if="showNavigationLayout">
    <RouterView />
  </NavigationLayout>
  <RouterView v-else />
</template>

<style>
/* Global styles can be added here */
</style>