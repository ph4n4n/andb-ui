import { contextBridge, ipcRenderer } from 'electron'

// Type definitions for better type safety
export interface DatabaseConnection {
  host: string
  port: number
  database: string
  username: string
  password?: string
}

export interface CommandResult {
  success: boolean
  data?: string
  error?: string
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // andb-core CLI commands
  executeAndbCommand: (command: string, args: string[]): Promise<CommandResult> => {
    return ipcRenderer.invoke('execute-andb-command', command, args)
  },

  testConnection: (connection: DatabaseConnection): Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }> => {
    return ipcRenderer.invoke('test-connection', connection)
  },

  // Database/Storage operations
  getMigrationHistory: (limit?: number) => {
    return ipcRenderer.invoke('get-migration-history', limit)
  },

  addMigration: (migration: any) => {
    return ipcRenderer.invoke('add-migration', migration)
  },

  updateMigrationStatus: (id: number, status: string, error?: string) => {
    return ipcRenderer.invoke('update-migration-status', id, status, error)
  },

  getComparisonHistory: (limit?: number) => {
    return ipcRenderer.invoke('get-comparison-history', limit)
  },

  addComparison: (comparison: any) => {
    return ipcRenderer.invoke('add-comparison', comparison)
  },

  getExportLogs: (limit?: number) => {
    return ipcRenderer.invoke('get-export-logs', limit)
  },

  addExportLog: (log: any) => {
    return ipcRenderer.invoke('add-export-log', log)
  },

  getAuditLogs: (limit?: number) => {
    return ipcRenderer.invoke('get-audit-logs', limit)
  },

  addAuditLog: (log: any) => {
    return ipcRenderer.invoke('add-audit-log', log)
  },

  getDatabaseStats: () => {
    return ipcRenderer.invoke('get-database-stats')
  },

  databaseCleanup: (daysToKeep?: number) => {
    return ipcRenderer.invoke('database-cleanup', daysToKeep)
  },

  // andb-core operations (new programmatic approach)
  andbExecute: (args: {
    sourceConnection: any
    targetConnection: any
    operation: 'export' | 'compare' | 'migrate' | 'generate'
    options: any
  }) => {
    return ipcRenderer.invoke('andb-execute', args)
  },

  andbTest: () => {
    return ipcRenderer.invoke('andb-test')
  },

  // Storage (electron-store)
  storage: {
    get: (key: string) => ipcRenderer.invoke('storage-get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('storage-set', key, value),
    delete: (key: string) => ipcRenderer.invoke('storage-delete', key),
    has: (key: string) => ipcRenderer.invoke('storage-has', key),
    clear: () => ipcRenderer.invoke('storage-clear')
  },

  andbClearStorage: () => {
    return ipcRenderer.invoke('andb-clear-storage')
  },

  andbClearConnectionData: (connection: any) => {
    return ipcRenderer.invoke('andb-clear-connection-data', connection)
  },

  andbGetSchemas: (args?: any) => {
    return ipcRenderer.invoke('andb-get-schemas', args)
  },

  andbGetSavedComparisonResults: (args: {
    sourceConnection: any
    targetConnection: any
    type: string
  }) => {
    return ipcRenderer.invoke('andb-get-saved-comparison-results', args)
  },

  // Logger
  log: {
    send: (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
      return ipcRenderer.invoke('app-log', { level, message, data })
    },
    write: (content: string) => {
      return ipcRenderer.invoke('app-log-write', content)
    }
  },

  // Load mock compare data for testing
  loadMockCompareData: () => ipcRenderer.invoke('load-mock-compare-data')
})
