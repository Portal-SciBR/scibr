import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'
import i18n from '../i18n'

beforeEach(async () => {
  localStorage.removeItem('scibr:language')
  localStorage.removeItem('scibr:language-hint-dismissed')
  await i18n.changeLanguage('pt-BR')
})
