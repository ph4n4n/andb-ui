import { app } from 'electron'
import path from 'path'

/**
 * SQLite Storage Service for Electron UI
 * 
 * Provides persistent storage for DDL exports and comparisons
 * Uses better-sqlite3 for synchronous SQLite operations
 */

interface DDLExport {
  environment: string
  database: string
  type: string
  name: string
  content: string
}

interface Comparison {
  srcEnv: string
  destEnv: string
  database: string
  type: string
  name: string
  status: 'new' | 'updated' | 'deprecated'
  diffSummary?: string
  alterStatements?: string
}

export class SQLiteStorageService {
  private db: any
  private dbPath: string
  private static instance: SQLiteStorageService | null = null

  private constructor() {
    const Database = require('better-sqlite3')
    // Match AndbBuilder's storagePath
    this.dbPath = path.join(app.getPath('userData'), 'andb-storage.db')
    this.db = new Database(this.dbPath)

    // Ensure the db directory exists (though path.join(userData) should be safe)
    const fs = require('fs')
    const dbDir = path.dirname(this.dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    this.initializeSchema()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SQLiteStorageService {
    if (!this.instance) {
      this.instance = new SQLiteStorageService()
    }
    return this.instance
  }

  /**
   * Initialize database schema
   */
  private initializeSchema() {
    // Read schema from @andb/core
    const fs = require('fs')
    const schemaPath = require.resolve('@andb/core/core/storage/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')

    // Execute schema
    this.db.exec(schema)
  }

  /**
   * Save DDL export
   */
  saveDDL(data: DDLExport): boolean {
    const { environment, database, type, name, content } = data

    const stmt = this.db.prepare(`
      INSERT INTO ddl_exports (environment, database_name, ddl_type, ddl_name, ddl_content, checksum)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(environment, database_name, ddl_type, ddl_name) 
      DO UPDATE SET 
        ddl_content = excluded.ddl_content,
        checksum = excluded.checksum,
        updated_at = CURRENT_TIMESTAMP,
        exported_to_file = 0
    `)

    const crypto = require('crypto')
    const checksum = crypto.createHash('md5').update(content).digest('hex')

    stmt.run(environment, database, type, name, content, checksum)
    return true
  }

  /**
   * Save multiple DDL exports at once (bulk)
   */
  async saveExport(environment: string, database: string, type: string, data: any[], isFullSync: boolean = false): Promise<boolean> {
    const stmt = this.db.prepare(`
      INSERT INTO ddl_exports (environment, database_name, ddl_type, ddl_name, ddl_content, checksum)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(environment, database_name, ddl_type, ddl_name) 
      DO UPDATE SET 
        ddl_content = excluded.ddl_content,
        checksum = excluded.checksum,
        updated_at = CURRENT_TIMESTAMP,
        exported_to_file = 0
    `)

    const deleteStmt = this.db.prepare(`
      DELETE FROM ddl_exports 
      WHERE environment = ? AND database_name = ? AND ddl_type = ? AND ddl_name = ?
    `)

    const crypto = require('crypto')

    // Get existing names if full sync
    let existingNames: string[] = []
    if (isFullSync) {
      existingNames = this.getDDLList(environment, database, type)
    }

    const transaction = this.db.transaction((items: any[]) => {
      const newNames = new Set<string>()

      // 1. Upsert new items
      for (const item of items) {
        const checksum = crypto.createHash('md5').update(item.ddl).digest('hex')
        stmt.run(environment, database, type, item.name, item.ddl, checksum)
        if (isFullSync) newNames.add(item.name)
      }

      // 2. Delete obsolete items (only for full sync)
      if (isFullSync) {
        for (const name of existingNames) {
          if (!newNames.has(name)) {
            deleteStmt.run(environment, database, type, name)
          }
        }
      }
    })

    transaction(data)
    return true
  }

  /**
   * Get DDL content
   */
  getDDL(environment: string, database: string, type: string, name: string): string | null {
    const stmt = this.db.prepare(`
      SELECT ddl_content 
      FROM ddl_exports 
      WHERE environment = ? 
        AND database_name = ? 
        AND LOWER(ddl_type) = ? 
        AND ddl_name = ?
    `)

    const row = stmt.get(environment, database, type.toLowerCase(), name)
    return row ? row.ddl_content : null
  }

  /**
   * Get DDL objects list with metadata
   */
  getDDLObjects(environment: string, database: string, type: string): any[] {
    const stmt = this.db.prepare(`
      SELECT ddl_name as name, ddl_content as content, updated_at
      FROM ddl_exports 
      WHERE environment = ? 
        AND database_name = ? 
        AND LOWER(ddl_type) = ?
      ORDER BY ddl_name
    `)
    return stmt.all(environment, database, type.toLowerCase())
  }

  /**
   * Get DDL list for environment
   */
  getDDLList(environment: string, database: string, type: string): string[] {
    const stmt = this.db.prepare(`
      SELECT ddl_name 
      FROM ddl_exports 
      WHERE environment = ? 
        AND database_name = ? 
        AND LOWER(ddl_type) = ?
      ORDER BY ddl_name
    `)

    const rows = stmt.all(environment, database, type.toLowerCase())
    return rows.map((row: any) => row.ddl_name)
  }

  /**
   * Save comparison result
   */
  saveComparison(data: Comparison): boolean {
    const { srcEnv, destEnv, database, type, name, status, diffSummary, alterStatements } = data

    const stmt = this.db.prepare(`
      INSERT INTO comparisons (
        src_environment, dest_environment, database_name, 
        ddl_type, ddl_name, status, diff_summary, alter_statements
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(src_environment, dest_environment, database_name, ddl_type, ddl_name)
      DO UPDATE SET
        status = excluded.status,
        diff_summary = excluded.diff_summary,
        alter_statements = excluded.alter_statements,
        updated_at = CURRENT_TIMESTAMP
    `)

    stmt.run(srcEnv, destEnv, database, type, name, status, diffSummary, alterStatements)
    return true
  }

  /**
   * Get comparison results
   */
  getComparisons(srcEnv: string, destEnv: string, database: string, type?: string): any[] {
    let query = `
      SELECT * FROM comparisons 
      WHERE src_environment = ? 
        AND dest_environment = ? 
        AND database_name = ?
    `
    const params: any[] = [srcEnv, destEnv, database]

    if (type) {
      query += ` AND LOWER(ddl_type) = ?`
      params.push(type.toLowerCase())
    }

    query += ` ORDER BY ddl_type, ddl_name`

    const stmt = this.db.prepare(query)
    return stmt.all(...params)
  }

  /**
   * Get comparison by status
   */
  getComparisonsByStatus(
    srcEnv: string,
    destEnv: string,
    database: string,
    type: string,
    status: string
  ): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM comparisons 
      WHERE src_environment = ? 
        AND dest_environment = ? 
        AND database_name = ?
        AND ddl_type = ?
        AND status = ?
      ORDER BY ddl_name
    `)

    return stmt.all(srcEnv, destEnv, database, type, status)
  }

  /**
   * Get latest comparisons (history)
   */
  getLatestComparisons(limit: number = 50): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM comparisons 
      ORDER BY updated_at DESC 
      LIMIT ?
    `)
    return stmt.all(limit)
  }

  /**
   * Get migration history
   */
  getMigrationHistory(limit: number = 50): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM migration_history 
      ORDER BY executed_at DESC 
      LIMIT ?
    `)
    return stmt.all(limit)
  }

  /**
   * Get unique environments
   */
  getEnvironments(): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT environment FROM ddl_exports
      ORDER BY environment
    `)
    return stmt.all().map((r: any) => r.environment)
  }

  /**
   * Get unique databases for environment
   */
  getDatabases(environment: string): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT database_name FROM ddl_exports
      WHERE environment = ?
      ORDER BY database_name
    `)
    return stmt.all(environment).map((r: any) => r.database_name)
  }

  /**
   * Get last updated timestamp for a database
   */
  getLastUpdated(environment: string, database: string): string | null {
    const stmt = this.db.prepare(`
      SELECT MAX(updated_at) as last_updated
      FROM ddl_exports
      WHERE environment = ? AND database_name = ?
    `)
    const result = stmt.get(environment, database)
    return result ? result.last_updated : null
  }

  /**
   * Clear all data for a specific connection
   */
  clearDataForConnection(environment: string, database: string): void {
    const deleteDDL = this.db.prepare(`
      DELETE FROM ddl_exports 
      WHERE environment = ? AND database_name = ?
    `)

    // Also delete related comparisons
    // 1. Where connection is source
    const deleteCompSource = this.db.prepare(`
      DELETE FROM comparisons 
      WHERE src_environment = ? AND database_name = ?
    `)

    // 2. Where connection is target (requires finding items where dest_environment matches)
    // Note: comparisons table stores `database_name` which is usually the source DB name for mapping. 
    // If target env matches, we should clean up too.
    const deleteCompTarget = this.db.prepare(`
      DELETE FROM comparisons 
      WHERE dest_environment = ?
    `)

    const transaction = this.db.transaction(() => {
      deleteDDL.run(environment, database)
      deleteCompSource.run(environment, database)
      // Be careful with deleteCompTarget - it might affect other pairs if not specific enough.
      // But typically comparisons are scoped by pair.
      // Ideally we delete where dest_environment = env AND implied target DB matches... 
      // but comparisons table schema is (src_env, dest_env, database_name). 
      // 'database_name' is the logical name (usually source).
      // If we delete a TARGET connection, we should probably remove comparisons targeting it.
      deleteCompTarget.run(environment)
    })

    transaction()
  }

  /**
   * Clear all data (for testing)
   */
  clearAll(): void {
    this.db.exec('DELETE FROM ddl_exports')
    this.db.exec('DELETE FROM comparisons')
    this.db.exec('DELETE FROM alter_statements')
    this.db.exec('DELETE FROM export_queue')
  }

  /**
   * Get database statistics
   */
  getStats(): any {
    const ddlCount = this.db.prepare('SELECT COUNT(*) as count FROM ddl_exports').get()
    const comparisonCount = this.db.prepare('SELECT COUNT(*) as count FROM comparisons').get()

    return {
      ddlExports: ddlCount.count,
      comparisons: comparisonCount.count,
      dbPath: this.dbPath,
      dbSize: require('fs').statSync(this.dbPath).size
    }
  }

  /**
   * Save DDL snapshot
   */
  saveSnapshot(data: any): boolean {
    const { environment, database, type, name, content, versionTag } = data
    const crypto = require('crypto')
    const checksum = crypto.createHash('md5').update(content || '').digest('hex')

    const stmt = this.db.prepare(`
      INSERT INTO ddl_snapshots (environment, database_name, ddl_type, ddl_name, ddl_content, checksum, version_tag)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(environment, database, type, name, content, checksum, versionTag || null)
    return true
  }

  /**
   * Get snapshots for an object
   */
  getSnapshots(environment: string, database: string, type: string, name: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM ddl_snapshots
      WHERE environment = ? AND database_name = ? AND ddl_type = ? AND ddl_name = ?
      ORDER BY created_at DESC
    `)
    return stmt.all(environment, database, type, name)
  }

  /**
   * Get all snapshots globally
   */
  getAllSnapshots(limit: number = 100): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM ddl_snapshots
      ORDER BY created_at DESC
      LIMIT ?
    `)
    return stmt.all(limit)
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
    }
  }
}

export default SQLiteStorageService
