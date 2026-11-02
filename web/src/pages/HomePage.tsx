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

      <Paper variant="outlined" sx={{ p: 3 }} component="section">
        <Typography variant="h6" component="h2" gutterBottom>
          Como publicar uma divulgação
        </Typography>
        <Typography component="ol" sx={{ pl: 3, m: 0 }}>
          <li>
            Acesse a página <strong>Enviar</strong> pelo menu ou pelo botão
            abaixo.
          </li>
          <li>
            Preencha o <strong>título</strong>, um <strong>resumo</strong> de
            até 500 caracteres, o <strong>link para a fonte</strong> (começando
            com http:// ou https://), a área, o formato e o idioma.
          </li>
          <li>
            Informe a instituição ou autor e, se quiser, até 8 tags para
            facilitar a busca.
          </li>
          <li>
            Preencha seu nome e e-mail, indique sua relação com o conteúdo e
            aceite a Política de Privacidade.
          </li>
          <li>
            Clique em <strong>Enviar para revisão</strong>. Sua divulgação só
            fica visível depois de aprovada pela equipe.
          </li>
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" component={Link} to="/enviar">
            Enviar divulgação
          </Button>
          <Button component={Link} to="/diretrizes">
            Ver diretrizes de curadoria
          </Button>
        </Stack>
      </Paper>

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
