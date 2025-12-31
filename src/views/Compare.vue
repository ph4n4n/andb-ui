<template>
  <div 
    class="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900"
    :class="{ 'cursor-col-resize select-none': isResizingSidebar || isResizingResults }"
  >
    <!-- Header -->
    <Header />
    
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <div :style="{ width: displaySidebarWidth + 'px' }" class="shrink-0 relative transition-all duration-300 ease-in-out">
        <Sidebar ref="sidebarRef" :results="allResults" style="width: 100%" />
        <!-- Resize Handle -->
        <div 
          @mousedown="startSidebarResize"
          class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary-400/50 transition-colors z-20"
        ></div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Toolbar -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold flex items-center">
              <span class="mr-2">🔄</span> Schema Compare
            </h1>
            <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span v-if="activePair && activePair.source && activePair.target" class="flex items-center">
                <span class="font-semibold text-blue-600 dark:text-blue-400">{{ activePair.source.name }}</span>
                <span class="mx-2">→</span>
                <span class="font-semibold text-green-600 dark:text-green-400">{{ activePair.target.name }}</span>
                <span v-if="hasResults" class="ml-4 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-xs text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                  {{ countSummary }}
                </span>
              </span>
              <span v-else class="italic">No connection pair selected</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <div v-if="error" class="text-red-500 text-sm mr-2">{{ error }}</div>
            
            <button 
              @click="runComparison" 
              :disabled="loading || !activePair"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-primary-500/20 flex items-center group"
            >
              <RefreshCw v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              <Zap v-else class="w-4 h-4 mr-2 fill-current group-hover:scale-110 transition-transform" />
              {{ loading ? 'Comparing...' : 'Compare' }}
            </button>
          </div>
        </div>
        
        <!-- Comparison Area -->
        <main class="flex-1 flex overflow-hidden relative">
          <!-- Loading Overlay -->
          <div v-if="loading && !hasResults" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-20 flex items-center justify-center backdrop-blur-sm">
            <div class="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div class="relative w-20 h-20 mx-auto mb-6">
                <div class="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
              </div>
              <p class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">{{ statusMessage || 'Analyzing schemas...' }}</p>
              <div class="mt-2 text-xs text-gray-500 uppercase tracking-tighter animate-pulse">Please wait while we sync metadata</div>
            </div>
          </div>

          <!-- Vertical Split: Object List vs DDL View -->
          <div class="flex-1 flex overflow-hidden relative">
            <!-- Left: Comparison Results List (Sub-sidebar style) -->
            <div :style="{ width: resultsWidth + 'px' }" class="border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col shrink-0 relative">
              <!-- Results Header with Breadcrumb-like stack navigation -->
              <div class="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-10 flex items-center shrink-0">
                <button 
                  v-if="selectedFilterType !== 'all'"
                  @click="selectedFilterType = 'all'"
                  class="p-1 hover:bg-white dark:hover:bg-gray-700 rounded mr-2 transition-colors text-gray-500"
                  title="Back to Database Overview"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <div class="flex items-center min-w-0 flex-1">
                  <span class="text-primary-600 dark:text-primary-400 mr-1.5 shrink-0">
                    <Database v-if="selectedFilterType === 'all'" class="w-3.5 h-3.5" />
                    <component v-else :is="getIconForType(selectedFilterType)" class="w-3.5 h-3.5" />
                  </span>
                  <div class="flex flex-col min-w-0">
                    <span class="truncate text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                      <span v-if="selectedFilterType === 'all'">{{ selectedPath.db || 'Database' }} Overview</span>
                      <span v-else>{{ selectedFilterType }}</span>
                    </span>
                    <span v-if="hasResults" class="text-[8px] text-gray-400 uppercase tracking-tighter">
                      {{ filteredResults.length }} items • {{ filteredTotalChanges }} changes
                    </span>
                  </div>
                </div>
                <!-- Batch Migrate for single type or entire schema -->
                <button 
                  v-if="hasChanges(selectedFilterType)"
                  @click="openBatchMigrateModal(selectedFilterType === 'all' ? 'Schema' : selectedFilterType)"
                  class="ml-auto p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                  :title="selectedFilterType === 'all' ? 'Migrate Entire Schema' : 'Migrate All in this category'"
                >
                  <Zap class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Filter & Search Bar -->
              <div v-if="hasResults" class="p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-2 shrink-0">
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search class="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Search objects..."
                    class="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div class="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                  <button 
                    v-for="filter in statusFilters" :key="filter.value"
                    @click="selectedStatusFilter = filter.value"
                    class="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter transition-all whitespace-nowrap"
                    :class="selectedStatusFilter === filter.value 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>
              
              <div class="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden p-2">
                <div v-if="!hasResults" class="p-8 text-center text-gray-400 h-full flex flex-col justify-center">
                  <ScanSearch class="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p class="text-xs uppercase tracking-widest font-bold">No data found</p>
                  <p class="text-[10px] opacity-60 mt-1">Select a database to view details</p>
                </div>

                <!-- OVERVIEW MODE: Stack view of categories -->
                <div v-else-if="selectedFilterType === 'all'" class="space-y-2">
                  <div 
                    v-for="cat in resultsByCategory" :key="cat.type"
                    @click="selectedFilterType = cat.type"
                    class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all cursor-pointer group"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center min-w-0">
                        <div class="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-3 group-hover:scale-110 transition-transform">
                          <component :is="getIconForType(cat.type)" class="w-4 h-4" />
                        </div>
                        <div class="min-w-0">
                          <div class="font-bold text-gray-900 dark:text-white uppercase text-[10px] tracking-widest">{{ cat.type }}</div>
                          <div class="text-[10px] text-gray-400">{{ cat.items.length }} items</div>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <button 
                          v-if="hasChanges(cat.type)"
                          @click.stop="openBatchMigrateModal(cat.type)"
                          class="mr-2 p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-all shadow-sm border border-primary-200 dark:border-primary-800/30"
                          title="Migrate All"
                        >
                          <Zap class="w-3.5 h-3.5" />
                        </button>
                        <div v-if="cat.changes > 0" class="flex items-center text-orange-500 font-bold text-[10px] bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800/30 mr-2">
                          {{ cat.changes }}
                        </div>
                        <ChevronRight class="w-3 h-3 text-gray-300 group-hover:text-primary-500" />
                      </div>
                    </div>
                    <!-- Micro progress bar -->
                    <div class="mt-3 h-1 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden flex">
                      <div 
                        class="h-full bg-amber-500" 
                        :style="{ width: (cat.changes / cat.items.length * 100) + '%' }"
                      ></div>
                      <div 
                        class="h-full bg-gray-300 dark:bg-gray-600" 
                        :style="{ width: ((cat.items.length - cat.changes) / cat.items.length * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- LIST MODE: Flat list of objects in category -->
                <div v-else class="space-y-1">
                  <div v-for="item in filteredResults" :key="item.name" 
                    @click="selectItem(item)"
                    class="p-2.5 cursor-pointer rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-between group"
                    :class="{ 'bg-white dark:bg-gray-800 shadow-sm border border-primary-500/20 ring-1 ring-primary-500/10': selectedItem?.name === item.name }"
                  >
                    <div class="min-w-0 pr-2">
                      <div class="text-[12px] font-mono truncate text-gray-900 dark:text-gray-100" :class="{ 'font-bold': selectedItem?.name === item.name }" :title="item.name">
                        {{ item.name }}
                      </div>
                      <div class="text-[9px] text-gray-400 uppercase tracking-tighter flex items-center">
                        <component :is="getIconForType(item.type)" class="w-2.5 h-2.5 mr-1" />
                        {{ item.type }}
                      </div>
                    </div>
                    <div class="flex items-center justify-center w-6 h-6 shrink-0 group/status">
                      <!-- Always show status icon if identical -->
                      <component 
                        v-if="item.status === 'equal' || item.status === 'same'"
                        :is="getStatusIcon(item.status)" 
                        class="w-4 h-4 transition-all"
                        :class="getStatusClass(item.status)"
                        :title="getStatusText(item.status)"
                      />
                      <!-- Show status icon by default, swap to Zap on hover if can migrate -->
                      <template v-else>
                        <component 
                          :is="getStatusIcon(item.status)" 
                          class="w-4 h-4 transition-all group-hover/status:hidden"
                          :class="getStatusClass(item.status)"
                        />
                        <Zap 
                          @click.stop="openMigrateModal(item)"
                          class="w-4 h-4 text-primary-500 hidden group-hover/status:block cursor-pointer hover:scale-125 hover:drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] active:scale-95 animate-in fade-in zoom-in-75 duration-200"
                          title="Click to Migrate"
                        />
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Resize Handle -->
              <div 
                @mousedown="startResultsResize"
                class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary-400/50 transition-colors z-20"
              ></div>
            </div>

            <!-- Right: Split DDL Detail -->
            <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 relative">
              <div v-if="selectedItem" class="h-full flex flex-col">
                <div class="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                  <div class="flex items-center text-xs space-x-2 overflow-hidden">
                    <div class="flex items-center text-gray-500 dark:text-gray-400">
                      <Server class="w-3.5 h-3.5 mr-1" />
                      <span class="truncate">{{ selectedPath.env }}</span>
                    </div>
                    <ChevronRight class="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                    <div class="flex items-center text-gray-500 dark:text-gray-400">
                      <Database class="w-3.5 h-3.5 mr-1" />
                      <span class="truncate">{{ selectedPath.db }}</span>
                    </div>
                    <ChevronRight class="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                    <div class="flex items-center text-gray-600 dark:text-gray-300 font-bold">
                      <component :is="getIconForType(selectedItem.type)" class="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span class="uppercase">{{ selectedItem.type }}</span>
                    </div>
                    <ChevronRight class="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                    <div class="flex items-center">
                      <span class="font-bold text-gray-900 dark:text-white truncate text-sm">{{ selectedItem.name }}</span>
                    </div>
                    <span :class="getStatusClass(selectedItem.status)" class="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-opacity-10 font-black border uppercase tracking-tighter" :style="{ borderColor: 'currentColor' }">
                      {{ getStatusText(selectedItem.status) }}
                    </span>
                  </div>
                  <div class="flex space-x-2 items-center">
                    <button 
                      v-if="selectedItem.status !== 'equal' && selectedItem.status !== 'same'"
                      @click="openMigrateModal(selectedItem)" 
                      class="btn btn-primary py-1.5 px-4 text-[11px] h-9 flex items-center gap-2 group overflow-hidden relative shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                      :disabled="isMigrating"
                    >
                      <Zap class="w-4 h-4 group-hover:animate-pulse" />
                      <span class="font-bold">Migrate to {{ targetName }}</span>
                      <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 linear skew-x-[-20deg]"></div>
                    </button>
                    <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <button @click="openDetailModal(selectedItem)" class="p-2 text-gray-400 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm" title="View Full Definition">
                      <ScanSearch class="w-4.5 h-4.5 font-bold" />
                    </button>
                  </div>
                </div>
                <div class="flex-1">
                  <MirrorDiffView 
                    :source-ddl="selectedItem.diff?.source"
                    :target-ddl="selectedItem.diff?.target"
                    :source-label="sourceName"
                    :target-label="targetName"
                    :status="selectedItem.status"
                  />
                </div>
              </div>
              <div v-else class="flex-1 flex items-center justify-center text-gray-400 italic">
                <div class="text-center">
                  <MousePointer2 class="w-12 h-12 mx-auto mb-2 opacity-10" />
                  <p>Select an object to compare DDL</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Modals & Notifications -->
    <DDLDetailModal
      :is-open="showDetailModal"
      :item="selectedItem"
      @close="closeDetailModal"
    />

    <MigrationConfirmModal
      :is-open="showMigrateModal"
      :loading="isMigrating"
      :item="migratingItem"
      :source-name="sourceName"
      :target-name="targetName"
      @close="showMigrateModal = false"
      @confirm="confirmMigration"
    />

    <Notification ref="notificationRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import DDLDetailModal from '@/components/DDLDetailModal.vue'
import MirrorDiffView from '@/components/MirrorDiffView.vue'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import Andb from '@/utils/andb'
import { watch } from 'vue'
import { 
  RefreshCw, 
  ScanSearch, 
  MousePointer2,
  ChevronRight,
  Database,
  Server,
  Table,
  Layers,
  Hammer,
  Zap,
  ChevronLeft,
  CheckCircle2,
  PlusCircle,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-vue-next'
import MigrationConfirmModal from '@/components/MigrationConfirmModal.vue'
import Notification from '@/components/Notification.vue'
import { useOperationsStore } from '@/stores/operations'

const connectionPairsStore = useConnectionPairsStore()
const operationsStore = useOperationsStore()

const activePair = computed(() => connectionPairsStore.activePair)
const sourceName = computed(() => activePair.value?.source?.name || 'Source')
const targetName = computed(() => activePair.value?.target?.name || 'Target')

const sidebarRef = ref<any>(null)

const typeIcons = {
  tables: Table,
  views: Layers,
  procedures: Hammer,
  functions: Hammer,
  triggers: Zap
}

const getIconForType = (type: string) => {
  const key = type?.toLowerCase() as keyof typeof typeIcons
  return typeIcons[key] || Database
}

// State
const loading = ref(false)
const statusMessage = ref('')
const error = ref<string | null>(null)
const tableResults = ref<any[]>([])
const procedureResults = ref<any[]>([])
const functionResults = ref<any[]>([])
const viewResults = ref<any[]>([])
const triggerResults = ref<any[]>([])
const selectedItem = ref<any>(null)
const showDetailModal = ref(false)
const selectedFilterType = ref<string>('all')
const searchQuery = ref('')
const selectedStatusFilter = ref('all')

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Modified', value: 'modified' },
  { label: 'New', value: 'new' },
  { label: 'Deprecated', value: 'deprecated' },
  { label: 'Identical', value: 'equal' }
]

// Migration State
const isMigrating = ref(false)
const showMigrateModal = ref(false)
const migratingItem = ref<any>(null)
const batchType = ref<string | null>(null)
const notificationRef = ref<any>(null)

const hasChanges = (type: string) => {
  return allResults.value.some(i => (type === 'all' || i.type.toLowerCase() === type.toLowerCase()) && i.status !== 'equal' && i.status !== 'same')
}

const selectedPath = ref({
  env: '',
  db: '',
  type: ''
})

const appStore = useAppStore()
const isCollapsed = computed(() => appStore.sidebarCollapsed)

// Resize Logic
const sidebarWidth = ref(280)
const displaySidebarWidth = computed(() => isCollapsed.value ? 64 : sidebarWidth.value)
const resultsWidth = ref(256)
const isResizingSidebar = ref(false)
const isResizingResults = ref(false)

const startSidebarResize = () => {
  if (isCollapsed.value) return
  isResizingSidebar.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
}

const startResultsResize = () => {
  isResizingResults.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
}

const handleResize = (e: MouseEvent) => {
  if (isResizingSidebar.value && !isCollapsed.value) {
    sidebarWidth.value = Math.max(160, Math.min(480, e.clientX))
  } else if (isResizingResults.value) {
    // Current left position of the results pane is sidebarWidth
    resultsWidth.value = Math.max(160, Math.min(600, e.clientX - displaySidebarWidth.value))
  }
}

const stopResize = () => {
  isResizingSidebar.value = false
  isResizingResults.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
}

const allResults = computed(() => {
  const all = [
    ...tableResults.value.map(i => ({ ...i, type: 'tables' })),
    ...procedureResults.value.map(i => ({ ...i, type: 'procedures' })),
    ...functionResults.value.map(i => ({ ...i, type: 'functions' })),
    ...viewResults.value.map(i => ({ ...i, type: 'views' })),
    ...triggerResults.value.map(i => ({ ...i, type: 'triggers' }))
  ]
  
  console.log('[Compare] Calculated allResults:', all.length, 'items')
  
  return all.sort((a, b) => {
    // Sort by status priority: different/updated > missing/new > equal/same
    const getPriority = (s: string) => {
      s = s?.toLowerCase()
      if (s === 'different' || s === 'updated' || s === 'modified') return 0
      if (s === 'missing_in_target' || s === 'new' || s === 'missing') return 1
      if (s === 'missing_in_source' || s === 'deprecated') return 2
      if (s === 'equal' || s === 'same') return 3
      return 4
    }
    
    const priA = getPriority(a.status)
    const priB = getPriority(b.status)
    
    if (priA !== priB) return priA - priB
    return a.name.localeCompare(b.name)
  })
})

const filteredResults = computed(() => {
  let filtered = allResults.value

  // Filter by category
  if (selectedFilterType.value !== 'all') {
    filtered = filtered.filter(i => i.type === selectedFilterType.value)
  }

  // Filter by status
  if (selectedStatusFilter.value !== 'all') {
    const filter = selectedStatusFilter.value
    filtered = filtered.filter(i => {
      const status = i.status.toLowerCase()
      if (filter === 'modified') return status === 'modified' || status === 'different' || status === 'updated'
      if (filter === 'new') return status === 'new' || status === 'missing_in_target'
      if (filter === 'deprecated') return status === 'deprecated' || status === 'missing_in_source'
      if (filter === 'equal') return status === 'equal' || status === 'same'
      return true
    })
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(i => i.name.toLowerCase().includes(query))
  }

  return filtered
})

const hasResults = computed(() => allResults.value.length > 0)
const totalChanges = computed(() => allResults.value.filter(i => i.status !== 'equal' && i.status !== 'same').length)
const filteredTotalChanges = computed(() => filteredResults.value.filter(i => i.status !== 'equal' && i.status !== 'same').length)

const resultsByCategory = computed(() => {
  const categories = ['tables', 'views', 'procedures', 'functions', 'triggers']
  return categories.map(cat => {
    const items = allResults.value.filter(i => i.type === cat)
    return {
      type: cat,
      items,
      changes: items.filter(i => i.status !== 'equal' && i.status !== 'same').length
    }
  }).filter(c => c.items.length > 0)
})

const countSummary = computed(() => {
  const total = allResults.value.length
  const changes = totalChanges.value
  return `${changes} changes, ${total - changes} identical`
})

// Actions
const runComparison = async () => {
  if (!activePair.value) return
  
  loading.value = true
  statusMessage.value = 'Comparing schemas...'
  error.value = null
  
  try {
    const { source, target } = activePair.value
    const objTypes: ('tables' | 'procedures' | 'functions' | 'triggers' | 'views')[] = ['tables', 'procedures', 'functions', 'triggers', 'views']
    
    // 1. Export Source and Target DDLs first
    // Parallelize exports for speed
    statusMessage.value = 'Exporting source DDLs...'
    await Promise.all(objTypes.map(type => 
      Andb.export(source, target, { type, environment: source.environment })
    ))
    
    statusMessage.value = 'Exporting target DDLs...'
    await Promise.all(objTypes.map(type => 
      Andb.export(source, target, { type, environment: target.environment })
    ))
    
    // 2. Run comparison
    statusMessage.value = 'Comparing schemas...'
    
    // Start recording operation
    const opId = operationsStore.addOperation({
      type: 'compare',
      sourceEnv: source.environment,
      targetEnv: target.environment,
      status: 'pending',
      startTime: new Date()
    })

    const [tables, procs, funcs, views, triggers] = await Promise.all([
      Andb.compare(source, target, { type: 'tables', sourceEnv: source.environment, targetEnv: target.environment }),
      Andb.compare(source, target, { type: 'procedures', sourceEnv: source.environment, targetEnv: target.environment }),
      Andb.compare(source, target, { type: 'functions', sourceEnv: source.environment, targetEnv: target.environment }),
      Andb.compare(source, target, { type: 'views', sourceEnv: source.environment, targetEnv: target.environment }),
      Andb.compare(source, target, { type: 'triggers', sourceEnv: source.environment, targetEnv: target.environment })
    ])

    // Just to avoid unused warning
    console.log('Processed:', views.length + triggers.length, 'additional objects')
    
    tableResults.value = Array.isArray(tables) ? tables : []
    procedureResults.value = Array.isArray(procs) ? procs : []
    functionResults.value = Array.isArray(funcs) ? funcs : []
    viewResults.value = Array.isArray(views) ? views : []
    triggerResults.value = Array.isArray(triggers) ? triggers : []
    
    const totalCount = tableResults.value.length + procedureResults.value.length + functionResults.value.length + viewResults.value.length + triggerResults.value.length
    
    // Complete operation record
    operationsStore.completeOperation(opId, true, { ddlCount: totalCount })

    console.log('[Compare] Results received:', {
      tables: tableResults.value.length,
      procs: procedureResults.value.length,
      funcs: functionResults.value.length,
      views: viewResults.value.length,
      triggers: triggerResults.value.length
    })
    
    if (allResults.value.length > 0 && !selectedItem.value) {
      selectedItem.value = allResults.value[0]
    }
    
    // Refresh sidebar tree to show newly exported objects
    if (sidebarRef.value) {
      sidebarRef.value.refreshSchemas()
    }
  } catch (e: any) {
    error.value = e.message || 'Comparison failed'
  } finally {
    loading.value = false
  }
}

const selectItem = (item: any) => {
  selectedItem.value = item
}

const handleObjectSelected = (event: any) => {
  const { env, db, name, type } = event.detail
  console.log('[Compare] Sidebar selection:', name, type)
  
  selectedPath.value = { env, db, type }
  
  // Normalize type (ensure plural)
  const normalizedType = type.endsWith('s') ? type : type + 's'
  
  const found = allResults.value.find(i => 
    i.name === name && 
    (i.type === normalizedType || i.type === type)
  )
  
  if (found) {
    selectedItem.value = found
    // Ensure selected type matches the item type
    selectedFilterType.value = 'all' 
    // Scroll selection into view if needed (optional)
  } else {
    console.warn('[Compare] Object not found in results:', name, normalizedType)
  }
}

const handleCategorySelected = (event: any) => {
  const { env, db, type } = event.detail
  console.log('[Compare] Category selection:', type)
  selectedFilterType.value = type
  selectedPath.value = { env, db, type }
  
  // Clear diff view when category is selected
  selectedItem.value = null
  
  // Optional: Auto-select first item if user prefers
  /*
  if (filteredResults.value.length > 0) {
    selectedItem.value = filteredResults.value[0]
  }
  */
}

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'equal':
    case 'same':
      return CheckCircle2
    case 'new':
    case 'missing_in_target':
      return PlusCircle
    case 'deprecated':
    case 'missing_in_source':
      return XCircle
    case 'modified':
    case 'different':
    case 'updated':
      return AlertCircle
    default:
      return AlertCircle
  }
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'equal':
    case 'same':
      return 'text-gray-400 dark:text-gray-500 opacity-70' 
    case 'new':
    case 'missing_in_target':
      return 'text-emerald-500 dark:text-emerald-400 drop-shadow-sm font-bold'
    case 'deprecated':
    case 'missing_in_source':
      return 'text-rose-500 dark:text-rose-400 drop-shadow-sm font-bold'
    case 'modified':
    case 'different':
    case 'updated':
      return 'text-amber-500 dark:text-amber-400 drop-shadow-sm font-bold'
    default:
      return 'text-gray-400'
  }
}

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'equal':
    case 'same': return 'Identical'
    case 'different':
    case 'updated':
    case 'modified': return 'Modified'
    case 'missing_in_target':
    case 'new': return 'New (Source Only)'
    case 'missing_in_source':
    case 'deprecated': return 'Deprecated (Target Only)'
    default: return status
  }
}

const openDetailModal = (item: any) => {
  selectedItem.value = item
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
}

// Migration Actions
const openMigrateModal = (item: any) => {
  migratingItem.value = item
  batchType.value = null
  showMigrateModal.value = true
}

const openBatchMigrateModal = (type: string) => {
  batchType.value = type
  
  // Collect all items that will be migrated
  let itemsToMigrate = []
  if (type === 'Schema') {
    itemsToMigrate = allResults.value.filter(i => i.status !== 'equal' && i.status !== 'same')
  } else {
    itemsToMigrate = allResults.value.filter(i => 
      i.type.toLowerCase() === type.toLowerCase() && 
      i.status !== 'equal' && 
      i.status !== 'same'
    )
  }

  migratingItem.value = {
    name: `All ${type}`,
    type: type,
    isBatch: true,
    items: itemsToMigrate
  }
  showMigrateModal.value = true
}

const confirmMigration = async () => {
  if (!activePair.value || !migratingItem.value) return
  
  const item = migratingItem.value
  isMigrating.value = true
  
  try {
    const { source, target } = activePair.value
    
    // Start recording operation
    const opId = operationsStore.addOperation({
      type: 'migrate',
      sourceEnv: source.environment,
      targetEnv: target.environment,
      status: 'pending',
      startTime: new Date()
    })

    try {
      if (batchType.value) {
        // Batch Migration
        const type = batchType.value.toLowerCase()
        console.log(`[Compare] Starting batch migration for ${type}...`)
        
        const ddlTypes = type === 'schema' 
          ? ['tables', 'views', 'procedures', 'functions', 'triggers']
          : [type]
        
        // For batch migration, we sync everything: New, Updated, and Deprecated
        const statuses: ('NEW' | 'UPDATED' | 'DEPRECATED')[] = ['NEW', 'UPDATED', 'DEPRECATED']
        
        for (const ddlType of ddlTypes) {
          for (const status of statuses) {
            await Andb.migrate(source, target, {
              type: ddlType as any,
              sourceEnv: source.environment,
              targetEnv: target.environment,
              status: status
            })
          }
          
          // Atomic Verification for each type in the batch
          await Andb.export(source, target, {
            type: ddlType as any,
            environment: target.environment
          })
        }

        notificationRef.value?.add({
          type: 'success',
          title: 'Batch Migration Successful',
          message: `${type === 'schema' ? 'Entire schema' : 'All ' + batchType.value} has been migrated and verified.`
        })
      } else {
        // Individual Migration
        let status: 'NEW' | 'UPDATED' | 'DEPRECATED' = 'NEW'
        if (item.status === 'modified' || item.status === 'different' || item.status === 'updated') status = 'UPDATED'
        if (item.status === 'deprecated' || item.status === 'missing_in_source') status = 'DEPRECATED'
        
        console.log(`[Compare] Starting migration for ${item.name} (${status})...`)
        await Andb.migrate(source, target, {
          type: item.type as any,
          sourceEnv: source.environment,
          targetEnv: target.environment,
          name: item.name,
          status: status
        })
        
        // Atomic Verification
        console.log(`[Compare] Verifying migration for ${item.name}...`)
        await applyAtomicVerify(item)
        
        notificationRef.value?.add({
          type: 'success',
          title: 'Migration Successful',
          message: `${item.name} (${item.type}) has been migrated and verified.`
        })
      }
      
      showMigrateModal.value = false
      
      // For batch migration, we still run full comparison to be safe, 
      // for individual we already did atomic verify above
      if (batchType.value) {
        await runComparison()
      }
      
      // Also refresh schemas in sidebar
      if (sidebarRef.value) {
        await sidebarRef.value.refreshSchemas()
      }

      // Complete operation record
      operationsStore.completeOperation(opId, true)
    } catch (e: any) {
      operationsStore.completeOperation(opId, false, { error: e.message })
      throw e
    }
  } catch (e: any) {
    console.error('[Compare] Migration failed:', e)
    notificationRef.value?.add({
      type: 'error',
      title: 'Migration Failed',
      message: e.message || 'An unknown error occurred during migration.'
    })
  } finally {
    isMigrating.value = false
  }
}

/**
 * Perform atomic export and comparison for a single item
 * and update the local state without re-running full comparison
 */
const applyAtomicVerify = async (item: any) => {
  if (!activePair.value) return
  
  try {
    const { source, target } = activePair.value
    
    // 1. Export atomic (Target only, since source hasn't changed)
    await Andb.export(source, target, {
      type: item.type as any,
      environment: target.environment,
      name: item.name
    })
    
    // 2. Compare atomic
    const results = await Andb.compare(source, target, {
      type: item.type as any,
      sourceEnv: source.environment,
      targetEnv: target.environment,
      name: item.name
    })
    
    if (Array.isArray(results)) {
      const updatedItem = results.find((r: any) => r.name === item.name)
      
      if (!updatedItem) {
        console.warn(`[Compare] Item ${item.name} not found in comparison results during atomic verify`)
        return
      }
      
      // 3. Patch the specific result list
      const resultsMap: Record<string, any> = {
        tables: tableResults,
        procedures: procedureResults,
        functions: functionResults,
        views: viewResults,
        triggers: triggerResults
      }
      
      const listRef = resultsMap[item.type.toLowerCase()]
      if (listRef) {
        const index = listRef.value.findIndex((i: any) => i.name === item.name)
        if (index !== -1) {
          // Update the item in the list using splice for guaranteed reactivity
          const updatedObject = { ...listRef.value[index], ...updatedItem, type: item.type }
          listRef.value.splice(index, 1, updatedObject)
          
          // Update selected item if focused to refresh diff view
          if (selectedItem.value?.name === item.name) {
            selectedItem.value = { ...updatedObject }
          }
          
          console.log(`[Compare] Atomic verify patched: ${item.name} -> ${updatedItem.status}`)
        }
      }
    }
  } catch (e) {
    console.error('[Compare] Atomic verify failed:', e)
    // Fallback to full comparison if atomic fails
    await runComparison()
  }
}

// Lifecycle
onMounted(async () => {
  window.addEventListener('category-selected', handleCategorySelected as any)
  window.addEventListener('object-selected', handleObjectSelected as any)
  
  // Always trigger fresh comparison on init as requested
  if (activePair.value) {
    runComparison()
  }
})

onUnmounted(() => {
  window.removeEventListener('category-selected', handleCategorySelected as any)
  window.removeEventListener('object-selected', handleObjectSelected as any)
})

// Auto-load or Auto-compare on pair change
watch(() => connectionPairsStore.selectedPairId, (newId) => {
  if (newId) {
    // Reset state first
    tableResults.value = []
    procedureResults.value = []
    functionResults.value = []
    viewResults.value = []
    triggerResults.value = []
    selectedItem.value = null
    
    // Auto-trigger fresh compare on pair change
    runComparison()
  }
})

</script>
