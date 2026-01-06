<template>
  <div v-if="store.showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!-- Backdrop -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div 
        class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" 
        aria-hidden="true"
        @click="store.status !== 'downloading' ? store.dismissUpdate() : null"
      ></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-200 dark:border-gray-700">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <h3 class="text-lg leading-6 font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-yellow-500 fill-current" />
            {{ statusTitle }}
          </h3>
          <button 
            v-if="store.status !== 'downloading'"
            @click="store.dismissUpdate()"
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          
          <!-- Version Badge -->
          <div class="flex items-center gap-3 mb-4 text-sm">
             <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono">Current: {{ currentVersion }}</span>
             <ArrowRight class="w-4 h-4 text-gray-400" />
             <span class="px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-mono font-bold">New: {{ store.updateInfo?.version }}</span>
          </div>

          <!-- Release Notes -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What's New:</h4>
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert prose-sm">
               <!-- In a real app we would use markdown-it here -->
               <div v-if="releaseNotes" v-html="formatReleaseNotes(releaseNotes)"></div>
               <p v-else class="italic text-gray-500">No release notes provided.</p>
            </div>
          </div>

          <!-- Downloading State -->
          <div v-if="store.status === 'downloading'" class="space-y-2">
             <div class="flex justify-between text-xs text-gray-500">
                <span>Downloading...</span>
                <span>{{ percent }}%</span>
             </div>
             <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                    class="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                    :style="{ width: `${percent}%` }"
                ></div>
             </div>
             <div class="flex justify-between text-xs text-gray-400">
                <span>{{ formatBytes(store.progress?.connections || 0) }}/s</span> <!-- Actually bytesPerSecond -->
                <span>{{ formatBytes(store.progress?.transferred || 0) }} / {{ formatBytes(store.progress?.total || 0) }}</span>
             </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 sm:flex sm:flex-row-reverse gap-2">
          
          <!-- Restart Action -->
          <button 
             v-if="store.status === 'downloaded'"
             @click="store.quitAndInstall()" 
             class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Restart & Install
          </button>

          <!-- Download Action -->
          <button 
             v-else-if="store.status === 'available'"
             @click="store.downloadUpdate()" 
             class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            <DownloadCloud class="w-4 h-4 mr-2" />
            Download Update
          </button>

           <button 
             v-if="store.status !== 'downloading'"
             @click="store.dismissUpdate()" 
             class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {{ store.status === 'downloaded' ? 'Later' : 'Skip This Version' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, X, ArrowRight, DownloadCloud } from 'lucide-vue-next'
import { useUpdaterStore } from '@/stores/updater'

const store = useUpdaterStore()

// Mock current version (in real app, get from API or defined const)
const currentVersion = '2.0.0' 

const statusTitle = computed(() => {
    switch(store.status) {
        case 'available': return 'Update Available'
        case 'downloading': return 'Downloading Update...'
        case 'downloaded': return 'Ready to Install 🚀'
        default: return 'Update Info'
    }
})

const releaseNotes = computed(() => {
    if (!store.updateInfo?.releaseNotes) return null
    if (Array.isArray(store.updateInfo.releaseNotes)) {
        return store.updateInfo.releaseNotes.map((n: any) => n.note || n).join('\n')
    }
    return store.updateInfo.releaseNotes
})

const percent = computed(() => {
    return Math.round(store.progress?.percent || 0)
})

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const formatReleaseNotes = (notes: string) => {
    // Simple HTML formatting for now
    return notes.replace(/\n/g, '<br/>').replace(/- /g, '• ')
}

</script>
