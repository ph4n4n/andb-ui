<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ $t('settings.templates.title') }}
      </h3>
      <button @click="openModal()" class="btn btn-primary flex items-center">
        <plus class="w-4 h-4 mr-2" />
        {{ $t('settings.templates.add') }}
      </button>
    </div>

    <!-- Templates List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="template in templates" 
        :key="template.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group relative"
      >
        <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <LayoutTemplate class="w-5 h-5" />
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ template.name }}</h4>
                    <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{{ template.type }}</p>
                </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openModal(template)" class="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                    <Edit2 class="w-4 h-4" />
                </button>
                <button @click="deleteTemplate(template.id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 class="w-4 h-4" />
                </button>
            </div>
        </div>
        
        <div class="space-y-1.5 mt-4">
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Server class="w-3.5 h-3.5 mr-2 opacity-70" />
                <span class="truncate">{{ template.host }}:{{ template.port }}</span>
            </div>
            <div v-if="template.database" class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Database class="w-3.5 h-3.5 mr-2 opacity-70" />
                <span class="truncate">{{ template.database }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <User class="w-3.5 h-3.5 mr-2 opacity-70" />
                <span class="truncate">{{ template.username }}</span>
            </div>
        </div>
      </div>

       <!-- Empty State -->
       <div v-if="templates.length === 0" class="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
              <LayoutTemplate class="w-8 h-8" />
          </div>
          <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-1">{{ $t('settings.templates.emptyTitle') }}</h3>
          <p class="text-xs text-gray-500 max-w-xs">{{ $t('settings.templates.emptyDesc') }}</p>
          <button @click="openModal()" class="mt-4 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 transition-colors shadow-sm">
              {{ $t('settings.templates.createFirst') }}
          </button>
       </div>
    </div>

    <!-- Edit/Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100 dark:border-gray-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 class="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <LayoutTemplate class="w-5 h-5 text-indigo-500" />
                {{ editingTemplate ? $t('settings.templates.edit') : $t('settings.templates.create') }}
            </h3>

            <div class="space-y-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('connections.templateName') }}</label>
                    <input v-model="form.name" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                         <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('connections.databaseType') }}</label>
                         <select v-model="form.type" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none">
                             <option value="mysql">{{ $t('connections.types.mysql') }}</option>
                             <option value="postgres">{{ $t('connections.types.postgres') }}</option>
                             <option value="sqlite">{{ $t('connections.types.sqlite') }}</option>
                         </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('connections.database') }}</label>
                        <input v-model="form.database" type="text" :placeholder="$t('connections.databasePlaceholder')" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2 space-y-1">
                        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('connections.host') }}</label>
                        <input v-model="form.host" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('connections.port') }}</label>
                        <input v-model.number="form.port" type="number" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                     <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('connections.username') }}</label>
                        <input v-model="form.username" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{{ $t('connections.password') }}</label>
                        <input v-model="form.password" type="password" placeholder="••••••" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button @click="closeModal" class="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 uppercase tracking-wider transition-colors">{{ $t('common.cancel') }}</button>
                <button @click="saveTemplate" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all">{{ $t('common.save') }}</button>
            </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, LayoutTemplate, Edit2, Trash2, Server, User } from 'lucide-vue-next'
import { useConnectionTemplatesStore, type ConnectionTemplate } from '@/stores/connectionTemplates'

const store = useConnectionTemplatesStore()
const templates = computed(() => store.templates)

const showModal = ref(false)
const editingTemplate = ref<ConnectionTemplate | null>(null)

const form = ref({
    name: '',
    host: 'localhost',
    port: 3306,
    database: '',
    username: 'root',
    password: '',
    type: 'mysql' as 'mysql' | 'postgres' | 'sqlite'
})

// Need to import useI18n to use $t in script
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const openModal = (template?: ConnectionTemplate) => {
    if (template) {
        editingTemplate.value = template
        form.value = {
            name: template.name,
            host: template.host,
            port: template.port,
            database: template.database || '',
            username: template.username,
            password: template.password || '',
            type: template.type
        }
    } else {
        editingTemplate.value = null
        form.value = {
            name: '',
            host: 'localhost',
            port: 3306,
            database: '',
            username: 'root',
            password: '',
            type: 'mysql'
        }
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingTemplate.value = null
}

const saveTemplate = () => {
    if (!form.value.name) return // Simple validation

    try {
        if (editingTemplate.value) {
            store.updateTemplate(editingTemplate.value.id, form.value)
        } else {
            store.addTemplate(form.value)
        }
        closeModal()
    } catch (e: any) {
        if (e.message === 'DUPLICATE_CONNECTION') {
            alert(t('connections.template.duplicateError'))
        } else {
            console.error(e)
            alert(t('common.error'))
        }
    }
}

const deleteTemplate = (id: string) => {
    if (confirm(t('connections.confirmDeleteTemplate'))) {
        store.removeTemplate(id)
    }
}
</script>
