import { createI18n } from 'vue-i18n'
import en from './en.yaml'
import vi from './vi.yaml'

const messages = {
  en,
  vi
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

export function setLanguage(locale: 'en' | 'vi') {
  i18n.global.locale.value = locale
}

