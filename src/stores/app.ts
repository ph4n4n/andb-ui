import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DatabaseConnection {
  id: string
  name: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  status: 'connected' | 'testing' | 'failed'
  environment: 'DEV' | 'STAGE' | 'PROD'
}

export interface ConnectionPair {
  source: DatabaseConnection | null
  target: DatabaseConnection | null
}

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const connections = ref<DatabaseConnection[]>([
    {
      id: '1',
      name: 'DEV1',
      host: 'localhost',
      port: 3306,
      database: 'dev_db',
      username: 'dev_user',
      status: 'connected',
      environment: 'DEV'
    },
    {
      id: '2',
      name: 'DEV2',
      host: 'dev2-server',
      port: 3306,
      database: 'dev2_db',
      username: 'dev2_user',
      status: 'connected',
      environment: 'DEV'
    },
    {
      id: '3',
      name: 'STAGE',
      host: 'stage-server',
      port: 3306,
      database: 'stage_db',
      username: 'stage_user',
      status: 'testing',
      environment: 'STAGE'
    },
    {
      id: '4',
      name: 'PROD',
      host: 'prod-server',
      port: 3306,
      database: 'prod_db',
      username: 'prod_user',
      status: 'failed',
      environment: 'PROD'
    }
  ])

  const currentPair = ref<ConnectionPair>({
    source: null,
    target: null
  })

  // Getters
  const getConnectionById = computed(() => {
    return (id: string) => connections.value.find(conn => conn.id === id)
  })

  const getConnectionsByEnvironment = computed(() => {
    return (env: string) => connections.value.filter(conn => conn.environment === env)
  })

  const isPairValid = computed(() => {
    return currentPair.value.source && currentPair.value.target
  })

  // Actions
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setConnectionPair = (sourceId: string, targetId: string) => {
    const source = getConnectionById.value(sourceId)
    const target = getConnectionById.value(targetId)
    
    if (source && target) {
      currentPair.value = { source, target }
    }
  }

  const addConnection = (connection: Omit<DatabaseConnection, 'id'>) => {
    const newConnection: DatabaseConnection = {
      ...connection,
      id: Date.now().toString()
    }
    connections.value.push(newConnection)
  }

  const updateConnection = (id: string, updates: Partial<DatabaseConnection>) => {
    const index = connections.value.findIndex(conn => conn.id === id)
    if (index !== -1) {
      connections.value[index] = { ...connections.value[index], ...updates }
    }
  }

  const removeConnection = (id: string) => {
    connections.value = connections.value.filter(conn => conn.id !== id)
  }

  const testConnection = async (id: string) => {
    const connection = getConnectionById.value(id)
    if (!connection) return

    // Update status to testing
    updateConnection(id, { status: 'testing' })

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Random result for demo
      const success = Math.random() > 0.3
      updateConnection(id, { 
        status: success ? 'connected' : 'failed' 
      })
    } catch (error) {
      updateConnection(id, { status: 'failed' })
    }
  }

  return {
    // State
    sidebarCollapsed,
    connections,
    currentPair,
    
    // Getters
    getConnectionById,
    getConnectionsByEnvironment,
    isPairValid,
    
    // Actions
    toggleSidebar,
    setConnectionPair,
    addConnection,
    updateConnection,
    removeConnection,
    testConnection
  }
})
