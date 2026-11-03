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
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { ApiError, submitCard } from '../lib/api'
import {
  RELACOES,
  enviadorSchemaFor,
  parseTags,
  stripAt,
  submissionSchemaFor,
  withHttps,
} from '../lib/schemas'
import { AREAS, FORMATOS, IDIOMAS } from '../lib/types'

const createFormSchema = (t: (key: string) => string) =>
  submissionSchemaFor(t)
    .omit({ tags: true })
    .extend(enviadorSchemaFor(t).shape)
    .extend({
      tagsRaw: z
        .string()
        .refine((v) => parseTags(v).length <= 8, t('validation.max8')),
      consentimento: z.literal(true, {
        error: t('validation.consentRequired'),
      }),
      website: z.string().max(0),
    })

type FormValues = z.input<ReturnType<typeof createFormSchema>>

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
  const { t } = useTranslation()
  const formSchema = createFormSchema(t)
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
  const summaryLength = useWatch({ control, name: 'descricao' })?.length ?? 0

  const mutation = useMutation({
    mutationFn: async (v: z.output<typeof formSchema>) => {
      const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0)
      if (Date.now() - last < COOLDOWN_MS) {
        throw new Error(t('submit.cooldown'))
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
          {t('submit.title')}
        </Typography>
        <Typography color="text.secondary">{t('submit.intro')}</Typography>
      </Box>

      {mutation.isSuccess && (
        <Alert severity="success">{t('submit.success')}</Alert>
      )}
      {mutation.isError && (
        <Alert severity="error">
          {mutation.error instanceof ApiError
            ? t(`errors.${mutation.error.code}`)
            : mutation.error.message}
        </Alert>
      )}

      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
      >
        <TextField
          label={t('submit.titleField')}
          required
          {...register('titulo')}
          error={!!errors.titulo}
          helperText={errors.titulo?.message}
        />
        <TextField
          label={t('submit.summary')}
          required
          multiline
          minRows={3}
          {...register('descricao')}
          error={!!errors.descricao}
          helperText={[
            errors.descricao?.message,
            t('submit.summaryHelp', { count: summaryLength }),
          ]
            .filter(Boolean)
            .join(' · ')}
        />
        <TextField
          label={t('submit.sourceLink')}
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
              label={t('submit.area')}
              {...field}
              error={!!errors.area}
              helperText={errors.area?.message}
            >
              {AREAS.map((a) => (
                <MenuItem key={a} value={a}>
                  {t(`domain.areas.${a}`)}
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
              label={t('submit.format')}
              {...field}
              error={!!errors.formato}
              helperText={errors.formato?.message}
            >
              {FORMATOS.map((f) => (
                <MenuItem key={f} value={f}>
                  {t(`domain.formats.${f}`)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="idioma"
          control={control}
          render={({ field }) => (
            <TextField select label={t('submit.language')} {...field}>
              {IDIOMAS.map((i) => (
                <MenuItem key={i.value} value={i.value}>
                  {t(`domain.languages.${i.value}`)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label={t('submit.institutionAuthor')}
          {...register('instituicao_autor')}
          error={!!errors.instituicao_autor}
          helperText={errors.instituicao_autor?.message}
        />
        <TextField
          label={t('submit.tags')}
          {...register('tagsRaw')}
          error={!!errors.tagsRaw}
          helperText={errors.tagsRaw?.message ?? t('submit.tagsHelp')}
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }}
          {...register('website')}
        />

        <Divider textAlign="left">{t('submit.submitterHeading')}</Divider>
        <Typography variant="body2" color="text.secondary">
          {t('submit.submitterIntro')} {import.meta.env.VITE_PRIVACY_EMAIL}.
        </Typography>
        <TextField
          label={t('submit.yourName')}
          required
          autoComplete="name"
          {...register('enviador_nome')}
          error={!!errors.enviador_nome}
          helperText={errors.enviador_nome?.message}
        />
        <TextField
          label={t('submit.yourEmail')}
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
              label={t('submit.relationship')}
              {...field}
              error={!!errors.enviador_relacao}
              helperText={errors.enviador_relacao?.message}
            >
              {RELACOES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {t(`domain.relations.${r.value}`)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Typography variant="body2" color="text.secondary">
          {t('submit.optionalContacts')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          <TextField
            label={t('submit.phone')}
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
            label={t('submit.site')}
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
                {t('submit.consentPrefix')}{' '}
                <MuiLink
                  component={Link}
                  to="/privacidade"
                  target="_blank"
                  rel="noopener"
                >
                  {t('submit.privacyPolicy')}
                </MuiLink>
                . {t('submit.consentSuffix')}
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
          {mutation.isPending
            ? t('submit.sending')
            : t('submit.submitForReview')}
        </Button>
      </Stack>
    </Stack>
  )
}
