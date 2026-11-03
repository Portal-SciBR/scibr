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
import { useTranslation } from 'react-i18next'
import { hasActiveFilters } from '../lib/filters'
import { useDebounced } from '../lib/useDebounced'
import { AREAS, FORMATOS, IDIOMAS, type Filters } from '../lib/types'

interface Props {
  filters: Filters
  availableTags: string[]
  availableAreas: string[]
  onChange: (patch: Partial<Filters>) => void
  onReset: () => void
}

export function SearchFilters({
  filters,
  availableTags,
  availableAreas,
  onChange,
  onReset,
}: Props) {
  const { t } = useTranslation()
  const areaOptions = [...new Set([...AREAS, ...availableAreas])]
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
        label={t('search.label')}
        placeholder={t('search.placeholder')}
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
                  aria-label={t('search.clear')}
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
          label={t('search.area')}
          value={filters.area}
          onChange={(e) =>
            onChange({ area: e.target.value as Filters['area'] })
          }
        >
          <MenuItem value="">{t('search.allAreas')}</MenuItem>
          {areaOptions.map((a) => (
            <MenuItem key={a} value={a}>
              {t(`domain.areas.${a}`, { defaultValue: a })}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t('search.format')}
          value={filters.formato}
          onChange={(e) =>
            onChange({ formato: e.target.value as Filters['formato'] })
          }
        >
          <MenuItem value="">{t('search.allFormats')}</MenuItem>
          {FORMATOS.map((f) => (
            <MenuItem key={f} value={f}>
              {t(`domain.formats.${f}`)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t('search.language')}
          value={filters.idioma}
          onChange={(e) => onChange({ idioma: e.target.value })}
        >
          <MenuItem value="">{t('search.allLanguages')}</MenuItem>
          {IDIOMAS.map((i) => (
            <MenuItem key={i.value} value={i.value}>
              {t(`domain.languages.${i.value}`)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t('search.sort')}
          value={filters.sort}
          onChange={(e) =>
            onChange({ sort: e.target.value as Filters['sort'] })
          }
        >
          <MenuItem value="relevance">{t('search.relevance')}</MenuItem>
          <MenuItem value="recent">{t('search.recent')}</MenuItem>
        </TextField>
      </Box>
      <Autocomplete
        multiple
        size="small"
        clearText={t('search.autocomplete.clear')}
        closeText={t('search.autocomplete.close')}
        noOptionsText={t('search.autocomplete.noOptions')}
        openText={t('search.autocomplete.open')}
        loadingText={t('search.autocomplete.loading')}
        options={availableTags}
        value={filters.tags}
        onChange={(_, tags) => onChange({ tags })}
        renderInput={(params) => (
          <TextField {...params} label={t('search.tags')} />
        )}
      />
      {hasActiveFilters(filters) && (
        <Box>
          <Button size="small" onClick={onReset}>
            {t('search.clearFilters')}
          </Button>
        </Box>
      )}
    </Stack>
  )
}
