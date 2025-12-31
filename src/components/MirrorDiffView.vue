<template>
  <div class="mirror-diff-view flex h-full overflow-hidden bg-white dark:bg-gray-900 font-mono text-sm group/view border-t border-gray-200 dark:border-gray-800">
    <!-- Source Pane (Left) -->
    <div 
      ref="sourcePane" 
      :style="{ width: leftPaneWidth + '%' }"
      @scroll="handleScroll('source')"
      class="shrink-0 flex flex-col overflow-hidden border-r border-gray-200 dark:border-[#30363d]"
    >
      <div class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
        <span class="font-bold text-primary-600 dark:text-primary-400 opacity-80 uppercase tracking-widest text-[10px]">SOURCE: {{ sourceLabel }}</span>
        <span v-if="isEmptySource" class="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800/50 font-bold uppercase">Deleted</span>
      </div>
      
      <div class="flex-1 overflow-auto custom-scrollbar-diff relative">
        <div v-if="isEmptySource" class="placeholder-empty flex items-center justify-center h-full text-gray-600 italic">
          [ DELETED OR NOT PRESENT ]
        </div>
        <div v-else class="ddl-container py-2">
          <div 
            v-for="(row, idx) in alignedRows" 
            :key="'src-' + idx"
            class="flex line-row group"
            :class="getLineClass(row.source.type)"
          >
            <div class="line-number w-12 shrink-0 text-right px-2 py-0.5 text-gray-400 dark:text-gray-600 select-none border-r border-gray-100 dark:border-[#30363d] group-hover:text-gray-600 dark:group-hover:text-gray-400">
              {{ row.source.line || '' }}
            </div>
            <div class="line-marker w-5 shrink-0 flex items-center justify-center opacity-70 select-none font-bold">
              {{ row.source.type === 'added' ? '+' : '' }}
            </div>
            <div 
              class="line-content px-2 py-0.5 whitespace-pre min-h-[1.5rem] break-all grow truncate ddl-code"
              v-html="row.source.highlighted || row.source.content"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resize Handle -->
    <div 
      @mousedown="startResize"
      class="resize-handle w-[2px] hover:w-1 hover:bg-primary-500 cursor-col-resize z-20 bg-gray-200 dark:bg-[#30363d] transition-all duration-200"
      :class="{ 'bg-primary-600 w-1': isResizing }"
    ></div>

    <!-- Target Pane (Right) -->
    <div 
      ref="targetPane" 
      class="flex-1 flex flex-col overflow-hidden"
      @scroll="handleScroll('target')"
    >
      <div class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
        <span class="font-bold text-emerald-600 dark:text-emerald-400 opacity-80 uppercase tracking-widest text-[10px]">TARGET: {{ targetLabel }}</span>
        <span v-if="isEmptyTarget" class="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 font-bold uppercase">New</span>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar-diff relative">
        <div v-if="isEmptyTarget" class="placeholder-empty flex items-center justify-center h-full text-gray-600 italic">
          [ NEW DDL HERE ]
        </div>
        <div v-else class="ddl-container py-2">
          <div 
            v-for="(row, idx) in alignedRows" 
            :key="'tgt-' + idx"
            class="flex line-row group"
            :class="getLineClass(row.target.type)"
          >
            <div class="line-number w-12 shrink-0 text-right px-2 py-0.5 text-gray-400 dark:text-gray-600 select-none border-r border-gray-100 dark:border-[#30363d] group-hover:text-gray-600 dark:group-hover:text-gray-400">
              {{ row.target.line || '' }}
            </div>
            <div class="line-marker w-5 shrink-0 flex items-center justify-center opacity-70 select-none font-bold">
              {{ row.target.type === 'removed' ? '-' : '' }}
            </div>
            <div 
              class="line-content px-2 py-0.5 whitespace-pre min-h-[1.5rem] break-all grow truncate ddl-code"
              v-html="row.target.highlighted || row.target.content"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'

const props = defineProps<{
  sourceDdl: string | null
  targetDdl: string | null
  sourceLabel: string
  targetLabel: string
  status: string
}>()

const sourcePane = ref<HTMLElement | null>(null)
const targetPane = ref<HTMLElement | null>(null)
const isSyncing = ref(false)
const leftPaneWidth = ref(50)
const isResizing = ref(false)

const isEmptySource = computed(() => !props.sourceDdl || props.status === 'missing_in_source')
const isEmptyTarget = computed(() => !props.targetDdl || props.status === 'missing_in_target' || props.status === 'missing')

// Aligned Diff Rows
const alignedRows = computed(() => {
  const oldLines = props.sourceDdl ? props.sourceDdl.split('\n') : []
  const newLines = props.targetDdl ? props.targetDdl.split('\n') : []

  if (props.status === 'equal' || props.status === 'same') {
    return oldLines.map((line, i) => ({
      source: { line: i + 1, content: line, highlighted: highlightedSourceLines.value[i], type: 'equal' },
      target: { line: i + 1, content: line, highlighted: highlightedTargetLines.value[i], type: 'equal' }
    }))
  }

  // Need alignment if different
  return computeAlignedDiff(oldLines, newLines)
})

const highlightedSourceLines = computed(() => {
  if (!props.sourceDdl) return []
  return highlightLines(props.sourceDdl)
})

const highlightedTargetLines = computed(() => {
  if (!props.targetDdl) return []
  return highlightLines(props.targetDdl)
})

function highlightLines(ddl: string) {
  // Prism highlight entire block to maintain context (comments, strings)
  const html = Prism.highlight(ddl, Prism.languages.sql, 'sql')
  return html.split('\n')
}

/**
 * Compute aligned diff using a basic LCS alignment strategy
 */
function computeAlignedDiff(oldLines: string[], newLines: string[]) {
  const matrix: number[][] = Array(oldLines.length + 1).fill(0).map(() => Array(newLines.length + 1).fill(0))
  
  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1])
      }
    }
  }
  
  const result: any[] = []
  let i = oldLines.length
  let j = newLines.length
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({
        source: { line: i, content: oldLines[i - 1], highlighted: highlightedSourceLines.value[i-1], type: 'equal' },
        target: { line: j, content: newLines[j - 1], highlighted: highlightedTargetLines.value[j-1], type: 'equal' }
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      result.unshift({
        source: { line: null, content: '', highlighted: '', type: 'empty' },
        target: { line: j, content: newLines[j - 1], highlighted: highlightedTargetLines.value[j-1], type: 'removed' }
      })
      j--
    } else {
      result.unshift({
        source: { line: i, content: oldLines[i - 1], highlighted: highlightedSourceLines.value[i-1], type: 'added' },
        target: { line: null, content: '', highlighted: '', type: 'empty' }
      })
      i--
    }
  }
  
  return result
}

function getLineClass(type: string) {
  switch (type) {
    case 'removed': return 'line-removed'
    case 'added': return 'line-added'
    case 'empty': return 'line-empty'
    default: return ''
  }
}

// Scroll Sync
const handleScroll = (side: 'source' | 'target') => {
  if (isSyncing.value) return
  isSyncing.value = true
  
  const source = sourcePane.value
  const target = targetPane.value
  
  if (source && target) {
    if (side === 'source') {
      target.scrollTop = source.scrollTop
      target.scrollLeft = source.scrollLeft
    } else {
      source.scrollTop = target.scrollTop
      source.scrollLeft = target.scrollLeft
    }
  }
  
  setTimeout(() => { isSyncing.value = false }, 20)
}

// Resizing logic
const startResize = () => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const viewRect = document.querySelector('.mirror-diff-view')?.getBoundingClientRect()
  if (viewRect) {
    const relativeX = e.clientX - viewRect.left
    const percentage = (relativeX / viewRect.width) * 100
    leftPaneWidth.value = Math.max(10, Math.min(90, percentage))
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
}

// Reset scroll on content change
watch(() => props.sourceDdl, () => {
  if (sourcePane.value) sourcePane.value.scrollTop = 0
  if (targetPane.value) targetPane.value.scrollTop = 0
})

onUnmounted(() => {
  stopResize()
})
</script>

<style scoped>
.ddl-code {
  color: #3b3b3b; /* VS Code Light text */
}
.dark .ddl-code {
  color: #d4d4d4; /* VS Code Dark text */
}

/* Navicat-inspired Dark SQL Syntax (Muted & Balanced) */
.dark :deep(.token.keyword) { color: #569cd6; font-weight: 500; }
.dark :deep(.token.string) { color: #ce9178; }
.dark :deep(.token.comment) { color: #6a9955; font-style: italic; opacity: 0.8; }
.dark :deep(.token.function) { color: #dcdcaa; }
.dark :deep(.token.number) { color: #b5cea8; }
.dark :deep(.token.operator) { color: #d4d4d4; }
.dark :deep(.token.punctuation) { color: #808080; }
.dark :deep(.token.boolean) { color: #569cd6; }
.dark :deep(.token.property) { color: #9cdcfe; }
.dark :deep(.token.comment *) { color: inherit !important; }

/* Navicat-inspired Light SQL Syntax */
:deep(.token.keyword) { color: #0000ff; font-weight: 500; }
:deep(.token.string) { color: #a31515; }
:deep(.token.comment) { color: #008000; font-style: italic; opacity: 0.7; }
:deep(.token.function) { color: #795e26; }
:deep(.token.number) { color: #098658; }
:deep(.token.operator) { color: #000000; }
:deep(.token.punctuation) { color: #000000; }
:deep(.token.boolean) { color: #0000ff; }
:deep(.token.property) { color: #001080; }

.line-row {
  transition: background 0.1s ease;
}

.line-removed {
  background-color: rgba(248, 81, 73, 0.08);
}
.line-removed .line-marker {
  color: #cf222e;
  opacity: 0.8;
}
.dark .line-removed {
  background-color: rgba(248, 81, 73, 0.12);
}
.dark .line-removed .line-marker {
  color: #f85149;
}

.line-added {
  background-color: rgba(63, 185, 80, 0.08);
}
.line-added .line-marker {
  color: #1a7f37;
  opacity: 0.8;
}
.dark .line-added {
  background-color: rgba(63, 185, 80, 0.12);
}
.dark .line-added .line-marker {
  color: #3fb950;
}

.line-empty {
  background-color: transparent;
  opacity: 0.15;
  background-image: linear-gradient(45deg, #e1e4e8 25%, transparent 25%, transparent 50%, #e1e4e8 50%, #e1e4e8 75%, transparent 75%, transparent);
  background-size: 10px 10px;
}
.dark .line-empty {
  background-color: #0d1117;
  background-image: linear-gradient(45deg, #1d2127 25%, transparent 25%, transparent 50%, #1d2127 50%, #1d2127 75%, transparent 75%, transparent);
}

.placeholder-empty {
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.01) 20px);
}

.custom-scrollbar-diff::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar-diff::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-diff::-webkit-scrollbar-thumb {
  background: rgba(48, 54, 61, 0.5);
  border-radius: 10px;
}

.custom-scrollbar-diff:hover::-webkit-scrollbar-thumb {
  background: rgba(139, 148, 158, 0.4);
}
</style>
