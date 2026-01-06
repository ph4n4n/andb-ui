<template>
  <MainLayout>
     <!-- PROJECT MODE: Detail View (Tree + Content) -->
     <div v-if="isProjectMode" class="w-full h-full overflow-hidden">
        <ProjectsDetailView />
     </div>

     <!-- GLOBAL MODE: Standard Schema View -->
     <GlobalSchemaView v-else />
  </MainLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import MainLayout from '@/layouts/MainLayout.vue'
import GlobalSchemaView from '@/views/GlobalSchemaView.vue'
import ProjectsDetailView from '@/components/ProjectsDetailView.vue'

const projectsStore = useProjectsStore()

const isProjectMode = computed(() => {
   return projectsStore.selectedProjectId && projectsStore.selectedProjectId !== 'default'
})
</script>
