/**
 * SQLite Database for History & Logs
 * 
 * ⚠️ STUB FILE - This should NOT be used in renderer process
 * Use window.electronAPI for database operations
 * 
 * Purpose: Store historical data, logs, audit trails
 * Separate from electron-store for:
 * - Complex queries
 * - Large datasets
 * - Relational data
 */

import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

export interface MigrationRecord {
  id: number
  timestamp: string
  source_env: string

  target_env: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  changes: string // JSON
  error?: string
  created_at: string
}

export interface ComparisonHistory {
  id: number
  timestamp: string
  pair_id: string
  source_env: string
  target_env: string
  diff_summary: string // JSON
  created_at: string
}

export interface ExportLog {
  id: number
  timestamp: string
  connection_id: string
  export_type: 'tables' | 'procedures' | 'functions' | 'triggers'
  file_path: string
  status: 'success' | 'failed'
  error?: string
  created_at: string
}

export interface AuditLog {
  id: number
  timestamp: string
  action: string
  resource_type: string
  resource_id: string
  details: string // JSON
  created_at: string
}

class DatabaseManager {
  private db: any | null = null
  private dbPath: string

  constructor() {
    // Database location: ~/Library/Application Support/andb-ui/history.db
    const userDataPath = app.getPath('userData')
    this.dbPath = join(userDataPath, 'history.db')
  }

  /**
   * Initialize database and create tables
   */
  initialize(): void {
    if (this.db) return

    this.db = new Database(this.dbPath)
    this.db.pragma('journal_mode = WAL') // Better performance

    this.createTables()
  }

  /**
   * Create database schema
   */
  private createTables(): void {
    if (!this.db) return

    // Migrations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        source_env TEXT NOT NULL,
        target_env TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
        changes TEXT NOT NULL,
        error TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Comparison history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS comparison_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        pair_id TEXT NOT NULL,
        source_env TEXT NOT NULL,
        target_env TEXT NOT NULL,
        diff_summary TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Export logs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS export_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        connection_id TEXT NOT NULL,
        export_type TEXT NOT NULL CHECK(export_type IN ('tables', 'procedures', 'functions', 'triggers')),
        file_path TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('success', 'failed')),
        error TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Audit logs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        details TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_migrations_timestamp ON migrations(timestamp);
      CREATE INDEX IF NOT EXISTS idx_migrations_status ON migrations(status);
      CREATE INDEX IF NOT EXISTS idx_comparison_timestamp ON comparison_history(timestamp);
      CREATE INDEX IF NOT EXISTS idx_export_timestamp ON export_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    `)
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  // ==================== Migration Operations ====================

  addMigration(migration: Omit<MigrationRecord, 'id' | 'created_at'>): number {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT INTO migrations (timestamp, source_env, target_env, status, changes, error)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const info = stmt.run(
      migration.timestamp,
      migration.source_env,
      migration.target_env,
      migration.status,
      migration.changes,
      migration.error || null
    )

    return info.lastInsertRowid as number
  }

  getMigrations(limit = 50): MigrationRecord[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT * FROM migrations
      ORDER BY created_at DESC
      LIMIT ?
    `)

    return stmt.all(limit) as MigrationRecord[]
  }

  updateMigrationStatus(id: number, status: MigrationRecord['status'], error?: string): void {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      UPDATE migrations
      SET status = ?, error = ?
      WHERE id = ?
    `)

    stmt.run(status, error || null, id)
  }

  // ==================== Comparison Operations ====================

  addComparison(comparison: Omit<ComparisonHistory, 'id' | 'created_at'>): number {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT INTO comparison_history (timestamp, pair_id, source_env, target_env, diff_summary)
      VALUES (?, ?, ?, ?, ?)
    `)

    const info = stmt.run(
      comparison.timestamp,
      comparison.pair_id,
      comparison.source_env,
      comparison.target_env,
      comparison.diff_summary
    )

    return info.lastInsertRowid as number
  }

  getComparisons(limit = 50): ComparisonHistory[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT * FROM comparison_history
      ORDER BY created_at DESC
      LIMIT ?
    `)

    return stmt.all(limit) as ComparisonHistory[]
  }

  // ==================== Export Operations ====================

  addExportLog(log: Omit<ExportLog, 'id' | 'created_at'>): number {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT INTO export_logs (timestamp, connection_id, export_type, file_path, status, error)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const info = stmt.run(
      log.timestamp,
      log.connection_id,
      log.export_type,
      log.file_path,
      log.status,
      log.error || null
    )

    return info.lastInsertRowid as number
  }

  getExportLogs(limit = 50): ExportLog[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT * FROM export_logs
      ORDER BY created_at DESC
      LIMIT ?
    `)

    return stmt.all(limit) as ExportLog[]
  }

  // ==================== Audit Operations ====================

  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): number {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (timestamp, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, ?, ?)
    `)

    const info = stmt.run(
      log.timestamp,
      log.action,
      log.resource_type,
      log.resource_id,
      log.details
    )

    return info.lastInsertRowid as number
  }

  getAuditLogs(limit = 100): AuditLog[] {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `)

    return stmt.all(limit) as AuditLog[]
  }

  // ==================== Utilities ====================

  /**
   * Clean up old records (data retention)
   */
  cleanup(daysToKeep = 90): void {
    if (!this.db) throw new Error('Database not initialized')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoff = cutoffDate.toISOString()

    this.db.prepare('DELETE FROM migrations WHERE created_at < ?').run(cutoff)
    this.db.prepare('DELETE FROM comparison_history WHERE created_at < ?').run(cutoff)
    this.db.prepare('DELETE FROM export_logs WHERE created_at < ?').run(cutoff)
    this.db.prepare('DELETE FROM audit_logs WHERE created_at < ?').run(cutoff)
  }

  /**
   * Get database stats
   */
  getStats() {
    if (!this.db) throw new Error('Database not initialized')

    return {
      migrations: this.db.prepare('SELECT COUNT(*) as count FROM migrations').get() as { count: number },
      comparisons: this.db.prepare('SELECT COUNT(*) as count FROM comparison_history').get() as { count: number },
      exports: this.db.prepare('SELECT COUNT(*) as count FROM export_logs').get() as { count: number },
      audits: this.db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as { count: number },
      path: this.dbPath
    }
  }
}

// Singleton instance
export const database = new DatabaseManager()

// Export for Electron main process
export default database
