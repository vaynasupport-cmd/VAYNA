/**
 * ═══════════════════════════════════════════════════════════════════════
 *  useMT5Account — Manages MT5 account connection & Supabase Realtime
 *  Architecture: User credentials → Supabase → Python script → MT5
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef } from 'react'
import { useStore } from './useStore'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import { supabase } from '@/lib/supabaseClient'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MT5Credentials {
  login: string
  investorPassword: string
  brokerServer: string
  vaynaAccountId: string   // The VAYNA account to link trades to
}

export interface MT5AccountRow {
  id: string
  user_id: string
  account_id: string | null
  login: string
  investor_password: string
  broker_server: string
  platform: string
  is_active: boolean
  last_sync_at: string | null
  created_at: string
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMT5Account() {
  const mt5Sync = useStore(s => s.mt5Sync)
  const setMT5Sync = useStore(s => s.setMT5Sync)
  const resetMT5Sync = useStore(s => s.resetMT5Sync)
  const triggerRefresh = useStore(s => s.triggerRefresh)
  const { user } = useAuth()
  const { toast } = useToast()
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // ─── Load existing MT5 account on mount ─────────────────────────────────
  useEffect(() => {
    if (!user) return

    const loadExistingAccount = async () => {
      const { data, error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      if (error || !data) return

      const row = data as MT5AccountRow
      setMT5Sync({
        mt5AccountId: row.id,
        platform: 'mt5',
        brokerLogin: row.login,
        brokerServer: row.broker_server,
        status: getConnectionStatus(row.last_sync_at),
        lastSyncAt: row.last_sync_at,
      })
    }

    loadExistingAccount()
  }, [user, setMT5Sync])

  // ─── Supabase Realtime: listen for new trades from Python script ────────
  useEffect(() => {
    if (!user) return

    // Subscribe to new trades inserted by the Python script
    const channel = supabase
      .channel(`mt5-trades-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newTrade = payload.new as any
          // Only react to trades from the Python sync script
          if (newTrade?.source === 'mt5_sync') {
            // Trigger global data refresh so all pages update
            triggerRefresh()

            // Update last sync time and status
            setMT5Sync({
              lastSyncAt: new Date().toISOString(),
              status: 'connected',
            })

            toast({
              title: `📈 Nouveau trade : ${newTrade.asset}`,
              description: `${newTrade.direction} • PnL: ${newTrade.pnl_amount >= 0 ? '+' : ''}${newTrade.pnl_amount?.toFixed(2)}$`,
            })
          }
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
        realtimeChannelRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ─── Connect: Save MT5 credentials to Supabase ─────────────────────────
  const connectMT5 = useCallback(async (credentials: MT5Credentials) => {
    if (!user) throw new Error('Non authentifié')

    try {
      setMT5Sync({ status: 'syncing' })

      // First deactivate any existing active account
      await supabase
        .from('mt5_accounts')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Insert new MT5 account
      const { data, error } = await supabase
        .from('mt5_accounts')
        .insert({
          user_id: user.id,
          account_id: credentials.vaynaAccountId,
          login: credentials.login,
          investor_password: credentials.investorPassword,
          broker_server: credentials.brokerServer,
          platform: 'mt5',
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Erreur de sauvegarde: ${error.message}`)
      }

      const row = data as MT5AccountRow

      setMT5Sync({
        mt5AccountId: row.id,
        platform: 'mt5',
        brokerLogin: credentials.login,
        brokerServer: credentials.brokerServer,
        status: 'connected',
        lastSyncAt: null,
        syncedTradesCount: 0,
      })

      toast({
        title: '✅ Compte MT5 enregistré !',
        description: `Compte ${credentials.login} (${credentials.brokerServer}) connecté. Le script Python synchronisera vos trades automatiquement.`,
      })

      return row.id
    } catch (error: any) {
      setMT5Sync({ status: 'error' })
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Impossible d\'enregistrer le compte MT5.',
        variant: 'destructive',
      })
      throw error
    }
  }, [user, setMT5Sync, toast])

  // ─── Disconnect: Deactivate the MT5 account ────────────────────────────
  const disconnectMT5 = useCallback(async () => {
    if (!user) return

    try {
      if (mt5Sync.mt5AccountId) {
        await supabase
          .from('mt5_accounts')
          .update({ is_active: false })
          .eq('id', mt5Sync.mt5AccountId)
      }

      resetMT5Sync()

      toast({
        title: 'Compte MT5 déconnecté',
        description: 'La synchronisation automatique est désactivée.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de déconnecter le compte.',
        variant: 'destructive',
      })
    }
  }, [user, mt5Sync.mt5AccountId, resetMT5Sync, toast])

  // ─── Refresh sync count from Supabase ──────────────────────────────────
  const refreshSyncCount = useCallback(async () => {
    if (!user || !mt5Sync.mt5AccountId) return

    // Get the linked VAYNA account ID and last sync time
    const { data: mt5Account } = await supabase
      .from('mt5_accounts')
      .select('account_id, last_sync_at')
      .eq('id', mt5Sync.mt5AccountId)
      .maybeSingle()

    if (!mt5Account) return

    // Count synced trades
    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('source', 'mt5_sync')

    setMT5Sync({
      syncedTradesCount: count || 0,
      lastSyncAt: mt5Account.last_sync_at,
      status: getConnectionStatus(mt5Account.last_sync_at),
    })

    // Refresh the trades list in the UI
    triggerRefresh()
  }, [user, mt5Sync.mt5AccountId, setMT5Sync, triggerRefresh])

  // ─── Pause/Resume: Toggle is_active without deleting ────────────────────
  const toggleMT5SyncStatus = useCallback(async (isActive: boolean) => {
    if (!user || !mt5Sync.mt5AccountId) return

    try {
      await supabase
        .from('mt5_accounts')
        .update({ is_active: isActive })
        .eq('id', mt5Sync.mt5AccountId)

      toast({
        title: isActive ? '✅ Auto-Import Réactivé' : '⏸️ Auto-Import Suspendu',
        description: isActive ? 'Le serveur va reprendre la synchronisation de vos trades MT5.' : 'Le serveur a arrêté de synchroniser ce compte.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le statut.',
        variant: 'destructive',
      })
    }
  }, [user, mt5Sync.mt5AccountId, toast])

  return {
    mt5Sync,
    connectMT5,
    disconnectMT5,
    refreshSyncCount,
    toggleMT5SyncStatus,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Determine connection status based on last_sync_at timestamp.
 * If the script synced within the last 30 seconds, consider it "connected".
 */
function getConnectionStatus(lastSyncAt: string | null): 'idle' | 'connected' {
  if (!lastSyncAt) return 'idle'
  const diff = Date.now() - new Date(lastSyncAt).getTime()
  return diff < 30_000 ? 'connected' : 'idle'
}
