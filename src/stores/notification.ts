import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
  progress: number
}

export const useNotificationStore = defineStore('notification', () => {
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

  return {
    notifications,
    add,
    remove
  }
})
