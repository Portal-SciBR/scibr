import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError('E-mail ou senha inválidos.')
    setBusy(false)
  }

  return (
    <Stack
      component="form"
      onSubmit={submit}
      spacing={2}
      sx={{ maxWidth: 360, mx: 'auto' }}
    >
      <Typography variant="h5" component="h1">
        Moderação
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="E-mail"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
      />
      <TextField
        label="Senha"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <Button type="submit" variant="contained" disabled={busy}>
        Entrar
      </Button>
    </Stack>
  )
}
