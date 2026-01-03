<template>
  <MainLayout>
    <!-- Dashboard Content -->
    <main class="flex-1 p-6 overflow-y-auto">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div class="flex flex-col gap-1">
            <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-[0.2em]">Operational Overview</p>
          </div>
          
          <div 
            class="flex items-center gap-2 p-1.5 rounded-2xl transition-all duration-300"
            :class="[
              appStore.buttonStyle === 'full' ? 'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5' : '',
              appStore.buttonStyle === 'minimal' || appStore.buttonStyle === 'icons' ? 'bg-transparent border-transparent px-0 shadow-none' : ''
            ]"
          >

            <!-- Load Samples Button -->
            <button 
              @click="loadSampleData" 
              class="flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200" 
              :class="[
                appStore.buttonStyle === 'full' ? 'px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl gap-2' : '',
                appStore.buttonStyle === 'minimal' ? 'px-3 py-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg gap-2' : '',
                appStore.buttonStyle === 'icons' ? 'w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : ''
              ]"
              :style="{ fontSize: appStore.fontSizes.button + 'px' }"
              :disabled="isLoadingSample"
              title="Load Sample Connections & Clusters"
            >
              <Database class="w-4 h-4" />
              <span v-if="appStore.buttonStyle !== 'icons'">{{ isLoadingSample ? 'Loading' : (appStore.buttonStyle === 'full' ? 'Load Samples' : 'Samples') }}</span>
            </button>

            <!-- Refresh Button -->
            <button 
              @click="refreshData" 
              class="flex items-center justify-center font-bold uppercase transition-all duration-300"
              :class="[
                appStore.buttonStyle === 'full' ? 'px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 gap-2' : '',
                appStore.buttonStyle === 'minimal' ? 'px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg tracking-wider active:scale-95 shadow-sm gap-2' : '',
                appStore.buttonStyle === 'icons' ? 'w-10 h-10 bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/20 hover:scale-110 active:scale-95' : ''
              ]"
              :style="{ fontSize: appStore.fontSizes.button + 'px' }"
              title="Refresh All Dashboard Statistics"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
              <span v-if="appStore.buttonStyle !== 'icons'">{{ appStore.buttonStyle === 'full' ? 'Refresh Dashboard' : 'Refresh' }}</span>
            </button>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Connections -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Database class="w-6 h-6" />
              </div>
              <div class="flex flex-col items-end">
                <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</div>
                <div class="text-xs font-bold text-green-500">{{ connectedCount }} / {{ totalConnections }}</div>
              </div>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Connections</p>
              <p class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ totalConnections }}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
              <div class="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-1">
                <div class="bg-blue-500 h-1 rounded-full transition-all duration-1000" :style="{ width: (totalConnections > 0 ? (connectedCount/totalConnections*100) : 0) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Environments -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Layers class="w-6 h-6" />
              </div>
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configured</div>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Environments</p>
              <p class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ enabledEnvironments.length }}</p>
            </div>
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span v-for="env in enabledEnvironments" :key="env.id" class="px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-[9px] font-black text-gray-400 uppercase rounded border border-gray-100 dark:border-gray-600/50">
                {{ env.name }}
              </span>
            </div>
          </div>

          <!-- Connection Pairs -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <GitCompare class="w-6 h-6" />
              </div>
              <div class="flex flex-col items-end">
                <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync Pairs</div>
                <div class="text-xs font-bold text-purple-500">{{ activePairs }} / {{ totalPairs }}</div>
              </div>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Mappings</p>
              <p class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ totalPairs }}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ready for Sync</span>
              <CheckCircle class="w-3.5 h-3.5 text-purple-500" />
            </div>
          </div>

          <!-- Recent Operations -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-orange-500/10 p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-orange-500/10 text-orange-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Activity class="w-6 h-6" />
              </div>
              <div class="text-[10px] font-black text-orange-500 uppercase tracking-widest">Live Feed</div>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Ops Today</p>
              <div class="flex items-baseline gap-2">
                <p class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ operationsToday }}</p>
                <span class="text-xs font-bold text-orange-500">+{{ operationsToday }}</span>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
              <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                <Clock class="w-3.5 h-3.5" />
                Last: {{ lastOperationTime }}
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Stats Cards - Operations Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <div 
             v-for="stat in [
               { label: 'Total Changes', val: totalDDLCount, unit: 'Objects', icon: FileCode, col: 'indigo' },
               { label: 'Migrations', val: totalMigrations, unit: 'Records', icon: ArrowRightLeft, col: 'cyan' },
               { label: 'Avg Speed', val: formatDuration(averageDuration), unit: 'ms', icon: Clock, col: 'pink' },
               { label: 'Success Rate', val: successRate + '%', unit: 'Relative', icon: TrendingUp, col: 'emerald' }
             ]" 
             :key="stat.label"
             class="bg-white/40 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 flex items-center gap-4 group"
           >
             <div 
               class="p-2.5 rounded-xl transition-all duration-300 shadow-sm"
               :class="[
                 stat.col === 'indigo' ? 'bg-indigo-500/10 text-indigo-500' : '',
                 stat.col === 'cyan' ? 'bg-cyan-500/10 text-cyan-500' : '',
                 stat.col === 'pink' ? 'bg-pink-500/10 text-pink-500' : '',
                 stat.col === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : '',
                 'group-hover:scale-110'
               ]"
             >
               <component :is="stat.icon" class="w-5 h-5" />
             </div>
             <div>
                <div class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</div>
                <div class="flex items-baseline gap-1">
                  <span class="text-lg font-black text-gray-900 dark:text-white">{{ stat.val }}</span>
                  <span class="text-[8px] font-bold text-gray-400 uppercase">{{ stat.unit }}</span>
                </div>
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
          <!-- Connection Pairs Overview -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
              <h2 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <GitCompare class="w-4 h-4 text-primary-500" />
                Sync Mappings
              </h2>
              <button @click="navigateTo('/settings')" class="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Manage Pairs</button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="bg-gray-50/50 dark:bg-gray-900/20">
                    <th class="text-left py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mapping Pair</th>
                    <th class="text-left py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Topology</th>
                    <th class="text-left py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition</th>
                    <th class="text-right py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                  <tr v-for="pair in connectionPairs" :key="pair.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td class="py-4 px-6">
                      <div class="flex flex-col gap-0.5">
                        <div class="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary-500 transition-colors">{{ pair.name }}</div>
                        <div class="text-[10px] text-gray-400 font-medium uppercase truncate max-w-[200px]">{{ pair.description || 'System mapped pair' }}</div>
                      </div>
                    </td>
                    <td class="py-4 px-6 text-sm">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase rounded border border-blue-500/20">{{ pair.sourceEnv }}</span>
                        <ArrowRightLeft class="w-3 h-3 text-gray-300" />
                        <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded border border-emerald-500/20">{{ pair.targetEnv }}</span>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-1.5">
                        <div class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(pair.status)"></div>
                        <span class="text-[10px] font-black uppercase tracking-widest" :class="getStatusClassText(pair.status)">{{ pair.status }}</span>
                      </div>
                    </td>
                    <td class="py-4 px-6 text-right">
                      <button 
                        @click="comparePair(pair)" 
                        class="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-primary-500 hover:text-white text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
                      >
                        Compare
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="connectionPairs.length === 0" class="p-12 text-center text-gray-400 uppercase tracking-widest text-xs font-black italic">
                No active sync mappings
              </div>
            </div>
          </div>

          <!-- Recent Activity Timeline -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
              <h2 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Activity class="w-4 h-4 text-orange-500" />
                Operational Feed
              </h2>
              <button @click="navigateTo('/history')" class="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-500 transition-colors">Clear Feed</button>
            </div>
            <div class="p-6">
              <div class="space-y-6 relative">
                <!-- Vertical Timeline Line -->
                <div class="absolute left-5 top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-700"></div>

                <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-4 relative group">
                  <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110 duration-300" :class="getActivityIcon(activity.type).bg">
                    <component :is="getActivityIcon(activity.type).icon" class="w-5 h-5" :class="getActivityIcon(activity.type).color" />
                  </div>
                  <div class="flex-1 min-w-0 pt-1">
                    <div class="flex items-center justify-between gap-4 mb-1">
                      <p class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{{ getActivityTitle(activity) }}</p>
                      <div class="flex-shrink-0 text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">
                        {{ formatTimeAgo(activity.startTime) }}
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ getActivityDescription(activity) }}</p>
                      <span v-if="activity.status === 'success'" class="w-1 h-1 rounded-full bg-green-500"></span>
                      <span v-if="activity.status === 'failed'" class="w-1 h-1 rounded-full bg-red-500"></span>
                    </div>
                  </div>
                </div>
                
                <div v-if="recentActivities.length === 0" class="text-center py-12">
                   <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                     <Activity class="w-8 h-8 text-gray-200" />
                   </div>
                   <p class="text-xs font-black text-gray-400 uppercase tracking-widest">No Operational History</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </MainLayout>
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
  ArrowRightLeft
} from 'lucide-vue-next'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useOperationsStore } from '@/stores/operations'

const router = useRouter()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const operationsStore = useOperationsStore()

const isRefreshing = ref(false)
const isLoadingSample = ref(false)

// Load sample data function
const loadSampleData = async () => {
  isLoadingSample.value = true
  try {
    const result = await (window as any).electronAPI?.loadMockCompareData?.()
    if (result?.success) {
      await refreshData()
    }
  } catch (error: any) {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.log.send('error', 'Error loading sample data in dashboard', error.message)
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
const averageDuration = computed(() => operationsStore.averageDuration)
const totalOperationsCount = computed(() => operationsStore.totalOperations)
const successfulOperations = computed(() => operationsStore.successfulOperations)
const successRate = computed(() => {
  if (totalOperationsCount.value === 0) return 0
  return Math.round((successfulOperations.value / totalOperationsCount.value) * 100)
})
const ddlByConnection = computed(() => operationsStore.ddlByConnection)
const migratesByPair = computed(() => operationsStore.migratesByPair)

const getStatusClassText = (status: string) => {
  const classes = {
    success: 'text-green-500',
    pending: 'text-yellow-500',
    failed: 'text-red-500'
  }
  return classes[status as keyof typeof classes] || 'text-gray-400'
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
    failed: 'bg-red-500'
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
    if ((window as any).electronAPI) {
      (window as any).electronAPI.log.send('error', 'Refresh failed in dashboard', error.message)
    }
  } finally {
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

import { onMounted } from 'vue'
onMounted(async () => {
  // Load data from store (which loads from storage)
  if ((window as any).electronAPI) {
    await Promise.all([
      appStore.reloadData(),
      connectionPairsStore.reloadData(),
      operationsStore.loadOperations()
    ])
  } else {
    // If running in browser/testing, maybe load defaults?
  }
})
</script>
