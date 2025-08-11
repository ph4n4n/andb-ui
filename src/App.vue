<template>
  <div id="app" class="h-screen bg-gray-50 dark:bg-gray-900">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// Global keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+B or Cmd+B to toggle sidebar
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    appStore.toggleSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
