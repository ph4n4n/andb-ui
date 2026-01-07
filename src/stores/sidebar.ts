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
      return environments.value
    }

    if (loading.value && !force) return environments.value

    loading.value = true
    try {
      const result = await Andb.getSchemas()
      if (result) {
        environments.value = result
        lastFetchTime.value = Date.now()
      }
      return environments.value
    } catch (err) {
      console.error('Failed to load schemas in store:', err)
      return environments.value
    } finally {
      loading.value = false
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
