<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group relative shrink-0"
      :title="$t('navigation.theme') + ': ' + settings.theme"
    >
      <div class="relative w-5 h-5 flex items-center justify-center">
        <!-- Sun for light themes, Moon for dark themes -->
        <Monitor v-if="settings.theme === 'system'" class="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
        <Sun v-else-if="!currentThemePreview.dark" class="w-5 h-5 text-amber-500" />
        <Moon v-else class="w-5 h-5 text-indigo-400" />
      </div>
    </button>

    <!-- Compact Theme Menu -->
    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-[110]" @click="isOpen = false"></div>
      <div 
        v-if="isOpen" 
        class="fixed z-[120] top-14 right-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
      >
        <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{{ $t('navigation.theme') }}</p>
        </div>
        
        <div class="space-y-0.5">
          <!-- System Option -->
          <button 
            @click="selectTheme('system')"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group"
            :class="settings.theme === 'system' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
          >
            <Monitor class="w-4 h-4" :class="settings.theme === 'system' ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'" />
            <span class="text-[11px] font-bold uppercase tracking-widest flex-1 text-left">Sync System</span>
            <Check v-if="settings.theme === 'system'" class="w-3 h-3" />
          </button>

          <div class="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2"></div>

          <!-- Manual Options -->
          <button 
            v-for="t in themeOptions" :key="t.id"
            @click="selectTheme(t.id)"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group"
            :class="settings.theme === t.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
          >
            <div 
              class="w-4 h-4 rounded-full border-2 transition-colors relative overflow-hidden" 
              :class="settings.theme === t.id ? 'border-white' : 'border-gray-200 dark:border-gray-700 group-hover:border-primary-500'"
            >
              <div class="absolute inset-0 flex">
                <div class="flex-1" :style="{ backgroundColor: t.preview.sidebar }"></div>
                <div class="w-2/3" :style="{ backgroundColor: t.preview.main }"></div>
              </div>
            </div>
            <span class="text-[11px] font-bold uppercase tracking-widest flex-1 text-left">{{ t.label }}</span>
            <Check v-if="settings.theme === t.id" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sun, Moon, Monitor, Check } from 'lucide-vue-next'
import { useSettingsStore, themeOptions } from '@/stores/settings'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const isOpen = ref(false)

const currentThemePreview = computed(() => {
  return themeOptions.find(t => t.id === settings.value.theme) || themeOptions[0]
})

const selectTheme = (id: any) => {
  settingsStore.setTheme(id)
  isOpen.value = false
}
</script>
