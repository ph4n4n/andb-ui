<template>
  <aside 
    :class="[
      'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Header/Logo Area removed (moved to Header.vue) -->

    <!-- Navigation Menu (Minimal) -->
    <nav class="py-4 border-b border-gray-100 dark:border-gray-700">
      <ul class="space-y-1 px-2">
        <li v-for="item in navItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="[
              $route.path === item.path
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
            ]"
            :title="item.name"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-show="!isCollapsed" class="ml-3 truncate">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Source Environment Tree Section -->
    <div class="flex-1 overflow-y-auto py-4">
      <div v-show="!isCollapsed" class="px-4 mb-3">
        <!-- Source Tree Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
            <Server class="w-3 h-3 mr-2" />
            Source Explorer
          </h3>
          <button @click="refreshSchemas" class="text-gray-400 hover:text-primary-500 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>

      <!-- Environment Groups -->
      <div class="px-2 space-y-1">
        <div v-for="env in filteredEnvironments" :key="env.name" class="space-y-1">
          <!-- Environment Node -->
          <div 
            @click="toggleEnvironment(env.name)"
            class="flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors group"
            :class="[
              isSourceEnvironment(env.name) 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            ]"
          >
            <ChevronRight 
              class="w-4 h-4 mr-2 transition-transform duration-200"
              :class="{ 'rotate-90': expandedEnvironments.has(env.name) }"
            />
            <component :is="getEnvIcon(env.name)" class="w-4 h-4 mr-2" />
            <span v-show="!isCollapsed" class="text-sm truncate">{{ env.name }}</span>
            <span v-show="!isCollapsed && isSourceEnvironment(env.name)" class="ml-auto text-[10px] bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-300 uppercase">Source</span>
          </div>

          <!-- Objects Under Environment (Only if it's the source or expanded) -->
          <div v-if="expandedEnvironments.has(env.name)" class="ml-4 pl-2 border-l border-gray-200 dark:border-gray-700 space-y-1 mt-1">
            <div v-for="db in env.databases" :key="db.name" class="space-y-1">
              <div 
                @click="selectDatabase(env.name, db.name)"
                class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm rounded-lg transition-colors group/db"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold': expandedDatabases.has(`${env.name}-${db.name}`) }"
              >
                <ChevronRight 
                  @click.stop="toggleDatabase(env.name, db.name)"
                  class="w-3.5 h-3.5 mr-1.5 transition-transform duration-200 shrink-0 text-gray-400"
                  :class="{ 'rotate-90': expandedDatabases.has(`${env.name}-${db.name}`) }"
                />
                <Database class="w-4 h-4 mr-2 text-primary-500 group-hover/db:scale-110 transition-transform" />
                <span class="truncate">{{ db.name }}</span>
              </div>

              <!-- Object Types (Tables, Procs, etc.) -->
              <div v-if="expandedDatabases.has(`${env.name}-${db.name}`)" class="ml-4 pl-2 border-l border-gray-100 dark:border-gray-800 space-y-1">
                <div v-for="type in ddlTypes" :key="type.key">
                  <div 
                    v-if="db[type.key]?.length > 0"
                    @click="selectCategory(env.name, db.name, type.key)"
                    class="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer group/cat transition-all"
                    :class="[
                      expandedTypes.has(`${env.name}-${db.name}-${type.key}`)
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    ]"
                  >
                    <ChevronRight 
                      @click.stop="toggleType(env.name, db.name, type.key)"
                      class="w-3 h-3 mr-2 transition-transform duration-200 shrink-0"
                      :class="{ 'rotate-90': expandedTypes.has(`${env.name}-${db.name}-${type.key}`) }"
                    />
                    <span class="truncate">{{ type.label }}</span>
                    <div class="ml-auto flex items-center space-x-1.5">
                      <!-- Change Count Badge (Orange/Amber) -->
                      <span v-if="getCategoryChangeCount(db, type.key) > 0" class="text-[10px] bg-amber-500 dark:bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-black shadow-sm flex items-center justify-center min-w-[18px]">
                        {{ getCategoryChangeCount(db, type.key) }}
                      </span>
                      <!-- Total Count Badge (Subtle Gray) -->
                      <span class="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-bold border border-gray-300/50 dark:border-gray-600/50">
                        {{ db[type.key].length }}
                      </span>
                    </div>
                  </div>

                  <!-- Individual Objects -->
                  <div v-if="expandedTypes.has(`${env.name}-${db.name}-${type.key}`)" class="ml-4 space-y-0.5">
                    <div 
                      v-for="item in db[type.key]" 
                      :key="item.name"
                      @click="selectObject(env.name, db.name, type.key, item)"
                      class="flex items-center px-3 py-1 rounded-md text-sm cursor-pointer transition-colors"
                      :class="[
                        selectedObjectId === item.name 
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                      ]"
                    >
                      <component :is="type.icon" class="w-3.5 h-3.5 mr-2 opacity-70" />
                      <span class="truncate font-mono text-[13px] mr-2">{{ item.name }}</span>
                      
                      <!-- Status Badge -->
                      <div v-if="comparisonMap[`${type.key}-${item.name}`]" class="ml-auto flex items-center">
                        <component 
                          :is="getStatusIcon(comparisonMap[`${type.key}-${item.name}`].status)" 
                          class="w-3.5 h-3.5"
                          :class="getStatusClass(comparisonMap[`${type.key}-${item.name}`].status)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions: Settings -->
    <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
      <router-link 
        to="/settings" 
        class="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Settings"
      >
        <Settings class="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-primary-500" />
        <span v-show="!isCollapsed" class="ml-3 text-sm font-medium">Settings</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import Andb from '@/utils/andb'
import { 
  Home, 
  Database,
  GitCompare, 
  Settings, 
  RefreshCw, 
  ChevronRight,
  Table,
  Zap,
  Hammer,
  Layers,
  ShieldCheck,
  Server,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  XCircle
} from 'lucide-vue-next'

const route = useRoute()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()

const isCollapsed = computed(() => appStore.sidebarCollapsed)
const activePair = computed(() => connectionPairsStore.activePair)

// Navigation Items
const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Compare', path: '/compare', icon: GitCompare },
]

const props = defineProps<{
  results?: any[]
}>()

// Schema Tree State
const loading = ref(false)
const environments = ref<any[]>([])
const expandedEnvironments = ref(new Set<string>())
const expandedDatabases = ref(new Set<string>())
const expandedTypes = ref(new Set<string>())
const selectedObjectId = ref<string | null>(null)

// Comparison Mapping
const comparisonMap = computed(() => {
  const map: Record<string, any> = {}
  if (props.results) {
    props.results.forEach(res => {
      map[`${res.type}-${res.name}`] = res
    })
  }
  return map
})

const filteredEnvironments = computed(() => {
  if (!activePair.value?.sourceEnv) {
    return environments.value
  }
  return environments.value.filter(env => env.name === activePair.value?.sourceEnv)
})

// DDL Types Mapping
const ddlTypes = [
  { key: 'tables', label: 'Tables', icon: Table },
  { key: 'views', label: 'Views', icon: Layers },
  { key: 'procedures', label: 'Procedures', icon: Hammer },
  { key: 'functions', label: 'Functions', icon: Hammer },
  { key: 'triggers', label: 'Triggers', icon: Zap }
]

// Actions
const isSourceEnvironment = (envName: string) => {
  return activePair.value?.sourceEnv === envName
}

const getEnvIcon = (envName: string) => {
  const name = envName.toUpperCase()
  if (name.includes('PROD')) return ShieldCheck
  if (name.includes('UAT')) return Layers
  if (name.includes('STAGE')) return Server
  return Database
}

const toggleEnvironment = (envName: string) => {
  if (expandedEnvironments.value.has(envName)) {
    expandedEnvironments.value.delete(envName)
  } else {
    expandedEnvironments.value.add(envName)
  }
}

const toggleDatabase = (envName: string, dbName: string) => {
  const key = `${envName}-${dbName}`
  if (expandedDatabases.value.has(key)) {
    expandedDatabases.value.delete(key)
  } else {
    expandedDatabases.value.add(key)
  }
}

const toggleType = (envName: string, dbName: string, type: string) => {
  const key = `${envName}-${dbName}-${type}`
  if (expandedTypes.value.has(key)) {
    expandedTypes.value.delete(key)
  } else {
    expandedTypes.value.add(key)
  }
}

const selectDatabase = (env: string, db: string) => {
  toggleDatabase(env, db)
  if (route.path === '/compare') {
    window.dispatchEvent(new CustomEvent('category-selected', { detail: { env, db, type: 'all' } }))
  }
}

const selectCategory = (env: string, db: string, type: string) => {
  toggleType(env, db, type)
  if (route.path === '/compare') {
    window.dispatchEvent(new CustomEvent('category-selected', { detail: { env, db, type } }))
  }
}

const getCategoryChangeCount = (db: any, typeKey: string) => {
  if (!props.results) return 0
  return db[typeKey].filter((item: any) => {
    const res = comparisonMap.value[`${typeKey}-${item.name}`]
    return res && res.status !== 'equal' && res.status !== 'same'
  }).length
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
    default:
      return AlertCircle
  }
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'equal':
    case 'same':
      return 'text-green-500 opacity-60'
    case 'new':
    case 'missing_in_target':
      return 'text-green-500 drop-shadow-sm font-bold'
    case 'deprecated':
    case 'missing_in_source':
      return 'text-red-500 drop-shadow-sm font-bold'
    case 'modified':
    case 'different':
    case 'updated':
      return 'text-orange-500 drop-shadow-sm font-bold'
    default:
      return 'text-gray-400'
  }
}

const selectObject = (env: string, db: string, type: string, item: any) => {
  selectedObjectId.value = item.name
  // Emit event or update global state to sync with Compare.vue
  if (route.path === '/compare') {
    // Scroll both panes to the selected object
    window.dispatchEvent(new CustomEvent('object-selected', { detail: { env, db, name: item.name, type } }))
  }
}

const refreshSchemas = async () => {
  loading.value = true
  try {
    const result = await Andb.getSchemas()
    environments.value = result || []
    
    // Auto-expand source environment
    if (activePair.value?.sourceEnv) {
      expandedEnvironments.value.add(activePair.value.sourceEnv)
    }
  } catch (error) {
    console.error('Failed to load schemas in sidebar:', error)
  } finally {
    loading.value = false
  }
}

// Watch for active pair changes to auto-expand
watch(activePair, (newPair) => {
  if (newPair?.sourceEnv) {
    expandedEnvironments.value.add(newPair.sourceEnv)
  }
}, { immediate: true })

onMounted(() => {
  refreshSchemas()
})

// Expose open methods
defineExpose({
  refreshSchemas
})
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
