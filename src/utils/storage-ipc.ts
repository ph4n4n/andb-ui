/**
 * Storage IPC Implementation
 * 
 * Replaces storage-stub.ts with real IPC calls to electron-store
 */

import type { DatabaseConnection } from '@/stores/app'
import type { ConnectionPair, Environment } from '@/stores/connectionPairs'

interface AppSchema {
  connections: DatabaseConnection[]
  connectionPairs: ConnectionPair[]
  environments: Environment[]
  settings: {
    theme: 'light' | 'dark' | 'system'
    language: 'en' | 'vi'
    buttonStyle: 'full' | 'minimal' | 'icons'
    navStyle: 'vertical-list' | 'horizontal-tabs'
    fontSize: number
    fontSizes: {
      main: number
      menu: number
      button: number
      ddlHeader: number
      schema: number
      ddlName: number
      code: number
    }
    fontFamilies: {
      general: string
      code: string
    }
  }
}

// Helper to get storage from window
const getStorage = () => {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return (window as any).electronAPI.storage
  }
  // Return a dummy object to avoid crash, actual calls will still fail but with better error or just no-op
  return {
    get: async () => ({ success: false, error: 'electronAPI not available' }),
    set: async () => ({ success: false, error: 'electronAPI not available' }),
    delete: async () => ({ success: false, error: 'electronAPI not available' })
  }
}

export const storage = {
  // ==================== Connections ====================
  async getConnections(): Promise<DatabaseConnection[]> {
    const result = await getStorage().get('connections')
    return result.success ? (result.data || []) : []
  },

  async saveConnections(connections: DatabaseConnection[]): Promise<void> {
    await getStorage().set('connections', JSON.parse(JSON.stringify(connections)))
  },

  async addConnection(connection: DatabaseConnection): Promise<void> {
    const connections = await this.getConnections()
    connections.push(connection)
    await this.saveConnections(connections)
  },

  async updateConnection(id: string, updates: Partial<DatabaseConnection>): Promise<void> {
    const connections = await this.getConnections()
    const index = connections.findIndex(c => c.id === id)
    if (index !== -1) {
      connections[index] = { ...connections[index], ...updates }
      await this.saveConnections(connections)
    }
  },

  async removeConnection(id: string): Promise<void> {
    const connections = await this.getConnections()
    const filtered = connections.filter(c => c.id !== id)
    await this.saveConnections(filtered)
  },

  // ==================== Connection Pairs ====================
  async getConnectionPairs(): Promise<ConnectionPair[]> {
    const result = await getStorage().get('connectionPairs')
    return result.success ? (result.data || []) : []
  },

  async saveConnectionPairs(pairs: ConnectionPair[]): Promise<void> {
    await getStorage().set('connectionPairs', JSON.parse(JSON.stringify(pairs)))
  },

  async addConnectionPair(pair: ConnectionPair): Promise<void> {
    const pairs = await this.getConnectionPairs()
    pairs.push(pair)
    await this.saveConnectionPairs(pairs)
  },

  async updateConnectionPair(id: string, updates: Partial<ConnectionPair>): Promise<void> {
    const pairs = await this.getConnectionPairs()
    const index = pairs.findIndex(p => p.id === id)
    if (index !== -1) {
      pairs[index] = { ...pairs[index], ...updates }
      await this.saveConnectionPairs(pairs)
    }
  },

  async removeConnectionPair(id: string): Promise<void> {
    const pairs = await this.getConnectionPairs()
    const filtered = pairs.filter(p => p.id !== id)
    await this.saveConnectionPairs(filtered)
  },

  // ==================== Environments ====================
  async getEnvironments(): Promise<Environment[]> {
    const result = await getStorage().get('environments')
    // Return defaults if empty
    if (!result.success || !result.data || result.data.length === 0) {
      return [
        { id: '1', name: 'DEV', description: 'Development environment', enabled: true, order: 1 },
        { id: '2', name: 'STAGE', description: 'Staging environment', enabled: true, order: 2 },
        { id: '3', name: 'UAT', description: 'UAT environment', enabled: true, order: 3 },
        { id: '4', name: 'PROD', description: 'Production environment', enabled: true, order: 4 }
      ]
    }
    return result.data
  },

  async saveEnvironments(environments: Environment[]): Promise<void> {
    await getStorage().set('environments', JSON.parse(JSON.stringify(environments)))
  },

  async updateEnvironment(id: string, updates: Partial<Environment>): Promise<void> {
    const envs = await this.getEnvironments()
    const index = envs.findIndex(e => e.id === id)
    if (index !== -1) {
      envs[index] = { ...envs[index], ...updates }
      await this.saveEnvironments(envs)
    }
  },

  // ==================== Settings ====================
  async getSettings() {
    const result = await getStorage().get('settings')
    const defaults = {
      theme: 'system' as const,
      language: 'en' as const,
      buttonStyle: 'full' as const,
      navStyle: 'vertical-list' as const,
      fontSize: 13,
      fontSizes: {
        main: 13,
        menu: 12,
        button: 11,
        ddlHeader: 16,
        schema: 12,
        ddlName: 14,
        code: 12
      },
      fontFamilies: {
        general: "'Inter', sans-serif",
        code: "'JetBrains Mono', monospace"
      }
    }
    return result.success ? { ...defaults, ...result.data } : defaults
  },

  async saveSettings(settings: AppSchema['settings']): Promise<void> {
    await getStorage().set('settings', settings)
  },

  async updateSettings(updates: Partial<AppSchema['settings']>): Promise<void> {
    const settings = await this.getSettings()
    await this.saveSettings({ ...settings, ...updates })
  },

  // ==================== Generic Store Access ====================
  async get<K extends keyof AppSchema>(key: K): Promise<AppSchema[K] | undefined> {
    const result = await getStorage().get(key)
    return result.success ? result.data : undefined
  },

  async set<K extends keyof AppSchema>(key: K, value: AppSchema[K]): Promise<void> {
    await getStorage().set(key, value)
  },

  async has(key: keyof AppSchema): Promise<boolean> {
    const result = await getStorage().has(key)
    return result.success ? result.data : false
  },

  async delete(key: keyof AppSchema): Promise<void> {
    await getStorage().delete(key)
  },

  async clear(): Promise<void> {
    await getStorage().clear()
  }
}

export default storage
