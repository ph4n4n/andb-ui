import { storage } from './storage-ipc'

/**
 * Backup and Restore Utility
 * 
 * Export/import application data
 */

export interface BackupData {
  version: string
  timestamp: string
  connections: any[]
  connectionPairs: any[]
  environments: any[]
  settings: any
}

export const backup = {
  /**
   * Create full backup of application data
   */
  async create(): Promise<BackupData> {
    return {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      connections: await storage.getConnections(),
      connectionPairs: await storage.getConnectionPairs(),
      environments: await storage.getEnvironments(),
      settings: await storage.getSettings()
    }
  },

  /**
   * Export backup as JSON string
   */
  async export(): Promise<string> {
    const data = await this.create()
    return JSON.stringify(data, null, 2)
  },

  /**
   * Download backup file
   */
  async download(filename = `andb-ui-backup-${Date.now()}.json`) {
    const json = await this.export()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  },

  /**
   * Restore from backup data
   */
  async restore(data: BackupData): Promise<boolean> {
    try {
      // Validate backup data
      if (!data.version || !data.timestamp) {
        throw new Error('Invalid backup data format')
      }

      // Restore data
      if (data.connections) {
        await storage.saveConnections(data.connections)
      }

      if (data.connectionPairs) {
        await storage.saveConnectionPairs(data.connectionPairs)
      }

      if (data.environments) {
        await storage.saveEnvironments(data.environments)
      }

      if (data.settings) {
        await storage.saveSettings(data.settings)
      }

      return true
    } catch (error) {
      return false
    }
  },

  /**
   * Import backup from JSON string
   */
  async import(json: string): Promise<boolean> {
    try {
      const data = JSON.parse(json) as BackupData
      return await this.restore(data)
    } catch (error) {
      return false
    }
  },

  /**
   * Import from file
   */
  async importFromFile(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      return this.import(text)
    } catch (error) {
      return false
    }
  }
}

export default backup
