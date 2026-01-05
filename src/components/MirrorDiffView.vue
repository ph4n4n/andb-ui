<template>
  <div class="mirror-diff-view flex h-full min-w-0 max-w-full overflow-hidden bg-white dark:bg-gray-900 group/view border-t border-gray-200 dark:border-gray-800 relative" :style="{ fontFamily: appStore.fontFamilies.code, fontSize: appStore.fontSizes.code + 'px' }">
    <!-- SPLIT VIEW MODE -->
    <template v-if="viewType === 'split'">
      <!-- Source Pane (Left) -->
      <div 
        ref="sourcePane" 
        :style="{ width: leftPaneWidth + '%' }"
        @scroll="handleScroll('source')"
        class="shrink-0 flex flex-col min-w-0 max-w-full overflow-hidden border-r border-gray-200 dark:border-[#30363d] relative"
      >
        <div class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 min-h-[37px]">
          <span class="font-bold text-primary-600 dark:text-primary-400 opacity-80 uppercase tracking-widest text-[10px]">{{ $t('compare.diffView.source', { label: sourceLabel }) }}</span>
          <span v-if="isEmptySource" class="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800/50 font-bold uppercase">{{ $t('compare.diffView.deleted') }}</span>
        </div>
        
        <div class="flex-1 overflow-auto custom-scrollbar-diff relative bg-gray-50 dark:bg-gray-900/10">
          <div v-if="isEmptySource" class="placeholder-empty flex items-center justify-center h-full text-gray-600 italic">
            {{ $t('compare.diffView.sourceEmpty') }}
          </div>
          <div v-else class="ddl-container py-2" :class="wrapLines ? 'w-full' : 'w-fit min-w-full'">
            <div 
              v-for="(row, idx) in alignedRows" 
              :key="'src-' + idx"
              class="flex line-row group"
              :class="getLineClass(row.source.type)"
            >
              <div class="line-number w-12 shrink-0 text-right px-2 py-0.5 text-gray-400 dark:text-gray-600 select-none border-r border-gray-100 dark:border-[#30363d] group-hover:text-gray-600 dark:group-hover:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
                {{ row.source.line || '' }}
              </div>
              <div class="line-marker w-5 shrink-0 flex items-center justify-center opacity-70 select-none font-bold">
                {{ row.source.type === 'added' ? '+' : '' }}
              </div>
              <div 
                class="line-content px-2 py-0.5 grow ddl-code"
                :class="wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'"
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
        class="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden relative"
        @scroll="handleScroll('target')"
      >
        <div class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 min-h-[37px]">
          <span class="font-bold text-emerald-600 dark:text-emerald-400 opacity-80 uppercase tracking-widest text-[10px]">{{ $t('compare.diffView.target', { label: targetLabel }) }}</span>
          
          <div class="flex items-center gap-3">
            <span v-if="isEmptyTarget" class="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 font-bold uppercase">{{ $t('compare.diffView.new') }}</span>
            
            <!-- Settings inside header for perfect alignment -->
            <div class="relative" ref="settingsRef">
              <button 
                @click="showSettings = !showSettings"
                class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                :class="{ 'text-primary-500 bg-gray-200 dark:bg-gray-700': showSettings }"
              >
                <Settings class="w-3.5 h-3.5" />
              </button>

              <!-- Dropdown -->
              <div v-if="showSettings" class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 text-xs text-gray-600 dark:text-gray-300 pointer-events-auto">
                <h3 class="font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-widest text-[10px]">{{ $t('compare.diffView.settings') }}</h3>
                
                <div class="space-y-4 text-left">
                  <!-- Whitespace -->
                  <div>
                    <h4 class="font-bold text-gray-500 uppercase text-[9px] mb-2">{{ $t('compare.diffView.whitespace') }}</h4>
                    <label class="flex items-start cursor-pointer group">
                      <div class="relative flex items-center mt-0.5">
                        <input type="checkbox" v-model="hideWhitespace" class="sr-only" />
                        <div class="w-4 h-4 border rounded border-gray-300 dark:border-gray-600 group-hover:border-primary-500 transition-colors flex items-center justify-center font-bold" :class="{ 'bg-primary-500 border-primary-500': hideWhitespace }">
                          <Check v-show="hideWhitespace" class="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div class="ml-2">
                        <div class="text-gray-900 dark:text-white font-medium">{{ $t('compare.diffView.hideWhitespace') }}</div>
                        <div class="text-[10px] text-gray-400 mt-0.5 leading-tight">{{ $t('compare.diffView.hideWhitespaceDesc') }}</div>
                      </div>
                    </label>
                  </div>

                  <!-- Line Wrapping -->
                  <div>
                    <h4 class="font-bold text-gray-500 uppercase text-[9px] mb-2">{{ $t('compare.diffView.display') }}</h4>
                    <label class="flex items-start cursor-pointer group">
                      <div class="relative flex items-center mt-0.5">
                        <input type="checkbox" v-model="wrapLines" class="sr-only" />
                        <div class="w-4 h-4 border rounded border-gray-300 dark:border-gray-600 group-hover:border-primary-500 transition-colors flex items-center justify-center font-bold" :class="{ 'bg-primary-500 border-primary-500': wrapLines }">
                          <Check v-show="wrapLines" class="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div class="ml-2">
                        <div class="text-gray-900 dark:text-white font-medium">{{ $t('compare.diffView.wrapLines') }}</div>
                      </div>
                    </label>
                  </div>

                  <!-- Diff display -->
                  <div>
                    <h4 class="font-bold text-gray-500 uppercase text-[9px] mb-2">{{ $t('compare.diffView.diffDisplay') }}</h4>
                    <div class="space-y-2">
                      <label v-for="mode in ['Unified', 'Split']" :key="mode" class="flex items-center cursor-pointer group">
                        <input type="radio" :value="mode.toLowerCase()" v-model="viewType" class="sr-only" />
                        <div class="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 group-hover:border-primary-500 transition-colors flex items-center justify-center p-1" :class="{ 'border-primary-500': viewType === mode.toLowerCase() }">
                          <div v-show="viewType === mode.toLowerCase()" class="w-2 h-2 rounded-full bg-primary-500"></div>
                        </div>
                        <span class="ml-2 text-gray-900 dark:text-white font-medium">{{ $t('compare.diffView.' + mode.toLowerCase() + 'Mode') }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto custom-scrollbar-diff relative bg-gray-50 dark:bg-gray-900/10">
          <div v-if="isEmptyTarget" class="placeholder-empty flex items-center justify-center h-full text-gray-600 italic">
            {{ $t('compare.diffView.targetEmpty') }}
          </div>
          <div v-else class="ddl-container py-2" :class="wrapLines ? 'w-full' : 'w-fit min-w-full'">
            <div 
              v-for="(row, idx) in alignedRows" 
              :key="'tgt-' + idx"
              class="flex line-row group"
              :class="getLineClass(row.target.type)"
            >
              <div class="line-number w-12 shrink-0 text-right px-2 py-0.5 text-gray-400 dark:text-gray-600 select-none border-r border-gray-100 dark:border-[#30363d] group-hover:text-gray-600 dark:group-hover:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
                {{ row.target.line || '' }}
              </div>
              <div class="line-marker w-5 shrink-0 flex items-center justify-center opacity-70 select-none font-bold">
                {{ row.target.type === 'removed' ? '-' : '' }}
              </div>
              <div 
                class="line-content px-2 py-0.5 grow ddl-code"
                :class="wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'"
                v-html="row.target.highlighted || row.target.content"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- UNIFIED VIEW MODE -->
    <div 
      v-else
      class="flex-1 flex flex-col overflow-hidden"
    >
      <div class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 min-h-[37px]">
        <span class="font-bold text-primary-600 dark:text-primary-400 opacity-80 uppercase tracking-widest text-[10px]">{{ $t('compare.diffView.unified', { source: sourceLabel, target: targetLabel }) }}</span>
        
        <!-- Settings inside header -->
        <div class="relative" ref="settingsRefUnified">
          <button 
            @click="showSettings = !showSettings"
            class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            :class="{ 'text-primary-500 bg-gray-200 dark:bg-gray-700': showSettings }"
          >
            <Settings class="w-3.5 h-3.5" />
          </button>

          <!-- Dropdown (same logic as above) -->
          <div v-if="showSettings" class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 text-xs text-gray-600 dark:text-gray-300 pointer-events-auto">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-widest text-[10px]">{{ $t('compare.diffView.settings') }}</h3>
            <div class="space-y-4 text-left">
              <div>
                <h4 class="font-bold text-gray-500 uppercase text-[9px] mb-2">{{ $t('compare.diffView.whitespace') }}</h4>
                <label class="flex items-start cursor-pointer group">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="hideWhitespace" class="sr-only" />
                    <div class="w-4 h-4 border rounded border-gray-300 dark:border-gray-600 group-hover:border-primary-500 transition-colors flex items-center justify-center font-bold" :class="{ 'bg-primary-500 border-primary-500': hideWhitespace }">
                      <Check v-show="hideWhitespace" class="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div class="ml-2">
                    <div class="text-gray-900 dark:text-white font-medium">{{ $t('compare.diffView.hideWhitespace') }}</div>
                    <div class="text-[10px] text-gray-400 mt-0.5 leading-tight">{{ $t('compare.diffView.hideWhitespaceDesc') }}</div>
                  </div>
                </label>
              </div>

              <!-- Line Wrapping -->
              <div>
                <h4 class="font-bold text-gray-500 uppercase text-[9px] mb-2">{{ $t('compare.diffView.display') }}</h4>
                <label class="flex items-start cursor-pointer group">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="wrapLines" class="sr-only" />
                    <div class="w-4 h-4 border rounded border-gray-300 dark:border-gray-600 group-hover:border-primary-500 transition-colors flex items-center justify-center font-bold" :class="{ 'bg-primary-500 border-primary-500': wrapLines }">
                      <Check v-show="wrapLines" class="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div class="ml-2">
                    <div class="text-gray-900 dark:text-white font-medium">{{ $t('compare.diffView.wrapLines') }}</div>
                  </div>
                </label>
              </div>

              <div>
                <h4 class="font-bold text-gray-500 uppercase text-[9px] mb-2">{{ $t('compare.diffView.diffDisplay') }}</h4>
                <div class="space-y-2">
                  <label v-for="mode in ['Unified', 'Split']" :key="mode" class="flex items-center cursor-pointer group">
                    <input type="radio" :value="mode.toLowerCase()" v-model="viewType" class="sr-only" />
                    <div class="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 group-hover:border-primary-500 transition-colors flex items-center justify-center p-1" :class="{ 'border-primary-500': viewType === mode.toLowerCase() }">
                      <div v-show="viewType === mode.toLowerCase()" class="w-2 h-2 rounded-full bg-primary-500"></div>
                    </div>
                    <span class="ml-2 text-gray-900 dark:text-white font-medium">{{ $t('compare.diffView.' + mode.toLowerCase() + 'Mode') }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar-diff relative ddl-container py-2">
          <div 
            v-for="(row, index) in unifiedRows" 
            :key="index"
            class="flex line-row group"
            :class="getLineClass(row.type)"
          >
            <div class="line-numbers w-24 shrink-0 flex border-r border-gray-100 dark:border-[#30363d] select-none text-[10px]">
              <div class="w-12 text-right px-2 py-0.5 text-gray-400 dark:text-gray-600 border-r border-gray-50 dark:border-gray-800/50">
                {{ row.sourceLine || '' }}
              </div>
              <div class="w-12 text-right px-2 py-0.5 text-gray-400 dark:text-gray-600">
                {{ row.targetLine || '' }}
              </div>
            </div>
            <div class="line-marker w-5 shrink-0 flex items-center justify-center opacity-70 select-none font-bold">
              {{ row.type === 'added' ? '+' : (row.type === 'removed' ? '-' : '') }}
            </div>
            <div 
              class="line-content px-2 py-0.5 grow ddl-code"
              :class="wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'"
              v-html="row.highlighted || row.content"
            ></div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import { Settings, Check } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

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

const showSettings = ref(false)
const settingsRef = ref<HTMLElement | null>(null)
const settingsRefUnified = ref<HTMLElement | null>(null)
const viewType = ref<'split' | 'unified'>('split')
const hideWhitespace = ref(false)
const wrapLines = ref(false)

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

const unifiedRows = computed(() => {
  const result: any[] = []
  
  alignedRows.value.forEach(row => {
    if (row.source.type === 'equal' && row.target.type === 'equal') {
      result.push({
        sourceLine: row.source.line,
        targetLine: row.target.line,
        content: row.source.content,
        highlighted: row.source.highlighted,
        type: 'equal'
      })
    } else {
      // In unified mode, show removed lines then added lines
      if (row.source.type !== 'empty') {
        result.push({
          sourceLine: row.source.line,
          targetLine: null,
          content: row.source.content,
          highlighted: row.source.highlighted,
          type: row.source.type === 'equal' ? 'equal' : 'added' // Wait, using source as + is weird but consistent with current component
        })
      }
      if (row.target.type !== 'empty') {
        result.push({
          sourceLine: null,
          targetLine: row.target.line,
          content: row.target.content,
          highlighted: row.target.highlighted,
          type: row.target.type === 'equal' ? 'equal' : 'removed'
        })
      }
    }
  })
  
  return result
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
  const compare = (l1: string, l2: string) => {
    if (hideWhitespace.value) {
      return l1.trim() === l2.trim()
    }
    return l1 === l2
  }

  const matrix: number[][] = Array(oldLines.length + 1).fill(0).map(() => Array(newLines.length + 1).fill(0))
  
  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (compare(oldLines[i - 1], newLines[j - 1])) {
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
    if (i > 0 && j > 0 && compare(oldLines[i - 1], newLines[j - 1])) {
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

const handleClickOutside = (event: MouseEvent) => {
  const isOutsideSplit = settingsRef.value && !settingsRef.value.contains(event.target as Node)
  const isOutsideUnified = settingsRefUnified.value && !settingsRefUnified.value.contains(event.target as Node)
  
  if (showSettings.value && isOutsideSplit && isOutsideUnified) {
    showSettings.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Opt + Z (Alt + Z)
  if (e.altKey && e.code === 'KeyZ') {
    e.preventDefault()
    wrapLines.value = !wrapLines.value
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('keydown', handleKeydown)
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
