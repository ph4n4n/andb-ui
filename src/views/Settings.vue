<template>
  <div class="h-screen flex flex-col pt-0 bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <Header />

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Settings Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Settings
          </h1>
          
          <!-- Accordion Sections -->
          <div class="space-y-4">
            
            <!-- General Settings -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button @click="toggleSection('general')"
                      class="w-full flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      :class="expandedSections.general ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'">
                <div class="flex items-center gap-3">
                  <ChevronDown class="w-5 h-5 transition-transform duration-200"
                               :class="expandedSections.general ? 'rotate-180' : ''" />
                  <h2 class="text-xl font-semibold">{{ $t('settings.title') }}</h2>
                </div>
              </button>
              
              <div v-if="expandedSections.general" class="border-t border-gray-200 dark:border-gray-700 p-6">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium mb-2">{{ $t('settings.theme') }}</label>
                    <select 
                      v-model="settings.theme"
                      @change="updateTheme"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="light">{{ $t('settings.light') }}</option>
                      <option value="dark">{{ $t('settings.dark') }}</option>
                      <option value="system">{{ $t('settings.system') }}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">{{ $t('settings.language') }}</label>
                    <select 
                      v-model="settings.language"
                      @change="updateLanguage"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="en">{{ $t('settings.english') }}</option>
                      <option value="vi">{{ $t('settings.vietnamese') }}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">Timezone</label>
                    <select 
                      v-model="settings.timezone"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                        {{ tz.label }}
                      </option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="flex items-center">
                      <input type="checkbox" checked class="mr-2" />
                      Auto-save
                    </label>
                  </div>
                  
                  <div>
                    <label class="flex items-center">
                      <input type="checkbox" checked class="mr-2" />
                      Notifications
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Environment Configuration -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button @click="toggleSection('environment')"
                      class="w-full flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      :class="expandedSections.environment ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'">
                <div class="flex items-center gap-3">
                  <ChevronDown class="w-5 h-5 transition-transform duration-200"
                               :class="expandedSections.environment ? 'rotate-180' : ''" />
                  <h2 class="text-xl font-semibold">{{ $t('environments.configuration') }}</h2>
                </div>
              </button>
              
              <div v-if="expandedSections.environment" class="border-t border-gray-200 dark:border-gray-700 p-6">
                <EnvironmentManager />
              </div>
            </div>
            
            <!-- Connection Manager -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button @click="toggleSection('connections')"
                      class="w-full flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      :class="expandedSections.connections ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'">
                <div class="flex items-center gap-3">
                  <ChevronDown class="w-5 h-5 transition-transform duration-200"
                               :class="expandedSections.connections ? 'rotate-180' : ''" />
                  <h2 class="text-xl font-semibold">{{ $t('connections.connectionManager') }}</h2>
                </div>
              </button>
              
              <div v-if="expandedSections.connections" class="border-t border-gray-200 dark:border-gray-700 p-6">
                <ConnectionManager />
              </div>
            </div>
            
            <!-- Connection Pairs -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button @click="toggleSection('pairs')"
                      class="w-full flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      :class="expandedSections.pairs ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'">
                <div class="flex items-center gap-3">
                  <ChevronDown class="w-5 h-5 transition-transform duration-200"
                               :class="expandedSections.pairs ? 'rotate-180' : ''" />
                  <h2 class="text-xl font-semibold">Connection Pairs</h2>
                </div>
              </button>
              
              <div v-if="expandedSections.pairs" class="border-t border-gray-200 dark:border-gray-700 p-6">
                <ConnectionPairManager 
                  :enabled-environments="enabledEnvironments"
                />
              </div>
            </div>
            
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end space-x-4 mt-6">
            <button @click="resetToDefaults" class="btn btn-secondary">Reset to Default</button>
            <button class="btn btn-primary">Save Settings</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import EnvironmentManager from '@/components/EnvironmentManager.vue'
import ConnectionPairManager from '@/components/ConnectionPairManager.vue'
import ConnectionManager from '@/components/ConnectionManager.vue'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useAppStore } from '@/stores/app'
import { useSettingsStore } from '@/stores/settings'
import { setLanguage } from '@/i18n'

const { t: $t } = useI18n()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const settingsStore = useSettingsStore()

const timezones = [
  { label: 'UTC (+00:00)', value: 'UTC' },
  { label: 'Asia/Ho_Chi_Minh (+07:00)', value: 'Asia/Ho_Chi_Minh' },
  { label: 'Asia/Shanghai (+08:00)', value: 'Asia/Shanghai' },
  { label: 'Asia/Tokyo (+09:00)', value: 'Asia/Tokyo' },
  { label: 'America/New_York (-05:00)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (-08:00)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (+00:00)', value: 'Europe/London' },
  { label: 'Europe/Paris (+01:00)', value: 'Europe/Paris' },
  { label: 'Australia/Sydney (+11:00)', value: 'Australia/Sydney' },
  { label: "Singapore (+08:00)", value: "Asia/Singapore" },
  { label: "Shanghai (+08:00)", value: "Asia/Shanghai" },
  { label: "Tokyo (+09:00)", value: "Asia/Tokyo" },
  { label: "Sydney (+11:00)", value: "Australia/Sydney" },
]

const settings = computed(() => settingsStore.settings)

// Expandable sections state
const expandedSections = ref({
  general: false,
  environment: false,
  connections: false,
  pairs: false
})

const enabledEnvironments = computed(() => {
  return connectionPairsStore.enabledEnvironments
})

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const updateTheme = () => {
  // Theme is automatically updated via watcher in store
}

const updateLanguage = () => {
  setLanguage(settings.value.language)
}

const resetToDefaults = async () => {
  if (confirm('Are you sure you want to reset ALL data (connections, environments, pairs) to default? This cannot be undone.')) {
    try {
      await Promise.all([
        appStore.resetConnections(),
        connectionPairsStore.resetEnvironments(),
        connectionPairsStore.resetConnectionPairs()
      ])
      alert('All data has been reset to defaults. Please refresh the page if changes are not immediately visible.')
    } catch (error: any) {
      if (window.electronAPI) {
        window.electronAPI.log.send('error', 'Failed to reset data in settings', error.message)
      }
      alert('Failed to reset data.')
    }
  }
}

// Auto-expand first section on mount
onMounted(() => {
  expandedSections.value.general = true
})
</script>
