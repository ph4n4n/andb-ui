import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UpdateInfo {
  version: string
  releaseNotes?: string | Array<any>
  releaseDate?: string
}

export interface ProgressInfo {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

export const useUpdaterStore = defineStore('updater', () => {
  const status = ref<'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>('idle')
  const updateInfo = ref<UpdateInfo | null>(null)
  const progress = ref<ProgressInfo | null>(null)
  const error = ref<string | null>(null)
  const showModal = ref(false)

  // Settings
  const autoDownload = ref(false) // If true, we skip the "Ask" phase

  const setStatus = (newStatus: string, data?: any) => {
    status.value = newStatus as any
    if (newStatus === 'available' || newStatus === 'downloaded') {
      if (data) updateInfo.value = data
      // Auto-show modal on new update
      if (newStatus === 'available') showModal.value = true
    }
    if (newStatus === 'downloading' && data) {
      progress.value = data
    }
    if (newStatus === 'error') {
      error.value = data
    }
  }

  const checkForUpdates = async () => {
    status.value = 'checking'
    await window.electronAPI.updater.checkForUpdates()
  }

  const downloadUpdate = async () => {
    status.value = 'downloading'
    await window.electronAPI.updater.downloadUpdate()
  }

  const quitAndInstall = async () => {
    await window.electronAPI.updater.quitAndInstall()
  }

  const dismissUpdate = () => {
    showModal.value = false
  }

  return {
    status,
    updateInfo,
    progress,
    error,
    showModal,
    autoDownload,
    setStatus,
    checkForUpdates,
    downloadUpdate,
    quitAndInstall,
    dismissUpdate
  }
})
