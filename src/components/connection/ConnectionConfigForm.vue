<template>
  <div class="space-y-8">
    <!-- Basic Info -->
    <div class="space-y-6">
        <div class="pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('connections.basicInfo') }}</h3>
        </div>
        
        <div class="grid grid-cols-1 gap-6" :class="{ 'md:grid-cols-2': showEnvironment }">
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.templateName') }} *</label>
                <input
                    :value="modelValue.name"
                    @input="updateField('name', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                />
            </div>
            
            <div v-if="showEnvironment" class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.environment') }} *</label>
                 <div class="relative group">
                    <select 
                        :value="modelValue.environment"
                        @change="updateField('environment', ($event.target as HTMLSelectElement).value)"
                        class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none outline-none"
                    >
                        <!-- Environment options should be passed or slot? For now, we assume simple text or provide slots -->
                        <option value="">Select Environment</option>
                        <option v-for="env in environments" :key="env" :value="env">{{ env }}</option>
                    </select>
                    <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
                 </div>
            </div>
        </div>
    </div>

    <!-- Database Connection -->
    <div class="space-y-6">
        <div class="pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ $t('connections.databaseConnection') }}</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.databaseType') }} *</label>
                 <div class="relative group">
                    <select 
                        :value="modelValue.type"
                        @change="updateField('type', ($event.target as HTMLSelectElement).value)"
                        class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none outline-none"
                    >
                        <option value="mysql">{{ $t('connections.types.mysql') }}</option>
                        <option value="postgres">{{ $t('connections.types.postgres') }}</option>
                        <option value="sqlite">{{ $t('connections.types.sqlite') }}</option>
                    </select>
                    <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
                 </div>
            </div>

            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.host') }} *</label>
                <input 
                    :value="modelValue.host" 
                    @input="updateField('host', ($event.target as HTMLInputElement).value)"
                    type="text" 
                    class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                />
            </div>

            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.port') }} *</label>
                <input 
                    :value="modelValue.port"
                    @input="updateField('port', Number(($event.target as HTMLInputElement).value))"
                    type="number" 
                    class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                />
            </div>

            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.database') }}</label>
                <input 
                    :value="modelValue.database"
                    @input="updateField('database', ($event.target as HTMLInputElement).value)"
                    type="text" 
                    :placeholder="$t('connections.databasePlaceholder')" 
                    class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                />
            </div>

             <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.username') }} *</label>
                <input 
                    :value="modelValue.username"
                    @input="updateField('username', ($event.target as HTMLInputElement).value)"
                    type="text" 
                    class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                />
            </div>

            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ $t('connections.password') }}</label>
                <div class="relative">
                    <input 
                        :value="modelValue.password"
                        @input="updateField('password', ($event.target as HTMLInputElement).value)"
                        :type="showPassword ? 'text' : 'password'" 
                        placeholder="••••••" 
                        class="w-full px-4 py-3 pr-12 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                    />
                     <button @click="showPassword = !showPassword" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors">
                        <Eye v-if="!showPassword" class="w-4 h-4" />
                        <EyeOff v-else class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Product Configuration -->
    <div class="space-y-6">
        <div class="pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Product Configuration (Pre-env)</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Domain</label>
                <input 
                    :value="modelValue.productSettings?.domain"
                    @input="updateField('productSettings', { ...(modelValue.productSettings || {}), domain: ($event.target as HTMLInputElement).value })"
                    type="text"
                    placeholder="e.g. abc.com"
                    class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                />
            </div>
            <div class="space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Server Domain</label>
                <input 
                    :value="modelValue.productSettings?.emailServer"
                    @input="updateField('productSettings', { ...(modelValue.productSettings || {}), emailServer: ($event.target as HTMLInputElement).value })"
                    type="text"
                    placeholder="e.g. @abc.net"
                    class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                />
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps<{
    modelValue: any
    showEnvironment?: boolean
    environments?: string[]
}>()

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

const updateField = (key: string, value: any) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [key]: value
    })
}
</script>
