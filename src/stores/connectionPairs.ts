import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Environment {
  id: string
  name: string
  description: string
  enabled: boolean
  order: number
}

export interface ConnectionPair {
  id: string
  name: string
  sourceEnv: string
  targetEnv: string
  description: string
  isDefault: boolean
  status: 'idle' | 'testing' | 'success' | 'failed'
}

export const useConnectionPairsStore = defineStore('connectionPairs', () => {
  // State
  const environments = ref<Environment[]>([
    { id: '1', name: 'DEV', description: 'Development environment', enabled: true, order: 1 },
    { id: '2', name: 'STAGE', description: 'Staging environment', enabled: true, order: 2 },
    { id: '3', name: 'UAT', description: 'User Acceptance Testing', enabled: true, order: 3 },
    { id: '4', name: 'PROD', description: 'Production environment', enabled: true, order: 4 }
  ])

  const connectionPairs = ref<ConnectionPair[]>([
    {
      id: '1',
      name: 'DEV to STAGE',
      sourceEnv: 'DEV',
      targetEnv: 'STAGE',
      description: 'Development to staging migration',
      isDefault: true,
      status: 'idle'
    },
    {
      id: '2',
      name: 'STAGE to UAT',
      sourceEnv: 'STAGE',
      targetEnv: 'UAT',
      description: 'Staging to UAT testing',
      isDefault: false,
      status: 'idle'
    },
    {
      id: '3',
      name: 'UAT to PROD',
      sourceEnv: 'UAT',
      targetEnv: 'PROD',
      description: 'UAT to production deployment',
      isDefault: false,
      status: 'idle'
    }
  ])

  const selectedPairId = ref('1') // Default to first pair

  // Getters
  const enabledEnvironments = computed(() => {
    return environments.value.filter(env => env.enabled)
  })

  const availablePairs = computed(() => {
    return connectionPairs.value
  })

  const defaultPair = computed(() => {
    return connectionPairs.value.find(pair => pair.isDefault)
  })

  const selectedPair = computed(() => {
    return connectionPairs.value.find(pair => pair.id === selectedPairId.value)
  })

  const getPairsBySource = computed(() => {
    return (sourceEnv: string) => connectionPairs.value.filter(p => p.sourceEnv === sourceEnv)
  })

  const getPairsByTarget = computed(() => {
    return (targetEnv: string) => connectionPairs.value.filter(p => p.targetEnv === targetEnv)
  })

  // Actions
  const setSelectedPair = (pairId: string) => {
    const pair = connectionPairs.value.find(p => p.id === pairId)
    if (pair) {
      selectedPairId.value = pairId
    }
  }

  const addEnvironment = (environment: Omit<Environment, 'id'>) => {
    const newEnv: Environment = {
      ...environment,
      id: Date.now().toString()
    }
    environments.value.push(newEnv)
  }

  const updateEnvironment = (id: string, updates: Partial<Environment>) => {
    const index = environments.value.findIndex(env => env.id === id)
    if (index !== -1) {
      environments.value[index] = { ...environments.value[index], ...updates }
    }
  }

  const removeEnvironment = (id: string) => {
    const env = environments.value.find(e => e.id === id)
    if (env && !['DEV', 'STAGE', 'UAT', 'PROD'].includes(env.name.toUpperCase())) {
      environments.value = environments.value.filter(e => e.id !== id)
    }
  }

  const addConnectionPair = (pair: Omit<ConnectionPair, 'id'>) => {
    const newPair: ConnectionPair = {
      ...pair,
      id: Date.now().toString()
    }
    connectionPairs.value.push(newPair)
  }

  const updateConnectionPair = (id: string, updates: Partial<ConnectionPair>) => {
    const index = connectionPairs.value.findIndex(pair => pair.id === id)
    if (index !== -1) {
      connectionPairs.value[index] = { ...connectionPairs.value[index], ...updates }
    }
  }

  const removeConnectionPair = (id: string) => {
    connectionPairs.value = connectionPairs.value.filter(pair => pair.id !== id)
  }

  const setDefaultPair = (pairId: string) => {
    // Remove default from all other pairs
    connectionPairs.value.forEach(pair => {
      pair.isDefault = false
    })
    
    // Set this pair as default
    const pair = connectionPairs.value.find(p => p.id === pairId)
    if (pair) {
      pair.isDefault = true
      // Auto-select default pair
      selectedPairId.value = pairId
    }
  }

  const testConnectionPair = async (pairId: string) => {
    const pair = connectionPairs.value.find(p => p.id === pairId)
    if (!pair) return

    pair.status = 'testing'
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Random result for demo
      const success = Math.random() > 0.3
      pair.status = success ? 'success' : 'failed'
    } catch (error) {
      pair.status = 'failed'
    }
  }

  const reorderEnvironments = (newOrder: Environment[]) => {
    environments.value = newOrder.map((env, index) => ({
      ...env,
      order: index + 1
    }))
  }

  // Initialize with default pair selected
  const initialize = () => {
    const defaultPair = connectionPairs.value.find(p => p.isDefault)
    if (defaultPair) {
      selectedPairId.value = defaultPair.id
    }
  }

  return {
    // State
    environments,
    connectionPairs,
    selectedPairId,
    
    // Getters
    enabledEnvironments,
    availablePairs,
    defaultPair,
    selectedPair,
    getPairsBySource,
    getPairsByTarget,
    
    // Actions
    setSelectedPair,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    addConnectionPair,
    updateConnectionPair,
    removeConnectionPair,
    setDefaultPair,
    testConnectionPair,
    reorderEnvironments,
    initialize
  }
})
