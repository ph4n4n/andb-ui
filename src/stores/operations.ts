import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectsStore } from './projects'

export interface Operation {
  id: string
  projectId: string // Isolation link
  type: 'compare' | 'migrate' | 'export' | 'import' | 'test'
  sourceEnv?: string
  targetEnv?: string
  connectionId?: string
  status: 'pending' | 'running' | 'success' | 'failed'
  startTime: Date
  endTime?: Date
  duration?: number // in milliseconds
  ddlCount?: number
  tableCount?: number
  errorMessage?: string
  metadata?: Record<string, any>
}

export const useOperationsStore = defineStore('operations', () => {
  // State
  const operations = ref<Operation[]>([])

  // Helper for filtered data
  const filteredOperations = computed(() => {
    const projectsStore = useProjectsStore()
    const projectId = projectsStore.selectedProjectId
    if (!projectId) return []
    return operations.value.filter(op => op.projectId === projectId)
  })

  // Computed (Isolated)
  const totalOperations = computed(() => filteredOperations.value.length)

  const operationsByType = computed(() => {
    return filteredOperations.value.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })

  const successfulOperations = computed(() =>
    filteredOperations.value.filter(op => op.status === 'success').length
  )

  const failedOperations = computed(() =>
    filteredOperations.value.filter(op => op.status === 'failed').length
  )

  const totalDDLCount = computed(() =>
    filteredOperations.value.reduce((sum, op) => sum + (op.ddlCount || 0), 0)
  )

  const averageDuration = computed(() => {
    const completedOps = filteredOperations.value.filter(op => op.duration)
    if (completedOps.length === 0) return 0
    const total = completedOps.reduce((sum, op) => sum + (op.duration || 0), 0)
    return Math.round(total / completedOps.length)
  })

  const recentOperations = computed(() =>
    [...filteredOperations.value]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10)
  )

  const operationsToday = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return filteredOperations.value.filter(op => new Date(op.startTime) >= today).length
  })

  const ddlByConnection = computed(() => {
    const result: Record<string, number> = {}
    filteredOperations.value.forEach(op => {
      if (op.connectionId && op.ddlCount) {
        result[op.connectionId] = (result[op.connectionId] || 0) + op.ddlCount
      }
    })
    return result
  })

  const migratesByPair = computed(() => {
    const result: Record<string, { count: number; totalDuration: number; avgDuration: number }> = {}
    filteredOperations.value
      .filter(op => op.type === 'migrate' && op.sourceEnv && op.targetEnv)
      .forEach(op => {
        const key = `${op.sourceEnv}->${op.targetEnv}`
        if (!result[key]) {
          result[key] = { count: 0, totalDuration: 0, avgDuration: 0 }
        }
        result[key].count++
        if (op.duration) {
          result[key].totalDuration += op.duration
        }
      })

    // Calculate averages
    Object.keys(result).forEach(key => {
      if (result[key].count > 0) {
        result[key].avgDuration = Math.round(result[key].totalDuration / result[key].count)
      }
    })

    return result
  })

  // Actions
  const addOperation = (operation: Omit<Operation, 'id' | 'projectId'>) => {
    const projectsStore = useProjectsStore()
    const newOp: Operation = {
      ...operation,
      id: Date.now().toString(),
      projectId: projectsStore.selectedProjectId || 'default'
    }
    operations.value.push(newOp)
    saveToStorage()
    return newOp.id
  }

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    const index = operations.value.findIndex(op => op.id === id)
    if (index !== -1) {
      operations.value[index] = { ...operations.value[index], ...updates }

      // Calculate duration if endTime is set
      if (updates.endTime && operations.value[index].startTime) {
        operations.value[index].duration =
          new Date(updates.endTime).getTime() - new Date(operations.value[index].startTime).getTime()
      }

      saveToStorage()
    }
  }

  const completeOperation = (id: string, success: boolean, metadata?: Record<string, any>) => {
    updateOperation(id, {
      status: success ? 'success' : 'failed',
      endTime: new Date(),
      metadata
    })
  }

  const clearOperations = () => {
    const projectsStore = useProjectsStore()
    const projectId = projectsStore.selectedProjectId
    // Isolated clear: only clear current project's operations
    operations.value = operations.value.filter(op => op.projectId !== projectId)
    saveToStorage()
  }

  const clearOldOperations = (daysToKeep: number = 30) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    operations.value = operations.value.filter(op => new Date(op.startTime) >= cutoffDate)
    saveToStorage()
  }

  // Storage
  const saveToStorage = async () => {
    if ((window as any).electronAPI?.storage) {
      // Use JSON serialize/deserialize to ensure we send a clean, cloneable object to IPC
      const plainOperations = JSON.parse(JSON.stringify(operations.value))
      await (window as any).electronAPI.storage.set('operations', plainOperations)
    }
  }

  const loadFromStorage = async () => {
    if ((window as any).electronAPI?.storage) {
      const stored = await (window as any).electronAPI.storage.get('operations')
      if (stored && Array.isArray(stored)) {
        operations.value = stored.map(op => ({
          ...op,
          startTime: new Date(op.startTime),
          endTime: op.endTime ? new Date(op.endTime) : undefined
        }))
      }
    }
  }

  // Initialize
  loadFromStorage()

  return {
    // State
    operations,
    filteredOperations,

    // Computed
    totalOperations,
    operationsByType,
    successfulOperations,
    failedOperations,
    totalDDLCount,
    averageDuration,
    recentOperations,
    operationsToday,
    ddlByConnection,
    migratesByPair,

    // Actions
    addOperation,
    updateOperation,
    completeOperation,
    clearOperations,
    clearOldOperations,
    loadOperations: loadFromStorage
  }
})
