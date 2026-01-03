<template>
  <div class="space-y-6">
    <!-- Basic Connection Info -->
    <div class="space-y-6">
      <div class="pb-2 border-b border-gray-100 dark:border-gray-800">
        <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('connections.basicInfo') }}</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.connectionName') }} *</label>
          <input
            v-model="form.name"
            type="text"
            :placeholder="$t('connections.connectionNamePlaceholder')"
            class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            :class="{ 'border-red-500 ring-4 ring-red-500/10': errors.name }"
          />
          <p v-if="errors.name" class="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.environment') }} *</label>
          <div class="relative group">
            <select
              v-model="form.environment"
              class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none outline-none"
              :class="{ 'border-red-500 ring-4 ring-red-500/10': errors.environment }"
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
            <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
          </div>
          <p v-if="errors.environment" class="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{{ errors.environment }}</p>
        </div>
      </div>
    </div>

    <!-- Database Connection -->
    <div class="space-y-6 pt-4">
      <div class="pb-2 border-b border-gray-100 dark:border-gray-800">
        <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('connections.databaseConnection') }}</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.host') }} *</label>
          <input
            v-model="form.host"
            type="text"
            :placeholder="$t('connections.hostPlaceholder')"
            class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            :class="{ 'border-red-500 ring-4 ring-red-500/10': errors.host }"
          />
          <p v-if="errors.host" class="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{{ errors.host }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.port') }} *</label>
          <input
            v-model.number="form.port"
            type="number"
            :placeholder="$t('connections.portPlaceholder')"
            class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            :class="{ 'border-red-500 ring-4 ring-red-500/10': errors.port }"
          />
          <p v-if="errors.port" class="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{{ errors.port }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.database') }} *</label>
          <input
            v-model="form.database"
            type="text"
            :placeholder="$t('connections.databasePlaceholder')"
            class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            :class="{ 'border-red-500 ring-4 ring-red-500/10': errors.database }"
          />
          <p v-if="errors.database" class="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{{ errors.database }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.username') }} *</label>
          <input
            v-model="form.username"
            type="text"
            :placeholder="$t('connections.usernamePlaceholder')"
            class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            :class="{ 'border-red-500 ring-4 ring-red-500/10': errors.username }"
          />
          <p v-if="errors.username" class="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{{ errors.username }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.password') }}</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('connections.passwordPlaceholder')"
              class="w-full px-4 py-3 pr-12 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            />
            <button
              @click="showPassword = !showPassword"
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.connectionTimeout') }}</label>
          <div class="flex flex-col gap-1">
            <input
              v-model.number="form.timeout"
              type="number"
              placeholder="30"
              class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            />
            <p class="text-[9px] text-gray-500 font-bold uppercase tracking-tight ml-1 opacity-60">{{ $t('connections.timeoutInSeconds') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Settings (Collapsible) -->
    <div class="bg-gray-50/30 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        @click="showAdvanced = !showAdvanced"
        class="flex items-center justify-between w-full px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <span class="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">{{ $t('connections.advancedSettings') }}</span>
        <ChevronDown :class="{ 'rotate-180': showAdvanced }" class="w-4 h-4 text-gray-400 transition-transform" />
      </button>

      <div v-if="showAdvanced" class="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative">
                <input
                  v-model="form.useSSL"
                  type="checkbox"
                  class="peer sr-only"
                />
                <div class="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-primary-500 transition-colors"></div>
                <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span class="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest group-hover:text-primary-500 transition-colors">{{ $t('connections.useSSL') }}</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group" :class="{ 'opacity-50 pointer-events-none': !form.useSSL }">
              <div class="relative">
                <input
                  v-model="form.allowSelfSigned"
                  type="checkbox"
                  class="peer sr-only"
                  :disabled="!form.useSSL"
                />
                <div class="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-primary-500 transition-colors"></div>
                <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span class="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest group-hover:text-primary-500 transition-colors">{{ $t('connections.allowSelfSigned') }}</span>
            </label>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.charset') }}</label>
              <div class="relative group">
                <select
                  v-model="form.charset"
                  class="w-full px-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 appearance-none outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                >
                  <option value="utf8mb4">utf8mb4 (Recommended)</option>
                  <option value="utf8">utf8</option>
                  <option value="latin1">latin1</option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.timezone') }}</label>
              <div class="relative group">
                <select
                  v-model="form.timezone"
                  class="w-full px-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 appearance-none outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                >
                  <option value="+00:00">UTC (+00:00)</option>
                  <option value="+07:00">Ho Chi Minh (+07:00)</option>
                  <option value="+08:00">Singapore/Shanghai (+08:00)</option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
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
    <div class="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800 shrink-0">
      <button
        @click="testConnection"
        :disabled="isTesting || !isFormValid"
        class="flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary-500 hover:text-primary-500 transition-all active:scale-95 disabled:opacity-50"
      >
        <ShieldQuestion v-if="!isTesting" class="w-4 h-4 mr-2" />
        <Loader v-else class="w-4 h-4 mr-2 animate-spin" />
        {{ isTesting ? $t('connections.testing') : $t('connections.test') }}
      </button>

      <div class="flex items-center gap-4">
        <button
          @click="$emit('cancel')"
          class="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="saveConnection"
          :disabled="!isFormValid || isSaving"
          class="flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Loader v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? $t('common.saving') : $t('common.save') }}
        </button>
      </div>
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
      environment: form.value.environment as 'DEV' | 'STAGE' | 'UAT' | 'PROD',
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
