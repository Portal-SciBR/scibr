import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import {
  parseTags,
  submissionSchema,
  type SubmissionInput,
} from '../lib/schemas'
import { AREAS, FORMATOS, type AdminCard } from '../lib/types'

interface Props {
  card: AdminCard
  onClose: () => void
  onSave: (patch: Partial<SubmissionInput>) => void
}

export function EditCardDialog({ card, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    titulo: card.titulo,
    descricao: card.descricao,
    area: card.area,
    formato: card.formato,
    instituicao_autor: card.instituicao_autor ?? '',
    tagsRaw: card.tags.join(', '),
    link_original: card.link_original,
    idioma: card.idioma,
  })
  const [error, setError] = useState('')
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))

  const save = () => {
    const { tagsRaw, ...rest } = form
    const parsed = submissionSchema.safeParse({
      ...rest,
      tags: parseTags(tagsRaw),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    onSave({
      ...parsed.data,
      instituicao_autor: parsed.data.instituicao_autor || undefined,
    })
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <DialogTitle>Editar divulgação</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Título"
            value={form.titulo}
            onChange={set('titulo')}
          />
          <TextField
            label="Resumo"
            multiline
            minRows={3}
            value={form.descricao}
            onChange={set('descricao')}
          />
          <TextField
            label="Link"
            value={form.link_original}
            onChange={set('link_original')}
          />
          <TextField
            select
            label="Área"
            value={form.area}
            onChange={set('area')}
          >
            {AREAS.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Formato"
            value={form.formato}
            onChange={set('formato')}
          >
            {FORMATOS.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Instituição ou autor"
            value={form.instituicao_autor}
            onChange={set('instituicao_autor')}
          />
          <TextField
            label="Tags (vírgula)"
            value={form.tagsRaw}
            onChange={set('tagsRaw')}
            error={!!error}
            helperText={error}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
