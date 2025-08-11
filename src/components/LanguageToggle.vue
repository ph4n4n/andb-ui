<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      :title="$t('navigation.language')"
    >
      <Globe class="w-5 h-5" />
    </button>

    <div
      v-if="isDropdownOpen"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="py-1">
        <button
          v-for="lang in languages"
          :key="lang.value"
          @click="selectLanguage(lang.value)"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': settings.language === lang.value }"
        >
          <span class="text-sm font-medium">{{ lang.flag }}</span>
          {{ $t(`settings.${lang.label}`) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Globe } from 'lucide-vue-next'
import { useSettingsStore, type Language } from '@/stores/settings'
import { setLanguage } from '@/i18n'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const isDropdownOpen = ref(false)

const languages = [
  { value: 'en' as Language, label: 'english', flag: '🇺🇸' },
  { value: 'vi' as Language, label: 'vietnamese', flag: '🇻🇳' }
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectLanguage = (language: Language) => {
  settingsStore.setLanguage(language)
  setLanguage(language)
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
