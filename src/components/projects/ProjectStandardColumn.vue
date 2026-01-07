<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Folder, 
  Pin,
  PinOff,
  Trash2,
  CheckCircle2,
  PlusCircle,
  Plus,
  ChevronRight,
  ChevronDown,
  ArrowLeftToLine,
  ArrowRightFromLine,
  ChevronsRight,
  ChevronsLeft
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  column: any
  index: number
  isCollapsed: boolean
  combinedTypes: string[]
  activeStartIndex: number
  isMergedStack?: boolean
  isLast?: boolean // New Prop
}>()

const emit = defineEmits<{
  (e: 'select', item: any): void
  (e: 'dblclick', item: any): void
  (e: 'toggle-pin'): void
  (e: 'add-item'): void
  (e: 'delete-project', item: any): void
  (e: 'toggle-membership', item: any): void
  (e: 'update-title', newTitle: string): void
  (e: 'accordion-click', item: any, parent: any): void
  (e: 'accordion-click', item: any, parent: any): void
  (e: 'toggle-stack', level: number | 'all'): void // New Emit
  (e: 'stack-to-parent', payload: { childIndex: number, parentIndex: number }): void
}>()

const appStore = useAppStore()
const titleInput = ref<HTMLInputElement | null>(null)
const isEditing = ref(false)
const editingTitle = ref('')

const startEdit = () => {
    editingTitle.value = props.column.title
    isEditing.value = true
    // tick needed
    setTimeout(() => titleInput.value?.focus(), 0)
}

const saveTitle = () => {
    if (editingTitle.value.trim() && editingTitle.value !== props.column.title) {
        emit('update-title', editingTitle.value)
    }
    isEditing.value = false
}

const cancelEdit = () => {
    isEditing.value = false
}


</script>

<template>
    <div 
      class="border-r border-gray-100 dark:border-white/5 flex flex-col shrink-0 bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out group/col relative"
      :class="isCollapsed ? 'w-12 hover:w-72 z-10 hover:z-20 hover:shadow-2xl' : 'w-72'"
    >
      <!-- Column Header (Luxury) -->
      <!-- Column Header -->
      <div 
         class="relative border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl transition-all overflow-hidden shrink-0" 
         :class="isCollapsed ? 'px-0 h-[56px] min-h-[56px] group-hover/col:px-5 group-hover/col:h-[56px]' : 'px-5 h-14'"
      >
        <!-- A. Full Header (Visible if !isCollapsed OR Hovered) -->
        <div 
            class="w-full h-full items-center justify-between"
            :class="isCollapsed ? 'hidden group-hover/col:flex' : 'flex'"
        >
            <!-- Title / Edit Input -->
            <div class="min-w-0 flex-1 mr-2">
                <input 
                  v-if="isEditing"
                  ref="titleInput"
                  v-model="editingTitle"
                  @blur="saveTitle"
                  @keydown.enter="saveTitle"
                  @keydown.esc="cancelEdit"
                  @click.stop
                  class="w-full bg-white dark:bg-gray-800 border-2 border-primary-500 rounded-xl px-2 py-1 text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white outline-none"
                />
                <div v-else class="flex flex-col min-w-0">
                   <span class="text-[8px] font-black uppercase tracking-[0.3em] text-primary-500/60 leading-none mb-1 truncate">{{ column.type === 'projects' ? 'Source Control' : 'Project Hierarchy' }}</span>
                   <h3 
                      @click="startEdit"
                      class="text-xs font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white whitespace-nowrap overflow-hidden cursor-pointer hover:text-primary-500 truncate"
                   >
                      {{ column.title }}
                   </h3>
                </div>
            </div>

            <!-- Controls (Stack, Pin, Add) -->
            <div v-if="appStore.projectManagerMode" class="flex items-center gap-1 shrink-0">
              <!-- Unstack (Merged Stack only) -->
              <button 
                 v-if="isMergedStack"
                 @click.stop="emit('toggle-stack', index)"
                 class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-1 text-primary-500"
                 title="Unstack (Expand Right)"
              >
                 <ArrowRightFromLine class="w-4 h-4" />
              </button>
              
              <button 
                 v-if="isMergedStack"
                 @click.stop="emit('toggle-stack', 'all')"
                 class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-1 text-primary-500/50 hover:text-primary-500"
                 title="Unstack All"
              >
                 <ChevronsRight class="w-4 h-4" />
                 <span class="sr-only">Unstack All</span>
              </button>

              <!-- Stack (Intermediate Columns) -->
              <button 
                 v-if="!isMergedStack && !isLast && index > 0"
                 @click.stop="emit('stack-to-parent', { childIndex: index, parentIndex: index - 1 })"
                 class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-1 text-gray-400 hover:text-gray-500"
                 title="Stack Column"
              >
                 <ArrowLeftToLine class="w-4 h-4" />
              </button>

              <!-- Stack All (Last Column only) -->
              <button 
                 v-if="!isMergedStack && isLast && activeStartIndex < index"
                 @click.stop="emit('toggle-stack', 'all')"
                 class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-1 text-gray-400 hover:text-gray-500"
                 title="Stack All Preceding"
              >
                 <ChevronsLeft class="w-4 h-4" />
                 <span class="sr-only">Stack All</span>
              </button>

              <!-- Pin Toggle -->
              <button 
                 v-if="!isMergedStack"
                 @click.stop="emit('toggle-pin')"
                 class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                 :class="column.isPinned ? 'text-primary-500' : 'text-gray-400 hover:text-gray-500'"
                 :title="column.isPinned ? 'Unpin column' : 'Pin column'"
              >
                 <component :is="column.isPinned ? Pin : PinOff" class="w-3.5 h-3.5" />
              </button>

              <!-- Add Button (Contextual) -->
              <button 
                 v-if="['projects', 'connections', 'pairs'].includes(column.type)"
                 @click.stop="emit('add-item')"
                 class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-primary-500 transition-colors"
                 :title="'New ' + column.title.slice(0, -1)"
              >
                 <Plus class="w-4 h-4" />
              </button>
            </div>
        </div>

        <!-- B. Collapsed Header (Visible if Collapsed AND NOT Hovered) -->
        <!-- B. Collapsed Header (Exact User Structure) -->
        <!-- B. Collapsed Header (Simplified Identity-Focused) -->
        <!-- B. Collapsed Header (TH: Dot Only) -->
        <div 
           v-if="isCollapsed" 
           class="flex items-center justify-center w-full h-full"
           :class="isCollapsed ? 'px-0 h-14 group-hover/col:px-5 group-hover/col:h-14' : 'px-5 h-14'"
        >
             <div class="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600"></div>
        </div>
      </div>
      
      <!-- C. Collapsed Body (TD: Identity) -->
      <div 
        v-if="isCollapsed"
        class="flex-1 flex flex-col items-center pt-2 pb-4 overflow-hidden group-hover/col:hidden"
      >
         <!-- Active Icon -->
         <div v-if="column.selectedId" class="mb-2 text-primary-500 shrink-0">
             <component 
                :is="column.items.find((i: any) => i.id === column.selectedId)?.icon || Folder" 
                class="w-4 h-4"
             />
         </div>

         <!-- Vertical Title -->
         <!-- Removed flex-1 to prevent text being pushed to bottom -->
         <div class="w-full flex justify-center overflow-hidden">
             <span 
                style="writing-mode: vertical-rl; text-orientation: mixed;"
                class="whitespace-nowrap uppercase text-[10px] font-bold tracking-widest text-gray-500 select-none truncate rotate-180"
             >
                {{ column.title }}
             </span>
         </div>
      </div>

      <!-- D. Expanded Body (TD: Items List) -->
      <div 
         class="flex-1 overflow-y-auto slim-scrollbar px-3 py-4 space-y-1.5 transition-opacity duration-200 bg-white dark:bg-gray-950"
         :class="isCollapsed ? 'hidden group-hover/col:block' : ''"
      >
        <div v-for="item in column.items" :key="item.id">
            <button
            @click="emit('select', item)"
            :class="{
                'bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20 shadow-xl shadow-primary-500/5 border border-primary-500/10': column.selectedId === item.id,
                'hover:bg-primary-50/50 dark:hover:bg-primary-900/5 text-gray-700 dark:text-gray-300 border-transparent': column.selectedId !== item.id,
                'justify-center px-0': isCollapsed
            }"
            @dblclick="emit('dblclick', item)"
            class="w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group border border-transparent"
            :title="isCollapsed ? item.name : ''"
            >
            <div 
                class="flex items-center min-w-0 transition-all duration-300" 
                :class="[
                    isCollapsed ? 'justify-center w-full group-hover/col:justify-start group-hover/col:w-auto gap-0 group-hover/col:gap-3' : 'justify-start w-auto gap-3'
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
                :class="isCollapsed ? 'max-w-0 opacity-0 group-hover/col:max-w-[200px] overflow-hidden group-hover/col:opacity-100' : 'opacity-100 overflow-visible'"
                >
                <div class="flex items-center gap-1.5 w-full">
                    <span class="text-sm font-bold truncate">{{ item.name }}</span>
                    <span v-if="item.inProject" class="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 ring-2 ring-primary-500/20 ml-0.5"></span>
                </div>
                <div 
                    v-if="item.description || item.count !== undefined" 
                    class="text-[10px] truncate opacity-70 flex items-center gap-1.5"
                >
                    <span v-if="item.environment && !isCollapsed" class="shrink-0 font-black text-[8px] px-1 rounded bg-gray-100 dark:bg-gray-800 tracking-tighter">{{ item.environment }}</span>
                    <span class="truncate">{{ item.description || (item.count !== undefined ? `${item.count} items` : '') }}</span>
                </div>
                </div>
            </div>

            <!-- Project Membership Toggle -->
            <div 
                v-if="['connections', 'pairs'].includes(column.type) && !isCollapsed"
                @click.stop="emit('toggle-membership', item)"
                class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                :class="item.inProject ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600'"
                :title="item.inProject ? 'Remove from Base' : 'Add to Base'"
            >
                <CheckCircle2 v-if="item.inProject" class="w-3.5 h-3.5" />
                <PlusCircle v-else class="w-3.5 h-3.5" />
            </div>

            <!-- Project Delete Trigger -->
            <div 
                v-if="column.type === 'projects' && item.id !== 'default' && !isCollapsed"
                @click.stop="emit('delete-project', item)"
                class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1 cursor-pointer"
                title="Delete Base"
            >
                <Trash2 class="w-3.5 h-3.5" />
            </div>

            <ChevronRight 
                v-else-if="column.selectedId === item.id && !combinedTypes.includes(column.type)" 
                class="w-3 h-3 shrink-0 opacity-80"
                :class="isCollapsed ? 'hidden group-hover/col:block' : 'block'"
            />
            </button>

            <!-- Deep Nested Accordion (Classic Mode) -->
            <div v-if="item?.expanded && item?.children" class="pl-4 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <!-- Level 2: Databases -->
                <div v-for="child in item.children" :key="child.id">
                    <button 
                        @click.stop="emit('accordion-click', child, item)"
                        class="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors relative"
                        :class="{ 'text-primary-500 bg-primary-50 dark:bg-primary-900/10': child.selected }"
                    >
                        <!-- Indent Guide -->
                        <div class="absolute left-0 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800 ml-[-8px]"></div>
                        
                        <component :is="child.icon" class="w-3 h-3 opacity-70 shrink-0" />
                        <span class="truncate flex-1">{{ child.name }}</span>
                        <ChevronRight 
                            v-if="['databases', 'types'].includes(child.contextType) && !child.expanded"
                            class="w-3 h-3 opacity-50"
                        />
                        <ChevronDown
                            v-if="['databases', 'types'].includes(child.contextType) && child.expanded"
                            class="w-3 h-3 opacity-50"
                        />
                    </button>

                    <!-- Level 3: Types (Tables, Views...) -->
                    <div v-if="child.expanded && child.children" class="pl-4 py-1 space-y-0.5 border-l border-gray-100 dark:border-gray-800 ml-1">
                        <div v-for="gChild in child.children" :key="gChild.id">
                            <button 
                                @click.stop="emit('accordion-click', gChild, child)"
                                class="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                                :class="{ 'text-primary-500 font-bold': gChild.selected }"
                            >
                                <component :is="gChild.icon" class="w-2.5 h-2.5 opacity-70 shrink-0" />
                                <span class="truncate flex-1">{{ gChild.name }}</span>
                            </button>
                            
                            <!-- Level 4: Objects (Specific Tables) -->
                            <div v-if="gChild.expanded && gChild.children" class="pl-4 py-1 space-y-px border-l border-gray-100 dark:border-gray-800 ml-1">
                                <button 
                                    v-for="ggChild in gChild.children" 
                                    :key="ggChild.id"
                                    @click.stop="emit('accordion-click', ggChild, gChild)"
                                    class="w-full text-left px-3 py-1 rounded text-[11px] text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 flex items-center gap-2 transition-colors"
                                    :class="{ 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-medium': ggChild.selected }"
                                >
                                    <span class="truncate">{{ ggChild.name }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
</template>
