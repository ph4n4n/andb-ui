<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div class="flex items-center justify-between gap-4">
      <!-- Left side: Toggle button and title/breadcrumbs -->
      <div class="flex items-center space-x-4 min-w-0">


        <!-- Logo & Brand -->
        <div class="flex items-center space-x-3 mr-4">
          <img 
            src="/icon.png" 
            alt="Andb" 
            class="w-8 h-8 rounded-lg shadow-sm"
          />
          <span class="font-bold text-lg text-gray-900 dark:text-white hidden md:block">Andb</span>
        </div>
        
        <div class="flex flex-col min-w-0">
          <h1 class="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
            {{ currentPageTitle }}
          </h1>
          <Breadcrumbs />
        </div>
      </div>

      <!-- Center: Connection Selector (Contextual) -->
      <div v-if="route.path === '/compare'" class="hidden lg:flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center pl-2 space-x-2 border-r border-gray-200 dark:border-gray-700 pr-2">
          <Database class="w-4 h-4 text-primary-500" />
          <select
            v-model="selectedPairId"
            @change="onPairChange"
            class="pr-8 py-1.5 border-none bg-transparent text-gray-900 dark:text-white text-sm font-bold focus:ring-0 cursor-pointer"
          >
            <option v-for="pair in availablePairs" :key="pair.id" :value="pair.id" class="bg-white dark:bg-gray-800">
              {{ pair.name }}
            </option>
          </select>
        </div>

        <div class="flex items-center space-x-1 px-1">
          <!-- Verify Action -->
          <button
            @click="testConnections"
            class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center group relative"
            :class="{ 'opacity-50 cursor-not-allowed': isTesting }"
            :disabled="isTesting"
            title="Verify connectivity now"
          >
            <Loader2 v-if="isTesting" class="w-4 h-4 animate-spin text-primary-500" />
            <Check v-else-if="testResult === 'success'" class="w-4 h-4 text-green-500" />
            <AlertCircle v-else-if="testResult === 'failed'" class="w-4 h-4 text-red-500" />
            <ShieldCheck v-else class="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
          </button>

          <!-- Reload Action -->
          <button
            @click="refresh"
            class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all group"
            :disabled="isRefreshing"
            title="Reload configuration from storage"
          >
            <RefreshCw class="w-4 h-4 text-gray-400 group-hover:text-primary-500" :class="{ 'animate-spin': isRefreshing }" />
          </button>

          <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <!-- Direct to Pairs Setting -->
          <button
            @click="router.push('/settings?cat=pairs')"
            class="p-2 text-gray-400 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all group"
            title="Manage Connection Pairs"
          >
            <Settings class="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <!-- Single Connection Selector for Schema/Dashboard -->
      <div v-else-if="route.path === '/schema'" class="hidden lg:flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center px-4 py-1.5 space-x-3">
          <Database class="w-4 h-4 text-primary-500" />
          <select
            v-model="appStore.selectedConnectionId"
            class="pr-8 border-none bg-transparent text-gray-900 dark:text-white text-sm font-bold focus:ring-0 cursor-pointer"
          >
            <option value="" disabled>Select Database</option>
            <option v-for="conn in appStore.connections" :key="conn.id" :value="conn.id" class="bg-white dark:bg-gray-800">
              {{ conn.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Right side: System Actions -->
      <div class="flex items-center space-x-1 shrink-0">
        <div class="flex items-center space-x-1">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        
        <div class="w-px h-6 bg-gray-200 dark:border-gray-700 mx-2"></div>

        <button
          @click="showAbout = true"
          class="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="About"
        >
          <Info class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- About Modal -->
    <AboutModal :isOpen="showAbout" @close="showAbout = false" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import ThemeToggle from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'
import AboutModal from './AboutModal.vue'
import Breadcrumbs from './Breadcrumbs.vue'
import { 
 
  ShieldCheck, 
  RefreshCw, 
  Settings,
  Info,
  Loader2,
  Check,
  AlertCircle,
  Database
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t: $t } = useI18n()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()

// About modal state
const showAbout = ref(false)
const isRefreshing = ref(false)

const isTesting = computed(() => connectionPairsStore.selectedPair?.status === 'testing')
const testResult = computed(() => connectionPairsStore.selectedPair?.status)

// Initialize store
onMounted(() => {
  // Initialize is now automatic in the store
  // Initial test on mount if we have a pair
  if (connectionPairsStore.selectedPairId) {
    testConnections()
  }

  // Auto-pick source for schema explorer if nothing selected
  if (route.path === '/schema' && !appStore.selectedConnectionId && connectionPairsStore.activePair) {
    appStore.selectedConnectionId = connectionPairsStore.activePair.source?.id || ''
  }
})

// Watch for route changes to apply auto-pick logic
watch(() => route.path, (newPath) => {
  if (newPath === '/schema' && !appStore.selectedConnectionId && connectionPairsStore.activePair) {
    appStore.selectedConnectionId = connectionPairsStore.activePair.source?.id || ''
  }
})

// Watch for pair changes to update auto-pick (optional, but requested "auto pick source in default pair")
watch(() => connectionPairsStore.selectedPairId, (newId) => {
  if (newId) {
    // Reset status before testing
    const pair = connectionPairsStore.connectionPairs.find(p => p.id === newId)
    if (pair) {
      pair.status = 'idle'
      // If we are in schema view, update the selection to match the new pair's source
      if (route.path === '/schema' && connectionPairsStore.activePair) {
        appStore.selectedConnectionId = connectionPairsStore.activePair.source?.id || ''
      }
    }
    
    testConnections()
  }
})

const selectedPairId = computed({
  get: () => connectionPairsStore.selectedPairId,
  set: (value) => connectionPairsStore.setSelectedPair(value)
})

const availablePairs = computed(() => connectionPairsStore.availablePairs)

const currentPageTitle = computed(() => {
  const routeNames: Record<string, string> = {
    '/': $t('common.dashboard'),
    '/schema': $t('common.schema'),
    '/compare': $t('common.compare'),
    '/settings': $t('common.settings')
  }
  return routeNames[route.path] || $t('common.dashboard')
})



const testConnections = async () => {
  // Test current selected pair
  const selectedPair = connectionPairsStore.selectedPair
  if (selectedPair) {
    await connectionPairsStore.testConnectionPair(selectedPair.id)
  }
}

const onPairChange = () => {
}

const refresh = async () => {
  isRefreshing.value = true
  try {
    // Refresh connection pairs and app connections
    await Promise.all([
      connectionPairsStore.reloadData(),
      appStore.reloadData()
    ])
  } finally {
    // Artificial delay for feel
    setTimeout(() => {
      isRefreshing.value = false
    }, 800)
  }
}

// Keyboard shortcuts moved to App.vue for better global handling
</script>
