import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LogEntry {
  message: string
  type: 'info' | 'warn' | 'error' | 'cmd' | 'success'
  timestamp: Date
}

export const useConsoleStore = defineStore('console', () => {
  const logs = ref<LogEntry[]>([])
  const isVisible = ref(false)
  const height = ref(200)

  function addLog(message: string, type: LogEntry['type'] = 'info') {
    logs.value.push({
      message,
      type,
      timestamp: new Date()
    })
  }

  function clearLogs() {
    logs.value = []
  }

  function setVisibility(visible: boolean) {
    isVisible.value = visible
  }

  function toggleVisibility() {
    isVisible.value = !isVisible.value
  }

  function setHeight(newHeight: number) {
    height.value = newHeight
  }

  return {
    logs,
    isVisible,
    height,
    addLog,
    clearLogs,
    setVisibility,
    toggleVisibility,
    setHeight
  }
})
