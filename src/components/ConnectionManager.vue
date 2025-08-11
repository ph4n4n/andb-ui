<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ $t('connections.connectionManager') }}
      </h2>
      <button
        @click="$emit('close')"
        class="btn btn-secondary"
      >
        {{ $t('common.close') }}
      </button>
    </div>

    <!-- Environment Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="env in enabledEnvironments"
          :key="env.name"
          @click="selectedEnvironment = env.name"
          class="py-2 px-1 border-b-2 font-medium text-sm"
          :class="selectedEnvironment === env.name 
            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
        >
          <div class="flex items-center gap-2">
            <span
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              :class="getEnvironmentBadgeClass(env.name)"
            >
              {{ $t(`environments.${env.name.toLowerCase()}`) }}
            </span>
            <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
              {{ getConnectionCount(env.name) }}
            </span>
          </div>
        </button>
      </nav>
    </div>

    <!-- Connection List for Selected Environment -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('connections.connectionsFor', { environment: $t(`environments.${selectedEnvironment.toLowerCase()}`) }) }}
        </h3>
        <button
          @click="showAddForm = true"
          class="btn btn-primary flex items-center"
        >
          <Plus class="w-4 h-4 mr-2" />
          {{ $t('connections.addConnection') }}
        </button>
      </div>

      <!-- Connection List -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.connectionName') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.host') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('connections.lastTested') }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('common.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="connection in environmentConnections"
                :key="connection.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <Database class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ connection.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ connection.database }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ connection.host }}:{{ connection.port }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ connection.username }}
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="flex-shrink-0 h-2 w-2 rounded-full mr-2"
                      :class="getStatusColor(connection.status)"
                    ></div>
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{ $t(`connections.${connection.status}`) }}
                    </span>
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatLastTested(connection.lastTested) }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="testConnection(connection.id)"
                      :disabled="connection.status === 'testing'"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                      :title="$t('connections.testConnection')"
                    >
                      <Wifi class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="editConnection(connection)"
                      class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      :title="$t('common.edit')"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="deleteConnection(connection.id)"
                      class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      :title="$t('common.delete')"
                    >
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
            <button
              @click="showAddForm = true"
              class="btn btn-primary"
            >
              {{ $t('connections.addConnection') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Connection Modal -->
    <div v-if="showAddForm || editingConnection" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingConnection ? $t('connections.editConnection') : $t('connections.addConnection') }}
          </h3>
          <button
            @click="closeForm"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <ConnectionForm
          :connection="editingConnection"
          @save="handleSaveConnection"
          @cancel="closeForm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Database, Wifi, Edit, Trash2, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import ConnectionForm from './ConnectionForm.vue'
import type { DatabaseConnection } from '@/stores/app'

const { t: $t } = useI18n()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()

const emit = defineEmits<{
  close: []
}>()

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

const formatLastTested = (lastTested?: Date) => {
  if (!lastTested) return $t('connections.neverTested')
  return new Date(lastTested).toLocaleString()
}

const testConnection = (id: string) => {
  appStore.testConnection(id)
}

const editConnection = (connection: DatabaseConnection) => {
  editingConnection.value = connection
}

const deleteConnection = (id: string) => {
  if (confirm($t('connections.confirmDelete'))) {
    appStore.removeConnection(id)
  }
}

const handleSaveConnection = (connectionData: Omit<DatabaseConnection, 'id'>) => {
  if (editingConnection.value) {
    // Update existing connection
    appStore.updateConnection(editingConnection.value.id, connectionData)
  } else {
    // Add new connection
    appStore.addConnection(connectionData)
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
