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
    targetConn: DatabaseConnection
  ): AndbConfig {
    // Build ENVIRONMENTS object dynamically
    const ENVIRONMENTS: Record<string, string> = {
      [sourceConn.environment]: sourceConn.environment,
      [targetConn.environment]: targetConn.environment
    }

    return {
      // DEBUG: Log core path
      ...(this.getCorePath(), {}),

      /**
       * Get database destination configuration
       */
      getDBDestination: (env: string, mail = false) => {
        const conn = env.toUpperCase() === sourceConn.environment
          ? sourceConn
          : targetConn

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
        return sourceConn.environment
      },

      /**
       * Get destination environment (always return target from pair)
       */
      getDestEnv: (_env: string) => {
        return targetConn.environment
      },

      /**
       * Get database name for environment
       */
      getDBName: (env: string, _isDbMail = false) => {
        const conn = env.toUpperCase() === sourceConn.environment
          ? sourceConn
          : targetConn

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
        if (targetConn.domainMapping?.from && targetConn.domainMapping?.to) {
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
      console.log('[AndbBuilder] Resolved @andb/core path:', require.resolve('@andb/core'));
      console.log('[AndbBuilder] Resolved @andb/core/package.json:', require.resolve('@andb/core/package.json'));
    } catch (e) {
      console.error('[AndbBuilder] Could not resolve @andb/core path', e);
    }
  }

  /**
   * Build and execute andb-core operation
   */
  static async execute(
    sourceConn: DatabaseConnection,
    targetConn: DatabaseConnection,
    operation: 'export' | 'compare' | 'migrate' | 'generate',
    options: any = {}
  ): Promise<any> {
    const fs = require('fs')
    const originalCwd = process.cwd()
    const userDataDir = app.getPath('userData')

    try {
      console.log(`[AndbBuilder] Executing ${operation}...`)

      // Force CWD to userData to ensure andb-core writes files there
      // This fixes the issue where files are written to unknown locations
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true })
      }
      process.chdir(userDataDir)
      console.log(`[AndbBuilder] Changed CWD to: ${process.cwd()}`)

      // Build config from pair
      const config = this.buildConfig(sourceConn, targetConn)
      console.log('[AndbBuilder] Config built')

      // Initialize global logger
      try {
        // Handle different export formats of andb-logger
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
        } else {
          console.warn('Logger structure unknown:', Logger);
        }

        if (loggerInstance) {
          (global as any).logger = loggerInstance;
          console.log('[AndbBuilder] Logger initialized')
        }
      } catch (e) {
        console.warn('Failed to initialize logger:', e)
      }

      // Debug: Check mysql2 availability
      try {
        console.log('[AndbBuilder] Checking mysql2...')
        const mysql = require('mysql2')
        console.log('[AndbBuilder] mysql2 loaded. createConnection is:', typeof mysql.createConnection)
      } catch (e) {
        console.error('[AndbBuilder] Failed to require mysql2:', e)
      }

      // Create container with config
      console.log('[AndbBuilder] Creating container...')
      const container = new Container(config)
      console.log('[AndbBuilder] Container created')

      // Debug: Test source connection directly to verify data access
      try {
        console.log('[AndbBuilder] Testing source connection...')
        const mysql = require('mysql2/promise')
        const conn = await mysql.createConnection({
          host: sourceConn.host,
          user: sourceConn.username,
          password: sourceConn.password,
          database: sourceConn.database,
          port: sourceConn.port
        })
        const [rows] = await conn.execute('SHOW TABLES')
        console.log(`[AndbBuilder] Source DB Tables (${rows.length}):`, rows.map((r: any) => Object.values(r)[0]))
        await conn.end()
      } catch (e) {
        console.error('[AndbBuilder] Source DB Connection Failed:', e)
      }

      const services = container.getServices()
      console.log('[AndbBuilder] Services retrieved')

      // Execute operation based on type
      switch (operation) {
        case 'export':
          console.log('[AndbBuilder] Calling executeExport')
          return await this.executeExport(services, options)

        case 'compare':
          // Pass config to compare so we can read source env etc.
          return await this.executeCompare(services, options, config, targetConn.environment)


        case 'migrate':
          return await this.executeMigrate(services, options, targetConn.environment)

        case 'generate':
          // Generate is CLI-only, not available in programmatic API
          throw new Error('Generate operation is only available via andb-cli')

        default:
          throw new Error(`Unknown operation: ${operation}`)
      }
    } catch (error: any) {
      console.error('[AndbBuilder] Execution failed:', error)
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      }
    } finally {
      // Restore original CWD
      try {
        process.chdir(originalCwd)
        console.log(`[AndbBuilder] Restored CWD to: ${process.cwd()}`)
      } catch (e) {
        console.error('[AndbBuilder] Failed to restore CWD:', e)
      }
    }
  }

  /**
   * Execute export operation
   */
  private static async executeExport(services: any, options: any) {
    const fs = require('fs')
    const path = require('path')

    console.log('[AndbBuilder] executeExport start', options)
    console.log('[AndbBuilder] Current CWD:', process.cwd())

    const {
      type = 'tables',
      environment,
      name = null
    } = options

    // Map type to DDL constant (lowercase to match andb-core constants)
    const ddlType = type.toLowerCase()
    console.log('[AndbBuilder] ddlType:', ddlType, 'environment:', environment, 'name:', name)

    try {
      // Call exporter service directly
      console.log('[AndbBuilder] Getting exporter service...')
      const exportFn = services.exporter(ddlType, name)
      console.log('[AndbBuilder] exportFn type:', typeof exportFn)

      console.log(`[AndbBuilder] Calling exportFn for ${ddlType}...`)
      const result = await exportFn(environment)
      console.log(`[AndbBuilder] exportFn completed for ${ddlType}. Success: ${result?.success}, Count: ${result?.count}`)

      return result
    } catch (error: any) {
      console.error('[AndbBuilder] Export failed:', error)
      console.error('[AndbBuilder] Error stack:', error.stack)
      throw error
    }
  }

  /**
   * Execute compare operation
   */
  private static async executeCompare(services: any, options: any, config: any, destEnv: string) {
    const fs = require('fs')
    const path = require('path')

    const {
      type = 'tables',
      name = null
    } = options

    // Map type to DDL constant (lowercase to match andb-core constants)
    const ddlType = type.toLowerCase()

    console.log('[executeCompare] Starting comparison for', ddlType, name ? `(${name})` : '')
    console.log('[executeCompare] baseDir:', config.baseDir)

    try {
      // Call comparator service directly
      const compareFn = services.comparator(ddlType, name)
      await compareFn(destEnv)

      console.log('[executeCompare] Comparator completed')

      // Debug: Check what files were created
      const srcEnv = config.getSourceEnv(destEnv)
      const dbName = config.getDBName(srcEnv)

      console.log('[executeCompare] Checking created files:')
      const checkPaths = [
        path.join(config.baseDir, 'db'),
        path.join(config.baseDir, 'db', srcEnv),
        path.join(config.baseDir, 'db', destEnv),
        path.join(config.baseDir, 'map-migrate')
      ]

      checkPaths.forEach(p => {
        if (fs.existsSync(p)) {
          console.log(`[executeCompare] ✓ ${p}`)
          try {
            const files = fs.readdirSync(p)
            console.log(`[executeCompare]   Contents:`, files.slice(0, 5))
          } catch (e) {
            console.log(`[executeCompare]   Could not read contents`)
          }
        } else {
          console.log(`[executeCompare] ✗ ${p}`)
        }
      })

      // Read and return results from SQLite
      const storage = this.getSQLiteStorage();
      const destDbName = config.getDBName(destEnv);
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

      console.log(`[executeCompare] Found ${mapped.length} total objects (including identical: ${mapped.filter((i: any) => i.status === 'equal').length})`)
      return mapped
    } catch (error: any) {
      console.error('[executeCompare] Compare failed:', error)
      throw error
    }
  }


  /**
   * Execute migrate operation
   */
  private static async executeMigrate(services: any, options: any, destEnv: string) {
    const {
      type = 'tables',
      status = 'NEW', // NEW, UPDATED, DEPRECATED
      name = null // Specific DDL name to migrate
    } = options

    // Map type to DDL constant (lowercase to match andb-core constants)
    const ddlType = type.toLowerCase()
    // Call migrator service directly
    // Signature: migrate(ddl, status, specificName = null)
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

    console.log(`[AndbBuilder] Fetching saved results for ${ddlType} (${srcEnv} -> ${destEnv})...`)
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

    console.log(`[AndbBuilder] Found ${mapped.length} saved objects for ${ddlType}`)
    return mapped
  }

  /**
   * Test if andb-core is available and working
   */
  static async test(): Promise<boolean> {
    try {
      const { Container } = require('@andb/core')
      return !!Container
    } catch (error) {
      console.error('andb-core not available:', error)
      return false
    }
  }
}

export default AndbBuilder
