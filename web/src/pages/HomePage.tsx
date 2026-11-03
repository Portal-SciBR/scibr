import {
  Alert,
  Box,
  Button,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { CardItem } from '../components/CardItem'
import { SearchFilters } from '../components/SearchFilters'
import { fetchTags, searchCards } from '../lib/api'
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  parseFilters,
  serializeFilters,
} from '../lib/filters'
import { isSupabaseConfigured } from '../lib/supabase'
import { PAGE_SIZE, type Filters } from '../lib/types'

const gridSx = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
  },
}

export function HomePage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const filters = parseFilters(params)

  const update = (patch: Partial<Filters>) => {
    const next = { ...filters, page: 1, ...patch }
    setParams(serializeFilters(next), { replace: true })
  }

  const cards = useQuery({
    queryKey: ['cards', filters],
    queryFn: () => searchCards(filters),
    enabled: isSupabaseConfigured,
    placeholderData: (prev) => prev,
  })
  const tags = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    enabled: isSupabaseConfigured,
    staleTime: 5 * 60_000,
  })

  const total = cards.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontSize: { xs: '1.9rem', sm: '3rem' } }}
        >
          {t('home.title')}
        </Typography>
        <Typography color="text.secondary">{t('home.subtitle')}</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3 }} component="section">
        <Typography variant="h6" component="h2" gutterBottom>
          {t('home.howToTitle')}
        </Typography>
        <Typography component="ol" sx={{ pl: 3, m: 0 }}>
          <li>{t('home.step1')}</li>
          <li>{t('home.step2')}</li>
          <li>{t('home.step3')}</li>
          <li>{t('home.step4')}</li>
          <li>{t('home.step5')}</li>
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" component={Link} to="/enviar">
            {t('home.submitResource')}
          </Button>
          <Button component={Link} to="/diretrizes">
            {t('home.viewGuidelines')}
          </Button>
        </Stack>
      </Paper>

      {!isSupabaseConfigured && (
        <Alert severity="warning">{t('home.supabaseWarning')}</Alert>
      )}

      <SearchFilters
        filters={filters}
        availableTags={tags.data ?? []}
        onChange={update}
        onReset={() =>
          setParams(serializeFilters(DEFAULT_FILTERS), { replace: true })
        }
      />

      <Box aria-live="polite">
        {cards.isError && (
          <Alert
            severity="error"
            action={
              <Button onClick={() => cards.refetch()}>{t('home.retry')}</Button>
            }
          >
            {t('home.loadError')}
          </Alert>
        )}
        {cards.data && (
          <Typography variant="body2" color="text.secondary">
            {t('home.results', { count: total })}
          </Typography>
        )}
      </Box>

      {cards.isLoading ? (
        <Box sx={gridSx}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={240} />
          ))}
        </Box>
      ) : cards.data && cards.data.items.length === 0 ? (
        <Alert severity="info">
          {hasActiveFilters(filters)
            ? t('home.noFilteredResults')
            : t('home.noResources')}
        </Alert>
      ) : (
        <Box sx={gridSx}>
          {cards.data?.items.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onTagClick={(tag) =>
                filters.tags.includes(tag)
                  ? undefined
                  : update({ tags: [...filters.tags, tag] })
              }
            />
          ))}
        </Box>
      )}

      {pages > 1 && (
        <Pagination
          sx={{ alignSelf: 'center' }}
          siblingCount={0}
          size="small"
          aria-label={t('home.pagination')}
          getItemAriaLabel={(type, page) => {
            if (type === 'first') return t('home.firstPage')
            if (type === 'last') return t('home.lastPage')
            if (type === 'next') return t('home.nextPage')
            if (type === 'previous') return t('home.previousPage')
            return t('home.page', { page })
          }}
          count={pages}
          page={filters.page}
          onChange={(_, page) => {
            setParams(serializeFilters({ ...filters, page }))
            window.scrollTo({ top: 0 })
          }}
        />
      )}
    </Stack>
  )
}
