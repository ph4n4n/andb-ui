<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <Header />
      
      <!-- Migrate Content -->
      <main class="flex-1 flex">
        <!-- Left Pane: Pending Changes -->
        <div class="flex-1 p-6 border-r border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold">Pending Changes</h2>
            <div class="flex space-x-2">
              <button class="btn btn-secondary">Select All</button>
              <button class="btn btn-primary">Create Migration</button>
            </div>
          </div>
          
          <div class="space-y-3">
            <div v-for="change in pendingChanges" :key="change.id" class="card p-4">
              <div class="flex items-center">
                <input type="checkbox" v-model="change.selected" class="mr-3" />
                <div class="flex-1">
                  <div class="font-medium">{{ change.type }}: {{ change.name }}</div>
                  <div class="text-sm text-gray-500">{{ change.description }}</div>
                </div>
                <span :class="getChangeTypeClass(change.type)">{{ change.type }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resize Handle -->
        <div class="w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-primary-500"></div>
        
        <!-- Right Pane: Migration History -->
        <div class="flex-1 p-6">
          <h2 class="text-xl font-semibold mb-6">Migration History</h2>
          
          <div class="space-y-4">
            <div v-for="migration in migrations" :key="migration.id" class="card p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium">{{ migration.source }} → {{ migration.target }}</div>
                <span :class="getStatusClass(migration.status)">{{ getStatusIcon(migration.status) }}</span>
              </div>
              <div class="text-sm text-gray-500 mb-2">{{ migration.timestamp }}</div>
              <div class="text-sm">
                <div v-for="item in migration.changes" :key="item" class="ml-4">• {{ item }}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Actions -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ selectedChangesCount }} changes selected
          </div>
          <div class="flex space-x-2">
            <button class="btn btn-secondary">Rollback Last</button>
            <button class="btn btn-primary">Create Migration</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

const pendingChanges = ref([
  { id: 1, type: 'Add', name: 'audit_logs', description: 'Add new table for audit logging', selected: false },
  { id: 2, type: 'Modify', name: 'create_order', description: 'Update procedure parameters', selected: false },
  { id: 3, type: 'Add', name: 'validate_email', description: 'Add new function for email validation', selected: false },
  { id: 4, type: 'Update', name: 'update_timestamp', description: 'Modify trigger logic', selected: false }
])

const migrations = ref([
  {
    id: 1,
    source: 'DEV1',
    target: 'STAGE',
    timestamp: '2024-01-15 14:30',
    status: 'completed',
    changes: ['Added 3 tables', 'Updated 2 procedures']
  },
  {
    id: 2,
    source: 'STAGE',
    target: 'PROD',
    timestamp: '2024-01-14 10:15',
    status: 'completed',
    changes: ['Added 1 function']
  },
  {
    id: 3,
    source: 'DEV2',
    target: 'STAGE',
    timestamp: '2024-01-13 16:45',
    status: 'partial',
    changes: ['Modified 2 triggers']
  }
])

const selectedChangesCount = computed(() => {
  return pendingChanges.value.filter(change => change.selected).length
})

const getChangeTypeClass = (type: string) => {
  switch (type) {
    case 'Add': return 'text-green-600 bg-green-100 px-2 py-1 rounded text-xs'
    case 'Modify': return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs'
    case 'Update': return 'text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs'
    default: return 'text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return '✅'
    case 'partial': return '⚠️'
    case 'failed': return '❌'
    default: return '❓'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-600'
    case 'partial': return 'text-yellow-600'
    case 'failed': return 'text-red-600'
    default: return 'text-gray-400'
  }
}
</script>
