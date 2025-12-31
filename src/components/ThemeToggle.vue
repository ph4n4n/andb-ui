<template>
  <button
    @click="settingsStore.toggleTheme()"
    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group relative shrink-0"
    :title="$t('navigation.theme') + ': ' + settings.theme"
  >
    <div class="relative w-5 h-5 flex items-center justify-center">
      <Monitor v-if="settings.theme === 'system'" class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500" />
      <Sun v-else-if="settings.theme === 'light'" class="w-5 h-5 text-amber-500" />
      <Moon v-else class="w-5 h-5 text-indigo-400" />
    </div>
    
    <!-- Tooltip hint -->
    <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 capitalize">
      {{ settings.theme }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
</script>
