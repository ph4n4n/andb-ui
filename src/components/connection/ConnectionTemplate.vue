<template>
  <div class="space-y-6">
    <!-- Template Management -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">{{ $t('connections.templates') }}</h3>
        <button
          @click="saveAsTemplate"
          :disabled="!isFormValid"
          class="btn btn-secondary flex items-center"
        >
          <Save class="w-4 h-4 mr-2" />
          {{ $t('connections.saveAsTemplate') }}
        </button>
      </div>

      <!-- Template List -->
      <div v-if="templates.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="template in templates"
          :key="template.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
          @click="loadTemplate(template)"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-gray-900 dark:text-white">{{ template.name }}</h4>
            <button
              @click.stop="deleteTemplate(template.id)"
              class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>{{ template.host }}:{{ template.port }}</div>
            <div>{{ template.database }}</div>
            <div>{{ template.username }}</div>
            <div class="flex items-center gap-2">
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="getEnvironmentBadgeClass(template.environment)"
              >
                {{ $t(`environments.${template.environment.toLowerCase()}`) }}
              </span>
              <span v-if="template.useSSL" class="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
                SSL
              </span>
            </div>
          </div>
          
          <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {{ $t('connections.created') }}: {{ formatDate(template.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <Save class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('connections.noTemplates') }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('connections.noTemplatesDescription') }}
        </p>
      </div>
    </div>

    <!-- Save Template Modal -->
    <div v-if="showSaveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">{{ $t('connections.saveTemplate') }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('connections.templateName') }} *</label>
            <input
              v-model="templateName"
              type="text"
              :placeholder="$t('connections.templateNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('connections.templateDescription') }}</label>
            <textarea
              v-model="templateDescription"
              :placeholder="$t('connections.templateDescriptionPlaceholder')"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <label class="flex items-center">
              <input
                v-model="includePassword"
                type="checkbox"
                class="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {{ $t('connections.includePassword') }}
            </label>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showSaveModal = false"
            class="btn btn-secondary"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="confirmSaveTemplate"
            :disabled="!templateName.trim()"
            class="btn btn-primary"
          >
            {{ $t('connections.saveTemplate') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Save, Trash2 } from 'lucide-vue-next'

const { t: $t } = useI18n()

interface ConnectionTemplate {
  id: string
  name: string
  description?: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  environment: string
  useSSL: boolean
  allowSelfSigned: boolean
  charset: string
  timezone: string
  timeout: number
  createdAt: Date
}

interface Props {
  form: any
  isFormValid: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  loadTemplate: [template: ConnectionTemplate]
}>()

// State
const templates = ref<ConnectionTemplate[]>([])
const showSaveModal = ref(false)
const templateName = ref('')
const templateDescription = ref('')
const includePassword = ref(false)

// Load templates from localStorage
const loadTemplates = () => {
  try {
    const stored = localStorage.getItem('connection-templates')
    if (stored) {
      templates.value = JSON.parse(stored).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      }))
    }
  } catch (error: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('error', 'Failed to load templates from localStorage', error.message)
    }
  }
}

// Save templates to localStorage
const saveTemplates = () => {
  try {
    localStorage.setItem('connection-templates', JSON.stringify(templates.value))
  } catch (error: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('error', 'Failed to save templates to localStorage', error.message)
    }
  }
}

// Save current form as template
const saveAsTemplate = () => {
  templateName.value = ''
  templateDescription.value = ''
  includePassword.value = false
  showSaveModal.value = true
}

const confirmSaveTemplate = () => {
  const template: ConnectionTemplate = {
    id: Date.now().toString(),
    name: templateName.value,
    description: templateDescription.value,
    host: props.form.host,
    port: props.form.port,
    database: props.form.database,
    username: props.form.username,
    password: includePassword.value ? props.form.password : undefined,
    environment: props.form.environment,
    useSSL: props.form.useSSL,
    allowSelfSigned: props.form.allowSelfSigned,
    charset: props.form.charset,
    timezone: props.form.timezone,
    timeout: props.form.timeout,
    createdAt: new Date()
  }
  
  templates.value.push(template)
  saveTemplates()
  showSaveModal.value = false
}

// Load template into form
const loadTemplate = (template: ConnectionTemplate) => {
  emit('loadTemplate', template)
}

// Delete template
const deleteTemplate = (id: string) => {
  if (confirm($t('connections.confirmDeleteTemplate'))) {
    templates.value = templates.value.filter(t => t.id !== id)
    saveTemplates()
  }
}

// Helper methods
const getEnvironmentBadgeClass = (environment: string) => {
  const classes = {
    DEV: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    STAGE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    PROD: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
  return classes[environment as keyof typeof classes] || classes.DEV
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

// Initialize
loadTemplates()
</script>
