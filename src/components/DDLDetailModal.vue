<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="close">
    <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" :class="getIconBgClass(item?.status)">
            <FileCode class="w-5 h-5" :class="getIconColorClass(item?.status)" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ item?.name }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ item?.type || 'Table' }} Details</p>
          </div>
        </div>
        <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-180px)]">
        <!-- Status Info -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ getStatusIcon(item?.status) }}</span>
                <span class="font-semibold" :class="getStatusColorClass(item?.status)">
                  {{ getStatusText(item?.status) }}
                </span>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ item?.type || 'Table' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Action Required</p>
              <p class="text-lg font-semibold" :class="getActionColorClass(item?.status)">
                {{ getActionText(item?.status) }}
              </p>
            </div>
          </div>
        </div>

        <!-- DDL Statements -->
        <div v-if="ddlStatements.length > 0" class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">DDL Statements</h3>
            <div class="flex gap-2">
              <button @click="copyAllDDL" class="btn btn-secondary btn-sm flex items-center gap-2">
                <Copy class="w-4 h-4" />
                Copy All
              </button>
              <button @click="downloadDDL" class="btn btn-secondary btn-sm flex items-center gap-2">
                <Download class="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          
          <div class="space-y-3">
            <div v-for="(stmt, index) in ddlStatements" :key="index" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Statement {{ index + 1 }}</span>
                <button @click="copyDDL(stmt)" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <Copy class="w-4 h-4" />
                </button>
              </div>
              <pre class="p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-x-auto"><code>{{ stmt }}</code></pre>
            </div>
          </div>
        </div>

        <!-- Schema Diff (if different) -->
        <div v-if="item?.status === 'different' && schemaDiff" class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schema Differences</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Source Schema -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Source</h4>
              </div>
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre class="text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">{{ formatSchema(schemaDiff.source) }}</pre>
              </div>
            </div>

            <!-- Target Schema -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Target</h4>
              </div>
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre class="text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">{{ formatSchema(schemaDiff.target) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div v-if="item?.metadata" class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre class="text-xs font-mono text-gray-800 dark:text-gray-200">{{ JSON.stringify(item.metadata, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button @click="close" class="btn btn-secondary">Close</button>
        <button v-if="ddlStatements.length > 0" @click="applyChanges" class="btn btn-primary flex items-center gap-2">
          <CheckCircle class="w-4 h-4" />
          Apply Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, FileCode, Copy, Download, CheckCircle } from 'lucide-vue-next'

interface DDLItem {
  name: string
  type?: string
  status: string
  ddl?: string[]
  metadata?: any
  diff?: {
    source: any
    target: any
  }
}

const props = defineProps<{
  isOpen: boolean
  item: DDLItem | null
}>()

const emit = defineEmits<{
  close: []
  apply: [item: DDLItem]
}>()

const schemaDiff = computed(() => props.item?.diff || null)

const ddlStatements = computed(() => {
  if (!props.item) return []
  
  // If DDL is provided directly
  if (props.item.ddl && Array.isArray(props.item.ddl)) {
    if (props.item.ddl.length > 0) {
      return props.item.ddl
    }
  }
  
  // Generate DDL based on status and diff
  const statements: string[] = []
  const { name, type = 'table', status, diff } = props.item
  
  if (status === 'missing_in_target' || status === 'missing') {
    // Need to create in target - use source DDL if available
    if (diff?.source) {
      statements.push(diff.source)
    } else {
      // Fallback to generic CREATE
      if (type === 'table' || type === 'tables') {
        statements.push(`-- Source DDL not available\nCREATE TABLE \`${name}\` (\n  -- Schema definition needed\n);`)
      } else if (type === 'procedure' || type === 'procedures') {
        statements.push(`-- Source DDL not available\nCREATE PROCEDURE \`${name}\`()\nBEGIN\n  -- Procedure body needed\nEND;`)
      } else if (type === 'function' || type === 'functions') {
        statements.push(`-- Source DDL not available\nCREATE FUNCTION \`${name}\`() RETURNS VARCHAR(255)\nBEGIN\n  -- Function body needed\nEND;`)
      }
    }
  } else if (status === 'different' || status === 'modified') {
    // Need to alter - try to show both source and target
    if (diff?.source && diff?.target) {
      statements.push(`-- SOURCE DDL:\n${diff.source}`)
      statements.push(`-- TARGET DDL:\n${diff.target}`)
      statements.push(`-- You need to manually create ALTER statement based on differences above`)
    } else if (diff?.source) {
      statements.push(`-- Replace with source:\nDROP ${type.toUpperCase().slice(0, -1)} IF EXISTS \`${name}\`;`)
      statements.push(diff.source)
    } else {
      // Fallback
      if (type === 'table' || type === 'tables') {
        statements.push(`ALTER TABLE \`${name}\`\n  -- Modifications needed;`)
      } else {
        statements.push(`DROP ${type.toUpperCase().slice(0, -1)} IF EXISTS \`${name}\`;`)
        statements.push(`CREATE ${type.toUpperCase().slice(0, -1)} \`${name}\`\n  -- New definition needed;`)
      }
    }
  } else if (status === 'missing_in_source') {
    // Extra in target - show DROP
    statements.push(`DROP ${type.toUpperCase().slice(0, -1)} IF EXISTS \`${name}\`;`)
    if (diff?.target) {
      statements.push(`-- Current definition in target:\n${diff.target}`)
    }
  }
  
  return statements
})

const getStatusIcon = (status?: string) => {
  if (!status) return '❓'
  switch (status.toLowerCase()) {
    case 'equal':
    case 'same': return '✅'
    case 'different':
    case 'modified': return '⚠️'
    case 'missing_in_target':
    case 'missing': return '❌'
    case 'missing_in_source': return '➕'
    default: return '❓'
  }
}

const getStatusText = (status?: string) => {
  if (!status) return 'Unknown'
  switch (status.toLowerCase()) {
    case 'equal':
    case 'same': return 'Identical'
    case 'different':
    case 'modified': return 'Different'
    case 'missing_in_target':
    case 'missing': return 'Missing in Target'
    case 'missing_in_source': return 'Extra in Target'
    default: return status
  }
}

const getStatusColorClass = (status?: string) => {
  if (!status) return 'text-gray-600 dark:text-gray-400'
  switch (status.toLowerCase()) {
    case 'equal':
    case 'same': return 'text-green-600 dark:text-green-400'
    case 'different':
    case 'modified': return 'text-yellow-600 dark:text-yellow-400'
    case 'missing_in_target':
    case 'missing': return 'text-red-600 dark:text-red-400'
    case 'missing_in_source': return 'text-blue-600 dark:text-blue-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

const getIconBgClass = (status?: string) => {
  if (!status) return 'bg-gray-100 dark:bg-gray-700'
  switch (status.toLowerCase()) {
    case 'equal':
    case 'same': return 'bg-green-100 dark:bg-green-900/20'
    case 'different':
    case 'modified': return 'bg-yellow-100 dark:bg-yellow-900/20'
    case 'missing_in_target':
    case 'missing': return 'bg-red-100 dark:bg-red-900/20'
    case 'missing_in_source': return 'bg-blue-100 dark:bg-blue-900/20'
    default: return 'bg-gray-100 dark:bg-gray-700'
  }
}

const getIconColorClass = (status?: string) => {
  if (!status) return 'text-gray-600 dark:text-gray-400'
  switch (status.toLowerCase()) {
    case 'equal':
    case 'same': return 'text-green-600 dark:text-green-400'
    case 'different':
    case 'modified': return 'text-yellow-600 dark:text-yellow-400'
    case 'missing_in_target':
    case 'missing': return 'text-red-600 dark:text-red-400'
    case 'missing_in_source': return 'text-blue-600 dark:text-blue-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

const getActionText = (status?: string) => {
  if (!status) return 'Unknown'
  switch (status.toLowerCase()) {
    case 'equal':
    case 'same': return 'None'
    case 'different':
    case 'modified': return 'Alter'
    case 'missing_in_target':
    case 'missing': return 'Create'
    case 'missing_in_source': return 'Review'
    default: return 'Unknown'
  }
}

const getActionColorClass = (status?: string) => {
  if (!status) return 'text-gray-600 dark:text-gray-400'
  switch (status.toLowerCase()) {
    case 'equal':
    case 'same': return 'text-gray-600 dark:text-gray-400'
    case 'different':
    case 'modified': return 'text-yellow-600 dark:text-yellow-400'
    case 'missing_in_target':
    case 'missing': return 'text-red-600 dark:text-red-400'
    case 'missing_in_source': return 'text-blue-600 dark:text-blue-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

const formatSchema = (schema: any) => {
  if (!schema) return 'N/A'
  if (typeof schema === 'string') return schema
  return JSON.stringify(schema, null, 2)
}

const copyDDL = async (ddl: string) => {
  try {
    await navigator.clipboard.writeText(ddl)
    // TODO: Show toast notification
  } catch (err) {
    // Failed to copy
  }
}

const copyAllDDL = async () => {
  const allDDL = ddlStatements.value.join('\n\n')
  await copyDDL(allDDL)
}

const downloadDDL = () => {
  const allDDL = ddlStatements.value.join('\n\n')
  const blob = new Blob([allDDL], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.item?.name || 'ddl'}_${Date.now()}.sql`
  a.click()
  URL.revokeObjectURL(url)
}

const close = () => {
  emit('close')
}

const applyChanges = () => {
  if (props.item) {
    emit('apply', props.item)
  }
}
</script>
