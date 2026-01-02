import { app } from 'electron'

// Import dependencies safely
// @ts-ignore
const { Container } = require('@andb/core')
// @ts-ignore
const Logger = require('andb-logger')

/**
 * AndbBuilder Service
 * 
 * Dynamically builds andb-core configuration from selected connection pairs
 * Replaces subprocess approach with programmatic API
 */

interface DatabaseConnection {
  id: string
  name: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  environment: string
  domainMapping?: {
    from: string
    to: string
  }
}

interface ConnectionPair {
  id: string
  name: string
  sourceEnv: string
  targetEnv: string
}

interface AndbConfig {
  getDBDestination: (env: string, mail?: boolean) => any
  getSourceEnv: (envName: string) => string
  getDestEnv: (env: string) => string
  getDBName: (env: string, isDbMail?: boolean) => string
  replaceWithEnv: (ddl: string, destEnv: string) => string
  ENVIRONMENTS: Record<string, string>
  baseDir: string
  logName: string
  storage?: 'file' | 'sqlite' | 'hybrid'
  storagePath?: string
  enableFileOutput?: boolean  // Deprecated, use storage config instead
  dataStore?: any  // Deprecated, use storage config instead
}

export class AndbBuilder {
  // NEW: SQLiteStorage instance (shared across all operations)
  private static sqliteStorage: any = null

  /**
   * Get or create SQLiteStorage instance
   */
  private static getSQLiteStorage() {
    if (!this.sqliteStorage) {
      const { SQLiteStorageService } = require('./sqlite-storage')
      this.sqliteStorage = SQLiteStorageService.getInstance()
    }
    return this.sqliteStorage
  }

  /**
   * Build andb-core config from connection pair
   */
  static buildConfig(
    sourceConn: DatabaseConnection,
    targetConn: DatabaseConnection | null
  ): AndbConfig {
    // Build ENVIRONMENTS object dynamically
    const ENVIRONMENTS: Record<string, string> = {
      [sourceConn.environment]: sourceConn.environment
    }

    if (targetConn) {
      ENVIRONMENTS[targetConn.environment] = targetConn.environment
    }

    return {
      // DEBUG: Log core path
      ...(this.getCorePath(), {}),

      /**
       * Get database destination configuration
       */
      getDBDestination: (env: string, mail = false) => {
        if (!env) return undefined

        const srcEnv = sourceConn?.environment?.toUpperCase()
        const trgEnv = targetConn?.environment?.toUpperCase()
        const currentEnv = env.toUpperCase()

        const conn = (srcEnv && currentEnv === srcEnv)
          ? sourceConn
          : (trgEnv && currentEnv === trgEnv ? targetConn : null)

        if (!conn) return undefined

        return {
          envName: conn.environment,
          host: conn.host,
          port: conn.port || 3306,
          database: mail ? undefined : conn.database,
          user: conn.username,
          // Only include password if provided; omit empty string to avoid sending a blank password
          ...(conn.password ? { password: conn.password } : {})
        }
      },

      /**
       * Get source environment (always return source from pair)
       */
      getSourceEnv: (_envName: string) => {
        return sourceConn?.environment || ''
      },

      /**
       * Get destination environment (always return target from pair)
       */
      getDestEnv: (_env: string) => {
        return targetConn?.environment || ''
      },

      /**
       * Get database name for environment
       */
      getDBName: (env: string, _isDbMail = false) => {
        if (!env) return ''

        const srcEnv = sourceConn?.environment?.toUpperCase()
        const trgEnv = targetConn?.environment?.toUpperCase()
        const currentEnv = env.toUpperCase()

        const conn = (srcEnv && currentEnv === srcEnv)
          ? sourceConn
          : (trgEnv && currentEnv === trgEnv ? targetConn : null)

        return conn?.database || ''
      },

      /**
       * Replace domain in DDL based on destination environment
       * Example: @dev.example.com → @prod.example.com
       */
      replaceWithEnv: (ddl: string, destEnv: string) => {
        let result = ddl

        // Apply source domain mapping (if exists)
        if (sourceConn.domainMapping?.from && sourceConn.domainMapping?.to) {
          result = result.replace(
            new RegExp(sourceConn.domainMapping.from, 'g'),
            sourceConn.domainMapping.to
          )
        }

        // Apply target domain mapping (if exists)
        if (targetConn?.domainMapping?.from && targetConn?.domainMapping?.to) {
          result = result.replace(
            new RegExp(targetConn.domainMapping.from, 'g'),
            targetConn.domainMapping.to
          )
        }

        return result
      },

      ENVIRONMENTS,
      baseDir: app.getPath('userData'),
      logName: 'andb',

      // Storage Configuration - Use SQLite for better performance
      storage: 'sqlite',
      storagePath: require('path').join(app.getPath('userData'), 'andb-storage.db'),
      enableFileOutput: false  // Disable file output, use SQLite only
    }
  }

  public static getCorePath() {
    try {
      require.resolve('@andb/core');
      require.resolve('@andb/core/package.json');
    } catch (e) {
      // Quietly fail
    }
  }

  /**
   * Build and execute andb-core operation
   */
  static async execute(
    sourceConn: DatabaseConnection,
    targetConn: DatabaseConnection | null,
    operation: 'export' | 'compare' | 'migrate' | 'generate' | 'getSchemaObjects',
    options: any = {}
  ): Promise<any> {
    const fs = require('fs')
    const originalCwd = process.cwd()
    const userDataDir = app.getPath('userData')

    try {
      // Strict Rule: Disallow comparison within the same environment
      if (targetConn && sourceConn?.environment?.toUpperCase() === targetConn?.environment?.toUpperCase()) {
        throw new Error(`Comparison within the same environment '${sourceConn.environment}' is not permitted. Please select different environments to prevent conflicts.`)
      }

      // Force CWD to userData to ensure andb-core writes files there
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true })
      }
      process.chdir(userDataDir)

      // Build config from pair
      const config = this.buildConfig(sourceConn, targetConn)

      // Initialize global logger
      try {
        let loggerInstance;
        if (typeof Logger.getInstance === 'function') {
          loggerInstance = Logger.getInstance({
            mode: 'PROD',
            dirpath: app.getPath('userData'),
            logName: 'ANDB-UI'
          });
        } else if (typeof Logger === 'function') {
          loggerInstance = new Logger({
            mode: 'PROD',
            dirpath: app.getPath('userData'),
            logName: 'ANDB-UI'
          });
        }

        if (loggerInstance) {
          (global as any).logger = loggerInstance;
        }
      } catch (e) {
        // Silently fail logger init
      }

      // Create container with config
      const container = new Container(config)
      const services = container.getServices()

      // Execute operation based on type
      switch (operation) {
        case 'export':
          return await this.executeExport(services, options)

        case 'compare':
          if (!targetConn) throw new Error('Target connection is required for comparison')
          return await this.executeCompare(services, options, config, targetConn.environment)

        case 'migrate':
          if (!targetConn) throw new Error('Target connection is required for migration')
          return await this.executeMigrate(services, options, targetConn.environment)

        case 'generate':
          throw new Error('Generate operation is only available via andb-cli')

        default:
          throw new Error(`Unknown operation: ${operation}`)
      }
    } catch (error: any) {
      if ((global as any).logger) (global as any).logger.error('[AndbBuilder] execute error:', error)
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      }
    } finally {
      // Restore original CWD
      try {
        process.chdir(originalCwd)
      } catch (e) {
        // Silently fail CWD restore
      }
    }
  }

  /**
   * Execute export operation
   */
  private static async executeExport(services: any, options: any) {
    const {
      type = 'tables',
      environment,
      name = null
    } = options

    const ddlType = type.toLowerCase()

    try {
      const exportFn = services.exporter(ddlType, name)
      const result = await exportFn(environment)
      return result
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Execute compare operation
   */
  private static async executeCompare(services: any, options: any, config: any, destEnv: string) {
    const {
      type = 'tables',
      name = null
    } = options

    const ddlType = type.toLowerCase()

    try {
      const compareFn = services.comparator(ddlType, name)
      // Use destEnv passed from execute(), which should be the *aliased* name if applicable
      await compareFn(destEnv)

      const srcEnv = config.getSourceEnv(destEnv)
      const dbName = config.getDBName(srcEnv)

      // Read and return results from SQLite
      const storage = this.getSQLiteStorage();
      const normalizedSrcEnv = srcEnv.toUpperCase();
      const normalizedDestEnv = destEnv.toUpperCase();
      const destDbName = config.getDBName(normalizedDestEnv);

      const results = storage.getComparisons(normalizedSrcEnv, normalizedDestEnv, dbName, ddlType);

      const mapped = results.map((res: any) => ({
        name: res.ddl_name,
        status: res.status,
        type: res.ddl_type.toLowerCase(),
        diff: {
          source: storage.getDDL(srcEnv, dbName, ddlType, res.ddl_name),
          target: storage.getDDL(destEnv, destDbName, ddlType, res.ddl_name)
        }
      }))

      return mapped
    } catch (error: any) {
      throw error
    }
  }


  /**
   * Execute migrate operation
   */
  private static async executeMigrate(services: any, options: any, destEnv: string) {
    const {
      type = 'tables',
      status = 'NEW',
      name = null
    } = options

    const ddlType = type.toLowerCase()
    const migrateFn = services.migrator(ddlType, status.toLowerCase(), name)
    return await migrateFn(destEnv)
  }

  /**
   * Fetch saved comparison results from SQLite without re-running comparison
   */
  static async getSavedComparisonResults(
    sourceConn: DatabaseConnection,
    targetConn: DatabaseConnection,
    type: string
  ): Promise<any> {
    const ddlType = type.toLowerCase()
    const storage = this.getSQLiteStorage()

    const srcEnv = sourceConn.environment
    const destEnv = targetConn.environment
    const dbName = sourceConn.database
    const destDbName = targetConn.database

    const results = storage.getComparisons(srcEnv, destEnv, dbName, ddlType);

    const mapped = results.map((res: any) => ({
      name: res.ddl_name,
      status: res.status,
      type: res.ddl_type.toLowerCase(),
      diff: {
        source: storage.getDDL(srcEnv, dbName, ddlType, res.ddl_name),
        target: storage.getDDL(destEnv, destDbName, ddlType, res.ddl_name)
      }
    }))

    return mapped
  }


  /**
   * Clear cached data for a specific connection
   */
  static clearConnectionData(connection: DatabaseConnection): void {
    const storage = this.getSQLiteStorage()
    storage.clearDataForConnection(connection.environment, connection.database)
  }

  /**
   * Test if andb-core is available and working
   */
  static async test(): Promise<boolean> {
    try {
      const { Container } = require('@andb/core')
      return !!Container
    } catch (error) {
      return false
    }
  }
}

export default AndbBuilder
