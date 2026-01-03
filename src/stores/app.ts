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

export const FONT_SIZE_PROFILES = {
  small: {
    main: 12,
    menu: 11,
    button: 10,
    ddlHeader: 14,
    schema: 11,
    ddlName: 13,
    code: 11
  },
  medium: {
    main: 13,
    menu: 12,
    button: 11,
    ddlHeader: 16,
    schema: 12,
    ddlName: 14,
    code: 12
  },
  large: {
    main: 15,
    menu: 14,
    button: 13,
    ddlHeader: 20,
    schema: 14,
    ddlName: 16,
    code: 14
  }
}

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const buttonStyle = ref<'full' | 'minimal' | 'icons'>('full')
  const navStyle = ref<'vertical-list' | 'horizontal-tabs'>('vertical-list')
  const fontSizes = ref({
    main: 13,
    menu: 12,
    button: 11,
    ddlHeader: 16,
    schema: 12,
    ddlName: 14,
    code: 12
  })
  const fontFamilies = ref({
    general: "'Inter', sans-serif",
    code: "'JetBrains Mono', monospace"
  })
  const fontSizeProfile = ref<'small' | 'medium' | 'large' | 'custom'>('medium')

  // Store the last custom configuration to restore it when switching back to Custom
  const lastCustomFontSizes = ref({ ...FONT_SIZE_PROFILES.medium })

  const connections = ref<DatabaseConnection[]>([])

  // Initialize state
  const init = async () => {
    const savedSettings = await storage.getSettings()
    sidebarCollapsed.value = savedSettings.sidebarCollapsed
    buttonStyle.value = savedSettings.buttonStyle || 'full'
    navStyle.value = savedSettings.navStyle || 'vertical-list'
    if (savedSettings.fontSizes) {
      fontSizes.value = { ...fontSizes.value, ...savedSettings.fontSizes }
    }
    if (savedSettings.fontFamilies) {
      fontFamilies.value = { ...fontFamilies.value, ...savedSettings.fontFamilies }
    }
    if (savedSettings.lastCustomFontSizes) {
      lastCustomFontSizes.value = { ...lastCustomFontSizes.value, ...savedSettings.lastCustomFontSizes }
    }

    fontSizeProfile.value = savedSettings.fontSizeProfile || 'medium'

    // If we loaded 'custom', we should ensure fontSizes reflects the loaded values (already done by fontSizes loading)
    // If we loaded a profile, apply it to ensure consistency, UNLESS we want to respect the exact saved numbers 
    // which might differ if the profile definition changed in code. 
    // For now, let's respect savedSettings.fontSizes as the truth.

    selectedConnectionId.value = savedSettings.lastSelectedConnectionId || '1' // Fallback to DEV (id 1) if none

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

  // Global selected connection for exploration (Schema view, etc)
  const selectedConnectionId = ref<string>('')

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

  watch(navStyle, newValue => {
    storage.updateSettings({ navStyle: newValue })
  })

  watch(buttonStyle, newValue => {
    storage.updateSettings({ buttonStyle: newValue })
  })

  watch(fontSizes, newValue => {
    storage.updateSettings({ fontSizes: { ...newValue } })

    // If we make Manual changes while in 'custom' mode, update our lastCustomFontSizes
    if (fontSizeProfile.value === 'custom') {
      lastCustomFontSizes.value = { ...newValue }
      storage.updateSettings({ lastCustomFontSizes: { ...newValue } })
    } else {
      // If we make changes while NOT in custom mode, we should auto-switch to custom
      // But checking for deep equality is tricky because of the circular update nature.
      // Instead, we rely on the UI to call applyFontSizeProfile('custom') if needed, 
      // OR we accept that any manual change in UI (which v-models directly into fontSizes) 
      // implicitly means we are diverging.

      // Ideally the UI inputs should trigger a "switchToCustom" first, OR we detect deviation here.
      const currentProfileTarget = FONT_SIZE_PROFILES[fontSizeProfile.value]
      if (currentProfileTarget) {
        const isMatch = Object.keys(newValue).every(k => {
          const key = k as keyof typeof newValue
          return newValue[key] === currentProfileTarget[key]
        })
        if (!isMatch) {
          fontSizeProfile.value = 'custom'
          // And now that we are custom, save this new state as the custom preference
          lastCustomFontSizes.value = { ...newValue }
          storage.updateSettings({ lastCustomFontSizes: { ...newValue } })
        }
      }
    }
  }, { deep: true })

  watch(fontSizeProfile, newValue => {
    storage.updateSettings({ fontSizeProfile: newValue })
  })

  watch(fontFamilies, newValue => {
    storage.updateSettings({ fontFamilies: { ...newValue } })
  }, { deep: true })

  watch(selectedConnectionId, newValue => {
    storage.updateSettings({ lastSelectedConnectionId: newValue })
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

  const removeConnection = async (id: string) => {
    const conn = getConnectionById.value(id)
    if (conn) {
      // Clear cached data for this connection
      await Andb.clearConnectionData(conn)
    }
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
    } catch (error: any) {
      if (window.electronAPI) {
        window.electronAPI.log.send('error', `Connection test error for connection ID: ${id}`, error.message)
      }
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

  const applyFontSizeProfile = (profileKey: 'small' | 'medium' | 'large' | 'custom') => {
    fontSizeProfile.value = profileKey
    if (profileKey === 'custom') {
      // Restore last custom configuration
      fontSizes.value = { ...lastCustomFontSizes.value }
    } else if (FONT_SIZE_PROFILES[profileKey]) {
      fontSizes.value = { ...FONT_SIZE_PROFILES[profileKey] }
    }
  }

  return {
    // State
    sidebarCollapsed,
    buttonStyle,
    navStyle,
    fontSizes,
    fontFamilies,
    fontSizeProfile,
    connections,
    currentPair,
    selectedConnectionId,

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
    applyFontSizeProfile,
    reloadData: init
  }
})
