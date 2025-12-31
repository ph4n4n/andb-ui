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

    console.log(`[SQLiteStorage] Database initialized at: ${this.dbPath}`)

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
    console.log('[SQLiteStorage] Schema initialized')
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
   * Clear all data (for testing)
   */
  clearAll(): void {
    this.db.exec('DELETE FROM ddl_exports')
    this.db.exec('DELETE FROM comparisons')
    this.db.exec('DELETE FROM alter_statements')
    this.db.exec('DELETE FROM export_queue')
    console.log('[SQLiteStorage] All data cleared')
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
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      console.log('[SQLiteStorage] Database closed')
    }
  }
}

export default SQLiteStorageService
