<template>
  <div class="flex h-full w-full bg-white dark:bg-gray-900">
    <!-- Split Panes -->
    <!-- Left: Project Tree -->
    <div class="w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      
      <!-- Toolbar -->
      <div class="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1">
        <div class="flex-1 px-2 py-1.5 bg-gray-200/50 dark:bg-gray-800 text-xs text-gray-500 rounded-lg flex items-center gap-2">
           <Search class="w-3.5 h-3.5" />
           <span>Search...</span>
        </div>
        <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors">
          <Filter class="w-4 h-4" />
        </button>
        <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors">
          <Plus class="w-4 h-4" />
        </button>
      </div>

      <!-- Tree Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div class="flex flex-col gap-0.5">
           <!-- Project Root Node -->
           <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 font-bold text-xs select-none cursor-pointer">
              <FolderOpen class="w-4 h-4 fill-current" />
              <span>{{ currentProject?.name }}</span>
           </div>

           <!-- Hardcoded Tree Structure for Demo (Will be dynamic) -->
           <div class="ml-4 flex flex-col border-l border-gray-200 dark:border-gray-800 pl-2 mt-1 gap-1">
              
              <!-- Category: Connections -->
              <div class="group">
                 <div 
                    class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium cursor-pointer"
                    @click="toggleNode('cat-connections')"
                 >
                    <ChevronDown class="w-3 h-3 text-gray-400 transition-transform" :class="{ '-rotate-90': !expandedNodes.has('cat-connections') }" />
                    <Database class="w-3.5 h-3.5 text-blue-500" />
                    <span>Connections</span>
                    <span class="text-gray-400 text-[9px] ml-auto">{{ currentProject?.connectionIds.length }}</span>
                 </div>
                 
                 <div v-show="expandedNodes.has('cat-connections')" class="ml-5 flex flex-col border-l border-gray-200 dark:border-gray-800 pl-2 mt-1 gap-0.5">
                    <div v-for="conn in projectConnections" :key="conn.id">
                       <!-- Connection Node -->
                       <div 
                         class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs cursor-pointer group/conn"
                         :class="{ 'bg-primary-50 text-primary-600': selectedNode?.id === conn.id }"
                         @click="selectNode('connection', conn)"
                       >
                          <ChevronDown 
                             class="w-3 h-3 text-gray-400 function-hover hover:text-gray-600 transition-transform" 
                             :class="{ '-rotate-90': !expandedNodes.has(conn.id) }"
                             @click.stop="toggleNode(conn.id)"
                          />
                          <div class="w-1.5 h-1.5 rounded-full" :class="conn.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'"></div>
                          <span class="truncate">{{ conn.name }}</span>
                          
                          <!-- Quick Refresh -->
                          <button 
                             @click.stop="refreshConnectionSchema(conn)"
                             class="ml-auto opacity-0 group-hover/conn:opacity-100 p-0.5 hover:bg-gray-200 rounded text-gray-500"
                             :class="{ 'animate-spin': isRefreshing(conn.id) }"
                          >
                             <RefreshCw class="w-3 h-3" />
                          </button>
                       </div>

                       <!-- Database Schema (Tables/Views...) -->
                       <div v-if="expandedNodes.has(conn.id)" class="ml-4 pl-2 border-l border-gray-200 dark:border-gray-800 mt-0.5">
                          <div v-if="getDatabaseData(conn.id)" class="flex flex-col gap-0.5">
                              <div v-for="type in ddlTypes" :key="type.key">
                                 <div v-if="getDatabaseData(conn.id)[type.key]?.length > 0">
                                    <!-- Type Category -->
                                    <div 
                                       class="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-500 text-[11px] cursor-pointer"
                                       @click="toggleNode(`${conn.id}-${type.key}`)"
                                    >
                                       <ChevronDown class="w-2.5 h-2.5 transition-transform" :class="{ '-rotate-90': !expandedNodes.has(`${conn.id}-${type.key}`) }" />
                                       <component :is="type.icon" class="w-3 h-3" :class="type.color" />
                                       <span>{{ type.label }}</span>
                                       <span class="text-[9px] opacity-50">{{ getDatabaseData(conn.id)[type.key].length }}</span>
                                    </div>

                                    <!-- Objects List -->
                                    <div v-if="expandedNodes.has(`${conn.id}-${type.key}`)" class="ml-4 pl-2 border-l border-gray-100 dark:border-gray-800">
                                       <div 
                                          v-for="item in getDatabaseData(conn.id)[type.key]" 
                                          :key="item.name"
                                          class="px-2 py-0.5 text-[11px] text-gray-500 hover:text-primary-600 cursor-pointer truncate hover:bg-gray-50 rounded"
                                          :class="{ 'text-primary-600 font-bold bg-primary-50': selectedNode?.id === item.name }"
                                          @click.stop="selectNode('object', { ...item, connectionId: conn.id, type: type.key })"
                                       >
                                          {{ item.name }}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                          </div>
                          <div v-else class="px-3 py-2 text-[10px] text-gray-400 italic">
                             {{ isRefreshing(conn.id) ? 'Loading schema...' : 'No schema data loaded.' }}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Category: Sync Pairs -->
              <div class="group mt-1">
                 <div class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium cursor-pointer">
                    <ChevronDown class="w-3 h-3 text-gray-400" />
                    <GitCompare class="w-3.5 h-3.5 text-purple-500" />
                    <span>Sync Pairs</span>
                    <span class="text-gray-400 text-[9px] ml-auto">{{ currentProject?.pairIds.length }}</span>
                 </div>
                 <div class="ml-5 flex flex-col border-l border-gray-200 dark:border-gray-800 pl-2 mt-1 gap-0.5">
                    <div 
                      v-for="pair in projectPairs" :key="pair.id"
                      class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs cursor-pointer"
                      :class="{ 'bg-primary-50 text-primary-600': selectedNode?.id === pair.id }"
                      @click="selectNode('pair', pair)"
                    >
                       <GitCompare class="w-3 h-3" />
                       <span>{{ pair.name }}</span>
                    </div>
                 </div>
              </div>

              <!-- Category: Schemas (Derived) -->
              <div class="group mt-1">
                 <div class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium cursor-pointer">
                    <ChevronRight class="w-3 h-3 text-gray-400" />
                    <Layers class="w-3.5 h-3.5 text-emerald-500" />
                    <span>Environments</span>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
    
    <!-- Right: Content Area (Placeholder for now, acts like the 'Preview' column) -->
    <div class="flex-1 bg-white dark:bg-gray-900 flex flex-col">
       <div v-if="selectedNode" class="flex-1 flex flex-col">
          <!-- Context Header -->
          <div class="h-14 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6">
             <div class="flex items-center gap-3">
               <component :is="getNodeIcon(selectedNode.type)" class="w-5 h-5 text-gray-400" />
               <h2 class="text-sm font-bold text-gray-900 dark:text-white">{{ selectedNode.data.name }}</h2>
               <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase text-gray-500 rounded">{{ selectedNode.type }}</span>
             </div>
             <div>
                <!-- Actions -->
                <button class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                   Edit
                </button>
             </div>
          </div>
          
          <div class="flex-1 p-0 overflow-hidden relative">
             <div v-if="isFetchingDDL" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 backdrop-blur-sm">
                <div class="flex flex-col items-center gap-2">
                   <Loader2 class="w-8 h-8 text-primary-500 animate-spin" />
                   <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading DDL...</span>
                </div>
             </div>
             
             <!-- Content View -->
             <div v-if="selectedNode.type === 'object'" class="h-full">
                <DDLViewer 
                   :content="ddlContent" 
                   :showLineNumbers="true"
                   fontFamily="'JetBrains Mono', monospace"
                   :fontSize="13"
                />
             </div>
             
             <div v-else class="p-6 h-full overflow-y-auto">
                <div class="p-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                   <p class="text-sm text-gray-500">Details for {{ selectedNode.data.name }} ({{ selectedNode.type }})</p>
                   <p class="text-xs text-gray-400 mt-2">ID: {{ selectedNode.id }}</p>
                </div>
             </div>
          </div>
       </div>

       <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
          <FolderOpen class="w-16 h-16 mb-4 opacity-20" />
          <p class="text-sm font-bold uppercase tracking-widest opacity-50">Select an item to view details</p>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useSidebarStore } from '@/stores/sidebar'
import { 
  FolderOpen, 
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Database,
  GitCompare,
  Layers,
  Table,
  Hammer,
  RefreshCw,
  Code2,
  Loader2
} from 'lucide-vue-next'
import DDLViewer from '@/components/ddl/DDLViewer.vue'

const projectsStore = useProjectsStore()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const sidebarStore = useSidebarStore()

const currentProject = computed(() => projectsStore.currentProject)

const expandedNodes = ref(new Set<string>(['cat-connections', 'cat-pairs']))
const activeRefreshes = ref(new Set<string>())
const ddlContent = ref('')
const isFetchingDDL = ref(false)

const ddlTypes = [
   { key: 'tables', label: 'Tables', icon: Table, color: 'text-blue-500' },
   { key: 'views', label: 'Views', icon: Layers, color: 'text-indigo-500' },
   { key: 'procedures', label: 'Procedures', icon: Hammer, color: 'text-purple-500' },
   { key: 'functions', label: 'Functions', icon: Code2, color: 'text-pink-500' }
]

const projectConnections = computed(() => {
   return appStore.connections.filter(c => currentProject.value?.connectionIds.includes(c.id))
})

const getDatabaseData = (connectionId: string) => {
   // Search in sidebarStore environments
   for (const env of sidebarStore.environments) {
      const db = env.databases.find((d: any) => d.connectionId === connectionId)
      if (db) return db
   }
   return null
}

const toggleNode = (id: string) => {
   if (expandedNodes.value.has(id)) {
      expandedNodes.value.delete(id)
   } else {
      expandedNodes.value.add(id)
   }
}

const isRefreshing = (id: string) => activeRefreshes.value.has(id)

const refreshConnectionSchema = async (conn: any) => {
   activeRefreshes.value.add(conn.id)
   try {
      // Trigger sidebar refresh logic
      // Since sidebarStore doesn't expose a direct 'refreshByConnectionId', we emulate it
      // Find env/db name first
      const dbData = getDatabaseData(conn.id)
      if (dbData) {
         // If we have data, we know env/db names
         // But sidebarStore.loadSchemas() refreshes everything or relies on events.
         // Let's force a reload. Ideally we'd be more granular.
         await sidebarStore.loadSchemas(true)
      } else {
         // Try generic reload
         await sidebarStore.loadSchemas(true)
      }
   } finally {
      activeRefreshes.value.delete(conn.id)
   }
}

onMounted(() => {
   if (sidebarStore.environments.length === 0) {
      sidebarStore.loadSchemas()
   }
})


const projectPairs = computed(() => {
   return connectionPairsStore.connectionPairs.filter(p => currentProject.value?.pairIds.includes(p.id))
})

const selectedNode = ref<{ type: string, id: string, data: any } | null>(null)

const fetchDDL = async (node: any) => {
   if (!node.connectionId || !node.type || !node.name) return
   
   isFetchingDDL.value = true
   ddlContent.value = ''
   
   try {
      // Use efficient single object fetch if available
      // Fallback to simpler method if needed
      // Assuming electronAPI structure based on common utils
      if ((window as any).electronAPI) {
         const result = await (window as any).electronAPI.db.generateDDL({
            connectionId: node.connectionId,
            objects: [{ type: node.type, name: node.name }]
         })
         
         if (result && result.success) {
            ddlContent.value = result.ddl || '-- No DDL returned'
         } else {
            ddlContent.value = `-- Error fetching DDL: ${result?.error || 'Unknown error'}`
         }
      }
   } catch (e: any) {
      ddlContent.value = `-- Error: ${e.message}`
   } finally {
      isFetchingDDL.value = false
   }
}

const selectNode = async (type: string, data: any) => {
   selectedNode.value = {
      type,
      id: data.id || data.name,
      data
   }
   
   if (type === 'object') {
     await fetchDDL(data)
   } else {
     ddlContent.value = ''
   }
}

const getNodeIcon = (type: string) => {
   if (type === 'connection') return Database
   if (type === 'pair') return GitCompare
   return FolderOpen
}
</script>
