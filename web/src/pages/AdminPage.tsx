import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AdminLogin } from '../admin/AdminLogin'
import { EditCardDialog } from '../admin/EditCardDialog'
import { useAdminAuth } from '../admin/useAdminAuth'
import {
  clearSubmitterData,
  deleteCard,
  listAdminCards,
  setCardStatus,
  updateCard,
} from '../lib/api'
import { supabase } from '../lib/supabase'
import { useDebounced } from '../lib/useDebounced'
import type { AdminCard, Status } from '../lib/types'
import { SubmitterInfo } from '../components/SubmitterInfo'

type TabValue = Status | 'all'

export function AdminPage() {
  const { t } = useTranslation()
  const { loading, session, isAdmin } = useAdminAuth()
  if (loading) return null
  if (!session) return <AdminLogin />
  if (!isAdmin) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto' }}>
        <Alert severity="error">{t('moderation.noPermission')}</Alert>
        <Button onClick={() => supabase.auth.signOut()}>
          {t('moderation.signOut')}
        </Button>
        <Button component={Link} to="/">
          {t('moderation.backToSite')}
        </Button>
      </Stack>
    )
  }
  return <Moderation userId={session.user.id} />
}

function Moderation({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabValue>('pending')
  const [search, setSearch] = useState('')
  const q = useDebounced(search)
  const [editing, setEditing] = useState<AdminCard | null>(null)
  const tabs: { value: TabValue; label: string }[] = [
    { value: 'pending', label: t('moderation.pending') },
    { value: 'approved', label: t('moderation.approved') },
    { value: 'rejected', label: t('moderation.rejected') },
    { value: 'all', label: t('moderation.all') },
  ]

  const list = useQuery({
    queryKey: ['admin-cards', tab, q],
    queryFn: () => listAdminCards(tab, q),
  })
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-cards'] })
    qc.invalidateQueries({ queryKey: ['cards'] })
    qc.invalidateQueries({ queryKey: ['tags'] })
  }

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      setCardStatus(id, status, userId),
    onSuccess: refresh,
  })
  const remove = useMutation({ mutationFn: deleteCard, onSuccess: refresh })
  const clearData = useMutation({
    mutationFn: clearSubmitterData,
    onSuccess: refresh,
  })
  const edit = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Parameters<typeof updateCard>[1]
    }) => updateCard(id, patch),
    onSuccess: () => {
      setEditing(null)
      refresh()
    },
  })

  const error =
    list.error ?? review.error ?? remove.error ?? edit.error ?? clearData.error

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <Typography variant="h4" component="h1">
          {t('adminLogin.title')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/">
            {t('moderation.backToSite')}
          </Button>
          <Button onClick={() => supabase.auth.signOut()}>
            {t('moderation.signOut')}
          </Button>
        </Stack>
      </Stack>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        {tabs.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>
      <TextField
        size="small"
        type="search"
        label={t('moderation.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && <Alert severity="error">{t('moderation.error')}</Alert>}
      {list.data?.length === 0 && (
        <Alert severity="info">{t('moderation.empty')}</Alert>
      )}
      {list.data?.map((c) => (
        <Box
          key={c.id}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={t(`moderation.${c.status}`)}
              color={
                c.status === 'approved'
                  ? 'success'
                  : c.status === 'rejected'
                    ? 'error'
                    : 'warning'
              }
            />
            <Chip
              size="small"
              variant="outlined"
              label={t(`domain.areas.${c.area}`)}
            />
            <Chip
              size="small"
              variant="outlined"
              label={t(`domain.formats.${c.formato}`)}
            />
          </Stack>
          <Typography variant="h6" component="h2">
            {c.titulo}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {c.descricao}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all' }}>
            <a href={c.link_original} target="_blank" rel="noopener noreferrer">
              {c.link_original}
            </a>
          </Typography>
          <SubmitterInfo
            enviador={c}
            cardId={c.id}
            contact={{ email: c.enviador_email, telefone: c.enviador_telefone }}
          />
          {c.consentimento_em && (
            <Typography variant="caption" color="text.secondary">
              {t('moderation.consentDate', {
                date: new Date(c.consentimento_em).toLocaleString(
                  i18n.language,
                ),
                version: c.consentimento_versao,
              })}
            </Typography>
          )}
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: 'wrap', rowGap: 1, mt: 1 }}
          >
            {c.status !== 'approved' && (
              <Button
                size="small"
                variant="contained"
                onClick={() => review.mutate({ id: c.id, status: 'approved' })}
              >
                {t('moderation.approve')}
              </Button>
            )}
            {c.status !== 'rejected' && (
              <Button
                size="small"
                color="warning"
                onClick={() => review.mutate({ id: c.id, status: 'rejected' })}
              >
                {t('moderation.reject')}
              </Button>
            )}
            <Button size="small" onClick={() => setEditing(c)}>
              {t('moderation.edit')}
            </Button>
            {c.enviador_nome && (
              <Button
                size="small"
                color="warning"
                onClick={() =>
                  window.confirm(t('moderation.confirmClearSubmitterData')) &&
                  clearData.mutate(c.id)
                }
              >
                {t('moderation.clearSubmitterData')}
              </Button>
            )}
            <Button
              size="small"
              color="error"
              onClick={() =>
                window.confirm(t('moderation.confirmDelete')) &&
                remove.mutate(c.id)
              }
            >
              {t('moderation.delete')}
            </Button>
          </Stack>
        </Box>
      ))}
      {editing && (
        <EditCardDialog
          card={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => edit.mutate({ id: editing.id, patch })}
        />
      )}
    </Stack>
  )
}
