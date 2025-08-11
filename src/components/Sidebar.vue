<template>
  <aside 
    :class="[
      'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex-shrink-0',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Navigation Menu -->
      <nav class="flex-1" :class="isCollapsed ? 'px-2 py-6' : 'px-4 py-6'">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.name">
            <router-link
              :to="item.path"
              :class="[
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                $route.path === item.path
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" :class="isCollapsed ? 'mr-0' : 'mr-3'" />
              <span v-show="!isCollapsed">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Connections Section -->
      <div :class="[isCollapsed ? 'px-2' : 'px-4', 'py-4 border-t border-gray-200 dark:border-gray-700']">
        <div v-show="!isCollapsed" class="mb-3">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Connections
          </h3>
        </div>
        
        <ul class="space-y-1">
          <li v-for="connection in connections" :key="connection.name">
            <button
              :class="[
                'flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors duration-200',
                connection.status === 'connected'
                  ? 'text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                  : connection.status === 'testing'
                  ? 'text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
                  : 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
              ]"
            >
              <div class="w-2 h-2 rounded-full" :class="[getStatusColor(connection.status), isCollapsed ? 'mr-0' : 'mr-3']"></div>
              <span v-show="!isCollapsed">{{ connection.name }}</span>
            </button>
          </li>
        </ul>
        
        <button
          v-show="!isCollapsed"
          class="w-full mt-3 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
        >
          + Add New
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { 
  Home, 
  Download, 
  GitCompare, 
  GitBranch, 
  FileText, 
  Settings 
} from 'lucide-vue-next'

const appStore = useAppStore()
const isCollapsed = computed(() => appStore.sidebarCollapsed)

const menuItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Export', path: '/export', icon: Download },
  { name: 'Compare', path: '/compare', icon: GitCompare },
  { name: 'Migrate', path: '/migrate', icon: GitBranch },
  { name: 'Scripts', path: '/scripts', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings }
]

const connections = computed(() => appStore.connections)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'bg-green-500'
    case 'testing':
      return 'bg-yellow-500'
    case 'failed':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

// Expose collapse state for parent components
defineExpose({
  isCollapsed,
  toggle: () => appStore.toggleSidebar()
})
</script>
