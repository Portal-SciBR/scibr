import { Link as MuiLink, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { PRIVACY_EMAIL, PRIVACY_VERSION } from '../lib/privacy'

export function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        {t('privacy.title')}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {t('privacy.version', { version: PRIVACY_VERSION })}
      </Typography>

      <Typography variant="h6" component="h2">
        {t('privacy.controllerTitle')}
      </Typography>
      <Typography>{t('privacy.controller')}</Typography>

      <Typography variant="h6" component="h2">
        {t('privacy.collectedTitle')}
      </Typography>
      <Typography component="ul" sx={{ pl: 3 }}>
        <li>
          <strong>{t('privacy.required')}</strong> {t('privacy.requiredData')}
        </li>
        <li>
          <strong>{t('privacy.optional')}</strong> {t('privacy.optionalData')}
        </li>
        <li>{t('privacy.consentData')}</li>
      </Typography>

      <Typography variant="h6" component="h2">
        {t('privacy.useTitle')}
      </Typography>
      <Typography>{t('privacy.use')}</Typography>

      <Typography variant="h6" component="h2">
        {t('privacy.publicTitle')}
      </Typography>
      <Typography component="ul" sx={{ pl: 3 }}>
        <li>{t('privacy.publicName')}</li>
        <li>{t('privacy.hiddenContact')}</li>
        <li>{t('privacy.moderationAccess')}</li>
      </Typography>

      <Typography variant="h6" component="h2">
        {t('privacy.retentionTitle')}
      </Typography>
      <Typography>{t('privacy.retention')}</Typography>

      <Typography variant="h6" component="h2">
        {t('privacy.rightsTitle')}
      </Typography>
      <Typography>{t('privacy.rights')}</Typography>
      <Typography>
        {PRIVACY_EMAIL ? (
          <>
            {t('privacy.contact')}{' '}
            <MuiLink href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</MuiLink>{' '}
            {t('privacy.contactSuffix')}
          </>
        ) : (
          t('privacy.contactUnavailable')
        )}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {t('privacy.minors')}
      </Typography>
    </Stack>
  )
}
