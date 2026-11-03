import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'

const LANGUAGE_KEY = 'scibr:language'
const storedLanguage = localStorage.getItem(LANGUAGE_KEY)
const initialLanguage = storedLanguage === 'en' ? 'en' : 'pt-BR'

const updateDocumentLanguage = (language: string) => {
  const resolvedLanguage = language.startsWith('en') ? 'en' : 'pt-BR'
  document.documentElement.lang = resolvedLanguage
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      'content',
      resolvedLanguage === 'en'
        ? en.metadata.description
        : ptBR.metadata.description,
    )
  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute(
      'content',
      resolvedLanguage === 'en'
        ? en.metadata.ogDescription
        : ptBR.metadata.ogDescription,
    )
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: initialLanguage,
  fallbackLng: 'pt-BR',
  supportedLngs: ['en', 'pt-BR'],
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (language) => {
  const resolvedLanguage = language.startsWith('en') ? 'en' : 'pt-BR'
  localStorage.setItem(LANGUAGE_KEY, resolvedLanguage)
  updateDocumentLanguage(resolvedLanguage)
})

updateDocumentLanguage(initialLanguage)

export default i18n
