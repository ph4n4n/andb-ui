<template>
  <TransitionGroup
    tag="div"
    class="fixed bottom-4 right-4 z-[9999] flex flex-col items-end space-y-2 pointer-events-none"
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-8"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200 absolute"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0 translate-x-4"
  >
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="w-80 pointer-events-auto relative group overflow-hidden"
    >
      <!-- Refined Glassmorphic Background -->
      <div 
        class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
      >
        <div class="px-4 py-3 flex items-start gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0 pt-0.5">
            <CheckCircle2 v-if="notification.type === 'success'" class="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <AlertCircle v-else-if="notification.type === 'error'" class="h-5 w-5 text-rose-500 dark:text-rose-400" />
            <Info v-else class="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {{ notification.title }}
            </h3>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed break-words">
              {{ notification.message }}
            </p>
          </div>
          
          <!-- Close Button -->
          <button
            @click="remove(notification.id)"
            class="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        
        <!-- Subtle Progress Bar -->
        <div class="h-0.5 bg-gray-100 dark:bg-gray-700 w-full overflow-hidden">
          <div 
            class="h-full transition-all duration-100 ease-linear"
            :class="{
              'bg-teal-500 dark:bg-teal-400': notification.type === 'success',
              'bg-rose-500 dark:bg-rose-400': notification.type === 'error',
              'bg-blue-500 dark:bg-blue-400': notification.type === 'info'
            }"
            :style="{ width: notification.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const store = useNotificationStore()
const { notifications } = storeToRefs(store)
const { remove } = store
</script>

<style scoped>
.v-move {
  transition: all 0.5s ease;
}
</style>
