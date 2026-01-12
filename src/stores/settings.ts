import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system' | 'solarized-dark' | 'night-owl-dark' | 'night-owl-light'
export type Language = 'en' | 'vi'

export interface ThemeOption {
  id: Theme
  label: string
  dark: boolean
  preview: {
    main: string
    sidebar: string
  }
}

export const themeOptions: ThemeOption[] = [
  { id: 'light', label: 'Refined Light', dark: false, preview: { main: '#ffffff', sidebar: '#f9fafb' } },
  { id: 'night-owl-light', label: 'Night Owl Light', dark: false, preview: { main: '#fbfbfb', sidebar: '#f0f0f0' } },
  { id: 'dark', label: 'Pro Dark', dark: true, preview: { main: '#111827', sidebar: '#1f2937' } },
  { id: 'solarized-dark', label: 'Solarized Dark', dark: true, preview: { main: '#002b36', sidebar: '#073642' } },
  { id: 'night-owl-dark', label: 'Night Owl Dark', dark: true, preview: { main: '#011627', sidebar: '#01111d' } }
]

interface Settings {
  theme: Theme
  language: Language
  timezone: string
  domainNormalization: {
    pattern: string
    replacement: string
  }
  isNotMigrateCondition: string
}

const STORAGE_KEY = 'andb-ui-settings'

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  domainNormalization: {
    pattern: '@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    replacement: '@<EMAIL_DOMAIN>'
  },
  isNotMigrateCondition: 'test|OTE_'
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
  } catch (error: any) {
    if (window.electronAPI) {
      window.electronAPI.log.send('error', 'Failed to save settings to localStorage', error.message)
    }
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

    // Clean up existing theme classes
    const themeClasses = ['dark', 'solarized-dark', 'night-owl-dark', 'night-owl-light']
    root.classList.remove(...themeClasses)

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', isDark)
    } else {
      root.classList.add(theme)

      // For 'dark' variants, we should also add 'dark' class if we want to keep using Tailwind's dark: utilities
      // unless the theme specifically redefines everything.
      if (theme.includes('dark')) {
        root.classList.add('dark')
      }
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
