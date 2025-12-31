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
      console.warn('Not in Electron environment')
      return false
    }

    try {
      const result = await window.electronAPI.andbTest()
      return result.success && result.available === true
    } catch (error) {
      console.error('andb-core test failed:', error)
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
      const cleanSource = { ...sourceConnection }
      const cleanTarget = { ...targetConnection }

      console.log(`[Andb] Exporting ${options.type} for ${options.environment}...`)
      const result = await window.electronAPI.andbExecute({
        sourceConnection: cleanSource,
        targetConnection: cleanTarget,
        operation: 'export',
        options
      })
      console.log(`[Andb] Export result for ${options.type}:`, result)

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error: any) {
      console.error('Export error:', error)
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
      const cleanSource = { ...sourceConnection }
      const cleanTarget = { ...targetConnection }

      console.log(`[Andb] Comparing ${options.type} from ${options.sourceEnv} to ${options.targetEnv}...`)
      const result = await window.electronAPI.andbExecute({
        sourceConnection: cleanSource,
        targetConnection: cleanTarget,
        operation: 'compare',
        options
      })
      console.log(`[Andb] Compare result for ${options.type}:`, result)

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Compare failed')
      }
    } catch (error: any) {
      console.error('Compare error:', error)
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
      console.error('getSavedComparisonResults error:', error)
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
      const cleanSource = { ...sourceConnection }
      const cleanTarget = { ...targetConnection }

      const result = await window.electronAPI.andbExecute({
        sourceConnection: cleanSource,
        targetConnection: cleanTarget,
        operation: 'migrate',
        options
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Migration failed')
      }
    } catch (error: any) {
      console.error('Migration error:', error)
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
      const result = await window.electronAPI.andbExecute({
        sourceConnection,
        targetConnection,
        operation: 'generate',
        options
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || 'Generate failed')
      }
    } catch (error: any) {
      console.error('Generate error:', error)
      throw new Error(`Generate failed: ${error.message}`)
    }
  }

  /**
   * Test database connection
   * Uses old IPC method (testConnection)
   */
  static async testConnection(connection: DatabaseConnection): Promise<boolean> {
    if (!isElectron) {
      console.warn('Not in Electron, using mock test')
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

      if (result.success) {
        console.log('Connection test successful:', result.stdout)
        return true
      } else {
        console.error('Connection test failed:', result.stderr || result.error)
        return false
      }
    } catch (error) {
      console.error('Connection test error:', error)
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
      console.error('Get schemas error:', error)
      throw new Error(`Failed to load schemas: ${error.message}`)
    }
  }
}

export default Andb

