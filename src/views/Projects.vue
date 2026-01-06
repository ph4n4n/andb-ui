<template>
  <MainLayout>
    <template #toolbar>
      <div class="flex items-center justify-between w-full h-full px-2">
        <!-- Breadcrumb + Inline Edit Title -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500">
            <span class="text-gray-900 dark:text-white uppercase tracking-wider">{{ $t('projects.title') }}</span>
             
            
            <!-- Selected Project Inline Edit -->
            <template v-if="selectedProject && selectedProject.id !== 'default'">
              <span class="text-gray-300 dark:text-gray-700">/</span>
              <input 
                v-if="isEditingTitle"
                ref="titleInput"
                v-model="editingTitle"
                @blur="saveTitle"
                @keydown.enter="saveTitle"
                @keydown.esc="cancelEdit"
                class="bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white uppercase tracking-wider px-1 min-w-[200px]"
              />
              <button 
                v-else
                @click="startEditTitle"
                class="text-gray-900 dark:text-white uppercase tracking-wider hover:text-primary-500 transition-colors px-1"
              >
                {{ selectedProject.name }}
              </button>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- View Switcher -->
          <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
            <button 
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
              class="p-2 rounded-lg transition-all"
              title="List View"
            >
              <List class="w-4 h-4" />
            </button>
            <button 
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
              class="p-2 rounded-lg transition-all"
              title="Grid View"
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
            <button 
              @click="viewMode = 'columns'"
              :class="viewMode === 'columns' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
              class="p-2 rounded-lg transition-all"
              title="Columns View"
            >
              <Columns class="w-4 h-4" />
            </button>
            <button 
              @click="viewMode = 'detail'"
              :class="viewMode === 'detail' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
              class="p-2 rounded-lg transition-all"
              title="Detail View (Master-Detail)"
            >
              <LayoutList class="w-4 h-4" />
            </button>
          </div>

          <button 
            @click="createNewProject"
            class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider"
          >
            <Plus class="w-4 h-4" />
            {{ $t('projects.newProject') }}
          </button>
        </div>
      </div>
    </template>

    <div class="flex h-full overflow-hidden">
      <!-- Projects Content (Left) -->
      <div 
        class="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50"
        :class="viewMode === 'list' ? 'p-0' : 'p-8'"
      >
        <!-- Stats Overview (Only in Grid View) -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/20">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative">
              <div class="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">Total Projects</div>
              <div class="text-4xl font-black">{{ projectsStore.projects.length }}</div>
            </div>
          </div>
          
          <div class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative">
              <div class="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">Connections</div>
              <div class="text-4xl font-black">{{ appStore.connections.length }}</div>
            </div>
          </div>
          
          <div class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative">
              <div class="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">Sync Pairs</div>
              <div class="text-4xl font-black">{{ connectionPairsStore.connectionPairs.length }}</div>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="project in projectsStore.projects" 
            :key="project.id"
            class="group relative bg-white dark:bg-gray-800 rounded-3xl border-2 transition-all duration-500 overflow-hidden cursor-pointer"
            :class="{ 
              'border-primary-500 shadow-2xl shadow-primary-500/20 scale-[1.02]': projectsStore.selectedProjectId === project.id,
              'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-xl': projectsStore.selectedProjectId !== project.id
            }"
            @click="selectProject(project.id)"
            @dblclick="openProject(project.id)"
          >
            <!-- Gradient Background -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Active Indicator -->
            <div v-if="projectsStore.selectedProjectId === project.id" class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-500 animate-pulse"></div>
            
            <div class="relative p-6">
              <!-- Header -->
              <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-500">
                    <component :is="project.icon || Folder" class="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 class="text-lg font-black text-gray-900 dark:text-white mb-1">{{ project.name }}</h3>
                    <div v-if="projectsStore.selectedProjectId === project.id" class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span class="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  v-if="project.id !== 'default'" 
                  @click.stop="deleteProject(project)"
                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 min-h-[40px]">{{ project.description || 'No description provided' }}</p>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div class="flex items-center gap-2 mb-2">
                    <Database class="w-4 h-4 text-primary-500" />
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Connections</span>
                  </div>
                  <div class="text-2xl font-black text-gray-900 dark:text-white">{{ project.connectionIds.length }}</div>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div class="flex items-center gap-2 mb-2">
                    <GitCompare class="w-4 h-4 text-indigo-500" />
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pairs</span>
                  </div>
                  <div class="text-2xl font-black text-gray-900 dark:text-white">{{ project.pairIds.length }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columns View -->
        <ProjectsColumnsView 
          v-if="viewMode === 'columns'" 
          class="h-full" 
          @open="openProject"
        />

        <!-- Detail View (Master-Detail) -->
        <ProjectsDetailView 
          v-if="viewMode === 'detail'" 
          class="h-full w-full" 
        />

        <!-- List View -->
        <div v-if="viewMode === 'list'" class="min-w-full inline-block align-middle">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" @click="sortBy('name')">
                    Name
                    <span v-if="sortColumn === 'name'" class="ml-1">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" @click="sortBy('connections')">
                    Connections
                    <span v-if="sortColumn === 'connections'" class="ml-1">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" @click="sortBy('pairs')">
                    Pairs
                    <span v-if="sortColumn === 'pairs'" class="ml-1">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr 
                  v-for="project in sortedProjects" 
                  :key="project.id"
                  @click="selectProject(project.id)"
                  @dblclick="openProject(project.id)"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  :class="{ 'bg-primary-50 dark:bg-primary-900/10': projectsStore.selectedProjectId === project.id }"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-indigo-500 shadow-md shadow-primary-500/20">
                        <component :is="project.icon || Folder" class="h-5 w-5 text-white" />
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {{ project.name }}
                          <span v-if="projectsStore.selectedProjectId === project.id" class="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] uppercase font-bold tracking-wider">Active</span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          Updated {{ formatDate(project.updatedAt) }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
                      {{ project.description || 'No description' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {{ project.connectionIds.length }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {{ project.pairIds.length }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      v-if="project.id !== 'default'" 
                      @click.stop="deleteProject(project)"
                      class="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Properties Panel (Right) -->
      <div 
        v-if="selectedProject && selectedProject.id !== 'default'"
        class="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto custom-scrollbar shrink-0"
      >
        <div class="p-6 space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Properties</h2>
            <div class="flex items-center gap-2">
              <button 
                @click="openProject(selectedProject.id)"
                class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
                title="Open Project Dashboard"
              >
                Open
              </button>
              <button @click="projectsStore.selectProject('default')" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Name -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project Name</label>
            <input 
              v-model="selectedProject.name"
              @blur="saveProject"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="Enter project name"
            />
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
            <textarea 
              v-model="selectedProject.description"
              @blur="saveProject"
              rows="4"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              placeholder="Project description..."
            ></textarea>
          </div>

          <!-- Connections -->
          <div class="space-y-3">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Connections</label>
            <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto custom-scrollbar space-y-2">
              <label v-for="conn in appStore.connections" :key="conn.id" class="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer">
                <input 
                  type="checkbox"
                  :value="conn.id"
                  v-model="selectedProject.connectionIds"
                  @change="saveProject"
                  class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                >
                <div class="flex-1">
                  <div class="text-sm font-bold text-gray-900 dark:text-white">{{ conn.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ conn.environment }} • {{ conn.database }}</div>
                </div>
              </label>
              <div v-if="appStore.connections.length === 0" class="text-xs text-center py-8 text-gray-400">
                No connections available
              </div>
            </div>
          </div>

          <!-- Sync Pairs -->
          <div class="space-y-3">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sync Pairs</label>
            <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto custom-scrollbar space-y-2">
              <label v-for="pair in connectionPairsStore.connectionPairs" :key="pair.id" class="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer">
                <input 
                  type="checkbox"
                  :value="pair.id"
                  v-model="selectedProject.pairIds"
                  @change="saveProject"
                  class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                >
                <div class="flex-1">
                  <div class="text-sm font-bold text-gray-900 dark:text-white">{{ pair.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ pair.sourceEnv }} → {{ pair.targetEnv }}</div>
                </div>
              </label>
              <div v-if="connectionPairsStore.connectionPairs.length === 0" class="text-xs text-center py-8 text-gray-400">
                No sync pairs available
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</span>
              <span class="font-mono text-gray-600 dark:text-gray-300">{{ formatDate(selectedProject.createdAt) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</span>
              <span class="font-mono text-gray-600 dark:text-gray-300">{{ formatDate(selectedProject.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAppStore } from '@/stores/app'
import { useConnectionPairsStore } from '@/stores/connectionPairs'
import MainLayout from '@/layouts/MainLayout.vue'
import ProjectsColumnsView from '@/components/ProjectsColumnsView.vue'
import ProjectsDetailView from '@/components/ProjectsDetailView.vue'
import { 
  Folder, 
  Plus, 
  Trash2, 
  Database,
  GitCompare,
  X,
  List,
  LayoutGrid,
  Columns,
  LayoutList
} from 'lucide-vue-next'

import { useI18n } from 'vue-i18n'

import { useRouter } from 'vue-router'

const { t: $t } = useI18n()
const router = useRouter()
const projectsStore = useProjectsStore()
const appStore = useAppStore()
const connectionPairsStore = useConnectionPairsStore()

// Header Title Editing
const isEditingTitle = ref(false)
const editingTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

const openProject = (id: string) => {
  projectsStore.selectProject(id)
  router.push({ name: 'Dashboard' })
}

const viewMode = ref<'list' | 'grid' | 'columns' | 'detail'>('grid')
const sortColumn = ref<'name' | 'connections' | 'pairs'>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const sortedProjects = computed(() => {
  const projects = [...projectsStore.projects]
  
  return projects.sort((a, b) => {
    let result = 0
    if (sortColumn.value === 'name') {
      result = a.name.localeCompare(b.name)
    } else if (sortColumn.value === 'connections') {
      result = a.connectionIds.length - b.connectionIds.length
    } else if (sortColumn.value === 'pairs') {
      result = a.pairIds.length - b.pairIds.length
    }
    
    return sortDirection.value === 'asc' ? result : -result
  })
})

const sortBy = (column: 'name' | 'connections' | 'pairs') => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const selectedProject = computed(() => {
  return projectsStore.projects.find(p => p.id === projectsStore.selectedProjectId)
})

const createNewProject = () => {
  const newProject = projectsStore.addProject({
    name: 'Untitled Project',
    description: '',
    connectionIds: [],
    pairIds: []
  })
  
  projectsStore.selectProject(newProject.id)
  
  // Auto-focus title for editing
  nextTick(() => {
    startEditTitle()
  })
}

const selectProject = (id: string) => {
  projectsStore.selectProject(id)
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

const saveTitle = () => {
  if (selectedProject.value && editingTitle.value.trim()) {
    projectsStore.updateProject(selectedProject.value.id, { name: editingTitle.value.trim() })
  }
  isEditingTitle.value = false
}

const cancelEdit = () => {
  isEditingTitle.value = false
}

const saveProject = () => {
  if (selectedProject.value) {
    projectsStore.updateProject(selectedProject.value.id, {
      name: selectedProject.value.name,
      description: selectedProject.value.description,
      connectionIds: selectedProject.value.connectionIds,
      pairIds: selectedProject.value.pairIds
    })
  }
}

const deleteProject = (project: any) => {
  if (confirm($t('projects.deleteConfirm', { name: project.name }))) {
    projectsStore.removeProject(project.id)
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
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
