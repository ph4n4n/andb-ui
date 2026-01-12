<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useMillerStore } from './store'
import BaseMillerColumn from './BaseMillerColumn.vue'
import TreeNode from './TreeNode.vue'
import { type MillerNode, ColumnNode } from './types'

interface Props {
  initialNodes: MillerNode[]
  fetcher: (node: MillerNode) => Promise<MillerNode[]>
  rootTitle?: string
  autoCollapse?: boolean
}

const props = defineProps<Props>()
const millerStore = useMillerStore()

watch(() => props.autoCollapse, (val) => {
  millerStore.setAutoCollapse(!!val)
}, { immediate: true })
const containerRef = ref<HTMLElement | null>(null)

// Initialize the root column
// Keyboard Navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    // Logic for finding next/prev nodes based on current selection
    // This is abstract, so it requires mapping current columns state
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  if (millerStore.columns.length === 0) {
    millerStore.columns.push(new ColumnNode({
      id: 'root',
      level: 0,
      title: props.rootTitle || 'Root',
      items: props.initialNodes,
      isPinned: true
    }));
  }
})

watch(() => props.initialNodes, (newNodes) => {
  const rootCol = millerStore.columns.find(c => c.id === 'root' || c.level === 0);
  if (rootCol) {
    rootCol.items = newNodes;
  } else if (millerStore.columns.length === 0) {
    millerStore.columns.push(new ColumnNode({
      id: 'root',
      level: 0,
      title: props.rootTitle || 'Root',
      items: newNodes,
      isPinned: true
    }));
  }
}, { deep: true })

import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Scroll to end when a new column is added
watch(() => millerStore.columns.length, () => {
  setTimeout(() => {
    if (containerRef.value) {
      containerRef.value.scrollTo({
        left: containerRef.value.scrollWidth,
        behavior: 'smooth'
      })
    }
  }, 100)
})

const emit = defineEmits<{
  (e: 'select', node: MillerNode, level: number, skipFetch?: boolean): void
}>()

const handleSelect = (node: MillerNode, level: number, skipFetch?: boolean) => {
  millerStore.selectNode(node, level, props.fetcher, { skipFetch })
  emit('select', node, level, skipFetch)
}

const togglePin = (col: any) => {
  col.isPinned = !col.isPinned
  if (!col.isPinned) {
    // If unpinned, it might become eligible for auto-collapse
  }
}
</script>

<template>
  <div 
    ref="containerRef"
    class="miller-master-container flex h-full w-full overflow-x-scroll overflow-y-hidden bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-500 pb-2"
  >
    <BaseMillerColumn
      v-for="(col, index) in millerStore.visibleColumns"
      :key="col.id"
      :column="col"
      :index="index"
      :is-collapsed="col.isCollapsed && !col.isPinned"
      @toggle-pin="togglePin(col)"
      @stack="millerStore.stackToLevel"
      @unstack="millerStore.unstackLevel"
      @stack-all="millerStore.stackAll"
      @unstack-all="millerStore.unstackAll"
    >
      <template #header-actions>
        <slot name="header-actions" :column="col"></slot>
      </template>

      <template #body>
         <div class="h-full w-full overflow-y-auto overflow-x-hidden slim-scrollbar py-2">
            <TreeNode 
              v-for="item in col.items"
              :key="item.id"
              :node="item"
              :level="col.level"
              @select="handleSelect"
            >
              <template #actions="{ node }">
                <slot name="node-actions" :node="node" :column="col"></slot>
              </template>
            </TreeNode>
         </div>
      </template>
    </BaseMillerColumn>
  </div>
</template>

<style scoped>
.slim-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.slim-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
.dark .slim-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

/* Master Horizontal Scrollbar */
.miller-master-container::-webkit-scrollbar {
    height: 8px;
    display: block;
}
.miller-master-container::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.02);
    border-top: 1px solid rgba(0,0,0,0.05);
}
.dark .miller-master-container::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.02);
    border-top: 1px solid rgba(255,255,255,0.05);
}
.miller-master-container::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 4px;
    transition: background 0.3s;
}
.dark .miller-master-container::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
}
.miller-master-container:hover::-webkit-scrollbar-thumb {
    background: var(--primary-color, #3b82f6);
    opacity: 0.8;
}
.miller-master-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.1) transparent;
}
</style>
