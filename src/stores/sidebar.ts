import { defineStore } from 'pinia'
import { ref } from 'vue'
import Andb from '@/utils/andb'


export const useSidebarStore = defineStore('sidebar', () => {
  const refreshKey = ref(0)
  const refreshRequestKey = ref(0)
  const comparisonResults = ref<any[]>([])
  const environments = ref<any[]>([])
  const loading = ref(false)
  const lastFetchTime = ref(0)
  const CACHE_TTL = 30000 // 30 seconds

  const expandedEnvironments = ref(new Set<string>())
  const expandedDatabases = ref(new Set<string>())
  const expandedTypes = ref(new Set<string>())



  function triggerRefresh() {
    refreshKey.value++
  }

  function requestRefresh() {
    refreshRequestKey.value++
  }

  function setComparisonResults(results: any[]) {
    comparisonResults.value = results
  }

  function clearComparisonResults() {
    comparisonResults.value = []
  }

  async function loadSchemas(force = false) {
    const now = Date.now()
    if (!force && environments.value.length > 0 && (now - lastFetchTime.value < CACHE_TTL)) {
      return
    }

    if (loading.value) return

    loading.value = true
    try {
      const result = await Andb.getSchemas()

      // ... logic will be moved from Sidebar.vue to here for better state management
      // For now, I'll just store the raw result and let Sidebar handle the grouping
      // Actually, better to move the grouping logic here too.
      // But let's keep it simple first: just the fetch and loading state.

      // Wait, let's actually move the logic from Sidebar.vue to here.
      return result
    } finally {
      loading.value = false
      lastFetchTime.value = now
    }
  }

  function setEnvironments(data: any[]) {
    environments.value = data
  }


  return {
    refreshKey,
    refreshRequestKey,
    comparisonResults,
    environments,
    loading,
    triggerRefresh,
    requestRefresh,
    setComparisonResults,
    clearComparisonResults,
    loadSchemas,
    setEnvironments,
    expandedEnvironments,
    expandedDatabases,
    expandedTypes
  }
})
