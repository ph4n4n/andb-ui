import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storage } from '../utils/storage-ipc'
import type { Project } from '@/types/project'


export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const selectedProjectId = ref<string | null>(null)
  const viewMode = ref<'list' | 'grid' | 'columns' | 'detail'>('grid')

  // Initialize
  const init = async () => {
    const savedProjects = await storage.getProjects()

    // 1. Load existing projects
    if (savedProjects && savedProjects.length > 0) {
      const envIdMap: Record<string, string> = {
        '1': 'DEV',
        '2': 'STAGE',
        '3': 'UAT',
        '4': 'PROD'
      }

      projects.value = savedProjects.map(p => {
        let envs = Array.isArray(p.enabledEnvironmentIds) ? p.enabledEnvironmentIds.map(String) : ['DEV', 'STAGE', 'PROD']

        // Migrate numeric IDs to Named IDs
        envs = envs.map(id => envIdMap[id] || id)

        return {
          ...p,
          connectionIds: Array.isArray(p.connectionIds) ? p.connectionIds : [],
          pairIds: Array.isArray(p.pairIds) ? p.pairIds : [],
          enabledEnvironmentIds: envs
        }
      })
    }

    // 2. Ensure Default Project
    if (!projects.value.some(p => p.id === 'default')) {
      projects.value.push({
        id: 'default',
        name: 'The Base One',
        description: 'System default project',
        connectionIds: [],
        pairIds: [],
        enabledEnvironmentIds: ['DEV', 'STAGE', 'PROD'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }



    // 4. Set Selection
    const lastSelected = await storage.get('settings').then(s => s?.lastSelectedProjectId)

    // 5. Data Sanitization (Fix duplicate IDs from previous bugs)
    // If multiple projects share 'default' ID, only the first one stays 'default'
    let defaultCount = 0
    projects.value = projects.value.map(p => {
      if (p.id === 'default') {
        defaultCount++
        if (defaultCount > 1) {
          return { ...p, id: generateId() }
        }
      }
      return p
    })

    if (lastSelected && projects.value.some(p => p.id === lastSelected)) {
      selectedProjectId.value = lastSelected
    } else {
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

  /**
   * Safe UUID generator with fallbacks
   */
  const generateId = () => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID()
      }
      return 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
    } catch (e) {
      return 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
    }
  }

  // Actions
  function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const newProject: Project = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...project
    }

    projects.value.push(newProject)
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

    // Check if we are deleting the currently selected project
    const wasSelected = selectedProjectId.value === id

    projects.value = projects.value.filter(p => p.id !== id)

    if (wasSelected) {
      // Find another project to select, or fallback to default
      selectedProjectId.value = projects.value[0]?.id || 'default'
    }
  }

  const selectProject = (id: string) => {
    if (projects.value.some(p => p.id === id)) {
      selectedProjectId.value = id
    }
  }

  const duplicateProject = (id: string) => {
    const source = projects.value.find(p => p.id === id)
    if (!source) return

    const newProject: Project = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateId(), // OVERWRITE the ID from source
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projects.value.push(newProject)
    return newProject
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
    duplicateProject,
    removeProject,
    selectProject,
    addItemToProject,
    removeItemFromProject,
    reloadData: init,
    viewMode
  }
})
