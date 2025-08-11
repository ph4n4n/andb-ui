<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left side: Toggle button and title -->
      <div class="flex items-center space-x-4">
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 z-10"
          title="Toggle Sidebar (Ctrl+B)"
        >
          <Menu class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div class="flex items-center space-x-2">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ currentPageTitle }}
          </h1>
        </div>
      </div>

      <!-- Center: Connection Pair Selector -->
      <div class="hidden md:flex items-center space-x-2">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Current Pair:</span>
          <select
            v-model="selectedPairId"
            @change="onPairChange"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option v-for="pair in availablePairs" :key="pair.id" :value="pair.id">
              {{ pair.name }}
            </option>
          </select>
          <button
            @click="openPairSelector"
            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Manage Pairs"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Right side: Actions -->
      <div class="flex items-center space-x-2">
        <button
          @click="testConnections"
          class="btn btn-secondary flex items-center"
        >
          <Wifi class="w-4 h-4 mr-2" />
          <span class="hidden sm:inline">{{ $t('common.test') }}</span>
          <span class="sm:hidden">{{ $t('common.test') }}</span>
        </button>
        
        <button
          @click="refresh"
          class="btn btn-secondary flex items-center"
        >
          <RefreshCw class="w-4 h-4 mr-2" />
          <span class="hidden sm:inline">{{ $t('common.refresh') }}</span>
        </button>

        <!-- Theme Toggle -->
        <ThemeToggle />
        
        <!-- Language Toggle -->
        <LanguageToggle />
        
        <button
          @click="openSettings"
          class="btn btn-secondary flex items-center"
        >
          <Settings class="w-4 h-4 mr-2" />
          <span class="hidden sm:inline">{{ $t('common.settings') }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import ThemeToggle from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'
import { 
  Menu, 
  ArrowRightLeft, 
  Wifi, 
  RefreshCw, 
  Settings 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()

// Initialize store
onMounted(() => {
  connectionPairsStore.initialize()
})

const selectedPairId = computed({
  get: () => connectionPairsStore.selectedPairId,
  set: (value) => connectionPairsStore.setSelectedPair(value)
})

const availablePairs = computed(() => connectionPairsStore.availablePairs)

const connections = computed(() => appStore.connections)

const currentPageTitle = computed(() => {
  const routeNames: Record<string, string> = {
    '/': $t('common.dashboard'),
    '/export': $t('common.export'),
    '/compare': $t('common.compare'),
    '/migrate': $t('common.migrate'),
    '/scripts': $t('common.scripts'),
    '/settings': $t('common.settings')
  }
  return routeNames[route.path] || $t('common.dashboard')
})

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const testConnections = async () => {
  // Test current selected pair
  const selectedPair = connectionPairsStore.selectedPair
  if (selectedPair) {
    await connectionPairsStore.testConnectionPair(selectedPair.id)
  }
}

const onPairChange = () => {
  const selectedPair = connectionPairsStore.selectedPair
  console.log('Changed to pair:', selectedPair?.name)
}

const openPairSelector = () => {
  router.push('/settings')
}

const refresh = () => {
  console.log('Refresh data')
}

const openSettings = () => {
  router.push('/settings')
}

// Keyboard shortcuts moved to App.vue for better global handling
</script>
