<template>
  <div class="space-y-6">
    <!-- Basic Connection Info -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4">{{ $t('connections.basicInfo') }}</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.connectionName') }} *</label>
          <input
            v-model="form.name"
            type="text"
            :placeholder="$t('connections.connectionNamePlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.environment') }} *</label>
          <select
            v-model="form.environment"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :class="{ 'border-red-500': errors.environment }"
          >
            <option value="">{{ $t('common.select') }}</option>
            <option 
              v-for="env in enabledEnvironments" 
              :key="env.name" 
              :value="env.name"
            >
              {{ $t(`environments.${env.name.toLowerCase()}`) }}
            </option>
          </select>
          <p v-if="errors.environment" class="text-red-500 text-sm mt-1">{{ errors.environment }}</p>
        </div>
      </div>
    </div>

    <!-- Database Connection -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4">{{ $t('connections.databaseConnection') }}</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.host') }} *</label>
          <input
            v-model="form.host"
            type="text"
            :placeholder="$t('connections.hostPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :class="{ 'border-red-500': errors.host }"
          />
          <p v-if="errors.host" class="text-red-500 text-sm mt-1">{{ errors.host }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.port') }} *</label>
          <input
            v-model.number="form.port"
            type="number"
            :placeholder="$t('connections.portPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :class="{ 'border-red-500': errors.port }"
          />
          <p v-if="errors.port" class="text-red-500 text-sm mt-1">{{ errors.port }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.database') }} *</label>
          <input
            v-model="form.database"
            type="text"
            :placeholder="$t('connections.databasePlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :class="{ 'border-red-500': errors.database }"
          />
          <p v-if="errors.database" class="text-red-500 text-sm mt-1">{{ errors.database }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.username') }} *</label>
          <input
            v-model="form.username"
            type="text"
            :placeholder="$t('connections.usernamePlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :class="{ 'border-red-500': errors.username }"
          />
          <p v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.password') }}</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('connections.passwordPlaceholder')"
              class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              @click="showPassword = !showPassword"
              type="button"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('connections.connectionTimeout') }}</label>
          <input
            v-model.number="form.timeout"
            type="number"
            placeholder="30"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p class="text-gray-500 text-sm mt-1">{{ $t('connections.timeoutInSeconds') }}</p>
        </div>
      </div>
    </div>

    <!-- Advanced Settings (Collapsible) -->
    <div class="card p-6">
      <button
        @click="showAdvanced = !showAdvanced"
        class="flex items-center justify-between w-full text-left"
      >
        <h3 class="text-lg font-semibold">{{ $t('connections.advancedSettings') }}</h3>
        <ChevronDown :class="{ 'rotate-180': showAdvanced }" class="w-5 h-5 transition-transform" />
      </button>

      <div v-if="showAdvanced" class="mt-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="flex items-center">
              <input
                v-model="form.useSSL"
                type="checkbox"
                class="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {{ $t('connections.useSSL') }}
            </label>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="form.allowSelfSigned"
                type="checkbox"
                class="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                :disabled="!form.useSSL"
              />
              {{ $t('connections.allowSelfSigned') }}
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('connections.charset') }}</label>
            <select
              v-model="form.charset"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="utf8mb4">utf8mb4</option>
              <option value="utf8">utf8</option>
              <option value="latin1">latin1</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('connections.timezone') }}</label>
            <select
              v-model="form.timezone"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="+00:00">UTC (+00:00)</option>
              <option value="+07:00">Asia/Ho_Chi_Minh (+07:00)</option>
              <option value="+08:00">Asia/Shanghai (+08:00)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Result -->
    <div v-if="testResult" class="p-4 rounded-lg" :class="testResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
      <div class="flex items-center">
        <ShieldCheck v-if="testResult.success" class="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
        <XCircle v-else class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
        <span :class="testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
          {{ testResult.message }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div class="mr-auto">
        <button
          @click="testConnection"
          :disabled="isTesting || !isFormValid"
          class="btn btn-secondary flex items-center"
        >
          <ShieldQuestion v-if="!isTesting" class="w-4 h-4 mr-2" />
          <Loader v-else class="w-4 h-4 mr-2 animate-spin" />
          {{ isTesting ? $t('connections.testing') : $t('connections.test') }}
        </button>
      </div>

      <button
        @click="$emit('cancel')"
        class="btn btn-secondary"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
        @click="saveConnection"
        :disabled="!isFormValid || isSaving"
        class="btn btn-primary flex items-center"
      >
        <Loader v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
        {{ isSaving ? $t('common.saving') : $t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ShieldQuestion, 
  Loader, 
  ShieldCheck, 
  XCircle 
} from 'lucide-vue-next'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import type { DatabaseConnection } from '@/stores/app'

const { t: $t } = useI18n()
const connectionPairsStore = useConnectionPairsStore()

const enabledEnvironments = computed(() => connectionPairsStore.enabledEnvironments)

interface Props {
  connection?: DatabaseConnection
}

const props = withDefaults(defineProps<Props>(), {
  connection: undefined
})

const emit = defineEmits<{
  save: [connection: Omit<DatabaseConnection, 'id'>]
  cancel: []
}>()

// Form state
const form = ref({
  name: '',
  host: '',
  port: 3306,
  database: '',
  username: '',
  password: '',
  environment: '',
  timeout: 30,
  useSSL: false,
  allowSelfSigned: false,
  charset: 'utf8mb4',
  timezone: '+00:00'
})

// UI state
const showPassword = ref(false)
const showAdvanced = ref(false)
const isTesting = ref(false)
const isSaving = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

// Validation errors
const errors = ref<Record<string, string>>({})

// Initialize form with existing connection
if (props.connection) {
  form.value = {
    name: props.connection.name,
    host: props.connection.host,
    port: props.connection.port,
    database: props.connection.database,
    username: props.connection.username,
    password: props.connection.password || '',
    environment: props.connection.environment,
    timeout: 30,
    useSSL: false,
    allowSelfSigned: false,
    charset: 'utf8mb4',
    timezone: '+00:00'
  }
}

// Validation
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = $t('validation.required', { field: $t('connections.connectionName') })
  }
  
  if (!form.value.host.trim()) {
    errors.value.host = $t('validation.required', { field: $t('connections.host') })
  }
  
  if (!form.value.port || form.value.port < 1 || form.value.port > 65535) {
    errors.value.port = $t('validation.invalidPort')
  }
  
  if (!form.value.database.trim()) {
    errors.value.database = $t('validation.required', { field: $t('connections.database') })
  }
  
  if (!form.value.username.trim()) {
    errors.value.username = $t('validation.required', { field: $t('connections.username') })
  }
  
  if (!form.value.environment) {
    errors.value.environment = $t('validation.required', { field: $t('connections.environment') })
  }
  
  return Object.keys(errors.value).length === 0
}

const isFormValid = computed(() => {
  return form.value.name.trim() && 
         form.value.host.trim() && 
         form.value.port > 0 && 
         form.value.database.trim() && 
         form.value.username.trim() && 
         form.value.environment
})

// Test connection
const testConnection = async () => {
  if (!validateForm()) return
  
  isTesting.value = true
  testResult.value = null
  
  try {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = Math.random() > 0.3 // Random for demo
    testResult.value = {
      success,
      message: success 
        ? $t('connections.testSuccess') 
        : $t('connections.testFailed')
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: $t('connections.testError')
    }
  } finally {
    isTesting.value = false
  }
}

// Save connection
const saveConnection = async () => {
  if (!validateForm()) return
  
  isSaving.value = true
  
  try {
    const connectionData: Omit<DatabaseConnection, 'id'> = {
      name: form.value.name,
      host: form.value.host,
      port: form.value.port,
      database: form.value.database,
      username: form.value.username,
      password: form.value.password || undefined,
      environment: form.value.environment as 'DEV' | 'STAGE' | 'PROD',
      status: 'testing'
    }
    
    emit('save', connectionData)
  } finally {
    isSaving.value = false
  }
}

// Clear test result when form changes
watch(form, () => {
  testResult.value = null
}, { deep: true })
</script>
