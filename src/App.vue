<template>
  <div id="app" class="h-screen bg-gray-50 dark:bg-gray-900">
    <router-view />
    <UpdateModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUpdaterStore } from '@/stores/updater'
import UpdateModal from '@/components/UpdateModal.vue'

const appStore = useAppStore()
const updaterStore = useUpdaterStore()

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
  
  // Listen for Electron Updater events
  if (window.electronAPI?.updater) {
    window.electronAPI.updater.onUpdateStatus((response: any) => {
      updaterStore.setStatus(response.status, response.info || response.progress || response.error)
    })
    // Initial check (quietly)
    // updaterStore.checkForUpdates() // Optional, main process does it on startup
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (window.electronAPI?.updater) {
    window.electronAPI.updater.offUpdateStatus()
  }
})
</script>
