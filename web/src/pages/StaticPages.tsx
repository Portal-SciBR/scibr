import { Link as MuiLink, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        {t('about.title')}
      </Typography>
      <Typography>{t('about.intro')}</Typography>
      <Typography>{t('about.directory')}</Typography>
      <Typography variant="h6" component="h2">
        {t('about.issueTitle')}
      </Typography>
      <Typography>
        {t('about.report')}{' '}
        <MuiLink
          href="https://github.com/Portal-SciBR/scibr/issues/new?template=reportar-conteudo.yml"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('about.issueLink')}
        </MuiLink>
        .
      </Typography>
    </Stack>
  )
}

export function GuidelinesPage() {
  const { t } = useTranslation()
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        {t('guidelines.title')}
      </Typography>
      <Typography>{t('guidelines.intro')}</Typography>
      <Typography component="ul" sx={{ pl: 3 }}>
        <li>{t('guidelines.publicSource')}</li>
        <li>{t('guidelines.brazilRelation')}</li>
        <li>{t('guidelines.evidence')}</li>
        <li>{t('guidelines.appropriate')}</li>
      </Typography>
      <Typography color="text.secondary">{t('guidelines.review')}</Typography>
    </Stack>
  )
}
