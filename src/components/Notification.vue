<template>
  <TransitionGroup
    tag="div"
    class="fixed top-6 right-6 z-[9999] flex flex-col items-end space-y-4 pointer-events-none"
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
      class="w-[360px] pointer-events-auto relative group overflow-hidden"
    >
      <!-- Glassmorphic Background -->
      <div 
        class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl border border-white/20 dark:border-gray-700/50 flex flex-col overflow-hidden"
      >
        <div class="p-5 flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            <div 
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
              :class="{
                'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400': notification.type === 'success',
                'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400': notification.type === 'error',
                'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400': notification.type === 'info'
              }"
            >
              <CheckCircle2 v-if="notification.type === 'success'" class="h-6 w-6 stroke-[2.5]" />
              <AlertCircle v-else-if="notification.type === 'error'" class="h-6 w-6 stroke-[2.5]" />
              <Info v-else class="h-6 w-6 stroke-[2.5]" />
            </div>
          </div>
          <div class="ml-4 flex-1 pr-2">
            <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.15em] leading-tight">
              {{ notification.title }}
            </h3>
            <p class="mt-1.5 text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              {{ notification.message }}
            </p>
          </div>
          <button
            @click="remove(notification.id)"
            class="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        
        <!-- Progress Bar (Glow mode) -->
        <div class="h-1 bg-gray-100/50 dark:bg-gray-800/50 w-full overflow-hidden">
          <div 
            class="h-full transition-all duration-100 ease-linear relative"
            :class="{
              'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]': notification.type === 'success',
              'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]': notification.type === 'error',
              'bg-gradient-to-r from-blue-500 to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]': notification.type === 'info'
            }"
            :style="{ width: notification.progress + '%' }"
          >
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  duration?: number
  progress: number
}

const notifications = ref<Notification[]>([])
let nextId = 0

const add = (notification: Omit<Notification, 'id' | 'progress'>) => {
  const id = nextId++
  const duration = notification.duration || 5000
  const n: Notification = { 
    ...notification, 
    id, 
    duration,
    progress: 100 
  }
  notifications.value.push(n)

  const startTime = Date.now()
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, duration - elapsed)
    const index = notifications.value.findIndex(item => item.id === id)
    
    if (index !== -1) {
      notifications.value[index].progress = (remaining / duration) * 100
    } else {
      clearInterval(interval)
      return
    }

    if (remaining <= 0) {
      clearInterval(interval)
      remove(id)
    }
  }, 50)
}

const remove = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// Expose the add method
defineExpose({ add })
</script>

<style scoped>
.v-move {
  transition: all 0.5s ease;
}
</style>
