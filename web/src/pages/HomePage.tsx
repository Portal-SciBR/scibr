import {
  Alert,
  Box,
  Button,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
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
          A ciência brasileira, num só lugar
        </Typography>
        <Typography color="text.secondary">
          Diretório aberto de artigos, podcasts, canais e portais de divulgação
          científica.
        </Typography>
      </Box>

      {!isSupabaseConfigured && (
        <Alert severity="warning">
          Supabase não configurado. Defina VITE_SUPABASE_URL e
          VITE_SUPABASE_ANON_KEY em web/.env.
        </Alert>
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
              <Button onClick={() => cards.refetch()}>Tentar de novo</Button>
            }
          >
            Não foi possível carregar as divulgações.
          </Alert>
        )}
        {cards.data && (
          <Typography variant="body2" color="text.secondary">
            {total} {total === 1 ? 'resultado' : 'resultados'}
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
            ? 'Nenhuma divulgação encontrada com esses filtros.'
            : 'Ainda não há divulgações publicadas.'}
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
