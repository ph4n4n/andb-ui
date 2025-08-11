<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      :title="$t('navigation.theme')"
    >
      <Sun v-if="settings.theme === 'light'" class="w-5 h-5" />
      <Moon v-else-if="settings.theme === 'dark'" class="w-5 h-5" />
      <Monitor v-else class="w-5 h-5" />
    </button>

    <div
      v-if="isDropdownOpen"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="py-1">
        <button
          v-for="theme in themes"
          :key="theme.value"
          @click="selectTheme(theme.value)"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': settings.theme === theme.value }"
        >
          <component :is="theme.icon" class="w-4 h-4" />
          {{ $t(`settings.${theme.label}`) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useSettingsStore, type Theme } from '@/stores/settings'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const isDropdownOpen = ref(false)

const themes = [
  { value: 'light' as Theme, label: 'light', icon: Sun },
  { value: 'dark' as Theme, label: 'dark', icon: Moon },
  { value: 'system' as Theme, label: 'system', icon: Monitor }
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectTheme = (theme: Theme) => {
  settingsStore.setTheme(theme)
  isDropdownOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isDropdownOpen.value = false
  }
}

// Add click outside listener
document.addEventListener('click', handleClickOutside)
</script>
