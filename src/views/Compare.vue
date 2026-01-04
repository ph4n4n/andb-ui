<template>
  <MainLayout>
    <template #toolbar>
      <div class="flex items-center justify-between w-full h-full gap-4">
        <!-- Title & Page Status -->
        <div class="flex items-center gap-4">
          <div class="flex flex-col gap-0.5">
            <h1 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center">
              <GitMerge class="w-5 h-5 mr-2 text-primary-500" />
              {{ $t('common.compare') }}
            </h1>
            <div v-if="activePair && activePair.source && activePair.target" class="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
               <span class="text-blue-500">{{ activePair.source.name }}</span>
               <ArrowRightLeft class="w-3 h-3 mx-2 opacity-50 text-gray-400" />
               <span class="text-green-500">{{ activePair.target.name }}</span>
               <span v-if="hasResults" class="ml-3 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800/30">
                 {{ countSummary }}
               </span>
            </div>
            <p v-else class="text-[10px] text-gray-400 uppercase tracking-widest font-bold italic">{{ $t('compare.noPair') }}</p>
          </div>
        </div>

        <div 
          class="flex items-center gap-3 p-1.5 rounded-2xl transition-all duration-300 shadow-sm"
          :class="appStore.buttonStyle === 'full' 
            ? 'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5' 
            : 'bg-transparent border-transparent px-0'"
        >
          <!-- Segmented Control for View Mode -->
          <div 
            class="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl"
            :class="appStore.buttonStyle === 'minimal' ? 'scale-90' : ''"
          >
              <button 
                @click="viewMode = 'list'" 
                class="flex items-center gap-2 rounded-lg font-bold uppercase transition-all duration-200"
                :class="[
                  viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
                  appStore.buttonStyle === 'full' ? 'px-3 py-1.5 text-[10px]' : 'px-2 py-1 text-[10px]'
                ]"
                :title="$t('compare.listViewTooltip')"
              >
                <List class="w-3.5 h-3.5" />
                <span v-if="appStore.buttonStyle !== 'icons' && appStore.buttonStyle === 'full'">{{ $t('compare.listView') }}</span>
              </button>
              <button 
                @click="viewMode = 'tree'" 
                class="flex items-center gap-2 rounded-lg font-bold uppercase transition-all duration-200"
                :class="[
                  viewMode === 'tree' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
                  appStore.buttonStyle === 'full' ? 'px-3 py-1.5 text-[10px]' : 'px-2 py-1 text-[10px]'
                ]"
                :title="$t('compare.treeViewTooltip')"
              >
                <GitMerge class="w-3.5 h-3.5 rotate-90" />
                <span v-if="appStore.buttonStyle !== 'icons' && appStore.buttonStyle === 'full'">{{ $t('compare.treeViewLabel') }}</span>
              </button>
          </div>

          <div v-if="appStore.buttonStyle === 'full'" class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <div v-if="error" class="text-red-500 text-[10px] font-bold uppercase tracking-wider max-w-[150px] truncate" :title="error">{{ error }}</div>

          <button 
            @click="runComparison(true)" 
            :disabled="loading || !activePair"
            class="hidden md:flex items-center justify-center font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            :class="[
              appStore.buttonStyle === 'full' ? 'px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl text-[11px] gap-2' : '',
              appStore.buttonStyle === 'minimal' ? 'px-3 py-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-[10px] gap-2' : '',
              appStore.buttonStyle === 'icons' ? 'w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : ''
            ]"
            title="$t('compare.fetchTooltip')"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            <span v-if="appStore.buttonStyle !== 'icons'">{{ appStore.buttonStyle === 'full' ? $t('compare.fetchFromDB') : $t('compare.fetch') }}</span>
          </button>

          <button 
            @click="runComparison(false)" 
            :disabled="loading || !activePair"
            class="flex items-center justify-center font-bold uppercase transition-all duration-300 disabled:opacity-50 disabled:grayscale"
            :class="[
              appStore.buttonStyle === 'full' ? 'px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-[11px] tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 gap-2' : '',
              appStore.buttonStyle === 'minimal' ? 'px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-[10px] tracking-wider active:scale-95 shadow-sm gap-2' : '',
              appStore.buttonStyle === 'icons' ? 'w-11 h-11 bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/20 hover:scale-110 active:scale-95' : ''
            ]"
            :title="$t('compare.runCompareTooltip')"
          >
            <Zap v-if="!loading" class="w-4 h-4 fill-current" />
            <RefreshCw v-else class="w-4 h-4 animate-spin" />
            <span v-if="appStore.buttonStyle !== 'icons'">{{ loading ? $t('compare.comparing') : (appStore.buttonStyle === 'full' ? $t('compare.runCompare') : $t('compare.compare')) }}</span>
          </button>
        </div>
      </div>
    </template>
        
        <!-- Comparison & Console Split -->
        <div class="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <!-- Comparison Area (Top) -->
          <div class="flex-1 flex overflow-hidden relative min-w-0">
            <main class="flex-1 flex overflow-hidden relative min-w-0">
              <!-- Loading Overlay (Spinner Only) -->
              <div v-if="loading && !hasResults" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-20 flex items-center justify-center backdrop-blur-sm">
                <div class="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                  <div class="relative w-20 h-20 mx-auto mb-6">
                    <div class="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
                  </div>
                  <p class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">{{ statusMessage || $t('schema.loading') }}</p>
                  <div class="mt-2 text-xs text-gray-500 uppercase tracking-tighter animate-pulse">{{ $t('schema.runningCommands') }}</div>
                </div>
              </div>

          <!-- Vertical Split: Object List vs DDL View -->
          <div v-if="viewMode === 'list'" class="flex-1 flex overflow-hidden relative min-w-0">
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
                      <span v-if="selectedFilterType === 'all'">{{ selectedPath.db || $t('common.database') }} {{ $t('common.overview') }}</span>
                      <span v-else>{{ selectedFilterType }}</span>
                    </span>
                    <span v-if="hasResults" class="text-[8px] text-gray-400 uppercase tracking-tighter">
                      {{ filteredResults.length }} {{ $t('schema.items') }} • {{ filteredTotalChanges }} {{ $t('compare.totalChanges') }}
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
                    :placeholder="$t('history.searchPlaceholder')"
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
                  <p class="text-xs uppercase tracking-widest font-bold">{{ $t('history.noHistory') }}</p>
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
                          v-if="cat.changes > 0"
                          @click.stop.prevent="openBatchMigrateModal(cat.type)"
                          class="mr-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-600 hover:shadow-md dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50 dark:hover:bg-orange-600 dark:hover:text-white transition-all group/badge"
                          title="Click to Migrate All Changes"
                        >
                          <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-900/50 rounded w-4 h-4 group-hover/badge:bg-white/20 group-hover/badge:text-white transition-colors">
                            <Zap class="w-3 h-3 fill-current" />
                          </div>
                          <span class="font-bold text-[11px]">{{ cat.changes }}</span>
                        </button>
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
            <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 relative min-w-0">
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
                      <span class="font-bold">{{ $t('compare.migrateTo', { name: targetName }) }}</span>
                      <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 linear skew-x-[-20deg]"></div>
                    </button>
                    <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <button @click="openDetailModal(selectedItem)" class="p-2 text-gray-400 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm" :title="$t('compare.viewFullDefinition')">
                      <ScanSearch class="w-4.5 h-4.5 font-bold" />
                    </button>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
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
                  <p>{{ $t('schema.selectObject') }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tree Mode View -->
          <div v-else class="flex-1 relative">
             <CompareTreeMode 
               :results="allResults"
               :source-name="sourceName"
               :target-name="targetName"
               @migrate="openMigrateModal"
             />
          </div>

        </main>
      </div>
    </div>
  </MainLayout>

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

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import DDLDetailModal from '@/components/DDLDetailModal.vue'
import MirrorDiffView from '@/components/MirrorDiffView.vue'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useAppStore } from '@/stores/app'
import { useConsoleStore } from '@/stores/console'
import Andb from '@/utils/andb'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
  Search,
  List,
  GitMerge,
  ArrowRightLeft
} from 'lucide-vue-next'
import MigrationConfirmModal from '@/components/MigrationConfirmModal.vue'
import { useOperationsStore } from '@/stores/operations'
import { useNotificationStore } from '@/stores/notification'
import { useSidebarStore } from '@/stores/sidebar'
import CompareTreeMode from '@/components/CompareTreeMode.vue'

const connectionPairsStore = useConnectionPairsStore()
const appStore = useAppStore()
const operationsStore = useOperationsStore()
const consoleStore = useConsoleStore()
const notificationStore = useNotificationStore()
const sidebarStore = useSidebarStore()
const { t } = useI18n()

const activePair = computed(() => connectionPairsStore.activePair)
const sourceName = computed(() => activePair.value?.source?.name || 'Source')
const targetName = computed(() => activePair.value?.target?.name || 'Target')

const viewMode = ref<'list' | 'tree'>('list')



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
const resultsWidth = ref(300)
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

const statusFilters = computed(() => [
  { label: t('common.all'), value: 'all' },
  { label: t('compare.filters.modified'), value: 'modified' },
  { label: t('compare.filters.new'), value: 'new' },
  { label: t('compare.filters.deprecated'), value: 'deprecated' },
  { label: t('compare.filters.identical'), value: 'equal' }
])

// Migration State
const isMigrating = ref(false)
const showMigrateModal = ref(false)
const migratingItem = ref<any>(null)
const batchType = ref<string | null>(null)

const hasChanges = (type: string) => {
  return allResults.value.some(i => (type === 'all' || i.type.toLowerCase() === type.toLowerCase()) && i.status !== 'equal' && i.status !== 'same')
}

const selectedPath = ref({
  env: '',
  db: '',
  type: ''
})

// View State
const isResizingResults = ref(false)

const startResultsResize = () => {
  isResizingResults.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
}

const handleResize = (e: MouseEvent) => {
  if (isResizingResults.value) {
    resultsWidth.value = Math.max(200, Math.min(800, resultsWidth.value + e.movementX))
  }
}

const stopResize = () => {
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
const runComparison = async (refresh: boolean = false) => {
  if (!activePair.value) return
  
  loading.value = true
  // consoleStore.setVisibility(true) // Only open console on manual run/error, not initial load
  statusMessage.value = t('compare.initializing')
  consoleStore.clearLogs()
  error.value = null

  try {
    const { source, target } = activePair.value
    
    let objTypes: ('tables' | 'procedures' | 'functions' | 'triggers' | 'views')[] = ['tables', 'procedures', 'functions', 'triggers', 'views']
    let compareName: string | undefined = undefined

    // Atomic Compare Logic
    if (selectedItem.value) {
      // 1. Compare specific object
      objTypes = [selectedItem.value.type.toLowerCase()] // e.g., 'tables'
      compareName = selectedItem.value.name
      consoleStore.addLog(`Comparing single object: ${selectedItem.value.name} (${selectedItem.value.type})`, 'info')
      statusMessage.value = t('compare.analyzingItem', { name: selectedItem.value.name })
    } else if (selectedFilterType.value && selectedFilterType.value !== 'all') {
      // 2. Compare specific category
      objTypes = [selectedFilterType.value.toLowerCase() as any]
      consoleStore.addLog(`Comparing category: ${selectedFilterType.value}`, 'info')
      statusMessage.value = t('compare.analyzingItem', { name: selectedFilterType.value })
    } else {
      consoleStore.addLog(`Starting comparison between ${source.name} (${source.host}) and ${target.name} (${target.host})`, 'info')
      statusMessage.value = t('compare.analyzing')
    }
    
    // 1. Export Source and Target DDLs (Only if refreshing)
    // 1. Export Source and Target DDLs (Only if refreshing)
    if (refresh) {
      consoleStore.setVisibility(true)
      
      // POWERFUL FETCH: Clear cache if doing a full fetch to ensure fresh data
      if (!selectedItem.value && (!selectedFilterType.value || selectedFilterType.value === 'all')) {
         statusMessage.value = t('compare.cleaning')
         consoleStore.addLog('Cleaning up local cache for fresh fetch...', 'warn')
         await Promise.all([
           Andb.clearConnectionData(source),
           Andb.clearConnectionData(target)
         ])
      }

      statusMessage.value = t('compare.exporting')
      
      for (const type of objTypes) {
        const cmdS = `andb export --source ${source.environment} --type ${type}` + (compareName ? ` --name ${compareName}` : '')
        consoleStore.addLog(cmdS, 'cmd')
        const cmdT = `andb export --source ${target.environment} --type ${type}` + (compareName ? ` --name ${compareName}` : '')
        consoleStore.addLog(cmdT, 'cmd')
      }
      
      // Parallelize exports
      await Promise.all([
        ...objTypes.map(type => Andb.export(source, target, { 
          type, 
          environment: source.environment,
          name: compareName
        })),
        ...objTypes.map(type => Andb.export(source, target, { 
          type, 
          environment: target.environment,
          name: compareName
        }))
      ])
    }
    
    // 2. Compare (Always run to update comparison results from local cache)
    statusMessage.value = t('compare.comparingObjects')
    
    // Start recording operation
    const opId = operationsStore.addOperation({
      type: 'compare',
      sourceEnv: source.environment,
      targetEnv: target.environment,
      status: 'pending',
      startTime: new Date()
    })

    const results = await Promise.all(objTypes.map(type => 
      Andb.compare(source, target, { 
        type, 
        sourceEnv: source.environment, 
        targetEnv: target.environment,
        name: compareName
      })
    ))

    // Map results based on what we fetched
    objTypes.forEach((type, index) => {
      const res = Array.isArray(results[index]) ? results[index] : []
      if (type === 'tables') tableResults.value = res
      if (type === 'procedures') procedureResults.value = res
      if (type === 'functions') functionResults.value = res
      if (type === 'views') viewResults.value = res
      if (type === 'triggers') triggerResults.value = res
    })
    
    const totalCount = tableResults.value.length + procedureResults.value.length + functionResults.value.length + viewResults.value.length + triggerResults.value.length
    
    // Complete operation record
    operationsStore.completeOperation(opId, true, { ddlCount: totalCount })

    // Sync to Sidebar Store
    sidebarStore.setComparisonResults(allResults.value)
    sidebarStore.triggerRefresh()

    consoleStore.addLog('Comparison completed successfully', 'success')
  } catch (e: any) {
    error.value = e.message || 'Comparison failed'
    consoleStore.addLog(`Comparison failed: ${e.message}`, 'error')
    notificationStore.add({
      type: 'error',
      title: 'Comparison Failed',
      message: e.message
    })
  } finally {
    loading.value = false
  }
}

const selectItem = (item: any) => {
  selectedItem.value = item
}

const handleObjectSelected = (event: any) => {
  const { env, db, name, type } = event.detail
  
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
  }
}

const handleCategorySelected = (event: any) => {
  const { env, db, type } = event.detail
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
      return 'text-teal-600 dark:text-teal-400 font-bold' 
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
    case 'same': return t('common.status.identical')
    case 'different':
    case 'updated':
    case 'modified': return t('common.status.modified')
    case 'missing_in_target':
    case 'new': return t('common.status.newSource')
    case 'missing_in_source':
    case 'deprecated': return t('common.status.deprecatedTarget')
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
  console.log('[Compare] openBatchMigrateModal called with type:', type)
  consoleStore.addLog(`Opening batch migration for ${type}`, 'info')
  
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

  console.log('[Compare] Items to migrate:', itemsToMigrate.length)
  consoleStore.addLog(`Found ${itemsToMigrate.length} items to migrate`, 'info')

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
        
        const ddlTypes = type === 'schema' 
          ? ['tables', 'views', 'procedures', 'functions', 'triggers']
          : [type]
        
        // For batch migration, we sync everything: New, Updated, and Deprecated
        const statuses: ('NEW' | 'UPDATED' | 'DEPRECATED')[] = ['NEW', 'UPDATED', 'DEPRECATED']
        
        const resultsMap: Record<string, any> = {
          tables: tableResults,
          procedures: procedureResults,
          functions: functionResults,
          views: viewResults,
          triggers: triggerResults
        }

        for (const ddlType of ddlTypes) {
          // 1. Migrate all changes for this type
          for (const status of statuses) {
            await Andb.migrate(source, target, {
              type: ddlType as any,
              sourceEnv: source.environment,
              targetEnv: target.environment,
              status: status
            })
          }
          
          // 2. Export Target (Atomic for Category)
          await Andb.export(source, target, {
            type: ddlType as any,
            environment: target.environment
          })
          
          // 3. Compare (Atomic for Category)
          const results = await Andb.compare(source, target, {
            type: ddlType as any,
            sourceEnv: source.environment,
            targetEnv: target.environment
          })
          
          // 4. Update UI State immediately
          if (Array.isArray(results) && resultsMap[ddlType]) {
             resultsMap[ddlType].value = results.map(r => ({ ...r, type: ddlType.endsWith('s') ? ddlType : ddlType + 's' }))
             
             // If selected item is in this category, try to refresh it or deselect if gone
             if (selectedItem.value && selectedItem.value.type === ddlType) {
               const found = results.find((r: any) => r.name === selectedItem.value.name)
               if (found) {
                 selectedItem.value = { ...found, type: ddlType }
               } else {
                 // Item might have been deleted/renamed (though rare in migrate), or status changed to equal and filter hides it
                 // We keep it selected but update content
               }
             }
          }
        }

        notificationStore.add({
          type: 'success',
          title: 'Batch Migration Successful',
          message: `${type === 'schema' ? 'Entire schema' : 'All ' + batchType.value} has been migrated and verified.`
        })
      } else {
        // Individual Migration
        let status: 'NEW' | 'UPDATED' | 'DEPRECATED' = 'NEW'
        if (item.status === 'modified' || item.status === 'different' || item.status === 'updated') status = 'UPDATED'
        if (item.status === 'deprecated' || item.status === 'missing_in_source') status = 'DEPRECATED'
        
        await Andb.migrate(source, target, {
          type: item.type as any,
          sourceEnv: source.environment,
          targetEnv: target.environment,
          name: item.name,
          status: status
        })
        
        // Atomic Verification
        await applyAtomicVerify(item)
        
        notificationStore.add({
          type: 'success',
          title: 'Migration Successful',
          message: `${item.name} (${item.type}) has been migrated and verified.`
        })
      }
      
      showMigrateModal.value = false
      
      // Update Sidebar with new results
      sidebarStore.setComparisonResults(allResults.value)
      sidebarStore.triggerRefresh()

      // Complete operation record
      operationsStore.completeOperation(opId, true)
    } catch (e: any) {
      operationsStore.completeOperation(opId, false, { error: e.message })
      throw e
    }
  } catch (e: any) {
    notificationStore.add({
      type: 'error',
      title: 'Migration Failed',
      message: e.message || 'An unknown error occurred during migration.'
    })
    if (window.electronAPI) {
      window.electronAPI.log.send('error', `Migration failed for ${item.name}`, e.message)
    }
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
        }
      }
    }
  } catch (e: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('warn', `Atomic verify failed for ${item.name}, falling back to full comparison`, e.message)
    }
    // Fallback to full comparison if atomic fails
    await runComparison()
  }
}

// Lifecycle
onMounted(async () => {
  window.addEventListener('category-selected', handleCategorySelected as any)
  window.addEventListener('object-selected', handleObjectSelected as any)
  
  // Trigger local comparison on init (fetch from DB is manual)
  if (activePair.value) {
    runComparison(false)
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
    
    // Trigger local comparison on pair change
    runComparison(false)
  }
})

</script>
