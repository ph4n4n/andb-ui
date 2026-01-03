import type { DatabaseConnection } from '@/stores/app'

/**
 * Andb Service - Programmatic API Wrapper
 * 
 * New approach: Direct integration with andb-core via IPC
 * No subprocess, no command injection risks
 * 
 * Flow:
 * 1. User selects connection pair in UI
 * 2. Call andb.execute() with connections + operation
 * 3. Main process builds config dynamically
 * 4. andb-core.commander.build() with config
 * 5. Execute operation programmatically
 * 6. Return results
 */

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

export interface ExportOptions {
  type: 'tables' | 'procedures' | 'functions' | 'triggers' | 'views'
  environment?: string
  outputPath?: string
  name?: string // Specific object name
}

export interface CompareOptions {
  type: 'tables' | 'procedures' | 'functions' | 'triggers' | 'views'
  sourceEnv: string
  targetEnv: string
  name?: string // Specific object name
}

export interface MigrateOptions {
  type: 'tables' | 'procedures' | 'functions' | 'triggers' | 'views'
  sourceEnv: string
  targetEnv: string
  name?: string
  status?: 'NEW' | 'UPDATED' | 'DEPRECATED'
  dryRun?: boolean
}

export class Andb {
  /**
   * Test if andb-core is available
   */
  static async test(): Promise<boolean> {
    if (!isElectron) {
      return false
    }

    try {
      const result = await window.electronAPI.andbTest()
      return result.success && result.available === true
    } catch (error) {
      return false
    }
  }

  /**
   * Export database objects
   */
  static async export(
    sourceConnection: DatabaseConnection,
    targetConnection: DatabaseConnection,
    options: ExportOptions
  ): Promise<any> {
    if (!isElectron) {
      throw new Error('Not in Electron environment')
    }

    try {
      // Sanitize connections to remove Vue proxies/observers
      const cleanSource = sourceConnection ? { ...sourceConnection } : null
      const cleanTarget = targetConnection ? { ...targetConnection } : null

      const result = await window.electronAPI.andbExecute({
        sourceConnection: cleanSource as any,
        targetConnection: cleanTarget as any,
        operation: 'export',
        options
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error: any) {
      throw new Error(`Export failed: ${error.message}`)
    }
  }

  /**
   * Compare database objects between environments
   */
  static async compare(
    sourceConnection: DatabaseConnection,
    targetConnection: DatabaseConnection,
    options: CompareOptions
  ): Promise<any> {
    if (!isElectron) {
      throw new Error('Not in Electron environment')
    }

    try {
      // Sanitize connections
      const cleanSource = sourceConnection ? { ...sourceConnection } : null
      const cleanTarget = targetConnection ? { ...targetConnection } : null

      const result = await window.electronAPI.andbExecute({
        sourceConnection: cleanSource as any,
        targetConnection: cleanTarget as any,
        operation: 'compare',
        options
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Compare failed')
      }
    } catch (error: any) {
      throw new Error(`Compare failed: ${error.message}`)
    }
  }

  /**
   * Fetch saved comparison results without re-running
   */
  static async getSavedComparisonResults(
    sourceConnection: DatabaseConnection,
    targetConnection: DatabaseConnection,
    type: string
  ): Promise<any> {
    if (!isElectron) {
      throw new Error('Not in Electron environment')
    }

    try {
      const result = await window.electronAPI.andbGetSavedComparisonResults({
        sourceConnection,
        targetConnection,
        type
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to fetch saved results')
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch saved results: ${error.message}`)
    }
  }

  /**
   * Execute migration
   */
  static async migrate(
    sourceConnection: DatabaseConnection,
    targetConnection: DatabaseConnection,
    options: MigrateOptions
  ): Promise<any> {
    if (!isElectron) {
      throw new Error('Not in Electron environment')
    }

    try {
      // Sanitize connections
      const cleanSource = sourceConnection ? { ...sourceConnection } : null
      const cleanTarget = targetConnection ? { ...targetConnection } : null

      const result = await window.electronAPI.andbExecute({
        sourceConnection: cleanSource as any,
        targetConnection: cleanTarget as any,
        operation: 'migrate',
        options
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Migration failed')
      }
    } catch (error: any) {
      throw new Error(`Migration failed: ${error.message}`)
    }
  }

  /**
   * Generate scripts
   */
  static async generate(
    sourceConnection: DatabaseConnection,
    targetConnection: DatabaseConnection,
    options: any = {}
  ): Promise<any> {
    if (!isElectron) {
      throw new Error('Not in Electron environment')
    }

    try {
      const cleanSource = sourceConnection ? { ...sourceConnection } : null
      const cleanTarget = targetConnection ? { ...targetConnection } : null

      const result = await window.electronAPI.andbExecute({
        sourceConnection: cleanSource as any,
        targetConnection: cleanTarget as any,
        operation: 'generate',
        options
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Generate failed')
      }
    } catch (error: any) {
      throw new Error(`Generate failed: ${error.message}`)
    }
  }

  /**
   * Test database connection
   * Uses old IPC method (testConnection)
   */
  static async testConnection(connection: DatabaseConnection): Promise<boolean> {
    if (!isElectron) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return Math.random() > 0.2
    }

    try {
      const result = await window.electronAPI.testConnection({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password
      })

      return result.success
    } catch (error) {
      return false
    }
  }

  /**
   * Get all schemas from exported DDL
   */
  static async getSchemas(): Promise<any> {
    if (!isElectron) {
      throw new Error('Not in Electron environment')
    }

    try {
      const result = await window.electronAPI.andbGetSchemas({})

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Failed to load schemas')
      }
    } catch (error: any) {
      throw new Error(`Failed to load schemas: ${error.message}`)
    }
  }

  /**
   * Clear cached data for a specific connection
   */
  static async clearConnectionData(connection: DatabaseConnection): Promise<boolean> {
    if (!isElectron) return false
    try {
      // Sanitize connection (remove Vue proxies)
      const cleanConn = connection ? JSON.parse(JSON.stringify(connection)) : null
      const result = await window.electronAPI.andbClearConnectionData(cleanConn)
      return result.success
    } catch (error) {
      return false
    }
  }

  /**
   * Get snapshots for an object
   */
  static async getSnapshots(environment: string, database: string, type: string, name: string): Promise<any> {
    if (!isElectron) throw new Error('Not in Electron environment')
    try {
      const result = await (window as any).electronAPI.getSnapshots(environment, database, type, name)
      if (result.success) return result.data
      throw new Error(result.error || 'Failed to fetch snapshots')
    } catch (error: any) {
      throw new Error(`Failed to fetch snapshots: ${error.message}`)
    }
  }

  /**
   * Get all snapshots globally
   */
  static async getAllSnapshots(limit: number = 200): Promise<any> {
    if (!isElectron) throw new Error('Not in Electron environment')
    try {
      const result = await (window as any).electronAPI.getAllSnapshots(limit)
      if (result.success) return result.data
      throw new Error(result.error || 'Failed to fetch all snapshots')
    } catch (error: any) {
      throw new Error(`Failed to fetch all snapshots: ${error.message}`)
    }
  }

  /**
   * Create manual snapshot
   */
  static async createSnapshot(connection: DatabaseConnection, type: string, name: string): Promise<any> {
    if (!isElectron) throw new Error('Not in Electron environment')
    try {
      // Be extremely specific with sanitization
      const cleanConn = connection ? JSON.parse(JSON.stringify(connection)) : null
      const cleanType = type ? String(type) : ''
      const cleanName = name ? String(name) : ''

      const result = await (window as any).electronAPI.createSnapshot(cleanConn, cleanType, cleanName)
      if (result.success) return result.data
      throw new Error(result.error || 'Failed to create snapshot')
    } catch (error: any) {
      throw new Error(`Failed to create snapshot: ${error.message}`)
    }
  }

  /**
   * Restore a DDL snapshot to a connection
   */
  static async restoreSnapshot(connection: DatabaseConnection, snapshot: any): Promise<any> {
    if (!isElectron) throw new Error('Not in Electron environment')
    try {
      const cleanConn = connection ? JSON.parse(JSON.stringify(connection)) : null
      const cleanSnapshot = snapshot ? JSON.parse(JSON.stringify(snapshot)) : null

      const result = await (window as any).electronAPI.restoreSnapshot(cleanConn, cleanSnapshot)
      if (result.success) return result.data
      throw new Error(result.error || 'Failed to restore snapshot')
    } catch (error: any) {
      throw new Error(`Failed to restore snapshot: ${error.message}`)
    }
  }

  /**
   * Open backup folder in system explorer
   */
  static async openBackupFolder(): Promise<boolean> {
    if (!isElectron) return false
    try {
      const result = await (window as any).electronAPI.openBackupFolder()
      return result.success
    } catch (error) {
      return false
    }
  }
}

export default Andb
