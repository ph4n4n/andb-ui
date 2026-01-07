<script setup lang="ts">
import { Folder, ChevronRight, ArrowRightFromLine } from 'lucide-vue-next'

defineProps<{
  column: any
}>()

const emit = defineEmits<{
  (e: 'select', item: any): void
  (e: 'dblclick', item: any): void
  (e: 'exit-combined'): void
}>()
</script>

<template>
    <div class="border-r border-gray-100 dark:border-white/5 flex flex-col shrink-0 bg-white dark:bg-gray-950 w-72 transition-all duration-300 pointer-events-auto">
         <!-- Standard Column Header -->
         <div class="px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl flex items-center justify-between h-14">
             <div class="flex flex-col min-w-0">
                 <span class="text-[8px] font-black uppercase tracking-[0.3em] text-primary-500/60 leading-none mb-1 truncate">Current Context</span>
                 <h3 class="text-xs font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white whitespace-nowrap cursor-default">
                    {{ column.title }}
                 </h3>
             </div>
             <div class="flex items-center gap-1">
          <!-- Unstack Button -->
                  <button 
                    @click.stop="emit('exit-combined')"
                    class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-500 transition-colors"
                    title="Expand Columns"
                  >
                     <ArrowRightFromLine class="w-4 h-4" />
                  </button>
             </div>
         </div>
         
         <!-- Items List -->
         <div class="flex-1 overflow-y-auto slim-scrollbar px-3 py-4 space-y-1.5">
            <button
              v-for="item in column.items"
              :key="item.id"
              @click="emit('select', item)"
              class="w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group border hover:shadow-md"
              :class="{
                'bg-white dark:bg-gray-900 border-primary-500/30 ring-1 ring-primary-500/10 z-10': column.selectedId === item.id,
                'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-800': column.selectedId !== item.id
              }"
              @dblclick="emit('dblclick', item)"
            >
                <div class="flex items-center gap-3 min-w-0 w-full">
                    <div class="relative shrink-0">
                       <component 
                         :is="item.icon || Folder" 
                         class="w-4 h-4 transition-transform duration-300"
                         :class="{ 'scale-110 text-primary-500': column.selectedId === item.id, 'text-gray-400': column.selectedId !== item.id }"
                       />
                    </div>
                    <div class="flex-1 min-w-0">
                         <div class="flex items-center justify-between gap-2">
                             <span class="text-sm font-bold truncate transition-colors" :class="column.selectedId === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'">{{ item.name }}</span>
                             <span v-if="item.count !== undefined" class="text-[9px] font-black text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{{ item.count }}</span>
                         </div>
                         <div v-if="item.description" class="text-[10px] text-gray-400 truncate mt-0.5">{{ item.description }}</div>
                    </div>
                    <ChevronRight v-if="column.selectedId === item.id" class="w-3 h-3 text-primary-500" />
                </div>
            </button>
         </div>
    </div>
</template>
