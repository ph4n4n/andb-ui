<template>
  <MainLayout>
    <template #toolbar>
      <div class="flex items-center justify-between w-full h-full px-2">
        <!-- Breadcrumb + Inline Edit Title -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap overflow-hidden">
             <template v-for="(crumb, index) in displayedBreadcrumbs" :key="index">
                 <button 
                    @click="columnsViewRef?.jumpToBreadcrumb(crumb)"
                    class="transition-all hover:text-primary-500 hover:scale-105 active:scale-95"
                    :class="index === displayedBreadcrumbs.length - 1 ? 'text-gray-900 dark:text-white font-black cursor-default hover:text-gray-900 dark:hover:text-white hover:scale-100' : 'text-gray-400 dark:text-gray-500 opacity-70 cursor-pointer'"
                 >
                    {{ crumb.name }}
                 </button>
                 <span v-if="index < displayedBreadcrumbs.length - 1" class="mx-1 text-gray-300 dark:text-gray-700 select-none">/</span>
             </template>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Auto Collapse Toggle -->
          <div class="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-3">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">Auto Collapse</span>
              <button 
                  @click="appStore.autoCollapseColumns = !appStore.autoCollapseColumns"
                  class="w-9 h-5 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  :class="appStore.autoCollapseColumns ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                  title="Toggle Auto-Collapse Columns"
              >
                  <div 
                      class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-spring"
                      :class="appStore.autoCollapseColumns ? 'left-[18px]' : 'left-0.5'"
                  ></div>
              </button>
          </div>
        </div>
      </div>
    </template>

    <div class="flex-1 flex w-full h-full overflow-hidden">
      <!-- Projects Content (Columns Only) -->
      <div class="flex-1 overflow-hidden">
        <ProjectsColumnsView 
          ref="columnsViewRef"
          class="h-full" 
          @open="openProject"
          @create-project="createNewProject"
          @update-breadcrumbs="currentBreadcrumbs = $event"
        />
      </div>

      <!-- Properties Panel Removed as per feedback -->
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAppStore } from '@/stores/app'
import MainLayout from '@/layouts/MainLayout.vue'
import ProjectsColumnsView from '@/components/projects/ProjectsColumnsView.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const projectsStore = useProjectsStore()
const appStore = useAppStore()

// Header Title Editing
const isEditingTitle = ref(false)
const editingTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)
const columnsViewRef = ref<any>(null)

const openProject = (id: string) => {
  projectsStore.selectProject(id)
  router.push({ name: 'Dashboard' })
}

// Reset viewMode logic to always be columns (implicitly) in UI, but explicit in store if needed for other components
onMounted(() => {
   projectsStore.viewMode = 'columns'
})

const selectedProject = computed(() => {
  return projectsStore.projects.find((p: any) => p.id === projectsStore.selectedProjectId)
})

const currentBreadcrumbs = ref<{name: string, level: number, id: string}[]>([])
const displayedBreadcrumbs = computed(() => {
   if (currentBreadcrumbs.value.length > 0) return currentBreadcrumbs.value
   return selectedProject.value ? [{ name: selectedProject.value.name, level: 0, id: selectedProject.value.id }] : [{ name: 'Projects', level: 0, id: 'root' }]
})

const createNewProject = () => {
  const newProject = projectsStore.addProject({
    name: 'Untitled Base',
    description: '',
    connectionIds: [],
    pairIds: [],
    enabledEnvironmentIds: ['DEV', 'STAGE', 'UAT', 'PROD']
  })
  
  projectsStore.selectProject(newProject.id)
  
  // Auto-focus title for editing
  nextTick(() => {
    startEditTitle()
  })
}

const startEditTitle = () => {
  if (selectedProject.value) {
    editingTitle.value = selectedProject.value.name
    isEditingTitle.value = true
    nextTick(() => {
      titleInput.value?.focus()
      titleInput.value?.select()
    })
  }
}



</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 9999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1f2937;
}
</style>
