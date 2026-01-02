<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
              <!-- Header -->
              <div class="bg-white dark:bg-gray-800 px-4 pt-5 sm:p-6 pb-0">
                <div class="sm:flex sm:items-start mb-4">
                  <div class="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <Zap class="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <DialogTitle as="h3" class="text-base font-bold leading-6 text-gray-900 dark:text-white uppercase tracking-widest">
                      {{ item?.isBatch ? 'Batch Migration' : 'Migrate DDL Item' }}
                    </DialogTitle>
                    
                    <!-- Single Item Card (for non-batch) -->
                    <div v-if="!item?.isBatch" class="mt-4">
                      <div class="p-4 rounded-xl border bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 transition-all">
                        <div class="flex items-center justify-between text-xs mb-3">
                          <span class="text-gray-500 uppercase tracking-tighter">Object to Migrate</span>
                          <span class="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold uppercase text-[10px]">
                            {{ item?.type }}
                          </span>
                        </div>
                        <div class="text-lg font-mono font-bold text-gray-900 dark:text-white break-all">
                          {{ item?.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Content Area (Scrollable) -->
              <div class="px-4 sm:px-6 flex-1 overflow-y-auto custom-scrollbar">
                
                <!-- SUMMARY STATS (Batch Mode) -->
                <div v-if="item?.isBatch && item?.items?.length" class="mb-4">
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Start batch migration from <strong class="text-blue-600 dark:text-blue-400">{{ sourceName }}</strong> to <strong class="text-green-600 dark:text-green-400">{{ targetName }}</strong>?
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2 mb-4">
                     <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center border border-gray-100 dark:border-gray-700">
                       <div class="text-xl font-bold text-gray-900 dark:text-white">{{ item.items.length }}</div>
                       <div class="text-[10px] uppercase text-gray-500 tracking-wider">Total Items</div>
                     </div>
                     <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center border border-amber-100 dark:border-amber-800/30">
                       <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ Object.keys(groupedItems).length }}</div>
                       <div class="text-[10px] uppercase text-amber-600 dark:text-amber-400 tracking-wider">Types Changed</div>
                     </div>
                  </div>
                  
                  <div class="space-y-4">
                    <div v-for="(group, type) in groupedItems" :key="type" class="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div class="bg-gray-100 dark:bg-gray-800 px-3 py-2 flex items-center justify-between">
                         <div class="flex items-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                           <component :is="getIconForType(type as any)" class="w-3 h-3 mr-2" />
                           {{ type }}
                           <span class="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full text-[10px]">{{ group.length }}</span>
                         </div>
                      </div>
                      <div class="bg-white dark:bg-gray-900/50 divide-y divide-gray-100 dark:divide-gray-800/50 max-h-40 overflow-y-auto">
                        <div v-for="obj in group" :key="obj.name" class="px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <span class="text-xs font-mono text-gray-600 dark:text-gray-300 truncate pr-2">{{ obj.name }}</span>
                          <span :class="getStatusClass(obj.status)" class="text-[9px] uppercase font-bold tracking-tighter flex items-center">
                            <component :is="getStatusIcon(obj.status)" class="w-3 h-3 mr-1" />
                            {{ getStatusText(obj.status) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!item?.isBatch" class="flex items-center justify-between px-2 mb-4">
                  <div class="text-center flex-1">
                    <div class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Source</div>
                    <div class="font-bold text-blue-600 dark:text-blue-400 truncate">{{ sourceName }}</div>
                  </div>
                  <div class="px-4">
                    <ArrowRight class="w-4 h-4 text-gray-300" />
                  </div>
                  <div class="text-center flex-1">
                    <div class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Target</div>
                    <div class="font-bold text-green-600 dark:text-green-400 truncate">{{ targetName }}</div>
                  </div>
                </div>

                <div class="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30 flex items-start mb-6">
                  <AlertTriangle class="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <p class="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    <span v-if="item?.isBatch">
                      This will apply changes for <strong>{{ item?.items?.length }} objects</strong>. 
                    </span>
                    <span v-else>
                      This will apply the DDL from <strong>{{ sourceName }}</strong> to <strong>{{ targetName }}</strong>.
                    </span>
                    Existing structure in target will be modified or replaced. This action cannot be easily undone.
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 dark:border-gray-700 shrink-0">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto transition-all disabled:opacity-50 items-center h-10"
                  :disabled="loading"
                  @click="$emit('confirm')"
                >
                  <RefreshCw v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                  <Zap v-else class="w-4 h-4 mr-2" />
                  {{ loading ? 'Migrating...' : (item?.isBatch ? `Migrate ${item?.items?.length} Items` : 'Confirm Migration') }}
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto transition-all h-10 items-center"
                  :disabled="loading"
                  @click="$emit('close')"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { 
  Zap, 
  RefreshCw, 
  ArrowRight, 
  AlertTriangle,
  Table,
  Layers,
  Hammer,
  Database,
  Trash2,
  PlusCircle,
  FileEdit
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  loading: boolean
  item: any
  sourceName: string
  targetName: string
}>()

defineEmits(['close', 'confirm'])

const typeIcons: any = {
  tables: Table,
  views: Layers,
  procedures: Hammer,
  functions: Hammer,
  triggers: Zap
}

const getIconForType = (type: string) => {
  const key = type?.toLowerCase() 
  return typeIcons[key] || Database
}

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'missing_in_source':
    case 'deprecated': 
      return Trash2
    case 'missing_in_target':
    case 'new': 
      return PlusCircle
    default: 
      return FileEdit
  }
}

const groupedItems = computed(() => {
  if (!props.item?.items) return {}
  const groups: any = {}
  
  props.item.items.forEach((item: any) => {
    const type = item.type || 'Unknown'
    if (!groups[type]) groups[type] = []
    groups[type].push(item)
  })
  
  return groups
})

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
    case 'missing_in_target':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'deprecated':
    case 'missing_in_source':
      return 'text-rose-600 dark:text-rose-400'
    default:
      return 'text-amber-600 dark:text-amber-400'
  }
}

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'different':
    case 'updated':
    case 'modified': return 'MODIFIED'
    case 'missing_in_target':
    case 'new': return 'NEW'
    case 'missing_in_source':
    case 'deprecated': return 'DEPRECATED'
    default: return status
  }
}
</script>
