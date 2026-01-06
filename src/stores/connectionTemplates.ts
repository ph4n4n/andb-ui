import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storage } from '../utils/storage-ipc'

export interface ConnectionTemplate {
  id: string
  name: string
  host: string
  port: number
  username: string
  password?: string
  type: 'mysql' | 'postgres' | 'sqlite'
  createdAt: string
  updatedAt: string
}

export const useConnectionTemplatesStore = defineStore('connectionTemplates', () => {
  const templates = ref<ConnectionTemplate[]>([])

  const init = async () => {
    // Load from storage (assume storage method exists or will be added)
    // For now, we might need to mock or ensure storage supports this key
    const saved = await storage.get('connectionTemplates')
    if (saved) {
      templates.value = saved
    }
  }

  init()

  watch(templates, (newVal) => {
    storage.set('connectionTemplates', newVal)
  }, { deep: true })

  function addTemplate(template: Omit<ConnectionTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTemplate: ConnectionTemplate = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...template
    }
    templates.value.push(newTemplate)
    return newTemplate
  }

  function updateTemplate(id: string, updates: Partial<ConnectionTemplate>) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }
  }

  function removeTemplate(id: string) {
    templates.value = templates.value.filter(t => t.id !== id)
  }

  return {
    templates,
    addTemplate,
    updateTemplate,
    removeTemplate,
    reloadData: init
  }
})
