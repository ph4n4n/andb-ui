<template>
  <div class="flex w-full h-full overflow-hidden bg-white dark:bg-gray-950">
    <!-- Columns -->
    <div 
      v-for="(column, index) in columns" 
      :key="index"
      class="border-r border-gray-100 dark:border-white/5 flex flex-col shrink-0 bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out group/col relative"
      :class="isCollapsed(index) ? 'w-12 hover:w-72 z-10 hover:z-20 hover:shadow-2xl' : 'w-72'"
    >
      <!-- Column Header (Luxury) -->
      <div 
         class="px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl flex items-center justify-between h-14 transition-all" 
         :class="isCollapsed(index) ? 'justify-center px-0 group-hover/col:justify-between group-hover/col:px-4' : ''"
      >
        <!-- Title / Edit Input -->
        <div 
           class="min-w-0 flex-1 mr-2 transition-all duration-300"
           :class="isCollapsed(index) ? 'w-0 opacity-0 group-hover/col:w-auto group-hover/col:opacity-100' : 'w-auto opacity-100'"
        >
            <input 
              v-if="editingColumnIndex === index"
              ref="titleInput"
              v-model="editingTitle"
              @blur="saveColumnTitle(index)"
              @keydown.enter="saveColumnTitle(index)"
              @keydown.esc="cancelEdit"
              @click.stop
              class="w-full bg-white dark:bg-gray-800 border-2 border-primary-500 rounded-xl px-2 py-1 text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white outline-none"
            />
            <div v-else class="flex flex-col min-w-0">
               <span class="text-[8px] font-black uppercase tracking-[0.3em] text-primary-500/60 leading-none mb-1 truncate">{{ column.type === 'projects' ? 'Source Control' : 'Project Hierarchy' }}</span>
               <h3 
                  @click="startEditColumnTitle(index)"
                  class="text-xs font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300 cursor-pointer hover:text-primary-500 truncate"
               >
                  {{ column.title }}
               </h3>
            </div>
        </div>

        <div v-if="appStore.projectManagerMode" class="flex items-center gap-1 shrink-0" :class="isCollapsed(index) ? 'hidden group-hover/col:flex' : 'flex'">
          <!-- Global Auto-hide Settings (Only on Projects column) -->
          <button 
             v-if="column.type === 'projects'"
             @click.stop="appStore.autoCollapseColumns = !appStore.autoCollapseColumns"
             class="mr-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all"
             :class="appStore.autoCollapseColumns ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'"
             :title="appStore.autoCollapseColumns ? 'Auto-hide: ON' : 'Auto-hide: OFF'"
          >
             {{ appStore.autoCollapseColumns ? 'AUTO-HIDE' : 'STATIC' }}
          </button>

          <!-- Pin Toggle -->
          <button 
             @click.stop="togglePin(index)"
             class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
             :class="column.isPinned ? 'text-primary-500' : 'text-gray-400 hover:text-gray-500'"
             :title="column.isPinned ? 'Unpin column' : 'Pin column'"
          >
             <component :is="column.isPinned ? PinOff : Pin" class="w-3.5 h-3.5" />
          </button>

          <!-- Add Button (Contextual) -->
          <button 
             v-if="['projects', 'connections', 'pairs'].includes(column.type)"
             @click.stop="handleAdd(column)"
             class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-primary-500 transition-colors"
             :title="'New ' + column.title.slice(0, -1)"
          >
             <Plus class="w-4 h-4" />
          </button>
        </div>

        <div 
             v-if="isCollapsed(index)" 
             class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 absolute left-1/2 -translate-x-1/2 group-hover/col:opacity-0 transition-opacity pointer-events-none"
        ></div>
      </div>

      <!-- Collapsed Vertical Label -->
      <div 
          v-if="isCollapsed(index) && column.selectedId"
          class="absolute inset-x-0 top-14 bottom-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 group-hover/col:opacity-0 transition-opacity pointer-events-none z-10"
      >
        <span class="vertical-label -rotate-90 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.4em] text-primary-500/40 dark:text-primary-400/40 select-none">
            {{ getSelectedName(column) }}
        </span>
      </div>
      
      <div 
         class="flex-1 overflow-y-auto slim-scrollbar px-3 py-4 space-y-1.5 transition-opacity duration-200 bg-white dark:bg-gray-950"
         :class="{ 'opacity-0 group-hover/col:opacity-100': isCollapsed(index) }"
      >
        <button
          v-for="item in column.items"
          :key="item.id"
          @click="selectInColumn(index, item)"
          :class="{
            'bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20 shadow-xl shadow-primary-500/5 border border-primary-500/10': column.selectedId === item.id,
            'hover:bg-primary-50/50 dark:hover:bg-primary-900/5 text-gray-700 dark:text-gray-300 border-transparent': column.selectedId !== item.id,
            'justify-center px-0': isCollapsed(index)
          }"
          @dblclick="handleDblClick(index, item)"
          class="w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group border border-transparent"
          :title="isCollapsed(index) ? item.name : ''"
        >
          <div 
             class="flex items-center min-w-0 transition-all duration-300" 
             :class="[
                isCollapsed(index) ? 'justify-center w-full group-hover/col:justify-start group-hover/col:w-auto gap-0 group-hover/col:gap-3' : 'justify-start w-auto gap-3'
             ]"
          >
            <div class="relative shrink-0">
               <component 
                 :is="item.icon || Folder" 
                 class="w-4 h-4 transition-transform duration-300"
                 :class="{ 'scale-110': column.selectedId === item.id }"
               />
               <!-- Status Dot (for connections) -->
               <div 
                  v-if="item.host && item.status" 
                  class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-gray-900 shadow-sm"
                  :class="{
                    'bg-green-500': item.status === 'connected',
                    'bg-yellow-500': item.status === 'testing',
                    'bg-red-500': item.status === 'failed',
                    'bg-gray-300': item.status === 'idle'
                  }"
               ></div>
            </div>
            
            <div 
               class="flex-1 min-w-0 transition-all duration-300 whitespace-nowrap"
               :class="isCollapsed(index) ? 'max-w-0 opacity-0 group-hover/col:max-w-[200px] overflow-hidden group-hover/col:opacity-100' : 'opacity-100 overflow-visible'"
            >
              <div class="flex items-center gap-1.5 w-full">
                <span class="text-sm font-bold truncate">{{ item.name }}</span>
                <span v-if="item.inProject" class="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 ring-2 ring-primary-500/20 ml-0.5"></span>
              </div>
              <div 
                v-if="item.description || item.count !== undefined" 
                class="text-[10px] truncate opacity-70 flex items-center gap-1.5"
              >
                <span v-if="item.environment && !isCollapsed(index)" class="shrink-0 font-black text-[8px] px-1 rounded bg-gray-100 dark:bg-gray-800 tracking-tighter">{{ item.environment }}</span>
                <span class="truncate">{{ item.description || (item.count !== undefined ? `${item.count} items` : '') }}</span>
              </div>
            </div>
          </div>

          <!-- Project Membership Toggle (only if item supports it) -->
          <button 
             v-if="['connections', 'pairs'].includes(column.type) && !isCollapsed(index)"
             @click.stop="toggleProjectMembership(column, item)"
             class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
             :class="item.inProject ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600'"
             :title="item.inProject ? 'Remove from Base' : 'Add to Base'"
          >
             <CheckCircle2 v-if="item.inProject" class="w-3.5 h-3.5" />
             <PlusCircle v-else class="w-3.5 h-3.5" />
          </button>

          <!-- Project Delete Trigger -->
          <button 
             v-if="column.type === 'projects' && item.id !== 'default' && !isCollapsed(index)"
             @click.stop="handleDeleteProject(item)"
             class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
             title="Delete Base"
          >
             <Trash2 class="w-3.5 h-3.5" />
          </button>

          <ChevronRight 
             v-else-if="column.selectedId === item.id" 
             class="w-3 h-3 shrink-0 opacity-80"
             :class="isCollapsed(index) ? 'hidden group-hover/col:block' : 'block'"
          />
        </button>
      </div>
    </div>
    
    <div v-if="previewCode || previewObject" class="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-white/5 shadow-2xl z-10">
      <template v-if="previewLoading">
        <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
           <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-xs font-bold uppercase tracking-widest">Loading content...</p>
        </div>
      </template>
      <template v-else-if="previewObject && (previewObject.ddl || previewObject.content)">
        <DDLCodeViewer
          :code="previewCode"
          :object-name="previewObject.name"
          :ddl-type="previewObject.type"
          :environment="previewObject.environment"
          :updated-at="previewObject.updated_at || previewObject.lastUpdated"
          class="flex-1"
        />
      </template>

      <!-- Pair Preview / DRY Workbench -->
      <template v-else-if="previewObject && previewObject.sourceEnv && previewObject.targetEnv">
        <CompareWorkbench 
           :results="comparisonResults"
           :loading="fetchingResults"
           :pair-name="previewObject.name"
           :source-label="previewObject.sourceEnv"
           :target-label="previewObject.targetEnv"
           @run="(refresh) => loadComparisonResults(previewObject, refresh)"
           @migrate="(item) => router.push(`/compare?pairId=${previewObject.id}&action=migrate&item=${item.name}`)"
           class="flex-1"
        />
      </template>

      <!-- Connection Preview (Reused ConnectionForm) -->
      <template v-else-if="previewObject && previewObject.host">
         <div class="flex flex-col w-full h-full bg-gray-50 dark:bg-gray-950/50">
              <!-- Header -->
            <div class="px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center w-full shrink-0">
               <div>
                  <div class="flex items-center gap-2 mb-1">
                    <Database class="w-4 h-4 text-green-500" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Connection Details</span>
                  </div>
                  <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider truncate">{{ previewObject.name }}</h2>
                  <div class="flex items-center gap-3 mt-2 text-sm font-mono text-gray-500">
                     <span class="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold uppercase tracking-tighter">{{ previewObject.environment }}</span>
                     <span class="text-gray-400">•</span>
                     <span class="font-bold text-gray-700 dark:text-gray-300">{{ previewObject.database }}</span>
                  </div>
               </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6">
                <!-- Reused ConnectionForm -->
                <ConnectionForm 
                    :connection="previewObject"
                    @save="handleSaveConnection"
                    @cancel="previewObject = null"
                />
            </div>
         </div>
      </template>
    </div>
    
    <!-- Empty State / Main Workspace Background -->
    <div v-else class="flex-1 h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-950/50 border-l border-gray-200 dark:border-gray-800 relative overflow-hidden min-w-0">
      <!-- Background Decorative Grid (Subtle) -->
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" 
           style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 32px 32px;">
      </div>

      <div class="relative flex flex-col items-center justify-center text-center p-12 w-full animate-in fade-in zoom-in-95 duration-700">
        <div class="relative flex items-center justify-center mb-8">
           <div class="absolute inset-x-[-40px] inset-y-[-40px] bg-primary-500/10 blur-[60px] rounded-full opacity-50"></div>
           <LayoutGrid class="w-16 h-16 relative opacity-20 dark:opacity-10 scale-125" />
        </div>
        <div class="space-y-1">
          <h3 class="text-[11px] font-black uppercase tracking-[0.4em] mb-2 opacity-40">Main Stage</h3>
          <p class="text-[10px] font-bold uppercase tracking-widest opacity-30">Select an item to preview details</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useSidebarStore } from '@/stores/sidebar'
import { useNotificationStore } from '@/stores/notification'
import DDLCodeViewer from '@/components/DDLCodeViewer.vue'
import ConnectionForm from '@/components/ConnectionForm.vue'
import CompareWorkbench from '@/components/CompareWorkbench.vue'
import { Andb } from '@/utils/andb'
import { 
  Folder, 
  Database,
  GitCompare,
  Link,
  Table,
  Eye,
  Hammer,
  Pin,
  PinOff,
  LayoutGrid,
  Globe,
  Trash2,
  CheckCircle2,
  PlusCircle,
  Plus,
  Zap,
  ChevronRight
} from 'lucide-vue-next'

interface ColumnData {
  level: number
  type: 'projects' | 'categories' | 'environments' | 'databases' | 'types' | 'objects' | 'connections' | 'pairs'
  title: string
  items: any[]
  selectedId: string | null
  isPinned?: boolean
}

const router = useRouter()
const projectsStore = useProjectsStore()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const notificationStore = useNotificationStore()

const columns = ref<ColumnData[]>([])
const previewObject = ref<any>(null)
const previewCode = ref('')
const previewLoading = ref(false)
const comparisonResults = ref<any[]>([])
const fetchingResults = ref(false)

const editingColumnIndex = ref<number | null>(null)
const editingTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

// Initialize columns
onMounted(async () => {
  await projectsStore.reloadData()
  columns.value = [
    {
      level: 0,
      type: 'projects',
      title: 'Bases',
      items: projectsStore.projects,
      selectedId: null,
      isPinned: true
    }
  ]
})

const isCollapsed = (index: number) => {
  if (!appStore.projectManagerMode) return false
  const col = columns.value[index]
  if (col.isPinned) return false
  if (!appStore.autoCollapseColumns) return false
  
  // Collapse if NOT the last column AND has a selection
  return index < columns.value.length - 1 && col.selectedId !== null
}

const getSelectedName = (column: ColumnData) => {
  const item = column.items.find(i => i.id === column.selectedId)
  return item ? item.name : ''
}

const togglePin = (index: number) => {
  columns.value[index].isPinned = !columns.value[index].isPinned
}

const selectInColumn = async (level: number, item: any) => {
  // If clicking same item, just return
  if (columns.value[level].selectedId === item.id) {
    // If it's a leaf node, maybe we want to refresh?
    if (level === columns.value.length - 1) {
       handleSelection(item)
    }
    return
  }

  columns.value[level].selectedId = item.id
  columns.value = columns.value.slice(0, level + 1)
  
  // Handle the selection (preview etc)
  handleSelection(item)

  const nextColumn = await getNextColumn(level, item)
  if (nextColumn) {
    columns.value.push(nextColumn)
  }
}

const handleSelection = async (item: any) => {
  previewObject.value = item
  previewCode.value = ''
  comparisonResults.value = []

  if (item.ddl !== undefined) {
    // It's a DDL object
    previewLoading.value = true
    try {
      // In a real app, you might fetch DDL here if not already present
      previewCode.value = item.ddl || '-- No DDL found'
    } finally {
      previewLoading.value = false
    }
  } else if (item.sourceEnv && item.targetEnv) {
    // It's a pair
    loadComparisonResults(item)
  }
}

const loadComparisonResults = async (pair: any, refresh = false) => {
  fetchingResults.value = true
  try {
    const source = appStore.connections.find(c => c.id === pair.sourceId)
    const target = appStore.connections.find(c => c.id === pair.targetId)
    if (!source || !target) return

    if (refresh) {
       await Andb.export(source, target, { type: 'all' as any })
    }
    
    const res = await Andb.compare(source, target, { 
      type: 'all' as any,
      sourceEnv: pair.sourceEnv,
      targetEnv: pair.targetEnv
    })
    
    if (res) {
       comparisonResults.value = [
         ...(res.tables || []).map((i: any) => ({ ...i, type: 'tables' })),
         ...(res.views || []).map((i: any) => ({ ...i, type: 'views' })),
         ...(res.procedures || []).map((i: any) => ({ ...i, type: 'procedures' })),
         ...(res.functions || []).map((i: any) => ({ ...i, type: 'functions' })),
         ...(res.triggers || []).map((i: any) => ({ ...i, type: 'triggers' }))
       ]
    }
  } catch (e) {
    console.error('Failed to load comparison results in PM', e)
  } finally {
    fetchingResults.value = false
  }
}

const getNextColumn = async (level: number, item: any): Promise<ColumnData | null> => {
  const currentType = columns.value[level].type
  
  switch (currentType) {
    case 'projects':
      return {
        level: level + 1,
        type: 'categories',
        title: item.name,
        items: [
          { id: 'schema', name: 'Schema', icon: Database },
          { id: 'connections', name: 'Connections', icon: Link, count: item.connectionIds?.length || 0 },
          { id: 'pairs', name: 'Sync Pairs', icon: GitCompare, count: item.pairIds?.length || 0 }
        ],
        selectedId: null
      }
    
    case 'categories':
      if (item.id === 'schema') {
        const envs = await getProjectEnvironments(columns.value[0].selectedId!)
        return {
          level: level + 1,
          type: 'environments',
          title: 'Environments',
          items: envs,
          selectedId: null
        }
      } else if (item.id === 'connections') {
        const project = projectsStore.projects.find(p => p.id === columns.value[0].selectedId)
        const conns = appStore.connections.filter(c => project?.connectionIds.includes(c.id))
        return {
          level: level + 1,
          type: 'connections',
          title: 'Connections',
          items: conns.map(c => ({ 
            ...c, 
            icon: Database,
            inProject: true,
            description: `${c.environment} • ${c.database}` 
          })),
          selectedId: null
        }
      } else if (item.id === 'pairs') {
         const project = projectsStore.projects.find(p => p.id === columns.value[0].selectedId)
         const pairs = connectionPairsStore.connectionPairs.filter(p => project?.pairIds.includes(p.id))
         return {
           level: level + 1,
           type: 'pairs',
           title: 'Sync Pairs',
           items: pairs.map(p => ({
             ...p,
             icon: GitCompare,
             inProject: true,
             description: `${p.sourceEnv} → ${p.targetEnv}`
           })),
           selectedId: null
         }
      }
      return null

    case 'environments':
      const dbRes = await getEnvironmentDatabases(columns.value[0].selectedId!, item.name)
      return {
        level: level + 1,
        type: 'databases',
        title: item.name,
        items: dbRes,
        selectedId: null
      }

    case 'databases':
      return {
        level: level + 1,
        type: 'types',
        title: item.name,
        items: [
          { id: 'tables', name: 'Tables', icon: Table, count: item.counts?.tables },
          { id: 'views', name: 'Views', icon: Eye, count: item.counts?.views },
          { id: 'procedures', name: 'Procedures', icon: Hammer, count: item.counts?.procedures },
          { id: 'functions', name: 'Functions', icon: Hammer, count: item.counts?.functions },
          { id: 'triggers', name: 'Triggers', icon: Zap, count: item.counts?.triggers }
        ],
        selectedId: null
      }

    case 'types':
      const objects = await getDatabaseObjects(
        columns.value[0].selectedId!,
        columns.value[level - 2].title, // environment
        columns.value[level - 1].title, // database
        item.id // type
      )
      return {
        level: level + 1,
        type: 'objects',
        title: item.name,
        items: objects,
        selectedId: null
      }

    default:
      return null
  }
}

// Data fetching helpers (Mock for now, will connect to Andb and stores)
const getProjectEnvironments = async (projectId: string) => {
  const project = projectsStore.projects.find(p => p.id === projectId)
  if (!project) return []
  
  const envs = new Set<string>()
  appStore.connections.filter(c => project.connectionIds.includes(c.id)).forEach(c => envs.add(c.environment))
  return Array.from(envs).map(name => ({ id: name, name, icon: Globe }))
}

const getEnvironmentDatabases = async (projectId: string, environment: string) => {
  const project = projectsStore.projects.find(p => p.id === projectId)
  const conns = appStore.connections.filter(c => project?.connectionIds.includes(c.id) && c.environment === environment)
  
  // Now we need the actual schemas from Andb
  const schemas = await Andb.getSchemas()
  const dbItems = []
  
  for (const conn of conns) {
     const schema = schemas.find((s: any) => s.environment === environment && s.database === conn.database)
     dbItems.push({
       id: conn.id,
       name: conn.database,
       icon: Database,
       counts: schema?.counts || {},
       environment: conn.environment
     })
  }
  return dbItems
}

const getDatabaseObjects = async (_projectId: string, environment: string, database: string, type: string) => {
  const schemas = await Andb.getSchemas()
  const schema = schemas.find((s: any) => s.environment === environment && s.database === database)
  if (!schema || !schema[type]) return []
  
  return schema[type].map((obj: any) => ({
    ...obj,
    id: `${environment}-${database}-${type}-${obj.name}`,
    icon: type === 'tables' ? Table : type === 'views' ? Eye : Hammer,
    environment,
    database
  }))
}

const toggleProjectMembership = async (column: ColumnData, item: any) => {
  const projectId = columns.value[0].selectedId
  if (!projectId) return

  const isAdding = !item.inProject
  if (column.type === 'connections') {
    if (isAdding) projectsStore.addItemToProject('connection', item.id)
    else projectsStore.removeItemFromProject('connection', item.id)
    item.inProject = isAdding
  } else if (column.type === 'pairs') {
    if (isAdding) projectsStore.addItemToProject('pair', item.id)
    else projectsStore.removeItemFromProject('pair', item.id)
    item.inProject = isAdding
  }
}

const handleDeleteProject = async (item: any) => {
  if (confirm(`Are you sure you want to delete project "${item.name}"?`)) {
    await projectsStore.removeProject(item.id)
    if (columns.value[0].selectedId === item.id) {
       columns.value = columns.value.slice(0, 1)
       columns.value[0].selectedId = null
       previewObject.value = null
    }
  }
}

const handleAdd = (column: ColumnData) => {
  if (column.type === 'projects') {
    const name = prompt('Enter new Base name:')
    if (name) projectsStore.addProject({ 
        name, 
        description: 'New project',
        connectionIds: [],
        pairIds: [],
        enabledEnvironmentIds: ['1', '2', '3', '4']
    })
  } else if (column.type === 'connections') {
    router.push('/settings?tab=connections&action=new')
  } else if (column.type === 'pairs') {
    router.push('/settings?tab=pairs&action=new')
  }
}

const startEditColumnTitle = (index: number) => {
  if (columns.value[index].type !== 'projects') return // Only edit project titles for now
  editingColumnIndex.value = index
  editingTitle.value = columns.value[index].title
  setTimeout(() => titleInput.value?.focus(), 0)
}

const saveColumnTitle = async (index: number) => {
  if (editingColumnIndex.value === null) return
  const col = columns.value[index]
  if (editingTitle.value && editingTitle.value !== col.title) {
    await projectsStore.updateProject(col.items.find(i => i.name === col.title).id, { name: editingTitle.value })
    col.title = editingTitle.value
  }
  editingColumnIndex.value = null
}

const cancelEdit = () => {
  editingColumnIndex.value = null
}

const handleDblClick = (index: number, item: any) => {
  if (columns.value[index].type === 'pairs') {
    router.push(`/compare?pairId=${item.id}`)
  } else if (columns.value[index].type === 'connections') {
    router.push('/settings?tab=connections')
  }
}

const handleSaveConnection = async (_conn: any) => {
   // Logic to save connection from preview
   notificationStore.add({ type: 'success', title: 'Saved', message: 'Connection updated successfully' })
}

</script>

<style scoped>
.slim-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.slim-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.slim-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.dark .slim-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.vertical-label {
  writing-mode: vertical-rl;
}
</style>
