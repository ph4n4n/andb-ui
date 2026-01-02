<template>
  <div class="flex flex-col h-full bg-white dark:bg-black text-gray-800 dark:text-gray-300 font-mono text-xs rounded-none overflow-hidden border-t border-gray-200 dark:border-gray-700 shadow-inner">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <Terminal class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        <span class="font-semibold text-gray-700 dark:text-gray-200">Execution Log</span>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('clear')" 
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Clear logs"
        >
          <Eraser class="w-3.5 h-3.5" />
        </button>
        <button 
          @click="autoScroll = !autoScroll" 
          class="p-1 rounded transition-colors"
          :class="autoScroll ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
          title="Auto-scroll"
        >
          <ArrowDownCircle class="w-3.5 h-3.5" />
        </button>
        <button 
          @click="$emit('close')" 
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-1"
          title="Close Console"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Logs Area -->
    <div 
      ref="logsContainer"
      class="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar scroll-smooth"
    >
      <div v-if="logs.length === 0" class="text-gray-400 dark:text-gray-600 italic select-none">
        Waiting for commands...
      </div>
      <div 
        v-for="(log, index) in logs" 
        :key="index" 
        class="break-words leading-relaxed"
        :class="{
          'text-gray-700 dark:text-gray-300': log.type === 'info',
          'text-yellow-600 dark:text-yellow-400': log.type === 'warn',
          'text-red-600 dark:text-red-400': log.type === 'error',
          'text-blue-600 dark:text-blue-400 font-bold': log.type === 'cmd',
          'text-green-600 dark:text-green-400': log.type === 'success'
        }"
      >
        <span class="opacity-50 mr-2 text-[10px] select-none">[{{ formatTime(log.timestamp) }}]</span>
        <span v-if="log.type === 'cmd'" class="text-primary-600 dark:text-primary-400 opacity-70 select-none">$ </span>
        <span>{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { Terminal, Eraser, ArrowDownCircle, X } from 'lucide-vue-next'

export interface LogEntry {
  message: string
  type: 'info' | 'warn' | 'error' | 'cmd' | 'success'
  timestamp: Date
}

const props = defineProps<{
  logs: LogEntry[]
}>()

const emit = defineEmits<{
  clear: []
  close: []
}>()

const logsContainer = ref<HTMLElement | null>(null)
const autoScroll = ref(true)

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  })
}

const scrollToBottom = () => {
  if (autoScroll.value && logsContainer.value) {
    logsContainer.value.scrollTop = logsContainer.value.scrollHeight
  }
}

watch(() => props.logs.length, () => {
  nextTick(scrollToBottom)
})

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
@media (prefers-color-scheme: dark) {
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.4);
  }
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.8);
}
@media (prefers-color-scheme: dark) {
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(75, 85, 99, 0.6);
  }
}
</style>
