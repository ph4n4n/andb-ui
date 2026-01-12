<script setup lang="ts">
/**
 * BASE MILLER COLUMN BLUEPRINT (Abstract)
 * --------------------------------------
 * Enforces hardware-accelerated transitions and axial alignment.
 */
import { 
  Pin, 
  PinOff, 
  ArrowLeftToLine, 
  ArrowRightFromLine, 
  ChevronsLeft,
  ChevronsRight,
  ArrowRightToLine,
  Folder
} from 'lucide-vue-next'
import { ColumnNode } from './types'

interface Props {
  column: ColumnNode
  index: number
  isCollapsed: boolean
  activeIcon?: any      // Identity icon for the vertical rail
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-pin'): void
  (e: 'stack', level: number): void
  (e: 'unstack', level: number): void
  (e: 'stack-all', level: number): void
  (e: 'unstack-all', level: number): void
}>()

</script>

<template>
  <div 
    class="relative border-r border-gray-100 dark:border-white/5 flex flex-col shrink-0 bg-white dark:bg-gray-950 transition-all duration-500 cubic-bezier group/col will-change-[width,transform]"
    :class="[
        column.isFinalContent ? 'flex-1 min-w-[500px]' : (isCollapsed ? 'w-10 hover:w-72 z-10 hover:z-20 hover:shadow-2xl' : 'w-72 z-10')
    ]"
    role="treegrid"
    :aria-expanded="!isCollapsed"
  >
    <!-- [TH] - THE CONTROL ANCHOR (Header) -->
    <div 
       class="relative border-b border-gray-100 dark:border-white/5 shrink-0 flex flex-col items-center h-14 w-full overflow-hidden" 
    >
      <!-- Expanded Controls -->
      <div 
          class="absolute inset-0 flex items-center justify-between px-5 transition-all duration-300"
          :class="isCollapsed ? 'opacity-0 scale-95 pointer-events-none group-hover/col:opacity-100 group-hover/col:scale-100 group-hover/col:pointer-events-auto' : 'opacity-100 scale-100'"
      >
          <div class="min-w-0 flex-1 mr-2 flex items-center justify-between">
              <slot name="header-title">
                <span class="text-xs font-black uppercase tracking-widest truncate block">{{ column.title }}</span>
              </slot>
              <div class="flex items-center">
                <slot name="header-actions" :column="column"></slot>
              </div>
          </div>

          <div class="flex items-center gap-0.5 shrink-0">
              <!-- Indicators -->
              <div v-if="column.isStacked" class="px-1.5 py-0.5 rounded-full bg-primary-500/10 text-[8px] font-black text-primary-500 mr-2 border border-primary-500/20" title="Stacked Levels">
                +{{ column.stackedValue.length }}
              </div>

              <!-- Stack Actions -->
              <div class="flex items-center gap-0.5 mr-1">
                <button 
                  v-if="column.isStackable" 
                  @click.stop="emit('stack', column.level)" 
                  class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-primary-500 transition-all active:scale-95"
                  title="Stack into previous"
                >
                  <ArrowLeftToLine class="w-3.5 h-3.5"/>
                </button>

                <button 
                  v-if="column.isUnstackable" 
                  @click.stop="emit('unstack', column.level)" 
                  class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-primary-500 transition-all active:scale-95"
                  title="Unstack to separate column"
                >
                  <ArrowRightFromLine class="w-3.5 h-3.5"/>
                </button>

                <!-- Bulk Actions (Root mostly) -->
                <button 
                  v-if="column.canAcquireAll && !column.isStacked" 
                  @click.stop="emit('stack-all', column.level)" 
                  class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-primary-500 transition-all active:scale-95"
                  title="Stack all remaining"
                >
                  <ChevronsLeft class="w-4 h-4"/>
                </button>

                <button 
                  v-if="column.canReleaseAll && column.isStacked" 
                  @click.stop="emit('unstack-all', column.level)" 
                  class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-primary-500 transition-all active:scale-95"
                  title="Unstack all children"
                >
                  <ChevronsRight class="w-4 h-4"/>
                </button>
              </div>

              <div class="w-px h-3 bg-gray-100 dark:bg-white/5 mx-1"></div>

              <button @click.stop="emit('toggle-pin')" class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95" :class="column.isPinned ? 'text-primary-500' : 'text-gray-300'">
                <component :is="column.isPinned ? Pin : PinOff" class="w-3.5 h-3.5" />
              </button>
          </div>
      </div>

      <!-- BLUEPRINT: SIMPLE DOT (Collapsed Anchor) -->
      <div 
        class="absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none"
        :class="isCollapsed ? 'opacity-100 group-hover/col:opacity-0' : 'opacity-0'"
      >
           <div 
             class="w-1.5 h-1.5 rounded-full transition-all duration-300"
             :class="column.selectedId ? 'bg-primary-500 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-200 dark:bg-gray-800'"
           ></div>
      </div>
    </div>
    
    <!-- [TD] - THE IDENTITY RAIL (Body) -->
    <div class="flex-1 relative overflow-hidden">
        <!-- BLUEPRINT: TOPMOST AXIAL ALIGNMENT (Collapsed Rail) -->
        <div 
          class="absolute inset-0 flex flex-col items-center pt-4 transition-all duration-300 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
          :class="isCollapsed ? 'opacity-100 scale-100 group-hover/col:opacity-0 group-hover/col:scale-95' : 'opacity-0 pointer-events-none'"
          @click.stop="emit('unstack', column.level)"
        >
           <!-- 1. Active Icon (Naked) -->
           <div class="text-primary-500 shrink-0 h-4 flex items-center justify-center mb-3">
               <component :is="activeIcon || Folder" class="w-4 h-4" />
           </div>

           <!-- 2. Vertical Text Label -->
           <div class="flex-1 w-full flex flex-col items-center overflow-hidden">
               <span 
                  class="vertical-label whitespace-nowrap uppercase text-[9px] font-black tracking-[0.2em] text-gray-400/60 select-none rotate-180 origin-center transition-colors group-hover:text-primary-500"
               >
                  {{ column.title }}
               </span>
           </div>
           
           <div class="absolute inset-x-0 bottom-8 flex justify-center opacity-0 group-hover/col:opacity-100 transition-opacity">
               <ArrowRightToLine class="w-4 h-4 text-primary-500/40" />
           </div>
        </div>

        <!-- Expanded Body -->
        <div 
           class="h-full w-full transition-all duration-300 overflow-hidden"
           :class="isCollapsed ? 'opacity-0 translate-x-4 pointer-events-none group-hover/col:opacity-100 group-hover/col:translate-x-0 group-hover/col:pointer-events-auto' : 'opacity-100 translate-x-0'"
        >
          <!-- Shimmer Axis (Loading state) -->
          <div v-if="column.isLoading" class="absolute inset-0 flex flex-col items-center pt-10 pointer-events-none">
             <div class="w-px h-full bg-gradient-to-b from-primary-500/20 via-primary-500/5 to-transparent animate-pulse"></div>
          </div>
          
          <slot name="body"></slot>
        </div>
    </div>
  </div>
</template>

<style scoped>
.cubic-bezier {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.vertical-label {
    writing-mode: vertical-rl;
}
</style>
