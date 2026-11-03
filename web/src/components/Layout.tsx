import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Tooltip,
  Toolbar,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { fetchPendingCardsCount } from '../lib/api'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const LANGUAGE_HINT_KEY = 'scibr:language-hint-dismissed'

export function Layout() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [signedOut, setSignedOut] = useState(false)
  const [showLanguageHint, setShowLanguageHint] = useState(
    () => localStorage.getItem(LANGUAGE_HINT_KEY) !== 'true',
  )
  const { t, i18n } = useTranslation()
  const close = () => setAnchor(null)
  const pendingCount = useQuery({
    queryKey: ['pending-cards-count'],
    queryFn: fetchPendingCardsCount,
    enabled: isSupabaseConfigured,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setSignedOut(true)
    })
    return () => subscription.unsubscribe()
  }, [])
  const nav = [
    { to: '/', label: t('layout.home'), end: true },
    { to: '/sobre', label: t('layout.about') },
    { to: '/diretrizes', label: t('layout.guidelines') },
    { to: '/admin', label: t('layout.moderation') },
  ]
  const switchLanguage = () => {
    void i18n.changeLanguage(i18n.language.startsWith('en') ? 'pt-BR' : 'en')
    setShowLanguageHint(false)
    localStorage.setItem(LANGUAGE_HINT_KEY, 'true')
  }
  const showPendingBadge =
    !signedOut &&
    (pendingCount.isError ||
      (pendingCount.data != null && pendingCount.data > 0))
  const moderationAriaLabel = signedOut
    ? undefined
    : pendingCount.isError
      ? t('layout.moderationCountUnavailable')
      : pendingCount.data != null && pendingCount.data > 0
        ? t('layout.moderationPendingCount', { count: pendingCount.data })
        : undefined

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            🔬 Portal SciBR
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {nav.map((n) => (
              <Button
                key={n.to}
                color="inherit"
                component={NavLink}
                to={n.to}
                end={n.end}
                aria-label={n.to === '/admin' ? moderationAriaLabel : undefined}
              >
                {n.to === '/admin' ? (
                  <Badge
                    badgeContent={
                      pendingCount.isError ? '!' : (pendingCount.data ?? 0)
                    }
                    color={pendingCount.isError ? 'warning' : 'error'}
                    showZero={false}
                    invisible={!showPendingBadge}
                  >
                    {n.label}
                  </Badge>
                ) : (
                  n.label
                )}
              </Button>
            ))}
          </Box>
          <Button
            color="secondary"
            variant="contained"
            component={Link}
            to="/enviar"
            size="small"
            sx={{ whiteSpace: 'nowrap' }}
          >
            {t('layout.submit')}
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5 }}
            >
              {t('layout.promotion')}
            </Box>
          </Button>

          <Tooltip
            arrow
            placement="bottom"
            open={showLanguageHint}
            title={t('layout.languageHint')}
            disableHoverListener
            disableFocusListener
            disableTouchListener
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                  fontWeight: 700,
                  px: 1.5,
                  py: 1,
                  fontSize: '0.8rem',
                },
              },
              arrow: { sx: { color: 'secondary.main' } },
            }}
          >
            <Button
              color="inherit"
              size="small"
              onClick={switchLanguage}
              aria-label={t('layout.switchLanguage')}
              sx={{
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.65)',
                borderRadius: 2,
                bgcolor: showLanguageHint
                  ? 'rgba(255,255,255,0.14)'
                  : 'transparent',
                animation: showLanguageHint
                  ? 'languageHintPulse 1.8s ease-in-out infinite'
                  : 'none',
                '@keyframes languageHintPulse': {
                  '0%, 100%': {
                    boxShadow: '0 0 0 0 rgba(255,255,255,0.28)',
                  },
                  '50%': {
                    boxShadow: '0 0 0 5px rgba(255,255,255,0)',
                  },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              {t('layout.languageTarget')}
            </Button>
          </Tooltip>
          <IconButton
            color="inherit"
            edge="end"
            aria-label={t('layout.openMenu')}
            aria-haspopup="true"
            aria-expanded={Boolean(anchor)}
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
            {nav.map((n) => (
              <MenuItem
                key={n.to}
                component={Link}
                to={n.to}
                onClick={close}
                aria-label={n.to === '/admin' ? moderationAriaLabel : undefined}
              >
                {n.to === '/admin' ? (
                  <Badge
                    badgeContent={
                      pendingCount.isError ? '!' : (pendingCount.data ?? 0)
                    }
                    color={pendingCount.isError ? 'warning' : 'error'}
                    showZero={false}
                    invisible={!showPendingBadge}
                  >
                    {n.label}
                  </Badge>
                ) : (
                  n.label
                )}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        sx={{ py: { xs: 2, sm: 4 }, flexGrow: 1, overflowWrap: 'anywhere' }}
      >
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('layout.openSourceProject')} ·{' '}
          <MuiLink
            href="https://github.com/Portal-SciBR/scibr"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </MuiLink>{' '}
          ·{' '}
          <MuiLink component={Link} to="/privacidade">
            {t('layout.privacy')}
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  )
}
