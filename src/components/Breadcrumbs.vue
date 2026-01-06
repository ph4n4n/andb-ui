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
import { useProjectsStore } from '@/stores/projects'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const connectionPairsStore = useConnectionPairsStore()

const breadcrumbs = computed(() => {
  const crumbs: Array<{ label: string; action?: () => void }> = [
    { label: t('common.dashboard'), action: () => router.push('/') }
  ]

  const projectsStore = useProjectsStore()
  const currentProject = projectsStore.currentProject
  
  // Add current project if not default
  if (currentProject && currentProject.id !== 'default') {
    crumbs.push({ 
      label: currentProject.name, 
      action: () => router.push('/projects') 
    })
  }

  // Add page-specific breadcrumbs
  if (route.path === '/projects') {
    crumbs.push({ label: t('projects.title') })
  } else if (route.path === '/schema') {
    crumbs.push({ label: t('common.schema') })
    // TODO: Add selected database/table context here
  } else if (route.path === '/compare') {
    const activePair = connectionPairsStore.activePair
    if (activePair) {
      crumbs.push({ 
        label: activePair.name, 
        action: () => router.push('/compare') 
      })
    }
    crumbs.push({ label: t('common.compare') })
  } else if (route.path === '/history') {
    crumbs.push({ label: t('common.history') })
  } else if (route.path === '/settings') {
    crumbs.push({ label: t('common.settings') })
    // Add settings category if available
    if (route.query.cat) {
      crumbs.push({ label: String(route.query.cat).toUpperCase() })
    }
  }

  return crumbs
})
</script>
