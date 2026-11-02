import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { hasActiveFilters } from '../lib/filters'
import { useDebounced } from '../lib/useDebounced'
import { AREAS, FORMATOS, IDIOMAS, type Filters } from '../lib/types'

interface Props {
  filters: Filters
  availableTags: string[]
  onChange: (patch: Partial<Filters>) => void
  onReset: () => void
}

export function SearchFilters({
  filters,
  availableTags,
  onChange,
  onReset,
}: Props) {
  const [text, setText] = useState(filters.q)
  const debounced = useDebounced(text)

  useEffect(() => setText(filters.q), [filters.q])
  useEffect(() => {
    if (debounced !== filters.q) onChange({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <Stack
      spacing={2}
      component="form"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <TextField
        fullWidth
        type="search"
        label="Buscar divulgações"
        placeholder="Ex: astronomia, podcast, Fiocruz…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: text ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Limpar busca"
                  onClick={() => setText('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
        }}
      >
        <TextField
          select
          size="small"
          label="Área do conhecimento"
          value={filters.area}
          onChange={(e) =>
            onChange({ area: e.target.value as Filters['area'] })
          }
        >
          <MenuItem value="">Todas</MenuItem>
          {AREAS.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Formato"
          value={filters.formato}
          onChange={(e) =>
            onChange({ formato: e.target.value as Filters['formato'] })
          }
        >
          <MenuItem value="">Todos</MenuItem>
          {FORMATOS.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Idioma"
          value={filters.idioma}
          onChange={(e) => onChange({ idioma: e.target.value })}
        >
          <MenuItem value="">Todos</MenuItem>
          {IDIOMAS.map((i) => (
            <MenuItem key={i.value} value={i.value}>
              {i.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Ordenar por"
          value={filters.sort}
          onChange={(e) =>
            onChange({ sort: e.target.value as Filters['sort'] })
          }
        >
          <MenuItem value="relevance">Relevância</MenuItem>
          <MenuItem value="recent">Mais recentes</MenuItem>
        </TextField>
      </Box>
      <Autocomplete
        multiple
        size="small"
        options={availableTags}
        value={filters.tags}
        onChange={(_, tags) => onChange({ tags })}
        renderInput={(params) => <TextField {...params} label="Tags" />}
      />
      {hasActiveFilters(filters) && (
        <Box>
          <Button size="small" onClick={onReset}>
            Limpar filtros
          </Button>
        </Box>
      )}
    </Stack>
  )
}
