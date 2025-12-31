import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { join } from 'path'
import { AndbBuilder } from './services/andb-builder'
import { SQLiteStorageService } from './services/sqlite-storage'

const isDev = process.env.NODE_ENV === 'development'

// Enable hot reload for development
if (isDev) {
  try {
    const electronReload = require('electron-reload')
    const reloadFn = electronReload.default || electronReload
    reloadFn(__dirname, {
      electron: join(__dirname, '../node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
    })
  } catch (error) {
    console.log('electron-reload not available in production')
  }
}

app.name = 'Andb'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Andb',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    icon: join(__dirname, '../public/icon.png'),
    titleBarStyle: 'default',
    show: false
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/#/splash')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    // Navigate to splash after loading
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript('window.location.hash = "#/splash"')
    })
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    // Dereference the window object
  })

  return mainWindow
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  const mainWindow = createWindow()

  // Auto-load mock compare data in development mode
  // if (isDev) {
  if (false) { // Disable mock data to test real data loading
    try {
      const Store = require('electron-store')
      const store = new Store()

      // Check if mock data already exists
      const hasCache = store.has('compare_DEV_STAGE_TABLES_latest')

      if (!hasCache) {
        console.log('🔄 Loading mock compare data for development...')
        // Load mock data (same as IPC handler)
        const mockTables = [
          {
            name: 'users',
            status: 'different',
            type: 'tables',
            ddl: [
              'ALTER TABLE `users` ADD COLUMN `email_verified` TINYINT(1) DEFAULT 0 AFTER `email`;',
              'ALTER TABLE `users` ADD INDEX `idx_email_verified` (`email_verified`);'
            ],
            diff: {
              source: `CREATE TABLE \`users\` (\n  \`id\` INT(11) NOT NULL AUTO_INCREMENT,\n  \`username\` VARCHAR(255) NOT NULL,\n  \`email\` VARCHAR(255) NOT NULL,\n  \`email_verified\` TINYINT(1) DEFAULT 0,\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`),\n  UNIQUE KEY \`idx_username\` (\`username\`),\n  UNIQUE KEY \`idx_email\` (\`email\`),\n  KEY \`idx_email_verified\` (\`email_verified\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
              target: `CREATE TABLE \`users\` (\n  \`id\` INT(11) NOT NULL AUTO_INCREMENT,\n  \`username\` VARCHAR(255) NOT NULL,\n  \`email\` VARCHAR(255) NOT NULL,\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`),\n  UNIQUE KEY \`idx_username\` (\`username\`),\n  UNIQUE KEY \`idx_email\` (\`email\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
            }
          },
          {
            name: 'products',
            status: 'missing_in_target',
            type: 'tables',
            ddl: [
              `CREATE TABLE \`products\` (\n  \`id\` INT(11) NOT NULL AUTO_INCREMENT,\n  \`name\` VARCHAR(255) NOT NULL,\n  \`price\` DECIMAL(10,2) NOT NULL,\n  \`stock\` INT(11) DEFAULT 0,\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`),\n  KEY \`idx_name\` (\`name\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
            ],
            diff: {
              source: `CREATE TABLE \`products\` (\n  \`id\` INT(11) NOT NULL AUTO_INCREMENT,\n  \`name\` VARCHAR(255) NOT NULL,\n  \`price\` DECIMAL(10,2) NOT NULL,\n  \`stock\` INT(11) DEFAULT 0,\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`),\n  KEY \`idx_name\` (\`name\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
              target: null
            }
          },
          {
            name: 'old_logs',
            status: 'missing_in_source',
            type: 'tables',
            ddl: ['DROP TABLE IF EXISTS `old_logs`;'],
            diff: {
              source: null,
              target: `CREATE TABLE \`old_logs\` (\n  \`id\` INT(11) NOT NULL AUTO_INCREMENT,\n  \`message\` TEXT,\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
            }
          }
        ]

        const mockProcedures = [
          {
            name: 'sp_get_user_stats',
            status: 'different',
            type: 'procedures',
            ddl: [
              `DROP PROCEDURE IF EXISTS \`sp_get_user_stats\`;`,
              `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)\nBEGIN\n  SELECT \n    COUNT(*) as total_orders,\n    SUM(total) as total_spent\n  FROM orders\n  WHERE user_id = user_id AND status = 'completed';\nEND;`
            ],
            diff: {
              source: `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)\nBEGIN\n  SELECT \n    COUNT(*) as total_orders,\n    SUM(total) as total_spent\n  FROM orders\n  WHERE user_id = user_id AND status = 'completed';\nEND;`,
              target: `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)\nBEGIN\n  SELECT \n    COUNT(*) as total_orders\n  FROM orders\n  WHERE user_id = user_id;\nEND;`
            }
          }
        ]

        store.set('compare_DEV_STAGE_TABLES_latest', {
          timestamp: new Date().toISOString(),
          srcEnv: 'DEV',
          destEnv: 'STAGE',
          ddlType: 'TABLES',
          results: mockTables
        })

        store.set('compare_DEV_STAGE_PROCEDURES_latest', {
          timestamp: new Date().toISOString(),
          srcEnv: 'DEV',
          destEnv: 'STAGE',
          ddlType: 'PROCEDURES',
          results: mockProcedures
        })

        store.set('compare_DEV_STAGE_FUNCTIONS_latest', {
          timestamp: new Date().toISOString(),
          srcEnv: 'DEV',
          destEnv: 'STAGE',
          ddlType: 'FUNCTIONS',
          results: []
        })

        console.log('✅ Mock compare data loaded automatically!')
        console.log('  - Tables:', mockTables.length)
        console.log('  - Procedures:', mockProcedures.length)
      } else {
        console.log('ℹ️  Mock compare data already exists')
      }
    } catch (error) {
      console.error('Failed to auto-load mock data:', error)
    }
  }

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })
})

// ========================================
// IPC Handlers for andb-core CLI
// ========================================

/**
 * Execute andb-core operation (direct import, no subprocess)
 */
ipcMain.handle('execute-andb-operation', async (
  event,
  sourceConn: any,
  targetConn: any,
  operation: string,
  options: any
) => {
  try {
    const result = await AndbBuilder.execute(
      sourceConn,
      targetConn,
      operation as any,
      options
    )
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Test database connection (direct MySQL test)
 */
ipcMain.handle('test-connection', async (event, connection: any) => {
  try {
    const mysql = require('mysql2/promise')

    // Create test connection
    const conn = await mysql.createConnection({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password || '',
      connectTimeout: 5000
    })

    // Test query
    await conn.query('SELECT 1')
    await conn.end()

    return { success: true, message: 'Connection successful' }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed'
    }
  }
})

// ========================================
// IPC Handlers for Database/Storage (Core SQLite)
// ========================================

/**
 * Get migration history
 */
ipcMain.handle('get-migration-history', async (event, limit: number = 50) => {
  try {
    const storage = SQLiteStorageService.getInstance()
    return { success: true, data: storage.getMigrationHistory(limit) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Get comparison history
 */
ipcMain.handle('get-comparison-history', async (event, limit: number = 50) => {
  try {
    const storage = SQLiteStorageService.getInstance()
    return { success: true, data: storage.getLatestComparisons(limit) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Get database stats
 */
ipcMain.handle('get-database-stats', async () => {
  try {
    const storage = SQLiteStorageService.getInstance()
    return { success: true, data: storage.getStats() }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// ========================================
// IPC Handlers for andb-core Operations
// ========================================

/**
 * Execute andb-core operation with selected pair
 * Replaces old subprocess approach with programmatic API
 */
ipcMain.handle('andb-execute', async (event, args) => {
  const { sourceConnection, targetConnection, operation, options } = args

  try {
    const result = await AndbBuilder.execute(
      sourceConnection,
      targetConnection,
      operation,
      options
    )

    return { success: true, data: result }
  } catch (error: any) {
    console.error('andb-execute error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('andb-get-saved-comparison-results', async (event, args) => {
  const { sourceConnection, targetConnection, type } = args
  try {
    return {
      success: true,
      data: await AndbBuilder.getSavedComparisonResults(sourceConnection, targetConnection, type)
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// ========================================
// IPC Handlers for Storage (electron-store)
// ========================================

// Initialize store (electron-store v8 is CJS compatible)
import Store from 'electron-store'
const store = new Store()

/**
 * Generic Storage Get
 */
ipcMain.handle('storage-get', async (event, key: string) => {
  try {
    return { success: true, data: store.get(key) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Generic Storage Set
 */
ipcMain.handle('storage-set', async (event, key: string, value: any) => {
  try {
    store.set(key, value)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Generic Storage Delete
 */
ipcMain.handle('storage-delete', async (event, key: string) => {
  try {
    store.delete(key)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Generic Storage Has
 */
ipcMain.handle('storage-has', async (event, key: string) => {
  try {
    return { success: true, data: store.has(key) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Generic Storage Clear
 */
ipcMain.handle('storage-clear', async () => {
  try {
    store.clear()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Get all schemas from SQLite storage (replaces filesystem scanning)
 */
ipcMain.handle('andb-get-schemas', async (event) => {
  try {
    const storage = SQLiteStorageService.getInstance()
    console.log('[getSchemas] Retrieving environments and databases from SQLite')

    const environments = storage.getEnvironments()
    console.log('[getSchemas] Found environments:', environments)
    const result: any[] = []

    for (const env of environments) {
      const databases = storage.getDatabases(env)
      console.log(`[getSchemas] Environment ${env} has databases:`, databases)

      const envObj = {
        name: env,
        databases: [] as any[]
      }

      for (const db of databases) {
        const dbObj = {
          name: db,
          tables: [] as any[],
          views: [] as any[],
          procedures: [] as any[],
          functions: [] as any[],
          triggers: [] as any[],
          totalCount: 0
        }

        const ddlTypes = ['tables', 'views', 'procedures', 'functions', 'triggers']
        for (const type of ddlTypes) {
          const names = storage.getDDLList(env, db, type)
          if (names.length > 0) {
            console.log(`[getSchemas] Found ${names.length} ${type} in ${env}/${db}`)
          }

          for (const name of names) {
            const content = storage.getDDL(env, db, type, name)
            if (content) {
              // @ts-ignore
              dbObj[type.toLowerCase()].push({
                name,
                content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                checksum: require('crypto').createHash('md5').update(content).digest('hex')
              })
            }
          }
        }

        dbObj.totalCount = dbObj.tables.length + dbObj.views.length + dbObj.procedures.length + dbObj.functions.length + dbObj.triggers.length
        if (dbObj.totalCount > 0) {
          envObj.databases.push(dbObj)
        }
      }

      if (envObj.databases.length > 0) {
        result.push(envObj)
      }
    }

    console.log(`[getSchemas] Returning ${result.length} environments with data`)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('[getSchemas] Error:', error)
    return { success: false, error: error.message }
  }
})

/**
 * Clear all data from SQLite storage
 */
ipcMain.handle('andb-clear-storage', async () => {
  try {
    const storage = SQLiteStorageService.getInstance()
    storage.clearAll()
    console.log('[clearStorage] SQLite database cleared successfully')
    return { success: true }
  } catch (error: any) {
    console.error('[clearStorage] Error:', error)
    return { success: false, error: error.message }
  }
})

// Load mock compare data for testing
ipcMain.handle('load-mock-compare-data', async () => {
  try {
    const Store = require('electron-store')
    const store = new Store()

    // Mock tables with DDL
    const mockTables = [
      {
        name: 'users',
        status: 'different',
        type: 'tables',
        ddl: [
          'ALTER TABLE `users` ADD COLUMN `email_verified` TINYINT(1) DEFAULT 0 AFTER `email`;',
          'ALTER TABLE `users` ADD INDEX `idx_email_verified` (`email_verified`);'
        ],
        diff: {
          source: `CREATE TABLE \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`email_verified\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_username\` (\`username\`),
  UNIQUE KEY \`idx_email\` (\`email\`),
  KEY \`idx_email_verified\` (\`email_verified\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
          target: `CREATE TABLE \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_username\` (\`username\`),
  UNIQUE KEY \`idx_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
        }
      },
      {
        name: 'products',
        status: 'missing_in_target',
        type: 'tables',
        ddl: [
          `CREATE TABLE \`products\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`stock\` INT(11) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
        ],
        diff: {
          source: `CREATE TABLE \`products\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`stock\` INT(11) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
          target: null
        }
      },
      {
        name: 'old_logs',
        status: 'missing_in_source',
        type: 'tables',
        ddl: [
          'DROP TABLE IF EXISTS `old_logs`;'
        ],
        diff: {
          source: null,
          target: `CREATE TABLE \`old_logs\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`message\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
        }
      }
    ]

    // Mock procedures
    const mockProcedures = [
      {
        name: 'sp_get_user_stats',
        status: 'different',
        type: 'procedures',
        ddl: [
          `DROP PROCEDURE IF EXISTS \`sp_get_user_stats\`;`,
          `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)
BEGIN
  SELECT 
    COUNT(*) as total_orders,
    SUM(total) as total_spent
  FROM orders
  WHERE user_id = user_id AND status = 'completed';
END;`
        ],
        diff: {
          source: `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)
BEGIN
  SELECT 
    COUNT(*) as total_orders,
    SUM(total) as total_spent
  FROM orders
  WHERE user_id = user_id AND status = 'completed';
END;`,
          target: `CREATE PROCEDURE \`sp_get_user_stats\`(IN user_id INT)
BEGIN
  SELECT 
    COUNT(*) as total_orders
  FROM orders
  WHERE user_id = user_id;
END;`
        }
      }
    ]

    // Store mock data
    store.set('compare_DEV_STAGE_TABLES_latest', {
      timestamp: new Date().toISOString(),
      srcEnv: 'DEV',
      destEnv: 'STAGE',
      ddlType: 'TABLES',
      results: mockTables
    })

    store.set('compare_DEV_STAGE_PROCEDURES_latest', {
      timestamp: new Date().toISOString(),
      srcEnv: 'DEV',
      destEnv: 'STAGE',
      ddlType: 'PROCEDURES',
      results: mockProcedures
    })

    store.set('compare_DEV_STAGE_FUNCTIONS_latest', {
      timestamp: new Date().toISOString(),
      srcEnv: 'DEV',
      destEnv: 'STAGE',
      ddlType: 'FUNCTIONS',
      results: []
    })

    console.log('✅ Mock compare data loaded!')
    console.log('  - Tables:', mockTables.length)
    console.log('  - Procedures:', mockProcedures.length)

    return {
      success: true,
      message: `Loaded ${mockTables.length} tables, ${mockProcedures.length} procedures`
    }
  } catch (error: any) {
    console.error('Failed to load mock data:', error)
    return { success: false, error: error.message }
  }
})

// Close database on app quit
// NOTE: Database is now managed by andb-core
// app.on('before-quit', () => {
//   database.close()
// })
