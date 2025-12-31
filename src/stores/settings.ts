import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'en' | 'vi'

interface Settings {
  theme: Theme
  language: Language
}

const STORAGE_KEY = 'andb-ui-settings'

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en'
}

const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(loadSettings())

  // Watch for changes and save to localStorage
  watch(settings, (newSettings) => {
    saveSettings(newSettings)
    applyTheme(newSettings.theme)
    setLanguage(newSettings.language)
  }, { deep: true })

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', isDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  const setTheme = (theme: Theme) => {
    settings.value.theme = theme
  }

  const setLanguage = (language: Language) => {
    settings.value.language = language
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(settings.value.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    settings.value.theme = themes[nextIndex]
  }

  // Initialize theme on store creation
  applyTheme(settings.value.theme)

  return {
    settings,
    setTheme,
    setLanguage,
    toggleTheme
  }
})
