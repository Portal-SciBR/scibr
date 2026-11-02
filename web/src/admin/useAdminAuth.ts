import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isCurrentUserAdmin } from '../lib/api'
import { supabase } from '../lib/supabase'

export interface AdminAuth {
  loading: boolean
  session: Session | null
  isAdmin: boolean
}

export function useAdminAuth(): AdminAuth {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    )
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!session) {
      setIsAdmin(false)
      setLoading(false)
      return
    }
    setLoading(true)
    isCurrentUserAdmin(session.user.id)
      .then((ok) => !cancelled && setIsAdmin(ok))
      .catch(() => !cancelled && setIsAdmin(false))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [session])

  return { loading, session, isAdmin }
}
