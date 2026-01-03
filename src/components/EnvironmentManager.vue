<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('environments.configuration') }}
      </h3>
      <div class="flex items-center gap-2">
        <button
          @click="showConnectionManager"
          class="btn btn-secondary flex items-center"
        >
          <Database class="w-4 h-4 mr-2" />
          {{ $t('environments.manageConnections') }}
        </button>
        <button
          @click="addEnvironment"
          class="btn btn-primary flex items-center"
        >
          <Plus class="w-4 h-4 mr-2" />
          {{ $t('environments.addEnvironment') }}
        </button>
      </div>
    </div>

    <!-- Environment List -->
    <div class="space-y-2">
      <draggable
        v-model="environments"
        item-key="id"
        class="space-y-2"
        @end="onDragEnd"
        handle=".drag-handle"
      >
        <template #item="{ element: env }">
          <div class="card p-3 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-3">
              <!-- Drag Handle -->
              <div class="drag-handle cursor-move p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <GripVertical class="w-4 h-4 text-gray-400" />
              </div>

              <!-- Checkbox -->
              <input
                type="checkbox"
                :id="`env-${env.id}`"
                v-model="env.enabled"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />

              <!-- Environment Name Input -->
              <div class="flex-1">
                <input
                  v-model="env.name"
                  type="text"
                  class="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Environment name"
                  @blur="updateEnvironment(env)"
                />
              </div>

              <!-- Environment Type Badge -->
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getEnvironmentBadgeClass(env.name)
                ]"
              >
                {{ getEnvironmentType(env.name) }}
              </span>

              <!-- Connection Count -->
              <div class="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Database class="w-3 h-3 text-gray-500" />
                <span class="text-xs text-gray-600 dark:text-gray-400">
                  {{ getConnectionCount(env.name) }}
                </span>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2">
                <button
                  @click="duplicateEnvironment(env)"
                  class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Duplicate"
                >
                  <Copy class="w-4 h-4" />
                </button>
                <button
                  @click="removeEnvironment(env)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Remove"
                  :disabled="isDefaultEnvironment(env.name)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Environment Description -->
            <div class="mt-2 ml-8">
              <input
                v-model="env.description"
                type="text"
                class="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                placeholder="Description (optional)"
                @blur="updateEnvironment(env)"
              />
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Help Text -->
    <div class="text-sm text-gray-500 dark:text-gray-400">
      <p>• Drag and drop to reorder environments</p>
      <p>• Check/uncheck to enable/disable environments</p>
      <p>• Default environments (DEV, STAGE, UAT, PROD) cannot be deleted</p>
      <p>• Order determines the sequence in migration workflows</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, GripVertical, Copy, Trash2, Database } from 'lucide-vue-next'
import draggable from 'vuedraggable/src/vuedraggable'
import { useConnectionPairsStore, type Environment } from '@/stores/connectionPairs'
import { useAppStore } from '@/stores/app'

const { t: $t } = useI18n()
const connectionPairsStore = useConnectionPairsStore()
const appStore = useAppStore()

const environments = computed(() => connectionPairsStore.environments)

const emit = defineEmits<{
  showConnectionManager: []
}>()

const showConnectionManager = () => {
  emit('showConnectionManager')
}

const getConnectionCount = (environmentName: string) => {
  return appStore.connections.filter(conn => conn.environment === environmentName).length
}

const defaultEnvironments = ['DEV', 'STAGE', 'UAT', 'PROD']

const getEnvironmentType = (name: string) => {
  const upperName = name.toUpperCase()
  if (defaultEnvironments.includes(upperName)) {
    return upperName
  }
  return 'CUSTOM'
}

const getEnvironmentBadgeClass = (name: string) => {
  const type = getEnvironmentType(name)
  switch (type) {
    case 'DEV':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'STAGE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'UAT':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'PROD':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const isDefaultEnvironment = (name: string) => {
  return defaultEnvironments.includes(name.toUpperCase())
}

const addEnvironment = () => {
  connectionPairsStore.addEnvironment({
    name: 'CUSTOM',
    description: '',
    enabled: true,
    order: environments.value.length + 1
  })
}

const duplicateEnvironment = (env: Environment) => {
  connectionPairsStore.addEnvironment({
    name: `${env.name}_COPY`,
    description: env.description,
    enabled: env.enabled,
    order: environments.value.length + 1
  })
}

const removeEnvironment = (env: Environment) => {
  if (!isDefaultEnvironment(env.name)) {
    connectionPairsStore.removeEnvironment(env.id)
  }
}

const updateEnvironment = (env: Environment) => {
  // Validate environment name
  if (!env.name.trim()) {
    env.name = 'CUSTOM'
  }
  
  // Ensure unique names
  const duplicates = environments.value.filter(e => 
    e.name.toUpperCase() === env.name.toUpperCase() && e.id !== env.id
  )
  if (duplicates.length > 0) {
    env.name = `${env.name}_${Date.now()}`
  }
  
  // Update in store
  connectionPairsStore.updateEnvironment(env.id, {
    name: env.name,
    description: env.description,
    enabled: env.enabled
  })
}

const onDragEnd = () => {
  // Update order after drag
  connectionPairsStore.reorderEnvironments(environments.value)
}

// Expose environments for parent component
defineExpose({
  environments: computed(() => environments.value),
  getEnabledEnvironments: () => connectionPairsStore.enabledEnvironments
})
</script>

<style scoped>
.drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .drag-handle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
