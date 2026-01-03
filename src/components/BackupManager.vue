<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-2">
      <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
        Application Data Backup
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button 
        @click="handleExport"
        class="group flex items-center justify-between p-4 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 active:scale-[0.98] text-left"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl group-hover:scale-110 transition-transform">
            <Download class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Export Backup</h3>
            <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">Save all data to a JSON file.</p>
          </div>
        </div>
        <div class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-500 group-hover:text-white transition-colors">
          <ArrowRight class="w-4 h-4" />
        </div>
      </button>

      <label class="group cursor-pointer flex items-center justify-between p-4 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.98] text-left">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
            <Upload class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Import Backup</h3>
            <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">Restore data from backup file.</p>
          </div>
        </div>
        <input type="file" @change="handleImport" class="hidden" accept=".json" />
        <div class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <ArrowRight class="w-4 h-4" />
        </div>
      </label>
    </div>

    <!-- Warning Area -->
    <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-start gap-3">
      <AlertTriangle class="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
      <div class="text-[11px] text-red-700 dark:text-red-300">
        <p class="font-bold uppercase tracking-tight mb-1">Warning: Import overwrites everything</p>
        <p>Restoring from a backup will replace ALL your current connections, environment configurations, and connection pairs. This action cannot be undone.</p>
      </div>
    </div>

    <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
      <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-4">
        Database DDL Snapshots (Auto-Backup)
      </p>
      
      <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <HistoryIcon class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">DDL History & Snapshots</h3>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">The app automatically takes snapshots of DDL before every migration.</p>
            </div>
          </div>
          <router-link to="/history" class="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View History
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400">
              <Folder class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] block font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Physical Path</span>
              <span class="text-[11px] text-gray-600 dark:text-gray-400 font-mono bg-gray-100/50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded">/backups/*.sql</span>
            </div>
          </div>
          <button 
            @click="handleOpenFolder"
            class="font-bold uppercase tracking-widest transition-all active:scale-95"
            :class="appStore.buttonStyle === 'full'
              ? 'px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white rounded-xl text-[11px] shadow-lg shadow-gray-900/10'
              : 'px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-[10px]'"
          >
            Explore Files
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Upload, AlertTriangle, History as HistoryIcon, Folder, ArrowRight } from 'lucide-vue-next'
import backup from '@/utils/backup'
import Andb from '@/utils/andb'
import { useNotificationStore } from '@/stores/notification'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const notificationStore = useNotificationStore()

const handleExport = async () => {
  try {
    await backup.download()
    notificationStore.add({
      type: 'success',
      title: 'Export Success',
      message: 'Backup file exported successfully'
    })
  } catch (error: any) {
    notificationStore.add({
      type: 'error',
      title: 'Export Failed',
      message: `Export failed: ${error.message}`
    })
  }
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!confirm('Are you sure you want to restore data from this file? This will OVERWRITE all current data.')) {
    target.value = ''
    return
  }

  try {
    const success = await backup.importFromFile(file)
    if (success) {
      notificationStore.add({
        type: 'success',
        title: 'Restore Success',
        message: 'Data restored successfully. Please reload the application to apply all changes.'
      })
      // Optional: force reload
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {
      throw new Error('Invalid backup file or version mismatch')
    }
  } catch (error: any) {
    notificationStore.add({
      type: 'error',
      title: 'Restore Failed',
      message: `Restore failed: ${error.message}`
    })
  } finally {
    target.value = ''
  }
}

const handleOpenFolder = async () => {
  const success = await Andb.openBackupFolder()
  if (!success) {
    notificationStore.add({
      type: 'error',
      title: 'Failed',
      message: 'Could not open backup folder'
    })
  }
}
</script>
