import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storage } from '../utils/storage-ipc'
import type { Project } from '@/types/project'


export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const selectedProjectId = ref<string | null>(null)
  const viewMode = ref<'list' | 'grid' | 'columns' | 'detail'>('grid')
  const isPropertiesPanelOpen = ref(true)

  // Initialize
  const init = async () => {
    const savedProjects = await storage.getProjects()
    if (savedProjects.length > 0) {
      // Ensure strict schema for legacy data
      projects.value = savedProjects.map(p => ({
        ...p,
        connectionIds: Array.isArray(p.connectionIds) ? p.connectionIds : [],
        pairIds: Array.isArray(p.pairIds) ? p.pairIds : [],
        enabledEnvironmentIds: Array.isArray(p.enabledEnvironmentIds) ? p.enabledEnvironmentIds : ['1', '2', '3', '4'] // Default to all standard envs
      }))

      // Migration: Rename "Default Project" or "Nexus" to "The Base One"
      const defaultProj = projects.value.find(p => p.id === 'default')
      if (defaultProj && (defaultProj.name === 'Default Project' || defaultProj.name === 'Nexus')) {
        defaultProj.name = 'The Base One'
        defaultProj.description = 'System default project (cannot be deleted)'
      }
    } else {
      // Create Default Project if none exists
      const defaultProject: Project = {
        id: 'default',
        name: 'The Base One',
        description: 'System default project (cannot be deleted)',
        connectionIds: [], // Will be populated by existing connections if needed
        pairIds: [],
        enabledEnvironmentIds: ['1', '2', '3', '4'],
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
        name: 'The Base One',
        description: 'System default project (cannot be deleted)',
        connectionIds: [],
        pairIds: [],
        enabledEnvironmentIds: ['1', '2', '3', '4'],
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

  const addItemToProject = (type: 'connection' | 'pair', itemId: string) => {
    if (!selectedProjectId.value) return
    const project = projects.value.find(p => p.id === selectedProjectId.value)
    if (project) {
      if (type === 'connection' && !project.connectionIds.includes(itemId)) {
        project.connectionIds.push(itemId)
      } else if (type === 'pair' && !project.pairIds.includes(itemId)) {
        project.pairIds.push(itemId)
      }
    }
  }

  const removeItemFromProject = (type: 'connection' | 'pair', itemId: string) => {
    projects.value.forEach(p => {
      if (type === 'connection') {
        p.connectionIds = p.connectionIds.filter(id => id !== itemId)
      } else {
        p.pairIds = p.pairIds.filter(id => id !== itemId)
      }
    })
  }

  return {
    projects,
    selectedProjectId,
    currentProject,
    addProject,
    updateProject,
    removeProject,
    selectProject,
    addItemToProject,
    removeItemFromProject,
    reloadData: init,
    viewMode
  }
})
