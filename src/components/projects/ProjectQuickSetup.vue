<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Intro -->
    <div class="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
      <div class="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600 dark:text-indigo-300">
        <Wand2 class="w-5 h-5" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wide mb-1">
          {{ $t('projectSetup.title') }}
        </h3>
        <p class="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
          {{ $t('projectSetup.description') }}
        </p>
      </div>
    </div>

    <!-- Step 1: Select Environments -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">1</div>
        <h4 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
          {{ $t('projectSetup.steps.environments') }}
        </h4>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div 
          v-for="env in availableEnvironments" 
          :key="env.name"
          class="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none"
          :class="selectedEnvs.includes(env.name) 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
          @click="toggleEnv(env.name)"
        >
          <div 
            class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors"
            :class="selectedEnvs.includes(env.name)
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'"
          >
            <Check v-if="selectedEnvs.includes(env.name)" class="w-3.5 h-3.5" />
          </div>
          <span class="text-sm font-bold" :class="selectedEnvs.includes(env.name) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'">
            {{ env.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Step 2: Suggested Pairs -->
    <div class="space-y-4" v-if="suggestedPairs.length > 0">
      <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">2</div>
        <h4 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
          {{ $t('projectSetup.steps.pairs') }}
        </h4>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <div 
          v-for="(pair, index) in suggestedPairs" 
          :key="index"
          class="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {{ pair.source }}
              </span>
              <ArrowRight class="w-4 h-4 text-gray-400" />
              <span class="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {{ pair.target }}
              </span>
            </div>
            <div class="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
            <span class="text-xs text-gray-500 font-medium">
              {{ $t('projectSetup.suggestedPair') }}
            </span>
          </div>
          
          <button 
            @click="removeSuggestedPair(index)"
            class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Global Connections (Optional) -->
    <div class="space-y-4" v-if="selectedEnvs.length > 0">
       <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">3</div>
        <h4 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
          {{ $t('projectSetup.steps.connections') }}
        </h4>
      </div>
      
      <p class="text-xs text-gray-500 mb-2">
         {{ $t('projectSetup.connectionNote') }}
      </p>

      <div class="grid grid-cols-1 gap-4">
        <div v-for="env in selectedEnvs" :key="env" class="flex items-center gap-4">
             <div class="w-20 shrink-0">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ env }}</span>
             </div>
             <select 
                v-model="envConnectionMap[env]"
                class="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20"
             >
                <option value="">{{ $t('projectSetup.createEmpty') }}</option>
                <optgroup :label="$t('projectSetup.globalConnections')">
                    <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
                </optgroup>
             </select>
        </div>
      </div>
    </div>

    <!-- Action -->
    <div class="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button 
            @click="applySetup"
            class="btn btn-primary px-6 py-2.5 flex items-center gap-2"
            :disabled="selectedEnvs.length === 0 || isApplying"
        >
            <Loader2 v-if="isApplying" class="w-4 h-4 animate-spin" />
            <Wand2 v-else class="w-4 h-4" />
            {{ $t('projectSetup.apply') }}
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Wand2, Check, ArrowRight, X, Loader2 } from 'lucide-vue-next'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useConnectionTemplatesStore } from '@/stores/connectionTemplates'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const connectionPairsStore = useConnectionPairsStore()
const templatesStore = useConnectionTemplatesStore()
const appStore = useAppStore()

const availableEnvironments = computed(() => connectionPairsStore.environments.sort((a, b) => a.order - b.order))
const templates = computed(() => templatesStore.templates)

const selectedEnvs = ref<string[]>([])
const suggestedPairs = ref<{source: string, target: string}[]>([])
const envConnectionMap = ref<Record<string, string>>({})
const isApplying = ref(false)

const toggleEnv = (envName: string) => {
    if (selectedEnvs.value.includes(envName)) {
        selectedEnvs.value = selectedEnvs.value.filter(e => e !== envName)
        delete envConnectionMap.value[envName]
    } else {
        selectedEnvs.value.push(envName)
        // Sort based on defined order
        selectedEnvs.value.sort((a, b) => {
            const ordA = availableEnvironments.value.find(e => e.name === a)?.order || 99
            const ordB = availableEnvironments.value.find(e => e.name === b)?.order || 99
            return ordA - ordB
        })
        envConnectionMap.value[envName] = ''
    }
    generateSuggestions()
}

const generateSuggestions = () => {
    const pairs: {source: string, target: string}[] = []
    const envs = selectedEnvs.value
    
    // Logic: DEV -> STAGE -> UAT -> PROD
    // Or simply adjacent selected envs in order
    
    for (let i = 0; i < envs.length - 1; i++) {
        pairs.push({
            source: envs[i],
            target: envs[i+1]
        })
    }
    
    suggestedPairs.value = pairs
}

const removeSuggestedPair = (index: number) => {
    suggestedPairs.value.splice(index, 1)
}

const applySetup = async () => {
    isApplying.value = true
    try {
        // 1. Create Connections
        const createdConnectionIds: Record<string, string> = {} // Env -> ID

        for (const env of selectedEnvs.value) {
            const templateId = envConnectionMap.value[env]
            let connectionData: any = {
                name: env,
                environment: env,
                host: 'localhost',
                port: 3306,
                username: 'root',
                type: 'mysql',
                status: 'idle'
            }

            if (templateId) {
                const template = templates.value.find(t => t.id === templateId)
                if (template) {
                     connectionData = {
                        ...connectionData,
                        host: template.host,
                        port: template.port,
                        username: template.username,
                        password: template.password,
                        type: template.type,
                        templateId: template.id
                     }
                }
            }
            
            // Check if connection for this env already exists to avoid dupes?
            // For Quick Setup, we might just create new ones or use existing if name matches exactly?
            // Let's create new ones for now, maybe append " (Setup)" or just rely on user management later.
            // Actually, better: if connection with name == env exists, use it.
            
            const existing = appStore.connections.find(c => c.name === env && c.environment === env)
            if (existing) {
                createdConnectionIds[env] = existing.id
            } else {
                const newConn = appStore.addConnection(connectionData)
                createdConnectionIds[env] = newConn.id
            }
        }

        // 2. Create Pairs
        for (const pair of suggestedPairs.value) {
            const sourceId = createdConnectionIds[pair.source]
            const targetId = createdConnectionIds[pair.target]
            
            if (sourceId && targetId) {
                // Check existing
                 const existingPair = connectionPairsStore.connectionPairs.find(p => 
                    p.sourceEnv === pair.source && 
                    p.targetEnv === pair.target
                )
                
                if (!existingPair) {
                    connectionPairsStore.addConnectionPair({
                        name: `${pair.source} to ${pair.target}`,
                        sourceEnv: pair.source,
                        targetEnv: pair.target,
                        sourceConnectionId: sourceId,
                        targetConnectionId: targetId,
                        isDefault: false,
                        description: '',
                        status: 'idle'
                    })
                }
            }
        }
        
        // Notify success?
        // Emit event to parent to switch tab?
        alert(t('projectSetup.success'))
    } catch (e) {
        console.error(e)
        alert(t('common.error'))
    } finally {
        isApplying.value = false
    }
}
</script>
