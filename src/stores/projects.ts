import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storage } from '../utils/storage-ipc'
import type { Project } from '@/types/project'


export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const selectedProjectId = ref<string | null>(null)

  // Initialize
  const init = async () => {
    const savedProjects = await storage.getProjects()
    if (savedProjects.length > 0) {
      projects.value = savedProjects
    } else {
      // Create Default Project if none exists
      const defaultProject: Project = {
        id: 'default',
        name: 'Default Project',
        description: 'Default project for all connections',
        connectionIds: [], // Will be populated by existing connections if needed
        pairIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      projects.value = [defaultProject]
      selectedProjectId.value = 'default'
    }

    // Ensure "default" project exists if list is empty (double safety)
    if (projects.value.length === 0) {
      const defaultProject: Project = {
        id: 'default',
        name: 'Default Project',
        description: 'Default project for all connections',
        connectionIds: [],
        pairIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      projects.value = [defaultProject]
      selectedProjectId.value = 'default'
    }

    const lastSelected = await storage.get('settings').then(s => s?.lastSelectedProjectId)
    if (lastSelected && projects.value.some(p => p.id === lastSelected)) {
      selectedProjectId.value = lastSelected
    } else {
      // Always fallback to default or first
      selectedProjectId.value = projects.value[0]?.id || 'default'
    }
  }

  // Call init
  init()

  // Watchers
  watch(
    projects,
    newProjects => {
      storage.saveProjects(newProjects)
    },
    { deep: true }
  )

  watch(selectedProjectId, async (newId) => {
    if (newId) {
      // @ts-ignore
      await storage.updateSettings({ lastSelectedProjectId: newId })
    }
  })

  // Getters
  const currentProject = computed(() => {
    return projects.value.find(p => p.id === selectedProjectId.value) || null
  })

  // Actions
  function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const newProject: Project = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...project
    }

    projects.value.push(newProject)
    // The watch effect on 'projects' will handle saving to storage.
    // If a direct save is needed, a helper function 'saveProjects' would be defined.
    // For now, relying on the watcher.
    // saveProjects() // This line was in the instruction snippet, but 'saveProjects' is not defined.
    // The watcher on 'projects' already handles persistence.
    return newProject
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }
  }

  const removeProject = (id: string) => {
    if (id === 'default') return // Cannot remove default project
    projects.value = projects.value.filter(p => p.id !== id)
    if (selectedProjectId.value === id) {
      selectedProjectId.value = 'default'
    }
  }

  const selectProject = (id: string) => {
    if (projects.value.some(p => p.id === id)) {
      selectedProjectId.value = id
    }
  }

  return {
    projects,
    selectedProjectId,
    currentProject,
    addProject,
    updateProject,
    removeProject,
    selectProject,
    reloadData: init
  }
})
