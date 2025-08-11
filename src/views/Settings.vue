<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <Header />
      
      <!-- Settings Content -->
      <main class="flex-1 p-6">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Settings
          </h1>
          
          <!-- General Settings -->
          <div class="card p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">{{ $t('settings.title') }}</h2>
            
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
          
          <!-- Environment Configuration -->
          <div class="card p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">{{ $t('environments.configuration') }}</h2>
            <EnvironmentManager 
              ref="envManager" 
              @show-connection-manager="showConnectionManager = true"
            />
          </div>
          
          <!-- Connection Pairs -->
          <div class="card p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Connection Pairs</h2>
            <ConnectionPairManager 
              ref="pairManager"
              :enabled-environments="enabledEnvironments"
            />
          </div>
          
          <!-- andb-core Configuration -->
          <div class="card p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">andb-core Configuration</h2>
            
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium mb-2">Export Path</label>
                <input 
                  type="text" 
                  value="./exports"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Backup Path</label>
                <input 
                  type="text" 
                  value="./backups"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" checked class="mr-2" />
                  Backup enabled
                </label>
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" class="mr-2" />
                  Auto-compare
                </label>
              </div>
            </div>
          </div>
          
          <!-- Connection Defaults -->
          <div class="card p-6">
            <h2 class="text-xl font-semibold mb-4">Connection Defaults</h2>
            
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium mb-2">Default Port</label>
                <input 
                  type="number" 
                  value="3306"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Connection Timeout</label>
                <input 
                  type="text" 
                  value="30s"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" checked class="mr-2" />
                  Auto-test connections
                </label>
              </div>
              
              <div>
                <label class="flex items-center">
                  <input type="checkbox" class="mr-2" />
                  Save passwords
                </label>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end space-x-4 mt-6">
            <button class="btn btn-secondary">Reset to Default</button>
            <button class="btn btn-primary">Save Settings</button>
          </div>
        </div>
      </main>
    </div>

    <!-- Connection Manager Modal -->
    <div v-if="showConnectionManager" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <ConnectionManager @close="showConnectionManager = false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import EnvironmentManager from '@/components/EnvironmentManager.vue'
import ConnectionPairManager from '@/components/ConnectionPairManager.vue'
import ConnectionManager from '@/components/ConnectionManager.vue'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useSettingsStore } from '@/stores/settings'
import { setLanguage } from '@/i18n'

const { t: $t } = useI18n()
const envManager = ref()
const pairManager = ref()
const connectionPairsStore = useConnectionPairsStore()
const settingsStore = useSettingsStore()

const settings = computed(() => settingsStore.settings)
const showConnectionManager = ref(false)

const enabledEnvironments = computed(() => {
  return connectionPairsStore.enabledEnvironments
})

const updateTheme = () => {
  // Theme is automatically updated via watcher in store
}

const updateLanguage = () => {
  setLanguage(settings.value.language)
}
</script>
