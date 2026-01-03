<template>
  <teleport to="body">
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="close"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        @click.stop
      >
        <!-- Header with gradient -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8 text-center">
          <img 
            src="/andb-logo.png" 
            alt="ANDB Logo" 
            class="w-20 h-20 mx-auto mb-4"
          />
          <h2 class="text-3xl font-bold text-white mb-2">Andb</h2>
          <p class="text-primary-100">Simplest Database Migration Tool</p>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <!-- Version -->
          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Version</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ version }}</span>
          </div>

          <!-- Author -->
          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Author</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ author }}</span>
          </div>

          <!-- License -->
          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">License</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ license }}</span>
          </div>

          <!-- Copyright -->
          <div class="pt-3">
            <p class="text-xs text-center text-gray-500 dark:text-gray-400">
              © 2024 {{ author }}. All rights reserved.
            </p>
            <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
              Built with ❤️ for backend developers
            </p>
          </div>

          <!-- Links -->
          <div class="flex items-center justify-center gap-4 pt-4">
            <a 
              href="https://github.com/ph4n4n/andb-ui" 
              target="_blank"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
            >
              <Github class="w-4 h-4" />
              GitHub
            </a>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <a 
              href="https://github.com/ph4n4n/andb-ui/issues" 
              target="_blank"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
            >
              <Bug class="w-4 h-4" />
              Report Issue
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end">
          <button 
            @click="close"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { Github, Bug } from 'lucide-vue-next'

// App metadata
const version = '1.0.0'
const author = 'ph4n4n'
const license = 'MIT'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}
</script>

