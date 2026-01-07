<template>
  <div class="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-gray-950">
    <!-- Header / Toolbar -->
    <div class="px-6 h-16 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-between items-center shrink-0 z-10">
      <div class="flex items-center gap-4 min-w-0">
        <slot name="header-left">
          <div class="flex items-center gap-3">
            <button v-if="selectedItem" @click="selectedItem = null" class="p-1 px-2.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all text-primary-600 flex items-center gap-1.5 group">
              <ChevronLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span class="text-[10px] font-black uppercase tracking-widest">{{ $t('common.back') }}</span>
            </button>
            <div v-else class="p-2.5 bg-primary-500/10 dark:bg-primary-500/20 rounded-2xl text-primary-500 ring-1 ring-primary-500/20">
              <GitCompare class="w-5 h-5" />
            </div>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500/60 leading-none mb-1">{{ $t('compare.structuralComparison') }}</span>
            <h2 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider truncate">
              {{ selectedItem ? selectedItem.name : pairName }}
            </h2>
          </div>
        </slot>
      </div>

      <div class="flex items-center gap-3">
        <slot name="header-right">
          <!-- Mode Switcher Modern -->
          <div class="flex items-center bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl">
            <button 
              @click="viewMode = 'tree'"
              class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
              :class="viewMode === 'tree' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'"
            >
              <Network class="w-3.5 h-3.5" />
              {{ $t('compare.treeViewLabel') }}
            </button>
            <button 
              @click="viewMode = 'list'"
              class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
              :class="viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'"
            >
              <List class="w-3.5 h-3.5" />
              {{ $t('compare.listView') }}
            </button>
          </div>

          <div class="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-1"></div>

          <button 
            @click="onRun(false)"
            :disabled="loading"
            class="group relative flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <GitCompare v-if="!loading" class="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <RefreshCw v-else class="w-3.5 h-3.5 animate-spin" />
            {{ loading ? $t('compare.comparing') : $t('compare.runCompare') }}
          </button>
          
          <button 
            @click="onRun(true)"
            :disabled="loading"
            class="p-2.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all border border-gray-100 dark:border-gray-800"
            :title="$t('compare.fetch')"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          </button>
        </slot>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden relative flex bg-gray-50/30 dark:bg-gray-950/30">
      <!-- Loading Overlay -->
      <div v-if="loading && results.length === 0" class="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div class="relative flex items-center justify-center mb-6">
           <div class="absolute w-24 h-24 bg-primary-500/20 rounded-full animate-ping"></div>
           <div class="relative w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-[11px] font-black uppercase tracking-[.4em] text-primary-600 dark:text-primary-400 animate-pulse">{{ $t('compare.analyzing') }}</p>
      </div>

      <!-- Item Detail View (Diff) -->
      <template v-if="selectedItem">
        <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 animate-in slide-in-from-right-4 duration-300">
           <!-- Detail Header -->
           <div class="px-6 h-14 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900/50">
              <div class="flex items-center gap-3">
                 <div class="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                    <component :is="getIconForType(selectedItem.type)" class="w-3.5 h-3.5" />
                 </div>
                 <div class="flex flex-col">
                    <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">{{ selectedItem.type }}</span>
                    <span class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{{ selectedItem.name }}</span>
                 </div>
              </div>
              <div class="flex items-center gap-4">
                 <div :class="getStatusClass(selectedItem.status)" class="text-[9px] px-3 py-1 rounded-full bg-current bg-opacity-10 font-black border border-current uppercase tracking-widest">
                    {{ selectedItem.status }}
                 </div>
                 <div class="h-6 w-px bg-gray-100 dark:bg-gray-800"></div>
                 <button 
                   v-if="selectedItem.status !== 'equal' && selectedItem.status !== 'same'"
                   @click="$emit('migrate', selectedItem)"
                   class="flex items-center gap-2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                 >
                    <Zap class="w-3.5 h-3.5" />
                    {{ $t('common.migrate') }}
                 </button>
              </div>
           </div>
           <MirrorDiffView 
              :source-ddl="selectedItem.diff?.source"
              :target-ddl="selectedItem.diff?.target"
              :source-label="sourceLabel"
              :target-label="targetLabel"
              :status="selectedItem.status"
              class="flex-1"
           />
        </div>
      </template>

      <!-- List Mode -->
      <template v-else-if="viewMode === 'list' && results.length > 0">
        <!-- Results Sidebar -->
        <div class="w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
          <div class="p-4 space-y-4">
            <div class="relative group">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                v-model="searchQuery"
                :placeholder="$t('history.searchPlaceholder')"
                class="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              />
            </div>
            <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button 
                v-for="f in ['all', 'modified', 'new', 'deprecated', 'equal']" :key="f"
                @click="statusFilter = f"
                class="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all ring-1 ring-inset"
                :class="statusFilter === f ? 'bg-primary-600 text-white ring-primary-500' : 'bg-white dark:bg-gray-800 text-gray-500 ring-gray-100 dark:ring-gray-700 hover:bg-gray-50'"
              >
                {{ f === 'all' ? $t('common.all') : $t(`compare.status.${f}`) }}
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto px-2 pb-4 slim-scrollbar">
            <div v-for="cat in resultsByCategory" :key="cat.type" class="mb-5 last:mb-0">
              <div v-if="cat.items.length > 0">
                 <div class="flex items-center justify-between px-3 mb-2">
                    <span class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400/80">{{ cat.type }}</span>
                    <span class="text-[8px] font-black text-primary-500 dark:text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded ring-1 ring-primary-500/20 shadow-sm">{{ cat.items.length }}</span>
                 </div>
                 <div class="space-y-1 px-1">
                    <button 
                       v-for="item in cat.items" :key="item.name"
                       @click="selectedItem = item"
                       class="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between group hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30"
                    >
                       <span class="text-xs font-bold truncate text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">{{ item.name }}</span>
                       <component :is="getStatusIcon(item.status)" class="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-all" :class="getStatusClass(item.status)" />
                    </button>
                 </div>
              </div>
            </div>
            <div v-if="filteredResults.length === 0" class="py-12 text-center">
               <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                 <ScanSearch class="w-8 h-8 text-gray-300" />
               </div>
               <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">{{ $t('history.noHistory') }}</p>
            </div>
          </div>
        </div>
        <!-- Empty Explorer State -->
        <div class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-gray-900">
          <div class="relative mb-8">
            <div class="absolute inset-0 bg-primary-500/5 blur-3xl rounded-full scale-150"></div>
            <LayoutGrid class="w-24 h-24 relative opacity-10 dark:opacity-5" />
          </div>
          <p class="relative text-[10px] font-black uppercase tracking-[.4em] text-gray-400 dark:text-gray-600">{{ $t('schema.selectObject') }}</p>
        </div>
      </template>

      <!-- Tree Mode -->
      <template v-else-if="viewMode === 'tree' && results.length > 0">
        <CompareTreeMode 
          :results="results"
          :source-name="sourceLabel"
          :target-name="targetLabel"
          @select="selectedItem = $event"
          @migrate="$emit('migrate', $event)"
          class="flex-1 bg-white dark:bg-gray-900"
        />
      </template>

      <!-- Empty / Ready State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900">
         <div class="relative group cursor-pointer mb-12" @click="onRun(false)">
            <!-- Animated Background Glow -->
            <div class="absolute -inset-8 bg-gradient-to-tr from-primary-500/20 to-orange-500/20 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"></div>
            
            <div class="relative p-10 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl shadow-primary-500/10 border border-gray-100 dark:border-gray-700 group-hover:border-primary-500/30 transition-all duration-500">
               <GitCompare class="w-20 h-20 text-primary-500/30 group-hover:text-primary-500 transition-all duration-500 group-hover:scale-110" />
            </div>
            
            <!-- Floating Elements -->
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-orange-400/10 rounded-2xl backdrop-blur-sm border border-orange-400/20 flex items-center justify-center animate-bounce-slow">
               <Zap class="w-6 h-6 text-orange-500" />
            </div>
            <div class="absolute -bottom-6 -left-6 w-14 h-14 bg-primary-400/10 rounded-2xl backdrop-blur-sm border border-primary-400/20 flex items-center justify-center animate-pulse">
               <Database class="w-7 h-7 text-primary-500" />
            </div>
         </div>
         
         <div class="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">{{ $t('compare.structuralComparison') }}</h3>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-10 px-8">
               Seamlessly analyze schema differences between <span class="text-primary-600 font-black">{{ sourceLabel }}</span> and <span class="text-primary-600 font-black">{{ targetLabel }}</span>. Identify missing objects and out-of-sync logic with one click.
            </p>
            <button 
               @click="onRun(false)"
               class="group relative px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
               <span class="relative z-10">{{ $t('compare.runCompare') }}</span>
               <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  GitCompare, 
  ChevronLeft, 
  RefreshCw, 
  List, 
  Network, 
  Search, 
  ScanSearch, 
  Table, 
  Layers, 
  Hammer, 
  Zap, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Database,
  LayoutGrid
} from 'lucide-vue-next'
import CompareTreeMode from '@/components/CompareTreeMode.vue'
import MirrorDiffView from '@/components/MirrorDiffView.vue'

const props = defineProps<{
  results: any[]
  loading: boolean
  pairName: string
  sourceLabel: string
  targetLabel: string
}>()

const emit = defineEmits<{
  (e: 'run', refresh: boolean): void
  (e: 'migrate', item: any): void
}>()

const viewMode = ref<'list' | 'tree'>('tree')
const selectedItem = ref<any>(null)
const searchQuery = ref('')
const statusFilter = ref('all')

const onRun = (refresh: boolean) => {
  emit('run', refresh)
}

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

const getStatusIcon = (status: string) => {
  const s = status?.toLowerCase()
  if (s === 'different' || s === 'updated' || s === 'modified') return RefreshCw
  if (s === 'missing_in_target' || s === 'new' || s === 'missing') return Plus
  if (s === 'missing_in_source' || s === 'deprecated') return Trash2
  return CheckCircle2
}

const getStatusClass = (status: string) => {
  const s = status?.toLowerCase()
  if (s === 'different' || s === 'updated' || s === 'modified') return 'text-orange-500'
  if (s === 'missing_in_target' || s === 'new' || s === 'missing') return 'text-green-500'
  if (s === 'missing_in_source' || s === 'deprecated') return 'text-red-500'
  return 'text-gray-400 dark:text-gray-600'
}

const filteredResults = computed(() => {
  let filtered = props.results
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(i => {
      const s = i.status?.toLowerCase()
      if (statusFilter.value === 'modified') return s === 'different' || s === 'updated' || s === 'modified'
      if (statusFilter.value === 'new') return s === 'missing_in_target' || s === 'new'
      if (statusFilter.value === 'deprecated') return s === 'missing_in_source' || s === 'deprecated'
      if (statusFilter.value === 'equal') return s === 'equal' || s === 'same'
      return true
    })
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q))
  }
  
  return filtered
})

const resultsByCategory = computed(() => {
  const categories = ['tables', 'views', 'procedures', 'functions', 'triggers']
  return categories.map(cat => {
    const items = filteredResults.value.filter(i => i.type.toLowerCase() === cat)
    return { type: cat, items }
  }).filter(c => c.items.length > 0)
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
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.dark .slim-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}
</style>
