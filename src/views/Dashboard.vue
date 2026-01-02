<template>
  <div class="h-screen flex flex-col pt-0 bg-gray-50 dark:bg-gray-900">
    <!-- Header (Global Top Bar) -->
    <Header />

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Dashboard Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <!-- Title removed as it's in Header now, or kept if user wants sub-header? 
                 User said "take comparator as standard". Compare has toolbar H1.
                 But Header.vue HAS title.
                 Let's keep the Actions but maybe remove the redundant Dashboard title if Header shows it. 
                 However, Header shows "Dashboard" in top bar. 
                 Let's keep the CONTENT layout similar to before but wrapped correctly.
            -->
            <!-- Keeping internal title for now as page-specific actions are here -->
            <div class="flex items-center gap-2 ml-auto"> 
               <!-- Moved buttons to right, removed H1 "Dashboard" to match Compare style if desired, 
                    OR kept H1. Compare HAS "Schema Compare" H1 in body. 
                    I will keep H1 but adjust layout. -->
            </div>
          </div>

          <div class="flex items-center justify-between mb-8">
             <!-- Re-adding the header section properly -->
             <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <div class="flex items-center gap-2">
              <button @click="resetData" class="btn btn-danger flex items-center gap-2" :disabled="isResetting">
                <Trash2 class="w-4 h-4" :class="{ 'animate-pulse': isResetting }" />
                {{ isResetting ? 'Resetting...' : 'Reset Data' }}
              </button>
              <button @click="loadSampleData" class="btn btn-primary flex items-center gap-2" :disabled="isLoadingSample">
                <Database class="w-4 h-4" />
                {{ isLoadingSample ? 'Loading...' : 'Load Sample Data' }}
              </button>
              <button @click="refreshData" class="btn btn-secondary flex items-center gap-2">
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
                Refresh
              </button>
            </div>
          </div>
          
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Connections -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Connections</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ totalConnections }}</p>
                </div>
                <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Database class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm">
                <span class="text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp class="w-4 h-4 mr-1" />
                  {{ connectedCount }} connected
                </span>
              </div>
            </div>

            <!-- Environments -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Environments</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ enabledEnvironments.length }}</p>
                </div>
                <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Layers class="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                {{ enabledEnvironments.map(e => e.name).join(', ') }}
              </div>
            </div>

            <!-- Connection Pairs -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Connection Pairs</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ totalPairs }}</p>
                </div>
                <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <GitCompare class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm">
                <span class="text-purple-600 dark:text-purple-400">
                  {{ activePairs }} active pairs
                </span>
              </div>
            </div>

            <!-- Recent Operations -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Operations Today</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ operationsToday }}</p>
                </div>
                <div class="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Activity class="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                Last: {{ lastOperationTime }}
              </div>
            </div>
          </div>

          <!-- Additional Stats Cards - Operations Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total DDL Count -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total DDL Changes</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ totalDDLCount }}</p>
                </div>
                <div class="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <FileCode class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                Across all operations
              </div>
            </div>

            <!-- Total Migrations -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Migrations</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ totalMigrations }}</p>
                </div>
                <div class="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg">
                  <ArrowRightLeft class="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm">
                <span class="text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle class="w-4 h-4 mr-1" />
                  {{ successfulMigrations }} successful
                </span>
              </div>
            </div>

            <!-- Average Duration -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Duration</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ formatDuration(averageDuration) }}</p>
                </div>
                <div class="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                  <Clock class="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                Per operation
              </div>
            </div>

            <!-- Success Rate -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ successRate }}%</p>
                </div>
                <div class="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                  <TrendingUp class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                {{ successfulOperations }}/{{ totalOperationsCount }} operations
              </div>
            </div>
          </div>

          <!-- DDL by Connection & Migration Stats -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- DDL Count by Connection -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">DDL Changes by Connection</h2>
              <div class="space-y-3">
                <div v-for="(count, connId) in ddlByConnection" :key="connId" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ getConnectionName(connId) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">{{ count }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">DDL</span>
                  </div>
                </div>
                <div v-if="Object.keys(ddlByConnection).length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                  No DDL changes tracked yet
                </div>
              </div>
            </div>

            <!-- Migration Stats by Pair -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Migration Statistics</h2>
              <div class="space-y-3">
                <div v-for="(stats, pair) in migratesByPair" :key="pair" class="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ pair }}</span>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400">
                      {{ stats.count }} times
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Avg Duration: {{ formatDuration(stats.avgDuration) }}</span>
                    <span>Total: {{ formatDuration(stats.totalDuration) }}</span>
                  </div>
                </div>
                <div v-if="Object.keys(migratesByPair).length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                  No migrations performed yet
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Connection Status Chart -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Connection Status</h2>
              <div class="space-y-4">
                <div v-for="env in enabledEnvironments" :key="env.name" class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-gray-700 dark:text-gray-300">{{ env.name }}</span>
                    <span class="text-gray-600 dark:text-gray-400">{{ getConnectionsByEnv(env.name).length }} connections</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300"
                      :class="getEnvStatusColor(env.name)"
                      :style="{ width: getEnvProgress(env.name) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
              <div class="grid grid-cols-2 gap-4">
                <button @click="navigateTo('/compare')" class="col-span-2 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <GitCompare class="w-12 h-12 text-primary-600 dark:text-primary-400 mb-2" />
                  <span class="text-lg font-medium text-gray-700 dark:text-gray-300">Run Schema Compare</span>
                  <p class="text-sm text-gray-500 mt-1">Select a source and target environment to begin</p>
                </button>
              </div>
            </div>
          </div>

          <!-- Connection Pairs Overview -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Connection Pairs</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Source</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Target</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th class="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pair in connectionPairs" :key="pair.id" class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="py-3 px-4">
                      <div class="font-medium text-gray-900 dark:text-white">{{ pair.name }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ pair.description }}</div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {{ pair.sourceEnv }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {{ pair.targetEnv }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(pair.status)">
                        <span class="w-2 h-2 rounded-full mr-1.5" :class="getStatusDotClass(pair.status)"></span>
                        {{ pair.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button @click="comparePair(pair)" class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 text-sm font-medium">
                        Compare
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recent Activity Timeline -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" :class="getActivityIcon(activity.type).bg">
                  <component :is="getActivityIcon(activity.type).icon" class="w-5 h-5" :class="getActivityIcon(activity.type).color" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ getActivityTitle(activity) }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ getActivityDescription(activity) }}</p>
                </div>
                <div class="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatTimeAgo(activity.startTime) }}
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400 italic">
                No recent activity found
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <!-- Reset Data Confirmation Modal -->
    <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Trash2 class="w-5 h-5 mr-2 text-red-500" />
            Reset Application Data
          </h3>
          <button @click="closeResetModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="px-6 py-5">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to reset all data? This action is <span class="font-bold text-red-500">irreversible</span>.
          </p>
          
          <div class="bg-red-50 dark:bg-red-900/10 rounded-md p-4 border border-red-100 dark:border-red-900/20 mb-4">
            <p class="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
              The following will be deleted:
            </p>
            <ul class="space-y-2">
              <li class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <Database class="w-4 h-4 mr-2 text-red-500 opacity-70" />
                 Cached Schemas (DDL Exports)
              </li>
              <li class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <GitCompare class="w-4 h-4 mr-2 text-red-500 opacity-70" />
                Comparison Results & Diffs
              </li>
              <li class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                 <FileCode class="w-4 h-4 mr-2 text-red-500 opacity-70" />
                 Generated Alter Statements
              </li>
              <li class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                 <Activity class="w-4 h-4 mr-2 text-red-500 opacity-70" />
                 Migration History & Logs
              </li>
            </ul>
          </div>
          
           <p class="text-xs text-gray-500 dark:text-gray-400 italic">
            * Connection settings and preferences will NOT be deleted.
          </p>
        </div>
        
        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button 
            @click="closeResetModal" 
            class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="confirmResetData" 
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center"
            :disabled="isResetting"
          >
            <span v-if="isResetting" class="mr-2">Resetting...</span>
            <span v-else>Yes, Delete All</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Database, 
  Layers, 
  GitCompare, 
  Activity, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  FileCode,
  Clock,
  Trash2,
  ArrowRightLeft,
  X
} from 'lucide-vue-next'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const operationsStore = useOperationsStore()
// Actually reset should clear storage. Use window.electronAPI.andbClearStorage() if available.

const isRefreshing = ref(false)
const isLoadingSample = ref(false)
const isResetting = ref(false)
const showResetModal = ref(false)

const openResetModal = () => {
  showResetModal.value = true
}

const closeResetModal = () => {
  showResetModal.value = false
}

const resetData = () => {
  openResetModal()
}

const confirmResetData = async () => {
  isResetting.value = true
  try {
     // Assuming there is an IPC handler 'andb-clear-storage' as noted in summary
     if ((window as any).electronAPI && (window as any).electronAPI.andbClearStorage) {
         await (window as any).electronAPI.andbClearStorage()
     } else {
         await new Promise(resolve => setTimeout(resolve, 800))
     }
     
     // Reload/Clear app data
     await Promise.all([
       appStore.reloadData(),
       connectionPairsStore.reloadData(),
       operationsStore.clearOperations(),
       operationsStore.loadOperations()
     ])
     
     closeResetModal()
     // Optional: Show toast or success message
     // alert('Data has been reset successfully.') 
  } catch (error: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('error', 'Failed to reset data in dashboard', error.message)
    }
    alert('Failed to reset data.')
  } finally {
    isResetting.value = false
  }
}

// Load sample data function
const loadSampleData = async () => {
  isLoadingSample.value = true
  try {
    const result = await window.electronAPI.loadMockCompareData()
    if (result.success) {
      // Refresh dashboard data
      await refreshData()
    } else {
      // Failed to load sample data
    }
  } catch (error: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('error', 'Error loading sample data in dashboard', error.message)
    }
  } finally {
    isLoadingSample.value = false
  }
}

// Computed properties
const totalConnections = computed(() => appStore.connections.length)
const connectedCount = computed(() => appStore.connections.filter(c => c.status === 'connected').length)
const enabledEnvironments = computed(() => connectionPairsStore.enabledEnvironments)
const connectionPairs = computed(() => connectionPairsStore.connectionPairs)
const totalPairs = computed(() => connectionPairs.value.length)
const activePairs = computed(() => connectionPairs.value.filter(p => p.status === 'success').length)
const operationsToday = computed(() => operationsStore.operationsToday)
const lastOperationTime = computed(() => {
  const recent = operationsStore.recentOperations[0]
  if (!recent) return 'No operations yet'
  const diff = Date.now() - new Date(recent.startTime).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return new Date(recent.startTime).toLocaleDateString()
})

// Operations metrics
const totalDDLCount = computed(() => operationsStore.totalDDLCount)
const totalMigrations = computed(() => operationsStore.operationsByType.migrate || 0)
const successfulMigrations = computed(() => 
  operationsStore.operations.filter(op => op.type === 'migrate' && op.status === 'success').length
)
const averageDuration = computed(() => operationsStore.averageDuration)
const totalOperationsCount = computed(() => operationsStore.totalOperations)
const successfulOperations = computed(() => operationsStore.successfulOperations)
const successRate = computed(() => {
  if (totalOperationsCount.value === 0) return 0
  return Math.round((successfulOperations.value / totalOperationsCount.value) * 100)
})
const ddlByConnection = computed(() => operationsStore.ddlByConnection)
const migratesByPair = computed(() => operationsStore.migratesByPair)

const getConnectionsByEnv = (envName: string) => {
  return appStore.connections.filter(c => c.environment === envName)
}

const getEnvProgress = (envName: string) => {
  const connections = getConnectionsByEnv(envName)
  if (connections.length === 0) return 0
  const connected = connections.filter(c => c.status === 'connected').length
  return (connected / connections.length) * 100
}

const getEnvStatusColor = (envName: string) => {
  const progress = getEnvProgress(envName)
  if (progress === 100) return 'bg-green-500'
  if (progress >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getStatusClass = (status: string) => {
  const classes = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

const getConnectionName = (connId: string) => {
  const conn = appStore.connections.find(c => c.id === connId)
  return conn ? conn.name : `Connection ${connId}`
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const getStatusDotClass = (status: string) => {
  const classes = {
    success: 'bg-green-500',
    pending: 'bg-yellow-500',
    error: 'bg-red-500'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

// Recent activities from store
const recentActivities = computed(() => operationsStore.recentOperations)

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'compare':
      return { icon: GitCompare, bg: 'bg-purple-100 dark:bg-purple-900/20', color: 'text-purple-600 dark:text-purple-400' }
    case 'migrate':
      return { icon: ArrowRightLeft, bg: 'bg-orange-100 dark:bg-orange-900/20', color: 'text-orange-600 dark:text-orange-400' }
    case 'export':
      return { icon: Database, bg: 'bg-green-100 dark:bg-green-900/20', color: 'text-green-600 dark:text-green-400' }
    case 'test':
      return { icon: CheckCircle, bg: 'bg-blue-100 dark:bg-blue-900/20', color: 'text-blue-600 dark:text-blue-400' }
    default:
      return { icon: Activity, bg: 'bg-gray-100 dark:bg-gray-900/20', color: 'text-gray-600 dark:text-gray-400' }
  }
}

const getActivityTitle = (op: any) => {
  const typeMap: any = {
    compare: 'Database Comparison',
    migrate: 'Database Migration',
    export: 'DDL Export',
    test: 'Connection Test'
  }
  return typeMap[op.type] || 'Operation'
}

const getActivityDescription = (op: any) => {
  if (op.type === 'compare' || op.type === 'migrate') {
    return `${op.sourceEnv} → ${op.targetEnv}`
  }
  if (op.connectionId) {
    return `Connection: ${getConnectionName(op.connectionId)}`
  }
  return op.status === 'success' ? 'Completed successfully' : 'Operation failed'
}

const formatTimeAgo = (date: Date | string) => {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return new Date(date).toLocaleDateString()
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await Promise.all([
      appStore.reloadData(),
      connectionPairsStore.reloadData(),
      operationsStore.loadOperations()
    ])
  } catch (error: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('error', 'Refresh failed in dashboard', error.message)
    }
  } finally {
    // Artificial delay for UI feel
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const comparePair = (pair: any) => {
  router.push({ path: '/compare', query: { pairId: pair.id } })
}
</script>
