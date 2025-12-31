/**
 * Storage Stub for Renderer Process
 * 
 * This is a client-side stub that delegates to main process via IPC
 * Actual storage implementation is in electron/main.ts
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
    sidebarCollapsed: boolean
  }
  version: string
}

// Client-side storage wrapper - returns defaults for now
export const storage = {
  // ==================== Connections ====================
  getConnections(): DatabaseConnection[] {
    console.warn('[Storage] getConnections() - returning empty array')
    return []
  },

  saveConnections(_connections: DatabaseConnection[]): void {
    // Silently ignore - no IPC yet
  },

  addConnection(_connection: DatabaseConnection): void {
    // Silently ignore - no IPC yet
  },

  updateConnection(_id: string, _updates: Partial<DatabaseConnection>): void {
    // Silently ignore - no IPC yet
  },

  removeConnection(_id: string): void {
    // Silently ignore - no IPC yet
  },

  // ==================== Connection Pairs ====================
  getConnectionPairs(): ConnectionPair[] {
    console.warn('[Storage] getConnectionPairs() - returning empty array')
    return []
  },

  saveConnectionPairs(_pairs: ConnectionPair[]): void {
    // Silently ignore - no IPC yet
  },

  addConnectionPair(_pair: ConnectionPair): void {
    // Silently ignore - no IPC yet
  },

  updateConnectionPair(_id: string, _updates: Partial<ConnectionPair>): void {
    // Silently ignore - no IPC yet
  },

  removeConnectionPair(_id: string): void {
    // Silently ignore - no IPC yet
  },

  // ==================== Environments ====================
  getEnvironments(): Environment[] {
    console.warn('[Storage] getEnvironments() - returning defaults')
    return [
      { id: '1', name: 'DEV', description: 'Development environment', enabled: true, order: 1 },
      { id: '2', name: 'STAGE', description: 'Staging environment', enabled: true, order: 2 },
      { id: '3', name: 'UAT', description: 'UAT environment', enabled: true, order: 3 },
      { id: '4', name: 'PROD', description: 'Production environment', enabled: true, order: 4 }
    ]
  },

  saveEnvironments(_environments: Environment[]): void {
    // Silently ignore - no IPC yet
  },

  updateEnvironment(_id: string, _updates: Partial<Environment>): void {
    // Silently ignore - no IPC yet
  },

  // ==================== Settings ====================
  getSettings() {
    console.warn('[Storage] getSettings() - returning defaults')
    return {
      theme: 'light' as const,
      language: 'en' as const,
      sidebarCollapsed: false
    }
  },

  saveSettings(_settings: AppSchema['settings']): void {
    // Silently ignore - no IPC yet
  },

  updateSettings(_updates: Partial<AppSchema['settings']>): void {
    // Silently ignore - no IPC yet
  },

  // ==================== Generic Store Access ====================
  get<K extends keyof AppSchema>(key: K): AppSchema[K] | undefined {
    console.warn(`[Storage] get(${key}) - not implemented`)
    return undefined as any
  },

  set<K extends keyof AppSchema>(_key: K, _value: AppSchema[K]): void {
    // Silently ignore - no IPC yet
  },

  has(_key: keyof AppSchema): boolean {
    return false
  },

  delete(_key: keyof AppSchema): void {
    // Silently ignore - no IPC yet
  },

  clear(): void {
    // Silently ignore - no IPC yet
  },

  store: {} as any
}

export default storage

