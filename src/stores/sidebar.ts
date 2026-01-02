import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const refreshKey = ref(0)
  const comparisonResults = ref<any[]>([])

  function triggerRefresh() {
    refreshKey.value++
  }

  function setComparisonResults(results: any[]) {
    comparisonResults.value = results
  }

  function clearComparisonResults() {
    comparisonResults.value = []
  }

  return {
    refreshKey,
    comparisonResults,
    triggerRefresh,
    setComparisonResults,
    clearComparisonResults
  }
})
