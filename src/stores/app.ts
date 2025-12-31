import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { Andb } from '@/utils/andb'
import { storage } from '../utils/storage-ipc'

export interface DatabaseConnection {
  id: string
  name: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  status: 'idle' | 'connected' | 'testing' | 'failed'
  environment: 'DEV' | 'STAGE' | 'UAT' | 'PROD'
  lastTested?: string
  domainMapping?: {
    from: string  // e.g., '@dev.example.com'
    to: string    // e.g., '@prod.example.com'
  }
}

export interface ConnectionPair {
  source: DatabaseConnection | null
  target: DatabaseConnection | null
}

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const connections = ref<DatabaseConnection[]>([])

  // Initialize state
  const init = async () => {
    const savedSettings = await storage.getSettings()
    sidebarCollapsed.value = savedSettings.sidebarCollapsed

    const savedConnections = await storage.getConnections()
    if (savedConnections.length > 0) {
      connections.value = savedConnections
    } else {
      // Default demo connections
      connections.value = [
        {
          id: '1',
          name: 'DEV',
          host: '127.0.0.1',
          port: 3306,
          database: 'dev_database',
          username: 'root',
          password: 'root123',
          status: 'idle',
          environment: 'DEV'
        },
        {
          id: '2',
          name: 'STAGE',
          host: '127.0.0.1',
          port: 3307,
          database: 'stage_database',
          username: 'root',
          password: 'root123',
          status: 'idle',
          environment: 'STAGE'
        },
        {
          id: '3',
          name: 'UAT',
          host: '127.0.0.1',
          port: 3308,
          database: 'uat_database',
          username: 'root',
          password: 'root123',
          status: 'idle',
          environment: 'UAT'
        },
        {
          id: '4',
          name: 'PROD',
          host: '127.0.0.1',
          port: 3309,
          database: 'prod_database',
          username: 'root',
          password: 'root123',
          status: 'idle',
          environment: 'PROD'
        }
      ]
    }
  }

  // Call init
  init()

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

  // Watch and auto-save to storage
  watch(
    connections,
    newConnections => {
      storage.saveConnections(newConnections)
    },
    { deep: true }
  )

  watch(sidebarCollapsed, newValue => {
    storage.updateSettings({ sidebarCollapsed: newValue })
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

    updateConnection(id, { status: 'testing' })

    try {
      const success = await Andb.testConnection(connection)
      updateConnection(id, {
        status: success ? 'connected' : 'failed',
        lastTested: new Date().toISOString()
      })
      return success
    } catch (error) {
      console.error('Connection test error:', error)
      updateConnection(id, { status: 'failed' })
      return false
    }
  }

  const resetConnections = async () => {
    connections.value = [
      {
        id: '1',
        name: 'DEV',
        host: '127.0.0.1',
        port: 3306,
        database: 'dev_database',
        username: 'root',
        password: 'root123',
        status: 'idle',
        environment: 'DEV'
      },
      {
        id: '2',
        name: 'STAGE',
        host: '127.0.0.1',
        port: 3307,
        database: 'stage_database',
        username: 'root',
        password: 'root123',
        status: 'idle',
        environment: 'STAGE'
      },
      {
        id: '3',
        name: 'UAT',
        host: '127.0.0.1',
        port: 3308,
        database: 'uat_database',
        username: 'root',
        password: 'root123',
        status: 'idle',
        environment: 'UAT'
      },
      {
        id: '4',
        name: 'PROD',
        host: '127.0.0.1',
        port: 3309,
        database: 'prod_database',
        username: 'root',
        password: 'root123',
        status: 'idle',
        environment: 'PROD'
      }
    ]
    await storage.saveConnections(connections.value)
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
    testConnection,
    resetConnections,
    reloadData: init
  }
})
