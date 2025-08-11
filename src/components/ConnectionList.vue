<template>
  <div class="space-y-6">
    <!-- Header with Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('connections.title') }}
        </h2>
        <span class="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
          {{ filteredConnections.length }} {{ $t('connections.connections') }}
        </span>
      </div>
      
      <div class="flex items-center gap-2">
        <button
          @click="showBulkActions = !showBulkActions"
          :disabled="selectedConnections.length === 0"
          class="btn btn-secondary flex items-center"
        >
          <CheckSquare class="w-4 h-4 mr-2" />
          {{ selectedConnections.length }} {{ $t('common.selected') }}
        </button>
        
        <button
          @click="exportConnections"
          class="btn btn-secondary flex items-center"
        >
          <Download class="w-4 h-4 mr-2" />
          {{ $t('common.export') }}
        </button>
        
        <button
          @click="importConnections"
          class="btn btn-secondary flex items-center"
        >
          <Upload class="w-4 h-4 mr-2" />
          {{ $t('common.import') }}
        </button>
        
        <button
          @click="$emit('add')"
          class="btn btn-primary flex items-center"
        >
          <Plus class="w-4 h-4 mr-2" />
          {{ $t('connections.addConnection') }}
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="showBulkActions && selectedConnections.length > 0" class="card p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-300">
          {{ $t('connections.bulkActionsFor', { count: selectedConnections.length }) }}
        </span>
        
        <div class="flex items-center gap-2">
          <button
            @click="bulkTestConnections"
            :disabled="isBulkTesting"
            class="btn btn-secondary flex items-center"
          >
            <Wifi v-if="!isBulkTesting" class="w-4 h-4 mr-2" />
            <Loader v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ isBulkTesting ? $t('connections.testing') : $t('connections.testAll') }}
          </button>
          
          <button
            @click="bulkDeleteConnections"
            class="btn btn-danger flex items-center"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            {{ $t('connections.deleteSelected') }}
          </button>
          
          <button
            @click="clearSelection"
            class="btn btn-secondary"
          >
            {{ $t('common.clear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('connections.searchPlaceholder')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Environment Filter -->
        <div>
          <select
            v-model="environmentFilter"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{{ $t('connections.allEnvironments') }}</option>
            <option value="DEV">{{ $t('environments.dev') }}</option>
            <option value="STAGE">{{ $t('environments.stage') }}</option>
            <option value="PROD">{{ $t('environments.prod') }}</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{{ $t('connections.allStatuses') }}</option>
            <option value="connected">{{ $t('connections.connected') }}</option>
            <option value="testing">{{ $t('connections.testing') }}</option>
            <option value="failed">{{ $t('connections.failed') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Connections Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left">
                <input
                  v-model="selectAll"
                  @change="toggleSelectAll"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('connections.connectionName') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('connections.host') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('connections.environment') }}
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
              v-for="connection in filteredConnections"
              :key="connection.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  v-model="selectedConnections"
                  :value="connection.id"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              
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
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEnvironmentBadgeClass(connection.environment)"
                >
                  {{ $t(`environments.${connection.environment.toLowerCase()}`) }}
                </span>
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
                    @click="$emit('edit', connection)"
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
      <div v-if="filteredConnections.length === 0" class="text-center py-12">
        <Database class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('connections.noConnections') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('connections.noConnectionsDescription') }}
        </p>
        <div class="mt-6">
          <button
            @click="$emit('add')"
            class="btn btn-primary"
          >
            {{ $t('connections.addConnection') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        {{ $t('common.showing', { from: (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, filteredConnections.length), total: filteredConnections.length }) }}
      </div>
      
      <div class="flex items-center gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn btn-secondary"
        >
          {{ $t('common.previous') }}
        </button>
        
        <span class="text-sm text-gray-700 dark:text-gray-300">
          {{ $t('common.page', { current: currentPage, total: totalPages }) }}
        </span>
        
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn btn-secondary"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  CheckSquare, 
  Wifi, 
  Loader, 
  Trash2, 
  Edit, 
  Database 
} from 'lucide-vue-next'
import type { DatabaseConnection } from '@/stores/app'

const { t: $t } = useI18n()

interface Props {
  connections: DatabaseConnection[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
  edit: [connection: DatabaseConnection]
  delete: [id: string]
  test: [id: string]
  bulkDelete: [ids: string[]]
  bulkTest: [ids: string[]]
  export: []
  import: []
}>()

// State
const searchQuery = ref('')
const environmentFilter = ref('')
const statusFilter = ref('')
const selectedConnections = ref<string[]>([])
const showBulkActions = ref(false)
const isBulkTesting = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// Computed
const filteredConnections = computed(() => {
  let filtered = props.connections

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(conn => 
      conn.name.toLowerCase().includes(query) ||
      conn.host.toLowerCase().includes(query) ||
      conn.database.toLowerCase().includes(query) ||
      conn.username.toLowerCase().includes(query)
    )
  }

  // Environment filter
  if (environmentFilter.value) {
    filtered = filtered.filter(conn => conn.environment === environmentFilter.value)
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(conn => conn.status === statusFilter.value)
  }

  return filtered
})

const selectAll = computed({
  get: () => selectedConnections.value.length === filteredConnections.value.length && filteredConnections.value.length > 0,
  set: (value) => {
    if (value) {
      selectedConnections.value = filteredConnections.value.map(conn => conn.id)
    } else {
      selectedConnections.value = []
    }
  }
})

const totalPages = computed(() => Math.ceil(filteredConnections.value.length / pageSize.value))

// Methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedConnections.value = []
  } else {
    selectedConnections.value = filteredConnections.value.map(conn => conn.id)
  }
}

const clearSelection = () => {
  selectedConnections.value = []
  showBulkActions.value = false
}

const getEnvironmentBadgeClass = (environment: string) => {
  const classes = {
    DEV: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    STAGE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    PROD: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
  return classes[environment as keyof typeof classes] || classes.DEV
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
  emit('test', id)
}

const deleteConnection = (id: string) => {
  if (confirm($t('connections.confirmDelete'))) {
    emit('delete', id)
  }
}

const bulkTestConnections = async () => {
  isBulkTesting.value = true
  try {
    emit('bulkTest', selectedConnections.value)
  } finally {
    isBulkTesting.value = false
  }
}

const bulkDeleteConnections = () => {
  if (confirm($t('connections.confirmBulkDelete', { count: selectedConnections.value.length }))) {
    emit('bulkDelete', selectedConnections.value)
    clearSelection()
  }
}

const exportConnections = () => {
  emit('export')
}

const importConnections = () => {
  emit('import')
}

// Watch for filter changes to reset pagination
watch([searchQuery, environmentFilter, statusFilter], () => {
  currentPage.value = 1
})
</script>
