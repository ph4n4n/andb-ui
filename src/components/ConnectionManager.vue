<template>
  <div class="space-y-6">
    <!-- Environment Tabs (Horizontal) -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex -mb-px space-x-8">
        <button
          v-for="env in enabledEnvironments"
          :key="env.name"
          @click="selectedEnvironment = env.name"
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2"
          :class="selectedEnvironment === env.name 
            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
        >
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="getEnvironmentBadgeClass(env.name)">
            {{ $t(`environments.${env.name.toLowerCase()}`) }}
          </span>
          <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
            {{ getConnectionCount(env.name) }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Connection List for Selected Environment -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          {{ $t('connections.connectionsFor', { environment: $t(`environments.${selectedEnvironment.toLowerCase()}`) }) }}
        </h3>
        <button @click="showAddForm = true"
                class="btn btn-primary flex items-center">
          <Plus class="w-4 h-4 mr-2" />
          {{ $t('connections.addConnection') }}
        </button>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.connectionName') }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.host') }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.status') }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.lastTested') }}
                </th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('common.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="connection in environmentConnections"
                  :key="connection.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-2 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                        :class="{
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': !connection.type || connection.type === 'mysql',
                          'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400': connection.type === 'postgres',
                          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400': connection.type === 'sqlite'
                        }"
                      >
                         <!-- Simple Text Badge for Type -->
                        <span v-if="connection.type === 'postgres'" class="text-[10px] font-black">PG</span>
                        <span v-else-if="connection.type === 'sqlite'" class="text-[10px] font-black">SL</span>
                        <span v-else class="text-[10px] font-black">MY</span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ connection.name }}
                      </div>
                      <div class="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {{ connection.database }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white truncate max-w-[150px]" :title="`${connection.host}:${connection.port}`">
                    {{ connection.host }}:{{ connection.port }}
                  </div>
                  <div class="text-[11px] text-gray-500 dark:text-gray-400">
                    {{ connection.username }}
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-2 w-2 rounded-full mr-2"
                         :class="getStatusColor(connection.status)"></div>
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{ $t(`connections.${connection.status}`) }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatLastTested(connection.lastTested) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="testConnection(connection.id)"
                            :disabled="connection.status === 'testing'"
                            class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            :title="$t('connections.testConnection')">
                      <ShieldQuestion class="w-4 h-4" />
                    </button>
                    <button @click="editConnection(connection)"
                            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                            :title="$t('common.edit')">
                      <Edit class="w-4 h-4" />
                    </button>
                    <button @click="duplicateConnection(connection)"
                            class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            :title="$t('common.duplicate')">
                      <Copy class="w-4 h-4" />
                    </button>
                    <button @click="deleteConnection(connection.id)"
                            class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            :title="$t('common.delete')">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="environmentConnections.length === 0" class="text-center py-12">
          <Database class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('connections.noConnectionsForEnvironment', { environment: $t(`environments.${selectedEnvironment.toLowerCase()}`) }) }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ $t('connections.addFirstConnection') }}
          </p>
          <div class="mt-6">
            <button @click="showAddForm = true" class="btn btn-primary">
              {{ $t('connections.addConnection') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Connection Modal (Pro Style) -->
    <Teleport to="body">
      <div v-if="showAddForm || editingConnection" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
          @click="closeForm"
        ></div>
        
        <div class="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl max-w-4xl w-full border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center shadow-inner">
                <Database class="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {{ editingConnection ? 'Edit Connection' : 'Add New Connection' }}
                </h3>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Database Endpoint Configuration</p>
              </div>
            </div>
            <button @click="closeForm" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Modal Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <ConnectionForm
              :connection="editingConnection || undefined"
              @save="handleSaveConnection"
              @cancel="closeForm"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Database, ShieldQuestion, Edit, Trash2, X, Copy } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useProjectsStore } from '@/stores/projects' // Added
import ConnectionForm from './ConnectionForm.vue'
import type { DatabaseConnection } from '@/stores/app'

const { t: $t } = useI18n()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()
const projectsStore = useProjectsStore() // Added
const route = useRoute()
const router = useRouter()

// Handle deep linking for actions
onMounted(() => {
  if (route.query.action === 'new') {
    showAddForm.value = true
    // Optional: Clear query param to avoid reopening on refresh, 
    // but usually user might want to see it. 
    // Let's clear it to keep URL clean.
    router.replace({ query: { ...route.query, action: undefined } })
  }
})

// State
const selectedEnvironment = ref('DEV')
const showAddForm = ref(false)
const editingConnection = ref<DatabaseConnection | null>(null)

// Computed
const enabledEnvironments = computed(() => connectionPairsStore.enabledEnvironments)

const environmentConnections = computed(() => {
  return appStore.connections.filter(conn => conn.environment === selectedEnvironment.value)
})

// Methods
const getEnvironmentBadgeClass = (environment: string) => {
  const classes = {
    DEV: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    STAGE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    UAT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    PROD: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
  return classes[environment as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const getConnectionCount = (environmentName: string) => {
  return appStore.connections.filter(conn => conn.environment === environmentName).length
}

const getStatusColor = (status: string) => {
  const colors = {
    connected: 'bg-green-400',
    testing: 'bg-yellow-400',
    failed: 'bg-red-400'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-400'
}

const formatLastTested = (lastTested?: string | Date) => {
  if (!lastTested) return $t('connections.neverTested')
  return new Date(lastTested).toLocaleString()
}

const testConnection = (id: string) => appStore.testConnection(id)

const editConnection = (connection: DatabaseConnection) => {
  editingConnection.value = connection
  selectedEnvironment.value = connection.environment
}

const duplicateConnection = (connection: DatabaseConnection) => {
  const { id, ...rest } = connection
  const newConn = appStore.addConnection(rest as Omit<DatabaseConnection, 'id'>)

  // Stick to project
  if (projectsStore.selectedProjectId && projectsStore.selectedProjectId !== 'default') {
      const current = projectsStore.currentProject
      if (current) {
        const newIds = [...current.connectionIds, newConn.id]
        projectsStore.updateProject(current.id, { connectionIds: newIds })
      }
    }
}

const deleteConnection = (id: string) => {
  if (confirm($t('connections.confirmDelete'))) appStore.removeConnection(id)
}

const handleSaveConnection = (connectionData: Omit<DatabaseConnection, 'id'>) => {
  if (editingConnection.value) {
    appStore.updateConnection(editingConnection.value.id, connectionData)
  } else {
    // Stick: If creating new connection in a project context, attach it!
    const newConn = appStore.addConnection({ 
      ...connectionData, 
      environment: selectedEnvironment.value as 'DEV' | 'STAGE' | 'UAT' | 'PROD' 
    })
    
    // Check if we are in a project
    if (projectsStore.selectedProjectId && projectsStore.selectedProjectId !== 'default') {
      const current = projectsStore.currentProject
      if (current) {
        // Add to project
        const newIds = [...current.connectionIds, newConn.id]
        projectsStore.updateProject(current.id, { connectionIds: newIds })
      }
    }
  }
  closeForm()
}

const closeForm = () => {
  showAddForm.value = false
  editingConnection.value = null
}

// Initialize with first enabled environment
if (enabledEnvironments.value.length > 0) {
  selectedEnvironment.value = enabledEnvironments.value[0].name
}
</script>
