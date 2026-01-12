<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { type MillerNode } from './types'

interface Props {
  node: MillerNode
  level: number
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0
})

const emit = defineEmits<{
  (e: 'select', node: MillerNode, level: number, skipFetch?: boolean): void
}>()

const isSelected = computed(() => props.node.selected)
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isExpanded = computed(() => props.node.expanded)

const virtualLevel = computed(() => props.node.stackedColumnLevel !== undefined ? props.node.stackedColumnLevel : props.level)

const handleClick = () => {
  if (hasChildren.value) {
    props.node.expanded = true
    // inform store about selection
    emit('select', props.node, virtualLevel.value, true)
    return
  }
  emit('select', props.node, virtualLevel.value, false)
}
</script>

<template>
  <div class="flex flex-col w-full">
    <!-- Node Host -->
    <div 
      @click="handleClick"
      class="group flex items-center px-4 py-2 cursor-pointer transition-all duration-200 relative"
      :class="[
        isSelected ? 'bg-primary-500/5 text-primary-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
      ]"
      :style="{ paddingLeft: `${(depth * 12) + 16}px` }"
    >
      <!-- Selection Indicator -->
      <div 
        v-if="isSelected && depth === 0" 
        class="absolute left-0 top-2 bottom-2 w-0.5 bg-primary-500 rounded-r-full"
      ></div>

      <!-- Icon -->
      <div v-if="node.icon" class="mr-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        <component :is="node.icon" class="w-4 h-4" />
      </div>

      <!-- Label -->
      <span 
        class="text-[11px] font-medium truncate flex-1"
        :class="isSelected ? 'font-bold' : ''"
      >
        {{ node.name }}
      </span>

      <!-- Actions -->
      <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-1">
          <slot name="actions" :node="node"></slot>
      </div>

      <!-- Expand/Link Indicator -->
      <div v-if="hasChildren || !node.isTerminal" class="ml-2 opacity-30">
        <component :is="isExpanded ? ChevronDown : ChevronRight" class="w-3.5 h-3.5" />
      </div>
    </div>

    <!-- Recursive Stack Children -->
    <div 
      v-if="hasChildren && isExpanded"
      class="flex flex-col overflow-hidden"
    >
        <TreeNode 
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :level="virtualLevel"
          :depth="depth + 1"
          @select="(n, l, s) => emit('select', n, l, s)"
        />
    </div>
  </div>
</template>

<style scoped>
.group:active {
  transform: scale(0.98);
}
</style>
