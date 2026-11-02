import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0b6e4f' },
        secondary: { main: '#f2a900' },
        background: { default: '#f6f8f7' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#4cc9a0' },
        secondary: { main: '#f2a900' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
  },
})
