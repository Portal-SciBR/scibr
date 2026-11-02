import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { submitCard } from '../lib/api'
import {
  RELACOES,
  enviadorSchema,
  parseTags,
  stripAt,
  submissionSchema,
  withHttps,
} from '../lib/schemas'
import { AREAS, FORMATOS, IDIOMAS } from '../lib/types'

const formSchema = submissionSchema
  .omit({ tags: true })
  .extend(enviadorSchema.shape)
  .extend({
    tagsRaw: z
      .string()
      .refine((v) => parseTags(v).length <= 8, 'Máximo de 8 tags'),
    consentimento: z.literal(true, {
      error: 'É preciso concordar para enviar',
    }),
    website: z.string().max(0),
  })

type FormValues = z.input<typeof formSchema>

const COOLDOWN_KEY = 'scibr:last-submit'
const COOLDOWN_MS = 30_000

const defaults: FormValues = {
  titulo: '',
  descricao: '',
  area: '' as FormValues['area'],
  formato: '' as FormValues['formato'],
  instituicao_autor: '',
  tagsRaw: '',
  link_original: '',
  idioma: 'pt-BR',
  enviador_nome: '',
  enviador_email: '',
  enviador_relacao: '' as FormValues['enviador_relacao'],
  enviador_telefone: '',
  enviador_instagram: '',
  enviador_x: '',
  enviador_youtube: '',
  enviador_linkedin: '',
  enviador_site: '',
  consentimento: false as unknown as true,
  website: '',
}

export function SubmitPage() {
  // Normaliza @usuario e links sem https antes de validar.
  const normalize = (v: FormValues): FormValues => ({
    ...v,
    enviador_instagram: stripAt(v.enviador_instagram ?? ''),
    enviador_x: stripAt(v.enviador_x ?? ''),
    enviador_youtube: withHttps(v.enviador_youtube ?? ''),
    enviador_linkedin: withHttps(v.enviador_linkedin ?? ''),
    enviador_site: withHttps(v.enviador_site ?? ''),
  })

  const baseResolver = zodResolver(formSchema)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, z.output<typeof formSchema>>({
    resolver: (values, ctx, opts) => baseResolver(normalize(values), ctx, opts),
    defaultValues: defaults,
  })

  const mutation = useMutation({
    mutationFn: async (v: z.output<typeof formSchema>) => {
      const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0)
      if (Date.now() - last < COOLDOWN_MS) {
        throw new Error(
          'Aguarde alguns segundos antes de enviar outra divulgação.',
        )
      }
      // Honeypot preenchido: finge sucesso sem gravar.
      if (v.website) return
      const {
        tagsRaw,
        website: _website,
        consentimento: _consentimento,
        ...rest
      } = v
      await submitCard({ ...rest, tags: parseTags(tagsRaw) })
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
    },
    onSuccess: () => {
      reset(defaults)
      window.scrollTo({ top: 0 })
    },
  })

  return (
    <Stack spacing={3} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Enviar divulgação
        </Typography>
        <Typography color="text.secondary">
          Qualquer pessoa pode sugerir um conteúdo. Ele ficará visível após
          revisão da equipe. Não hospedamos o material: apenas direcionamos para
          a fonte original.
        </Typography>
      </Box>

      {mutation.isSuccess && (
        <Alert severity="success">
          Recebido! Sua divulgação será revisada antes de ser publicada.
        </Alert>
      )}
      {mutation.isError && (
        <Alert severity="error">{mutation.error.message}</Alert>
      )}

      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
      >
        <TextField
          label="Título"
          required
          {...register('titulo')}
          error={!!errors.titulo}
          helperText={errors.titulo?.message}
        />
        <TextField
          label="Resumo"
          required
          multiline
          minRows={3}
          {...register('descricao')}
          error={!!errors.descricao}
          helperText={errors.descricao?.message ?? 'Até 500 caracteres.'}
        />
        <TextField
          label="Link para a fonte"
          required
          type="url"
          placeholder="https://…"
          {...register('link_original')}
          error={!!errors.link_original}
          helperText={errors.link_original?.message}
        />
        <Controller
          name="area"
          control={control}
          render={({ field }) => (
            <TextField
              select
              required
              label="Área do conhecimento"
              {...field}
              error={!!errors.area}
              helperText={errors.area?.message}
            >
              {AREAS.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="formato"
          control={control}
          render={({ field }) => (
            <TextField
              select
              required
              label="Formato"
              {...field}
              error={!!errors.formato}
              helperText={errors.formato?.message}
            >
              {FORMATOS.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="idioma"
          control={control}
          render={({ field }) => (
            <TextField select label="Idioma" {...field}>
              {IDIOMAS.map((i) => (
                <MenuItem key={i.value} value={i.value}>
                  {i.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label="Instituição ou autor"
          {...register('instituicao_autor')}
          error={!!errors.instituicao_autor}
          helperText={errors.instituicao_autor?.message}
        />
        <TextField
          label="Tags"
          {...register('tagsRaw')}
          error={!!errors.tagsRaw}
          helperText={
            errors.tagsRaw?.message ?? 'Separe por vírgula. Máximo de 8.'
          }
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }}
          {...register('website')}
        />

        <Divider textAlign="left">Quem está enviando</Divider>
        <Typography variant="body2" color="text.secondary">
          Não coletamos dados pessoais. O objetivo desta página é apenas
          viabilizar o contato entre autores e leitores interessados no
          conteúdo. Em caso de dúvidas, entre em contato pelo e-mail{' '}
          {import.meta.env.VITE_PRIVACY_EMAIL}.
        </Typography>
        <TextField
          label="Seu nome"
          required
          autoComplete="name"
          {...register('enviador_nome')}
          error={!!errors.enviador_nome}
          helperText={errors.enviador_nome?.message}
        />
        <TextField
          label="Seu e-mail"
          required
          type="email"
          autoComplete="email"
          {...register('enviador_email')}
          error={!!errors.enviador_email}
          helperText={errors.enviador_email?.message}
        />
        <Controller
          name="enviador_relacao"
          control={control}
          render={({ field }) => (
            <TextField
              select
              required
              label="Sua relação com o conteúdo"
              {...field}
              error={!!errors.enviador_relacao}
              helperText={errors.enviador_relacao?.message}
            >
              {RELACOES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Typography variant="body2" color="text.secondary">
          Contatos e redes (opcionais) para divulgação do trabalho:
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          <TextField
            label="Telefone/WhatsApp"
            type="tel"
            autoComplete="tel"
            {...register('enviador_telefone')}
            error={!!errors.enviador_telefone}
            helperText={errors.enviador_telefone?.message}
          />
          <TextField
            label="Instagram"
            placeholder="@usuario"
            {...register('enviador_instagram')}
            error={!!errors.enviador_instagram}
            helperText={errors.enviador_instagram?.message}
          />
          <TextField
            label="X/Twitter"
            placeholder="@usuario"
            {...register('enviador_x')}
            error={!!errors.enviador_x}
            helperText={errors.enviador_x?.message}
          />
          <TextField
            label="YouTube"
            placeholder="youtube.com/@canal"
            {...register('enviador_youtube')}
            error={!!errors.enviador_youtube}
            helperText={errors.enviador_youtube?.message}
          />
          <TextField
            label="LinkedIn"
            placeholder="linkedin.com/in/…"
            {...register('enviador_linkedin')}
            error={!!errors.enviador_linkedin}
            helperText={errors.enviador_linkedin?.message}
          />
          <TextField
            label="Site ou Lattes"
            placeholder="https://…"
            {...register('enviador_site')}
            error={!!errors.enviador_site}
            helperText={errors.enviador_site?.message}
          />
        </Box>
        <FormControl error={!!errors.consentimento}>
          <FormControlLabel
            control={<Checkbox {...register('consentimento')} />}
            label={
              <>
                Li e concordo com a{' '}
                <MuiLink
                  component={Link}
                  to="/privacidade"
                  target="_blank"
                  rel="noopener"
                >
                  Política de Privacidade
                </MuiLink>
                . Autorizo a exibição pública do meu nome e das redes/site
                informados, e que meu e-mail e telefone sejam mostrados a
                visitantes que clicarem para ver o contato.
              </>
            }
          />
          {errors.consentimento && (
            <FormHelperText>{errors.consentimento.message}</FormHelperText>
          )}
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Enviando…' : 'Enviar para revisão'}
        </Button>
      </Stack>
    </Stack>
  )
}
