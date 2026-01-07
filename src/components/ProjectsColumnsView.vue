

<template>
  <div class="flex w-full h-full overflow-hidden bg-white dark:bg-gray-950">
    <!-- Combined Mode Layout -->
    <template v-if="isCombinedMode && mergedTreeColumn">
        <!-- Merged Tree Column (The Stack) -->
        <ProjectStandardColumn 
            v-if="mergedTreeColumn"
            :column="mergedTreeColumn as ColumnData"
            :index="activeStartIndex"
            :is-collapsed="false"
            :combined-types="COMBINED_TYPES"
            :active-start-index="activeStartIndex"
            :is-merged-stack="true"
          :is-last="false"
            @select="(item) => selectInMergedTree(item)"
            @dblclick="(item) => handleDblClick(0, item)"
            @toggle-pin="togglePin(0)"
            @add-item="handleAdd(mergedTreeColumn)"
            @delete-project="(item) => handleDeleteProject(item)"
            @toggle-membership="(item) => toggleProjectMembership(mergedTreeColumn, item)"
            @update-title="(newTitle) => saveColumnTitle(0, newTitle)"
            @accordion-click="(item, parent) => handleItemClick(item, 0, parent)"
            @toggle-stack="handleUnstack"
        />

        <ProjectStandardColumn 
          v-for="(column, index) in activeColumns" 
          :key="column.title"
          :column="column"
          :index="activeStartIndex + index"
          :is-collapsed="isAutoCollapsed(activeStartIndex + index)"
          :combined-types="COMBINED_TYPES"
          :active-start-index="activeStartIndex"
          :is-last="index === activeColumns.length - 1"
          @select="(item) => selectInColumn(activeStartIndex + index, item)"
          @dblclick="(item) => handleDblClick(activeStartIndex + index, item)"
          @toggle-pin="togglePin(activeStartIndex + index)"
          @add-item="handleAdd(column)"
          @delete-project="(item) => handleDeleteProject(item)"
          @toggle-membership="(item) => toggleProjectMembership(column, item)"
          @update-title="(newTitle) => saveColumnTitle(activeStartIndex + index, newTitle)"
          @accordion-click="(item, parent) => handleItemClick(item, activeStartIndex + index, parent)"
          @toggle-stack="handleStack"
          @stack-to-parent="handleStackToParent"
        />
    </template>

    <template v-else>
        <ProjectStandardColumn 
            v-for="(column, index) in columns" 
            :key="index"
            :column="column"
            :index="index"
            :is-collapsed="isAutoCollapsed(index)"
            :combined-types="COMBINED_TYPES"
            :active-start-index="activeStartIndex"
            :is-last="index === columns.length - 1"
            @select="(item) => selectInColumn(index, item)"
            @dblclick="(item) => handleDblClick(index, item)"
            @toggle-pin="togglePin(index)"
            @add-item="handleAdd(column)"
            @delete-project="(item) => handleDeleteProject(item)"
            @toggle-membership="(item) => toggleProjectMembership(column, item)"
            @update-title="(newTitle) => saveColumnTitle(index, newTitle)"
            @accordion-click="(item, parent) => handleItemClick(item, index, parent)"
            @toggle-stack="handleStack"
        />
    </template>
    
    <div v-if="previewCode || previewObject" class="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-white/5 shadow-2xl z-10">
      <template v-if="previewLoading">
        <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
           <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-xs font-bold uppercase tracking-widest">Loading content...</p>
        </div>
      </template>
      <template v-else-if="previewObject && (previewCode || previewObject.ddl || previewObject.content)">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur shrink-0 transition-colors">
             <div class="flex items-center gap-2 overflow-hidden">
                <div class="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                    <component :is="previewObject.icon || Table" class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                    <span class="text-[10px] uppercase font-black tracking-widest text-gray-400 leading-none mb-0.5">{{ previewObject.ddlType || 'Object' }}</span>
                    <span class="font-bold text-sm text-gray-900 dark:text-white truncate leading-tight">{{ previewObject.name }}</span>
                </div>
             </div>
             <div class="flex items-center gap-2">
                 <button @click="refreshObject" :disabled="previewLoading" class="p-2 text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Fetch latest from DB">
                    <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': previewLoading }" />
                 </button>
                 <button @click="compareObject" class="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20" title="Compare against other environments">
                    <GitCompare class="w-3.5 h-3.5" />
                    <span>Compare</span>
                 </button>
             </div>
        </div>
        <DDLCodeViewer
          :code="previewCode || previewObject.ddl || previewObject.content"
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

      <!-- ERD Diagram Preview -->
      <template v-else-if="previewObject && previewObject.type === 'diagram'">
         <SchemaDiagram :tables="previewObject.tables" class="flex-1" />
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
import { ref, onMounted, watch, triggerRef, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useNotificationStore } from '@/stores/notification'
import DDLCodeViewer from '@/components/DDLCodeViewer.vue'
import ConnectionForm from '@/components/ConnectionForm.vue'
import CompareWorkbench from '@/components/CompareWorkbench.vue'
import SchemaDiagram from '@/components/SchemaDiagram.vue'
import ProjectCombinedStack from '@/components/projects/ProjectCombinedStack.vue'
import ProjectStandardColumn from '@/components/projects/ProjectStandardColumn.vue'
import { Andb } from '@/utils/andb'
import { 
  Database,
  GitCompare,
  Link,
  Table,
  Eye,
  Hammer,
  LayoutGrid,
  Globe,
  Zap,
  Network,
  RefreshCw
} from 'lucide-vue-next'

interface ColumnData {
  level: number
  type: 'projects' | 'categories' | 'environments' | 'databases' | 'types' | 'objects' | 'connections' | 'pairs'
  title: string
  items: any[]
  selectedId: string | null
  isPinned?: boolean
  metadata?: any
}

// Config for what types support inline accordion behavior, and in what order?
// Actually simpler: if a 'parent' is expanded, we just fetch next level.
// We label items with 'contextType' to know what to fetch.
const COMBINED_TYPES = ['environments', 'databases', 'types']

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

const activeStartIndex = ref(0)

const emit = defineEmits(['open', 'create-project', 'update-breadcrumbs'])

// Initialize columns
onMounted(async () => {
  await projectsStore.reloadData()
  
  if (projectsStore.selectedProjectId) {
      // If a project is already selected, start from there!
      const project = projectsStore.projects.find(p => p.id === projectsStore.selectedProjectId)
      if (project) {
          columns.value = [
            {
              level: 0,
              type: 'projects',
              title: 'Bases',
              items: projectsStore.projects,
              selectedId: project.id,
              isPinned: true
            }
          ]
          // Manually trigger selection simulation to load next column
          await selectInColumn(0, project)
      } else {
         // Fallback
         loadRoot()
      }
  } else {
      loadRoot()
  }
})

const loadRoot = () => {
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
  emit('update-breadcrumbs', [{ name: 'Bases', level: 0, id: 'root' }])
}





const togglePin = (index: number) => {
  const col = columns.value[index]
  col.isPinned = !col.isPinned
  // Force reactivity if deep mutation isn't picked up (though Ref<Array> usually handles it)
  triggerRef(columns)
}

const handleItemClick = async (item: any, level: number, parent: any = null) => {
    // 1. Identify nature of item
    // Level 0 items (Columns) handle via selectInColumn usually, but we can unify.
    // Inner items track 'selected' state on the object itself.

    // Toggle Expansion
    if (['environments', 'databases', 'types'].includes(item.contextType || (parent ? 'unknown' : columns.value[level].type))) {
        // Is Combined/Accordion Item
        item.expanded = !item.expanded
        
        // Handle visual selection (Radio behavior among siblings)
        if (parent && parent.children) {
            parent.children.forEach((sib: any) => sib.selected = false)
        } else {
             // Root level siblings
             columns.value[level].items.forEach((sib: any) => sib.selected = false)
        }
        item.selected = true
        
        if (item.expanded && (!item.children || item.children.length === 0)) {
            await fetchChildren(item)
        }
    } else {
        // Leaf Node (e.g. Table Object)
        if (parent && parent.children) {
            parent.children.forEach((sib: any) => sib.selected = false)
        }
        item.selected = true
        handleSelection(item)
    }
}


const fetchChildren = async (item: any) => {
    try {
        if (item.contextType === 'environments' || !item.contextType) { // Root Env -> DBs
             const res = await getEnvironmentDatabases(columns.value[0].selectedId!, item.name)
             item.children = res.map((db: any) => ({
                 ...db,
                 contextType: 'databases',
                 environment: item.name
             }))
        } else if (item.contextType === 'databases') { // DB -> Types
             item.children = [
                { id: 'diagram', name: 'ER Diagram', icon: Network, contextType: 'diagram', environment: item.environment, database: item.name },
                { id: 'tables', name: 'Tables', icon: Table, count: item.counts?.tables, contextType: 'types', typeId: 'tables', environment: item.environment, database: item.name },
                { id: 'views', name: 'Views', icon: Eye, count: item.counts?.views, contextType: 'types', typeId: 'views', environment: item.environment, database: item.name },
                { id: 'procedures', name: 'Procedures', icon: Hammer, count: item.counts?.procedures, contextType: 'types', typeId: 'procedures', environment: item.environment, database: item.name },
                { id: 'functions', name: 'Functions', icon: Hammer, count: item.counts?.functions, contextType: 'types', typeId: 'functions', environment: item.environment, database: item.name },
                { id: 'triggers', name: 'Triggers', icon: Zap, count: item.counts?.triggers, contextType: 'types', typeId: 'triggers', environment: item.environment, database: item.name }
             ]
        } else if (item.contextType === 'types') { // Type -> Objects
             if (item.id === 'diagram') return // Leaf
             const res = await getDatabaseObjects(
                columns.value[0].selectedId!,
                item.environment,
                item.database,
                item.typeId 
             )
             item.children = res.map((obj: any) => ({
                 ...obj,
                 contextType: 'object',
                 environment: item.environment,
                 database: item.database,
                 ddlType: item.typeId
             }))
        }
    } catch (error) {
        console.error("Failed to fetch children", error)
    }
}


const isCombinedMode = computed(() => activeStartIndex.value > 0)

const mergedTreeColumn = computed<ColumnData | null>(() => {
    if (!isCombinedMode.value || columns.value.length === 0) return null
    
    // Deep clone the root column structure to avoid mutating original state during transformation
    // We only need shallow clone of items array initially, but objects need new references if we mutate children
    // Better strategy: Reconstruct the tree from the bottom up or top down using the current 'columns' state.
    
    const rootCol = { ...columns.value[0], items: columns.value[0].items.map(i => ({...i})) }
    let currentLevelItems = rootCol.items
    
    // Iterate from 0 to activeStartIndex - 1 (don't include the active column itself in the deep children)
    for (let i = 0; i < activeStartIndex.value - 1; i++) {
        const selectedId = columns.value[i].selectedId
        const selectedItem = currentLevelItems.find(it => it.id === selectedId)
        
        if (selectedItem && columns.value[i+1]) {
            selectedItem.expanded = true
            selectedItem.children = columns.value[i+1].items.map(it => ({...it}))
            currentLevelItems = selectedItem.children
        } else {
            break 
        }
    }
    
    // Ensure the last level's selection is maintained in the tree
    // The last level in the tree is activeStartIndex - 1
    const lastStackColIndex = activeStartIndex.value - 1
    if (lastStackColIndex >= 0) {
        const lastStackCol = columns.value[lastStackColIndex]
        if (lastStackCol && lastStackCol.selectedId) {
             const lastSel = currentLevelItems.find(it => it.id === lastStackCol.selectedId)
             if (lastSel) lastSel.selected = true
        }
    }

    return rootCol
})

const activeColumns = computed(() => {
    if (!isCombinedMode.value) return columns.value
    // Show columns STARTING FROM activeStartIndex 
    return columns.value.slice(activeStartIndex.value)
})

const selectInMergedTree = (item: any) => {
    // Find which column level this item belongs to
    // We search from the stack (0 to activeStartIndex)
    for (let i = 0; i <= activeStartIndex.value; i++) {
        const col = columns.value[i]
        if (col.items.find(it => it.id === item.id)) {
            // Found the level, select it
            selectInColumn(i, item)
            // If we selected a node in the merged tree interaction, we might want to ensure 
            // the stack stays at the current depth (or expands if we dug deeper).
            // But since 'selectInColumn' might truncate 'columns', we rely on it.
            return
        }
    }
}

const isAutoCollapsed = (index: number) => {
    // Global override
    if (!appStore.autoCollapseColumns) return false

    const col = columns.value[index]
    if (!col) return false
    // Collapse if it's not the last column AND it's not pinned
    // And ensure we don't collapse the merged stack itself (handled via index 0 anyway)
    return index < columns.value.length - 1 && !col.isPinned
}

const selectInColumn = async (level: number, item: any) => {
  const currentColumn = columns.value[level]
  
  // Standard Column Behavior
  if (currentColumn.selectedId === item.id) {
       handleSelection(item)
       
       // If this is the last column, try to fetch the next one (fixes stuck state)
       if (level === columns.value.length - 1) {
           const nextColumn = await getNextColumn(level, item)
           if (nextColumn) {
               columns.value.push(nextColumn)
           }
       }
       return
  }
  
  currentColumn.selectedId = item.id
  columns.value = columns.value.slice(0, level + 1)
  
  handleSelection(item)
  
  const nextColumn = await getNextColumn(level, item)
  if (nextColumn) {
      columns.value.push(nextColumn)
  }
}

// Breadcrumb emission
watch(columns, (newCols) => {
  const breadcrumbs = newCols
    .filter(c => c.selectedId)
    .map(c => {
      const item = c.items.find(i => i.id === c.selectedId)
      return {
        id: c.selectedId as string,
        name: item?.name || c.title,
        level: c.level
      }
    })
  emit('update-breadcrumbs', breadcrumbs)
}, { deep: true, immediate: true })

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
  } else if (item.ddlType) {
    if (item.ddl) {
        previewCode.value = item.ddl
    } else {
        fetchDDL(item)
    }
  } else if (item.id === 'diagram') {
    // ER Diagram
    previewLoading.value = true
    try {
       const schemas = await Andb.getSchemas()
       const schema = schemas.find((s: any) => s.environment === item.environment && s.database === item.database)
       if (schema && schema.tables) {
           previewObject.value = { ...item, type: 'diagram', tables: schema.tables }
       } else {
           previewObject.value = { ...item, type: 'diagram', tables: [] }
       }
    } catch (e) {
       console.error('Failed to load diagram data', e)
    } finally {
       previewLoading.value = false
    }
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
  
  // Dynamic Context Resolution for deep chains
  // We need to know previous context (Project, Env, DB) to fetch children
  // In Accordion mode these were passed via closure or parents
  // In Column mode we must resolve from previous columns
  
  const getContext = () => {
      const ctx: any = {}
      // Walk backwards to find context
      for (let i = level; i >= 0; i--) {
          const col = columns.value[i]
          const sel = col.items.find(it => it.id === col.selectedId)
          if (!sel) continue
          
          if (col.type === 'projects') ctx.projectId = sel.id
          if (col.type === 'environments') ctx.environment = sel.name
          if (col.type === 'databases') ctx.database = sel.name
      }
      return ctx
  }

  // Helper for Types column creation
  const createTypesColumn = (environment: string, database: string, counts?: any) => ({
      level: level + 1,
      type: 'types' as const,
      title: 'Objects',
      items: [
          { id: 'diagram', name: 'ER Diagram', icon: Network, environment, database },
          { id: 'tables', name: 'Tables', icon: Table, count: counts?.tables, typeId: 'tables' },
          { id: 'views', name: 'Views', icon: Eye, count: counts?.views, typeId: 'views' },
          { id: 'procedures', name: 'Procedures', icon: Hammer, count: counts?.procedures, typeId: 'procedures' },
          { id: 'functions', name: 'Functions', icon: Hammer, count: counts?.functions, typeId: 'functions' },
          { id: 'triggers', name: 'Triggers', icon: Zap, count: counts?.triggers, typeId: 'triggers' }
      ],
      selectedId: null,
      metadata: { environment, database }
  })

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
      return createTypesColumn(item.environment || getContext().environment, item.name, item.counts)

    case 'types':
      if (item.id === 'diagram') return null
      
      const ctx = getContext() || columns.value[level].metadata
      if (!ctx || !ctx.environment || !ctx.database) {
          console.warn("Context missing for types expansion", ctx)
          return null
      }

      const objects = await getDatabaseObjects(
        columns.value[0].selectedId!,
        ctx.environment,
        ctx.database,
        item.typeId || item.id 
      )
      
      return {
        level: level + 1,
        type: 'objects',
        title: item.name,
        items: objects.map((obj: any) => ({
             ...obj, 
             environment: ctx.environment,
             database: ctx.database,
             ddlType: item.typeId || item.id
        })),
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
    database,
    ddlType: type
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

const saveColumnTitle = async (index: number, newTitle: string) => {
  const col = columns.value[index]
  if (newTitle && newTitle !== col.title) {
       col.title = newTitle
       // Attempt to update project if this is a project column (Level 1)
       if (index > 0 && columns.value[index-1].type === 'projects') {
           const projectId = columns.value[index-1].selectedId
           if (projectId) {
               await projectsStore.updateProject(projectId, { name: newTitle })
           }
       }
  }
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

const handleStack = (level: number | 'all') => {
    if (level === 'all') {
        // Stack All (keep last column)
        activeStartIndex.value = Math.max(0, columns.value.length - 1)
    } else if (typeof level === 'number') {
        // Stack the column at 'level' (move it and predecessors into stack)
        // Ensure we only stack from left to right strictly
        if (level >= activeStartIndex.value) {
            activeStartIndex.value = level + 1
        }
    }
}

const handleUnstack = (level?: number | 'all') => {
    if (level === 'all') {
        activeStartIndex.value = 0
    } else {
        // Unstack one level (pop from stack)
        activeStartIndex.value = Math.max(0, activeStartIndex.value - 1)
    }
}

const handleStackToParent = (payload: { childIndex: number, parentIndex: number }) => {
    const { childIndex, parentIndex } = payload
    
    // Check if the parent column is currently "inside the stack" (hidden/merged)
    if (parentIndex < activeStartIndex.value) {
        // Case 1: Parent is Stacked. Child joins the stack.
        activeStartIndex.value = childIndex + 1
    } else {
        // Case 2: Parent is Visible. Close child D to return focus to C.
        columns.value = columns.value.slice(0, childIndex)
        if (columns.value[parentIndex]) {
             columns.value[parentIndex].selectedId = null
        }
        previewObject.value = null
    }
}

const fetchDDL = async (item: any) => {
    previewLoading.value = true
    try {
       const project = projectsStore.projects.find(p => p.id === columns.value[0].selectedId)
       const connection = appStore.connections.find(c => 
          project?.connectionIds.includes(c.id) && 
          c.environment === item.environment && 
          c.database === item.database
       )

       if (connection) {
           const res = await Andb.export(connection, null as any, { 
              type: item.ddlType as any, 
              name: item.name 
           })
           
           if (res && res[item.ddlType]) {
             const obj = res[item.ddlType].find((o: any) => o.name === item.name)
             if (obj && obj.ddl) {
               previewCode.value = obj.ddl
               item.ddl = obj.ddl 
             } else {
               previewCode.value = '-- No DDL available or empty'
             }
           }
       } else {
         previewCode.value = '-- Connection not found'
       }
    } catch (e) {
       console.error('Failed to fetch DDL', e)
       const msg = e instanceof Error ? e.message : String(e)
       previewCode.value = `-- Error fetching DDL: ${msg}`
    } finally {
       previewLoading.value = false
    }
}

const refreshObject = async () => {
    if (previewObject.value && previewObject.value.ddlType) {
        await fetchDDL(previewObject.value)
    }
}

const compareObject = () => {
    if (!previewObject.value) return
    const currentProj = projectsStore.projects.find(p => p.id === columns.value[0].selectedId)
    // Find connection for this object
    const conn = appStore.connections.find(c => c.environment === previewObject.value.environment && c.database === previewObject.value.database)
    
    if (conn && currentProj) {
        // Try to find a pair
        const pair = connectionPairsStore.connectionPairs.find(p => currentProj.pairIds.includes(p.id) && (p.sourceConnectionId === conn.id || p.targetConnectionId === conn.id))
        if (pair) {
            router.push(`/compare?pairId=${pair.id}&item=${previewObject.value.name}`)
            return
        }
    }
    router.push('/compare')
}

const jumpToBreadcrumb = (crumb: any) => {
    if (crumb.id === 'root') {
        columns.value[0].selectedId = null
        columns.value = columns.value.slice(0, 1)
        previewObject.value = null
        return
    }
    
    // Keep columns up to the one showing the children of the crumb
    // crumb.level is the column index where the item was selected.
    // We want to keep that column + the next one (which displays the content).
    if (columns.value.length > crumb.level + 1) {
        columns.value = columns.value.slice(0, crumb.level + 2)
        // Reset selection in the last column
        columns.value[crumb.level + 1].selectedId = null
        previewObject.value = null
    }
}

defineExpose({
    jumpToBreadcrumb
})
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
