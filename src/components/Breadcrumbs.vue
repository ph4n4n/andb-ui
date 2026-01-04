<template>
  <nav class="flex items-center text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
    <ol class="flex items-center">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
        <span v-if="index > 0" class="mx-2 text-gray-300 dark:text-gray-700 select-none">/</span>
        <button 
          @click="crumb.action" 
          :class="[
            'hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-0.5',
            index === breadcrumbs.length - 1 ? 'text-gray-600 dark:text-gray-300 font-bold' : 'opacity-70'
          ]"
          :disabled="!crumb.action"
        >
          {{ crumb.label }}
        </button>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const connectionPairsStore = useConnectionPairsStore()

const breadcrumbs = computed(() => {
  const crumbs = [
    { label: t('common.dashboard'), action: () => router.push('/') }
  ]

  const activePair = connectionPairsStore.activePair
  if (activePair) {
    crumbs.push({ 
      label: activePair.name, 
      action: () => router.push('/compare') 
    })
  }

  if (route.path === '/compare') {
    crumbs.push({ label: t('common.compare'), action: async () => {} })
  } else if (route.path === '/migrate') {
    crumbs.push({ label: t('migration.titleSingle'), action: async () => {} }) // Or a generic migration title
  } else if (route.path === '/settings') {
    crumbs.push({ label: t('common.settings'), action: async () => {} })
  }

  return crumbs
})
</script>
