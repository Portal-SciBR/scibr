import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/sobre', label: 'Sobre' },
  { to: '/diretrizes', label: 'Diretrizes' },
  { to: '/admin', label: 'Moderação' },
]

export function Layout() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = () => setAnchor(null)

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
            {NAV.map((n) => (
              <Button
                key={n.to}
                color="inherit"
                component={NavLink}
                to={n.to}
                end={n.end}
              >
                {n.label}
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
            Enviar
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5 }}
            >
              divulgação
            </Box>
          </Button>

          <IconButton
            color="inherit"
            edge="end"
            aria-label="Abrir menu"
            aria-haspopup="true"
            aria-expanded={Boolean(anchor)}
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
            {NAV.map((n) => (
              <MenuItem key={n.to} component={Link} to={n.to} onClick={close}>
                {n.label}
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
          Projeto open-source ·{' '}
          <MuiLink
            href="https://github.com/Portal-SciBR/scibr"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </MuiLink>{' '}
          ·{' '}
          <MuiLink component={Link} to="/privacidade">
            Privacidade
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  )
}
