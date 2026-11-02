import EmailIcon from '@mui/icons-material/Email'
import InstagramIcon from '@mui/icons-material/Instagram'
import LanguageIcon from '@mui/icons-material/Language'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import PhoneIcon from '@mui/icons-material/Phone'
import XIcon from '@mui/icons-material/X'
import YouTubeIcon from '@mui/icons-material/YouTube'
import {
  Button,
  IconButton,
  Link as MuiLink,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState, type ReactNode } from 'react'
import { revealContact, type RevealedContact } from '../lib/api'
import { RELACOES } from '../lib/schemas'
import type { PublicEnviador } from '../lib/types'

interface ContactLink {
  label: string
  href: string
  icon: ReactNode
}

function socialLinks(e: PublicEnviador): ContactLink[] {
  const links: ContactLink[] = []
  if (e.enviador_instagram)
    links.push({
      label: 'Instagram',
      href: `https://instagram.com/${encodeURIComponent(e.enviador_instagram)}`,
      icon: <InstagramIcon fontSize="small" />,
    })
  if (e.enviador_x)
    links.push({
      label: 'X/Twitter',
      href: `https://x.com/${encodeURIComponent(e.enviador_x)}`,
      icon: <XIcon fontSize="small" />,
    })
  if (e.enviador_youtube?.startsWith('https://'))
    links.push({
      label: 'YouTube',
      href: e.enviador_youtube,
      icon: <YouTubeIcon fontSize="small" />,
    })
  if (e.enviador_linkedin?.startsWith('https://'))
    links.push({
      label: 'LinkedIn',
      href: e.enviador_linkedin,
      icon: <LinkedInIcon fontSize="small" />,
    })
  if (e.enviador_site && /^https?:\/\//.test(e.enviador_site))
    links.push({
      label: 'Site ou Lattes',
      href: e.enviador_site,
      icon: <LanguageIcon fontSize="small" />,
    })
  return links
}

function PrivateContact({
  contact,
  name,
}: {
  contact: RevealedContact
  name: string
}) {
  if (!contact.email && !contact.telefone)
    return (
      <Typography variant="caption" color="text.secondary">
        Contato direto não disponível.
      </Typography>
    )
  return (
    <Stack spacing={0.5}>
      {contact.email && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <EmailIcon fontSize="small" />
          <MuiLink
            href={`mailto:${contact.email}`}
            variant="body2"
            aria-label={`E-mail de ${name}`}
          >
            {contact.email}
          </MuiLink>
        </Stack>
      )}
      {contact.telefone && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <PhoneIcon fontSize="small" />
          <MuiLink
            href={`tel:${contact.telefone.replace(/[^0-9+]/g, '')}`}
            variant="body2"
            aria-label={`Telefone de ${name}`}
          >
            {contact.telefone}
          </MuiLink>
        </Stack>
      )}
    </Stack>
  )
}

interface Props {
  enviador: PublicEnviador
  cardId: string
  // Moderadores já recebem e-mail/telefone; visitantes precisam clicar.
  contact?: RevealedContact
}

export function SubmitterInfo({ enviador, cardId, contact }: Props) {
  const [revealed, setRevealed] = useState<RevealedContact | null>(
    contact ?? null,
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!enviador.enviador_nome) return null
  const name = enviador.enviador_nome
  const relacao = RELACOES.find((r) => r.value === enviador.enviador_relacao)
  const links = socialLinks(enviador)

  const reveal = async () => {
    setBusy(true)
    setError('')
    try {
      setRevealed(await revealContact(cardId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao obter contato.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={0.5} sx={{ mt: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Enviado por <strong>{name}</strong>
        {relacao && ` · ${relacao.label}`}
      </Typography>
      {links.length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', ml: -0.75 }}>
          {links.map((l) => (
            <Tooltip key={l.label} title={l.label}>
              <IconButton
                size="small"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${l.label} de ${name}`}
              >
                {l.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      )}
      {revealed ? (
        <PrivateContact contact={revealed} name={name} />
      ) : (
        <Button
          size="small"
          onClick={reveal}
          disabled={busy}
          sx={{ alignSelf: 'flex-start' }}
        >
          {busy ? 'Carregando…' : 'Mostrar e-mail e telefone'}
        </Button>
      )}
      {error && (
        <Typography variant="caption" color="error" role="alert">
          {error}
        </Typography>
      )}
    </Stack>
  )
}
