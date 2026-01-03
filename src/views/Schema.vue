<template>
  <MainLayout>
    <template #toolbar>
      <div class="flex items-center justify-between w-full h-full gap-4">
        <!-- Title & Connection Selection -->
        <div class="flex items-center gap-4">
          <div class="flex flex-col gap-0.5">
            <h1 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center">
              <Folder class="w-5 h-5 mr-2 text-primary-500" />
              Schema Explorer
            </h1>
             <div class="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider gap-2">
                <Database class="w-3 h-3 opacity-50" />
                <select 
                 v-model="selectedConnectionId"
                 class="bg-transparent border-none p-0 font-bold text-primary-600 dark:text-primary-400 focus:ring-0 cursor-pointer max-w-[200px] truncate"
                 :style="{ fontSize: appStore.fontSizes.button + 'px' }"
               >
                 <option value="" disabled>Select Database</option>
                 <option v-for="conn in appStore.connections" :key="conn.id" :value="conn.id">
                   {{ conn.name }}
                 </option>
               </select>
               <button 
                 @click="loadSchema(false)" 
                 class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-primary-500 transition-colors"
                 title="Reload view from local cache"
               >
                 <RotateCcw class="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>

        <!-- Action Group -->
        <div 
          class="flex items-center gap-3 p-1.5 rounded-2xl transition-all duration-300 shadow-sm"
          :class="appStore.buttonStyle === 'full' 
            ? 'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5' 
            : 'bg-transparent border-transparent px-0'"
        >
          <div v-if="error" class="text-red-500 text-[10px] font-bold uppercase tracking-wider max-w-[150px] truncate px-2" :title="error">{{ error }}</div>
          
          <div v-if="selectedDbLastUpdated" class="hidden sm:flex flex-col items-end px-2 border-r border-gray-200 dark:border-gray-700">
            <span class="text-[9px] text-gray-400 uppercase tracking-tighter">Last synced</span>
            <span class="text-[10px] font-bold text-gray-600 dark:text-gray-300">{{ formatTimeAgo(selectedDbLastUpdated) }}</span>
          </div>

          <button 
            @click="loadSchema(true)" 
            :disabled="loading || !selectedConnectionId"
            class="flex items-center justify-center font-bold uppercase transition-all duration-300 disabled:opacity-50 disabled:grayscale"
            :class="[
              appStore.buttonStyle === 'full' ? 'px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 gap-2' : '',
              appStore.buttonStyle === 'minimal' ? 'px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg tracking-wider active:scale-95 shadow-sm gap-2' : '',
              appStore.buttonStyle === 'icons' ? 'w-10 h-10 bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/20 hover:scale-110 active:scale-95' : ''
            ]"
            :style="{ fontSize: appStore.fontSizes.button + 'px' }"
            title="Fetch Fresh Schema from Database (Andb Core)"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            <span v-if="appStore.buttonStyle !== 'icons'">{{ loading ? 'Fetching' : (appStore.buttonStyle === 'full' ? 'Fetch from DB' : 'Fetch') }}</span>
          </button>
        </div>
      </div>
    </template>
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden relative">
      <main class="flex-1 flex overflow-hidden relative">
        <!-- Loading Overlay -->
        <div v-if="loading && !hasResults" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-20 flex items-center justify-center backdrop-blur-sm">
          <div class="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div class="relative w-20 h-20 mx-auto mb-6">
              <div class="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
            </div>
            <p class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">{{ statusMessage || 'Loading schema...' }}</p>
            <div class="mt-2 text-xs text-gray-500 uppercase tracking-tighter animate-pulse">Running commands... Check console</div>
          </div>
        </div>

        <div class="flex-1 flex overflow-hidden relative">
          <!-- Left: Object Categories & List -->
          <div :style="{ width: resultsWidth + 'px' }" class="border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col shrink-0 relative">
            <div class="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-10 flex items-center shrink-0">
                <button 
                  v-if="selectedFilterType !== 'all'"
                  @click="selectedFilterType = 'all'"
                  class="p-1 hover:bg-white dark:hover:bg-gray-700 rounded mr-2 transition-colors text-gray-500"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <div class="flex items-center min-w-0 flex-1">
                  <span class="text-primary-600 dark:text-primary-400 mr-1.5 shrink-0">
                    <Database v-if="selectedFilterType === 'all'" class="w-3.5 h-3.5" />
                    <component v-else :is="getIconForType(selectedFilterType)" class="w-3.5 h-3.5" />
                  </span>
                  <div class="flex flex-col min-w-0">
                    <span 
                      class="truncate font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300"
                      :style="{ fontSize: (appStore.fontSizes.schema - 2) + 'px' }"
                    >
                      {{ selectedFilterType === 'all' ? 'Database Overview' : selectedFilterType }}
                    </span>
                    <span v-if="hasResults" :style="{ fontSize: (appStore.fontSizes.schema - 4) + 'px' }" class="text-gray-400 uppercase tracking-tighter">
                      {{ filteredResults.length }} items
                    </span>
                  </div>
                </div>
              </div>

              <!-- Search Bar -->
              <div v-if="hasResults" class="p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
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
              </div>
              
              <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div v-if="!hasResults" class="p-8 text-center text-gray-400 h-full flex flex-col justify-center">
                  <ScanSearch class="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p class="text-xs uppercase tracking-widest font-bold">No schema loaded</p>
                  <p class="text-[10px] opacity-60 mt-1">Select a database and click Fetch</p>
                </div>

                <!-- OVERVIEW MODE -->
                <div v-else-if="selectedFilterType === 'all'" class="space-y-2">
                  <div 
                    v-for="cat in resultsByCategory" :key="cat.type"
                    @click="selectedFilterType = cat.type"
                    class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all cursor-pointer group"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-3 group-hover:scale-110 transition-transform">
                          <component :is="getIconForType(cat.type)" class="w-4 h-4" />
                        </div>
                        <div>
                          <div class="font-bold text-gray-900 dark:text-white uppercase tracking-widest" :style="{ fontSize: (appStore.fontSizes.schema - 1) + 'px' }">{{ cat.type }}</div>
                          <div class="text-gray-400" :style="{ fontSize: (appStore.fontSizes.schema - 3) + 'px' }">{{ cat.items.length }} items</div>
                        </div>
                      </div>
                      <ChevronRight class="w-3 h-3 text-gray-300 group-hover:text-primary-500" />
                    </div>
                  </div>
                </div>

                <!-- LIST MODE -->
                <div v-else class="space-y-1">
                  <div v-for="item in filteredResults" :key="item.name" 
                    @click="selectItem(item)"
                    class="p-2.5 cursor-pointer rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-between group"
                    :class="{ 'bg-white dark:bg-gray-800 shadow-sm border border-primary-500/20 ring-1 ring-primary-500/10': selectedItem?.name === item.name }"
                  >
                    <div class="min-w-0 pr-2 flex-1">
                      <div class="flex items-center justify-between">
                        <div class="font-mono truncate text-gray-900 dark:text-gray-100" :class="{ 'font-bold': selectedItem?.name === item.name }" :style="{ fontSize: appStore.fontSizes.ddlName + 'px' }">
                          {{ item.name }}
                        </div>
                        <span v-if="item.updated_at" class="text-[9px] text-gray-400 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {{ formatTimeAgo(item.updated_at).replace(' ago', '') }}
                        </span>
                      </div>
                    </div>
                    <ChevronRight class="w-3 h-3 text-gray-300 group-hover:text-primary-500 shrink-0" v-show="selectedItem?.name !== item.name" />
                  </div>
                </div>
              </div>
              
              <!-- Resize Handle -->
              <div 
                @mousedown="startResultsResize"
                class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary-400/50 transition-colors z-10"
              ></div>
            </div>

            <!-- Right: DDL Viewer (Simplified MirrorDiffView) -->
            <div class="flex-1 bg-white dark:bg-gray-900 overflow-hidden flex flex-col relative">
              <div v-if="selectedItem" class="flex-1 flex flex-col overflow-hidden">
                <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0">
                  <div class="flex items-center overflow-hidden">
                    <div class="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-3">
                      <component :is="getIconForType(selectedItem.type)" class="w-5 h-5" />
                    </div>
                    <div class="min-w-0">
                      <h2 class="font-bold text-gray-900 dark:text-white truncate" :style="{ fontSize: appStore.fontSizes.ddlHeader + 'px' }">{{ selectedItem.name }}</h2>
                      <div class="flex items-center space-x-2 mt-0.5">
                        <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider transition-colors duration-200">{{ selectedItem.type }}</span>
                        <div v-if="selectedItem.updated_at" class="flex items-center text-[10px] text-gray-400 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                          <span class="mr-1 opacity-70">Synced:</span>
                          <span class="font-mono text-gray-500 dark:text-gray-300">{{ formatTimeAgo(selectedItem.updated_at) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="takeSnapshot"
                      :disabled="loading"
                      class="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                      title="Take Manual Snapshot"
                    >
                      <Camera class="w-4 h-4" />
                    </button>
                    <button 
                      @click="loadSchema(true)"
                      :disabled="loading"
                      class="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                      title="Atomic Refresh"
                    >
                      <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                    </button>
                    <button 
                      @click="copyDDL"
                      class="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                      title="Copy DDL"
                    >
                      <Copy class="w-4 h-4" />
                    </button>
                    <button 
                      @click="downloadDDL"
                      class="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                      title="Download SQL"
                    >
                      <Download class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div class="flex-1 overflow-hidden relative group">
                  <div class="absolute inset-0 flex overflow-auto custom-scrollbar bg-gray-50 dark:bg-gray-900/50 text-sm font-mono">
                    <!-- Line Numbers -->
                    <div class="flex-none py-4 px-2 text-right text-gray-400 dark:text-gray-600 select-none bg-gray-100/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 min-w-[3rem]">
                      <div v-for="n in lineCount" :key="n" class="leading-6">{{ n }}</div>
                    </div>
                    
                    <!-- Code -->
                    <pre class="flex-1 py-4 px-4 syntax-highlighter bg-transparent text-gray-800 dark:text-gray-200 !mt-0 !bg-transparent" :style="{ fontSize: appStore.fontSizes.code + 'px', fontFamily: appStore.fontFamilies.code }"><code v-html="highlightedDDL" class="block leading-6"></code></pre>
                  </div>
                  
                  <!-- Copy Button (Overlay) -->
                  <div class="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <!-- Existing copy button logic can go here or be kept if we want -->
                  </div>
                </div>
              </div>
              
              <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 grayscale opacity-40">
                <div class="relative mb-6">
                  <div class="absolute -inset-4 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
                  <MousePointer2 class="w-16 h-16 text-primary-500/50" />
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-widest">Select an item</h3>
                <p class="text-sm max-w-xs leading-relaxed">Choose an object from the left list to view its DDL definition and properties.</p>
              </div>
            </div>
          </div>
        </main>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAppStore } from '@/stores/app'
import { useConsoleStore } from '@/stores/console'
import Andb from '@/utils/andb'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import { 
  RefreshCw, 
  Folder,
  ScanSearch, 
  MousePointer2,
  ChevronRight,
  Database,
  Table,
  Layers,
  Hammer,
  Zap,
  ChevronLeft,
  Search, 
  Copy, 
  Download,
  Camera,
  RotateCcw
} from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'
import { useSidebarStore } from '@/stores/sidebar'

const appStore = useAppStore()
const consoleStore = useConsoleStore()
const notificationStore = useNotificationStore()
const sidebarStore = useSidebarStore()


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
const selectedConnectionId = ref('')
const selectedFilterType = ref('all')
const searchQuery = ref('')
const selectedItem = ref<any>(null)

const schemaData = ref({
  tables: [] as any[],
  procedures: [] as any[],
  functions: [] as any[],
  views: [] as any[],
  triggers: [] as any[]
})

const allResults = computed(() => {
  return [
    ...schemaData.value.tables.map(i => ({ ...i, type: 'tables' })),
    ...schemaData.value.procedures.map(i => ({ ...i, type: 'procedures' })),
    ...schemaData.value.functions.map(i => ({ ...i, type: 'functions' })),
    ...schemaData.value.views.map(i => ({ ...i, type: 'views' })),
    ...schemaData.value.triggers.map(i => ({ ...i, type: 'triggers' }))
  ]
})

const filteredResults = computed(() => {
  let filtered = allResults.value
  
  if (selectedFilterType.value !== 'all') {
    filtered = filtered.filter(i => i.type === selectedFilterType.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(i => i.name.toLowerCase().includes(query))
  }

  return filtered
})

const selectedDbLastUpdated = ref<string | null>(null)

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return 'Never'
  try {
    // SQLite returns 'YYYY-MM-DD HH:MM:SS' in UTC
    // JS Date.parse assumes local time for this format
    // We explicitly format it to ISO UTC string 'YYYY-MM-DDTHH:MM:SSZ'
    let utcString = dateString
    if (!dateString.endsWith('Z')) {
      utcString = dateString.replace(' ', 'T') + 'Z'
    }
    
    const date = new Date(utcString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    
    // Future date guard (drift/clocks)
    if (diffSec < 0) return 'Just now'
    
    if (diffSec < 60) return 'Just now'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
    return date.toLocaleDateString()
  } catch (e) {
    return 'Unknown'
  }
}

const formattedDDL = computed(() => {
  const item = selectedItem.value
  if (!item) return ''
  
  // Handle different property names from Cache vs Live Fetch
  // Cache (SQLite) uses 'content', Live (Andb Core) uses 'ddl'
  const ddl = item.ddl || item.content
  
  if (!ddl) return ''
  if (Array.isArray(ddl)) {
    return ddl.join('\n')
  }
  return ddl
})

const highlightedDDL = computed(() => {
  if (!formattedDDL.value) return ''
  
  // 1. Basic Highlight with Prism
  let html = Prism.highlight(formattedDDL.value, Prism.languages.sql, 'sql')

  // 2. Custom Post-processing for "Rainbow" brackets and distinct punctuation
  // Prism usually wraps punctuation in <span class="token punctuation">...</span>
  // We regex replace to add specific classes for ( ) , ;
  
  // Handle Parentheses (Rainbow effect placeholder - typically needs depth level, but we'll stick to a nice Gold/Purple for now)
  html = html.replace(
    /<span class="token punctuation">(\()<\/span>/g, 
    '<span class="token punctuation paren-open text-yellow-500 dark:text-yellow-400 font-bold">(</span>'
  )
  html = html.replace(
    /<span class="token punctuation">(\))<\/span>/g, 
    '<span class="token punctuation paren-close text-yellow-500 dark:text-yellow-400 font-bold">)</span>'
  )

  // Handle Commas (Bright contrast)
  html = html.replace(
    /<span class="token punctuation">(,)<\/span>/g, 
    '<span class="token punctuation comma text-gray-500 dark:text-gray-100 font-bold">,</span>'
  )

  // Handle Semicolons
  html = html.replace(
    /<span class="token punctuation">(;)<\/span>/g, 
    '<span class="token punctuation semicolon text-red-500 dark:text-pink-400 font-bold">;</span>'
  )
  
  return html
})

const lineCount = computed(() => {
  if (!formattedDDL.value) return 0
  return formattedDDL.value.split('\n').length
})

watch(selectedConnectionId, (newId) => {
  if (newId) {
    loadSchema(false)
  }
})

const hasResults = computed(() => allResults.value.length > 0)

const resultsByCategory = computed(() => {
  const categories = ['tables', 'views', 'procedures', 'functions', 'triggers']
  return categories.map(cat => ({
    type: cat,
    items: allResults.value.filter(i => i.type === cat)
  })).filter(c => c.items.length > 0)
})

// Resize Logic
const resultsWidth = ref(256)
const isResizingResults = ref(false)

const startResultsResize = () => {
  isResizingResults.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
}

const handleResize = (e: MouseEvent) => {
  if (isResizingResults.value) {
    resultsWidth.value = Math.max(200, Math.min(600, resultsWidth.value + e.movementX))
  }
}

const stopResize = () => {
  isResizingResults.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = 'default'
}

// Actions
const loadSchema = async (forceRefresh = false) => {
  if (!selectedConnectionId.value) return
  
  const conn = appStore.connections.find(c => c.id === selectedConnectionId.value)
  if (!conn) return

  loading.value = true
  if (forceRefresh) {
    consoleStore.setVisibility(true) // Open console only on manual refresh
    statusMessage.value = 'Fetching from database...'
    consoleStore.clearLogs()
  } else {
    // Silent load from cache
    statusMessage.value = 'Loading from cache...'
  }
  
  error.value = null
  // Only reset selection if NOT forcing refresh (i.e. switching DBs)
  if (!forceRefresh) {
    selectedItem.value = null
    selectedFilterType.value = 'all'
  }

  try {
    if (forceRefresh) {
      // REAL FETCH: Hit the database
      consoleStore.addLog(`Connecting to database: ${conn.name}...`, 'info')
      
      // Atomic Refresh Logic
      if (selectedItem.value) {
        // 1. Refresh specific object
        // ... (no clearing for atomic item refresh usually)
        let objTypes: any[] = [selectedItem.value.type.toLowerCase()] // e.g., 'tables'
        let exportName: string | undefined = selectedItem.value.name
        consoleStore.addLog(`Refreshing single object: ${selectedItem.value.name} (${selectedItem.value.type})`, 'info')
        
        // Helper to run export
        const runExports = async () => {
             for (const type of objTypes) {
                const cmd = `andb export --source ${conn.environment} --type ${type}` + (exportName ? ` --name ${exportName}` : '')
                consoleStore.addLog(cmd, 'cmd')
              }
        
              await Promise.all(objTypes.map(type => 
                Andb.export(conn, null as any, { 
                  type: type as any, 
                  environment: conn.environment, 
                  name: exportName 
                })
                  .then(res => {
                    consoleStore.addLog(`Fetched ${res.data?.length || 0} ${type}`, 'success')
                    return res
                  })
              ))
        }
        await runExports()

      } else if (selectedFilterType.value && selectedFilterType.value !== 'all') {
        // 2. Refresh specific category
        // Clear category data? No API for clearing just category yet. Connection clear is safest for "power full".
        // But if user asks for full power, maybe full clear is what they expect even for filtered view? 
        // User said: "khi click phải dọn sạch sqlite và fetch từ db thật về lưu mới toanh"
        // Implicitly probably refers to the main "Fetch from DB" button which usually fetches all.
        // But let's apply it generally if it's a full fetch.
        
        let objTypes: any[] = [selectedFilterType.value.toLowerCase()]
        consoleStore.addLog(`Refreshing category: ${selectedFilterType.value}`, 'info')
        
        // ... export loop ...
        for (const type of objTypes) {
          const cmd = `andb export --source ${conn.environment} --type ${type}`
          consoleStore.addLog(cmd, 'cmd')
        }
        
         await Promise.all(objTypes.map(type => 
            // @ts-ignore
            Andb.export(conn, null as any, { 
              type: type as any, 
              environment: conn.environment
            })
              .then(res => {
                consoleStore.addLog(`Fetched ${res.data?.length || 0} ${type}`, 'success')
                return res
              })
          ))

      } else {
        // 3. FULL REFRESH
        // POWERFUL CLEANUP HERE
        consoleStore.addLog(`Cleaning local cache for ${conn.name}...`, 'warn')
        await Andb.clearConnectionData(conn)
        
        consoleStore.addLog(`Refreshing full schema...`, 'info')
        let objTypes: any[] = ['tables', 'procedures', 'functions', 'triggers', 'views']
        
        for (const type of objTypes) {
           const cmd = `andb export --source ${conn.environment} --type ${type}`
           consoleStore.addLog(cmd, 'cmd')
         }
   
         await Promise.all(objTypes.map(type => 
           // @ts-ignore
           Andb.export(conn, null as any, { 
             type: type as any, 
             environment: conn.environment 
           })
             .then(res => {
               consoleStore.addLog(`Fetched ${res.data?.length || 0} ${type}`, 'success')
               return res
             })
         ))
      }

      // Update cache logic stays same - we just refreshed SQLite state.
      // Now falling through to load from cache will pick up changes.
      
      notificationStore.add({
        type: 'success',
        title: 'Schema Refreshed',
        message: `Successfully refreshed schema for ${conn.name} from source.`
      })
      
      consoleStore.addLog(`Schema refresh completed successfully.`, 'success')
      
      // Trigger sidebar update to reflect new cache
      sidebarStore.triggerRefresh()

    } 
    
    // Always load from cache to update UI state
    {
      // ... cache fetch ...
      // CACHE FETCH: Load from SQLite via Andb.getSchemas()
      const allSchemas = await Andb.getSchemas()
      // ... same as before logic ...
      const envData = allSchemas?.find((e: any) => e.name === conn.environment)
      const dbData = envData?.databases?.find((d: any) => d.name === conn.database) 


      if (dbData) {
        // Set last updated time from DB metadata
        selectedDbLastUpdated.value = dbData.lastUpdated || null
        
        schemaData.value = {
          tables: dbData.tables || [],
          procedures: dbData.procedures || [],
          functions: dbData.functions || [],
          views: dbData.views || [],
          triggers: dbData.triggers || []
        }
      } else {
        selectedDbLastUpdated.value = null
        // No data in cache
        schemaData.value = {
          tables: [], procedures: [], functions: [], views: [], triggers: []
        }
      }
    }

  } catch (err: any) {
    error.value = err.message
    consoleStore.addLog(`Error loading schema: ${err.message}`, 'error')
    notificationStore.add({
      type: 'error',
      title: 'Failed to load schema',
      message: err.message
    })
  } finally {
    loading.value = false
  }
}

const selectItem = async (item: any) => {
  selectedItem.value = item
  // If DDL is not already in item, we might need to fetch it (but compare usually returns it)
  // Ensure we are showing the correct filter type
  if (item.type && selectedFilterType.value === 'all') {
    selectedFilterType.value = item.type
  }
}

const takeSnapshot = async () => {
  if (!selectedItem.value || !selectedConnectionId.value) return
  
  const conn = appStore.connections.find(c => c.id === selectedConnectionId.value)
  if (!conn) return

  loading.value = true
  statusMessage.value = 'Taking snapshot...'
  
  try {
    await Andb.createSnapshot(conn, selectedItem.value.type, selectedItem.value.name)
    notificationStore.add({
      type: 'success',
      title: 'Snapshot Created',
      message: `Manual snapshot of ${selectedItem.value.name} saved to history.`
    })
  } catch (err: any) {
    notificationStore.add({
      type: 'error',
      title: 'Snapshot Failed',
      message: err.message
    })
  } finally {
    loading.value = false
  }
}

const copyDDL = () => {
  if (!formattedDDL.value) return
  navigator.clipboard.writeText(formattedDDL.value)
  notificationStore.add({
    type: 'success',
    title: 'Copied',
    message: 'DDL script copied to clipboard.'
  })
}

const downloadDDL = () => {
  if (!formattedDDL.value) return
  const blob = new Blob([formattedDDL.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedItem.value.name}.sql`
  a.click()
  URL.revokeObjectURL(url)
}

// Event Handlers for Sidebar
const handleCategorySelected = (e: any) => {
  const { type, env, db } = e.detail
  const conn = appStore.connections.find(c => c.environment === env && c.database === db)
  if (conn) {
    selectedConnectionId.value = conn.id
    selectedFilterType.value = type
    loadSchema(false)
  }
}

const handleObjectSelected = (e: any) => {
  const { name, type, env, db } = e.detail
  const conn = appStore.connections.find(c => c.environment === env && c.database === db)
  if (conn) {
    const connIdChanged = selectedConnectionId.value !== conn.id
    selectedConnectionId.value = conn.id
    
    // Clear search to ensure the object is visible
    searchQuery.value = ''
    
    if (selectedFilterType.value !== type && type !== 'all') {
      selectedFilterType.value = type
    }
    
    // If connection changed or no results, try load from cache
    if (!hasResults.value || connIdChanged) {
      loadSchema(false).then(() => {
        const item = allResults.value.find(i => i.name === name && (type === 'all' || i.type === type))
        if (item) selectItem(item)
      })
    } else {
      const item = allResults.value.find(i => i.name === name && (type === 'all' || i.type === type))
      if (item) {
        selectItem(item)
      } else {
        // Not found? Try one more reload from CACHE
        loadSchema(false).then(() => {
          const newItem = allResults.value.find(i => i.name === name && (type === 'all' || i.type === type))
          if (newItem) selectItem(newItem)
        })
      }
    }
  }
}

const handleDatabaseSelected = (e: any) => {
  const { env, db } = e.detail
  const conn = appStore.connections.find(c => c.environment === env && c.database === db)
  if (conn) {
    selectedConnectionId.value = conn.id
    selectedFilterType.value = 'all'
    loadSchema(false)
  }
}

const handleDatabaseRefreshRequested = (e: any) => {
  const { env, db } = e.detail
  const conn = appStore.connections.find(c => c.environment === env && c.database === db)
  if (conn) {
    selectedConnectionId.value = conn.id
    selectedFilterType.value = 'all'
    loadSchema(true)
  }
}

const handleCategoryRefreshRequested = (e: any) => {
  const { type, env, db } = e.detail
  const conn = appStore.connections.find(c => c.environment === env && c.database === db)
  if (conn) {
    selectedConnectionId.value = conn.id
    selectedFilterType.value = type
    selectedItem.value = null
    loadSchema(true)
  }
}

const handleObjectRefreshRequested = (e: any) => {
  const { name, type, env, db } = e.detail
  const conn = appStore.connections.find(c => c.environment === env && c.database === db)
  if (conn) {
    selectedConnectionId.value = conn.id
    selectedFilterType.value = type
    // Load from cache or current results to ensure selection
    loadSchema(false).then(() => {
      const item = allResults.value.find(i => i.name === name && (type === 'all' || i.type === type))
      if (item) {
        selectedItem.value = item
        loadSchema(true)
      }
    })
  }
}

onMounted(() => {
  // If there's an active pair, default to source
  if (appStore.currentPair?.source) {
    selectedConnectionId.value = appStore.currentPair.source.id
  }
  
  window.addEventListener('category-selected', handleCategorySelected)
  window.addEventListener('object-selected', handleObjectSelected)
  window.addEventListener('database-selected', handleDatabaseSelected)
  window.addEventListener('database-refresh-requested', handleDatabaseRefreshRequested)
  window.addEventListener('category-refresh-requested', handleCategoryRefreshRequested)
  window.addEventListener('object-refresh-requested', handleObjectRefreshRequested)
})

onUnmounted(() => {
  window.removeEventListener('category-selected', handleCategorySelected)
  window.removeEventListener('object-selected', handleObjectSelected)
  window.removeEventListener('database-selected', handleDatabaseSelected)
  window.removeEventListener('database-refresh-requested', handleDatabaseRefreshRequested)
  window.removeEventListener('category-refresh-requested', handleCategoryRefreshRequested)
  window.removeEventListener('object-refresh-requested', handleObjectRefreshRequested)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>

<style>
/* Syntax Highlighting - Standard (Light Mode) */
.syntax-highlighter .token.keyword { color: #0000FF; font-weight: bold; }
.syntax-highlighter .token.string { color: #A31515; }
.syntax-highlighter .token.comment { color: #008000; font-style: italic; }
.syntax-highlighter .token.function { color: #795E26; }
.syntax-highlighter .token.number { color: #098658; }
.syntax-highlighter .token.operator { color: #000000; }
.syntax-highlighter .token.punctuation { color: #000000; }

/* Dark Mode Overrides (Explicit specificity) */
html.dark .syntax-highlighter .token.keyword { color: #569cd6 !important; }
html.dark .syntax-highlighter .token.string { color: #ce9178 !important; }
html.dark .syntax-highlighter .token.comment { color: #6a9955 !important; }
html.dark .syntax-highlighter .token.function { color: #dcdcaa !important; }
html.dark .syntax-highlighter .token.number { color: #b5cea8 !important; }
html.dark .syntax-highlighter .token.operator,
html.dark .syntax-highlighter .token.punctuation { color: #d4d4d4 !important; }
</style>

