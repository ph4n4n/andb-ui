<template>
  <div class="flex h-full overflow-hidden bg-gray-50 dark:bg-gray-900/50">
    <!-- Columns -->
    <div 
      v-for="(column, index) in columns"
      :key="index"
      class="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 bg-white dark:bg-gray-900"
    >
      <!-- Column Header -->
      <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500">{{ column.title }}</h3>
      </div>
      
      <!-- Column Items -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
        <button
          v-for="item in column.items"
          :key="item.id"
          @click="selectInColumn(index, item)"
          :class="{
            'bg-primary-500 text-white shadow-md shadow-primary-500/20': column.selectedId === item.id,
            'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300': column.selectedId !== item.id
          }"
          @dblclick="handleDblClick(index, item)"
          class="w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <component 
              :is="item.icon || Folder" 
              class="w-4 h-4 shrink-0 transition-transform duration-300"
              :class="{ 'scale-110': column.selectedId === item.id }"
            />
            <div class="min-w-0">
              <div class="text-sm font-medium truncate">{{ item.name }}</div>
              <div 
                v-if="item.description || item.count !== undefined" 
                class="text-[10px] truncate opacity-70"
              >
                {{ item.description || (item.count !== undefined ? `${item.count} items` : '') }}
              </div>
            </div>
          </div>
          <ChevronRight 
            v-if="column.selectedId === item.id" 
            class="w-3 h-3 shrink-0 opacity-80" 
          />
        </button>
      </div>
    </div>
    
    <!-- Preview Panel (rightmost) -->
    <div v-if="previewCode || previewObject" class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-10 transition-all">
      <template v-if="previewLoading">
        <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
           <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-xs font-bold uppercase tracking-widest">Loading content...</p>
        </div>
      </template>
      <template v-else-if="previewObject">
        <DDLCodeViewer
          :code="previewCode"
          :object-name="previewObject.name"
          :ddl-type="previewObject.type"
          :environment="previewObject.environment"
          :updated-at="previewObject.updated_at || previewObject.lastUpdated"
        />
      </template>
    </div>
    
    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center text-gray-400">
      <div class="text-center p-8 opacity-40">
        <div class="relative inline-block">
           <LayoutGrid class="w-16 h-16 mb-4 opacity-50" />
        </div>
        <p class="text-sm font-bold uppercase tracking-widest">Select an item to view details</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useSidebarStore } from '@/stores/sidebar'
import DDLCodeViewer from '@/components/DDLCodeViewer.vue'
import { 
  Folder, 
  Database,
  GitCompare,
  Link,
  Table,
  Eye,
  Hammer,
  Zap,
  ChevronRight,
  Cog,
  LayoutGrid,
  Globe
} from 'lucide-vue-next'

interface ColumnData {
  level: number
  type: 'projects' | 'categories' | 'connections' | 'environments' | 'ddl-types' | 'ddl-items'
  title: string
  items: any[]
  selectedId: string | null
}

const emit = defineEmits(['open'])
const projectsStore = useProjectsStore()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const sidebarStore = useSidebarStore()

// Columns View State
const columns = ref<ColumnData[]>([])
const previewCode = ref<string>('')
const previewObject = ref<any>(null)
const previewLoading = ref(false)

// Initialize logic
const initializeColumns = () => {
    // Initialize with projects column
    columns.value = [{
      level: 0,
      type: 'projects',
      title: 'Projects',
      items: projectsStore.projects.map(p => ({
        ...p,
        icon: p.icon || Folder,
        count: undefined 
      })),
      selectedId: projectsStore.selectedProjectId
    }]
    
    // If a project is already selected, simulate selection
    if (projectsStore.selectedProjectId && projectsStore.selectedProjectId !== 'default') {
      const project = projectsStore.projects.find(p => p.id === projectsStore.selectedProjectId)
      if (project) {
        selectInColumn(0, { ...project, id: project.id })
      }
    }
}

onMounted(() => {
    initializeColumns()
})

// Navigate columns
const handleDblClick = (level: number, item: any) => {
  if (level === 0) {
    emit('open', item.id)
  }
}

const selectInColumn = async (level: number, item: any) => {
  // Update selection in current column
  if (columns.value[level]) {
    columns.value[level].selectedId = item.id
  }
  
  // Truncate columns after current level
  columns.value = columns.value.slice(0, level + 1)
  
  // Clear preview
  if (level < columns.value.length) {
    previewCode.value = ''
    previewObject.value = null
  }
  
  // If editing project (level 0), update global selection
  if (level === 0) {
    projectsStore.selectProject(item.id)
  }

  // Determine next column based on current selection
  const nextColumn = await getNextColumn(level, item)
  if (nextColumn) {
    columns.value.push(nextColumn)
  }
}

const getNextColumn = async (level: number, item: any): Promise<ColumnData | null> => {
  const currentType = columns.value[level].type
  
  switch (currentType) {
    case 'projects':
      if (item.id === 'default') return null
      
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
            description: `${c.environment} • ${c.database}` 
          })),
          selectedId: null
        }
      } else if (item.id === 'pairs') {
         const project = projectsStore.projects.find(p => p.id === columns.value[0].selectedId)
         const pairs = connectionPairsStore.connectionPairs.filter(p => project?.pairIds.includes(p.id))
         return {
          level: level + 1,
          type: 'connections', // Reuse type for simplicity in rendering or create 'pairs' type
          title: 'Sync Pairs',
          items: pairs.map(p => ({ 
            ...p, 
            icon: GitCompare,
            description: `${p.sourceEnv} → ${p.targetEnv}` 
          })),
          selectedId: null
        }
      }
      break
    
    case 'environments':
      return {
        level: level + 1,
        type: 'ddl-types',
        title: item.name,
        items: [
          { id: 'tables', name: 'Tables', icon: Table },
          { id: 'views', name: 'Views', icon: Eye },
          { id: 'procedures', name: 'Procedures', icon: Cog },
          { id: 'functions', name: 'Functions', icon: Zap },
          { id: 'triggers', name: 'Triggers', icon: Zap } 
        ],
        selectedId: null
      }
    
    case 'ddl-types':
      const env = columns.value[level - 1].items.find(e => e.id === columns.value[level - 1].selectedId)
      const ddlItems = await loadDDLItems(env.name, item.id)
      return {
        level: level + 1,
        type: 'ddl-items',
        title: item.name,
        items: ddlItems,
        selectedId: null
      }
    
    case 'ddl-items':
      await loadDDLCode(item)
      return null
  }
  
  return null
}

const getProjectEnvironments = async (projectId: string) => {
  const project = projectsStore.projects.find(p => p.id === projectId)
  if (!project) return []
  
  const envs = new Set<string>()
  project.connectionIds.forEach(connId => {
    const conn = appStore.connections.find(c => c.id === connId)
    if (conn) envs.add(conn.environment)
  })
  
  return Array.from(envs).map(env => ({
    id: env,
    name: env,
    icon: Globe
  }))
}

const loadDDLItems = async (environment: string, ddlType: string) => {
  const result = await sidebarStore.loadSchemas(false)
  
  const env = result?.find((e: any) => e.name === environment)
  if (!env) return []
  
  const items: any[] = []
  env.databases?.forEach((db: any) => {
    const typeMap: Record<string, string> = {
        'tables': 'tables',
        'views': 'views',
        'procedures': 'procedures',
        'functions': 'functions',
        'triggers': 'triggers'
    }
    const prop = typeMap[ddlType]
    
    if (db[prop]) {
      db[prop].forEach((item: any) => {
        items.push({
          id: `${db.name}.${item.name}`,
          name: item.name,
          database: db.name,
          environment: environment,
          type: ddlType, 
          icon: getIconForDDLType(ddlType),
          ...item
        })
      })
    }
  })
  
  return items.sort((a, b) => a.name.localeCompare(b.name))
}

const getIconForDDLType = (type: string) => {
    switch (type) {
        case 'tables': return Table
        case 'views': return Eye
        case 'procedures': return Hammer
        case 'functions': return Zap
        case 'triggers': return Zap
        default: return Database
    }
}

const loadDDLCode = async (item: any) => {
  previewLoading.value = true
  previewObject.value = item
  previewCode.value = '' 
  
  try {
    const connection = appStore.connections.find(c => 
      c.environment === item.environment && c.database === item.database
    )
    
    if (!connection) {
      previewCode.value = '-- Connection not found'
      return
    }
    
    if (item.ddl || item.content) {
         let ddl = item.ddl || item.content
         if (Array.isArray(ddl)) ddl = ddl.join('\n')
         previewCode.value = ddl
    } else {
         previewCode.value = '-- DDL content not cached. Please refresh schema data.'
    }
    
  } catch (e) {
    console.error(e)
    previewCode.value = '-- Error loading DDL'
  } finally {
    previewLoading.value = false
  }
}
</script>
