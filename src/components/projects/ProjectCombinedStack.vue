<script setup lang="ts">
import { ref } from 'vue'
import { Database, Folder, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  columns: any[]
}>()

const emit = defineEmits<{
  (e: 'select', level: number, item: any): void
}>()

const editingLevel = ref<number | null>(null)

const toggleEdit = (index: number) => {
    editingLevel.value = editingLevel.value === index ? null : index
}

const handleSelect = (level: number, item: any) => {
    emit('select', level, item)
    editingLevel.value = null
}

const getSelectedName = (col: any) => {
    const item = col.items.find((i: any) => i.id === col.selectedId)
    return item ? item.name : ''
}
</script>

<template>
    <div class="flex flex-col w-14 lg:w-16 h-full border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl shrink-0 z-20">
         <div 
            v-for="(col, index) in columns" 
            :key="index"
            class="relative group/stack-item"
         >
            <div    
                @click="toggleEdit(index)"
                class="w-full aspect-square flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white dark:hover:bg-white/5 border-b border-transparent hover:border-gray-200 dark:hover:border-white/5"
                :class="{'bg-white dark:bg-white/10 z-20 shadow-xl': editingLevel === index}"
            >
                <div class="p-2 rounded-xl" :class="editingLevel === index ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400 group-hover/stack-item:text-gray-900 dark:group-hover/stack-item:text-white'">
                    <!-- Use First Item Icon or Default -->
                    <component 
                        :is="col.items.find((i: any) => i.id === col.selectedId)?.icon || Database" 
                        class="w-5 h-5"
                    />
                </div>
            </div>

            <!-- Vertical Label Tooltip -->
             <div class="absolute left-full top-0 h-full flex items-center pl-2 opacity-0 group-hover/stack-item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  <div class="bg-gray-900 text-white text-[10px] uppercase font-bold tracking-widest py-1 px-2 rounded shadow-xl">
                      <span class="opacity-50 mr-1">{{ col.title }}:</span>
                      {{ getSelectedName(col) }}
                  </div>
             </div>

            <!-- Flyout Selection Menu -->
            <div 
                v-if="editingLevel === index"
                class="absolute left-full top-0 w-64 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-r-2xl rounded-b-2xl z-50 flex flex-col animate-in slide-in-from-left-2 duration-200"
            >
                 <div class="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur sticky top-0">
                     <h3 class="text-xs font-black uppercase tracking-widest text-gray-400">Select {{ col.title }}</h3>
                 </div>
                 <div class="p-2 space-y-0.5">
                     <button 
                        v-for="item in col.items"
                        :key="item.id"
                        @click="handleSelect(index, item)"
                        class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-3 transition-colors"
                        :class="col.selectedId === item.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'"
                     >
                         <component :is="item.icon || Folder" class="w-4 h-4 opacity-70" />
                         <span class="truncate flex-1">{{ item.name }}</span>
                         <CheckCircle2 v-if="col.selectedId === item.id" class="w-3.5 h-3.5 text-primary-500" />
                     </button>
                 </div>
            </div>
         </div>
    </div>
</template>
