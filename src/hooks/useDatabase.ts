import { useCallback } from 'react'
import { useStore } from './useStore'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './useAuth'
import {
  calculateDashboardStats,
  calculateAdvancedStats,
  calculateEquityCurve,
  calculateMonthlyPerformance,
} from '@/lib/statsCalculator'
import { getNotificationPreferences } from '@/lib/notificationPreferences'
import type { Account, Trade, JournalEntry } from '@/types'

// Map Supabase snake_case rows → camelCase types
function mapAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    propFirm: row.prop_firm,
    initialCapital: row.initial_capital,
    currentCapital: row.current_capital,
    maxDrawdownPercent: row.max_drawdown_percent,
    maxDrawdownAmount: row.max_drawdown_amount,
    currentDrawdownAmount: row.current_drawdown_amount,
    targetPercent: row.target_percent,
    targetAmount: row.target_amount,
    profitPercent: row.profit_percent,
    profitAmount: row.profit_amount,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTrade(row: any): Trade {
  return {
    id: row.id,
    accountId: row.account_id,
    date: row.date,
    createdDateTime: row.created_date_time,
    asset: row.asset,
    timeframe: row.timeframe,
    direction: row.direction,
    riskPercent: row.risk_percent,
    entryPrice: row.entry_price,
    exitPrice: row.exit_price,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    positionSize: row.position_size,
    result: row.result,
    pnlAmount: row.pnl_amount,
    pnlPercent: row.pnl_percent,
    rMultiple: row.r_multiple,
    commission: row.commission,
    swap: row.swap,
    comment: row.comment,
    emotionalTag: row.emotional_tag,
    strategy: row.strategy,
    setupType: row.setup_type,
    ticket: row.ticket,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapJournalEntry(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    content: row.content,
    mentalState: row.mental_state,
    disciplineScore: row.discipline_score,
    focusScore: row.focus_score,
    confidence: row.confidence,
    tradingPlans: row.trading_plans,
    setupsIdentified: row.setups_identified,
    lessonsLearned: row.lessons_learned,
    marketCondition: row.market_condition,
    pnlSummary: row.pnl_summary,
    nextActions: row.next_actions,
    references: row.references_text,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function useDatabase() {
  const {
    setAccounts,
    setTrades,
    setJournalEntries,
    setDashboardStats,
    setAdvancedStats,
    setEquityCurve,
    setMonthlyPerformance,
    selectedAccountId,
    selectedPeriod,
    setNotificationPreferences,
  } = useStore()

  const { user } = useAuth()

  // ─── LOAD ALL DATA ──────────────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    if (!user) return
    try {
      // Load Notification Preferences
      const prefs = await getNotificationPreferences(user.id)
      setNotificationPreferences(prefs)

      // Load accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })
      if (accountsError) throw accountsError
      const rawAccounts = (accountsData || []).map(mapAccount)

      // Load trades
      let tradesQuery = supabase.from('trades').select('*').order('date', { ascending: false })
      if (selectedAccountId) tradesQuery = tradesQuery.eq('account_id', selectedAccountId)
      if (selectedPeriod?.startDate) tradesQuery = tradesQuery.gte('date', selectedPeriod.startDate)
      if (selectedPeriod?.endDate) tradesQuery = tradesQuery.lte('date', selectedPeriod.endDate)

      const { data: tradesData, error: tradesError } = await tradesQuery
      if (tradesError) throw tradesError
      const trades = (tradesData || []).map(mapTrade)
      setTrades(trades)

      // Calculate dynamic account stats
      const accounts = rawAccounts.map(account => {
        const accountTrades = trades.filter(t => t.accountId === account.id);
        const totalPnl = accountTrades.reduce((sum, t) => sum + (t.pnlAmount || 0), 0);

        const computedMaxDrawdown = account.initialCapital * ((account.maxDrawdownPercent || 0) / 100);
        const computedTarget = account.initialCapital * ((account.targetPercent || 0) / 100);
        const lostAccount = computedMaxDrawdown > 0 && Math.max(0, -totalPnl) >= computedMaxDrawdown;
        const validatedAccount = computedTarget > 0 && totalPnl >= computedTarget;
        const autoStatus = lostAccount ? 'lost' : (validatedAccount ? 'validated' : 'active');

        return {
          ...account,
          currentCapital: account.initialCapital + totalPnl,
          profitAmount: totalPnl,
          profitPercent: (totalPnl / account.initialCapital) * 100,
          maxDrawdownAmount: computedMaxDrawdown,
          targetAmount: computedTarget,
          // Drawdown actuel = perte nette par rapport au capital initial (jamais négatif)
          currentDrawdownAmount: Math.max(0, -totalPnl),
          status: autoStatus as Account['status'],
        };
      });

      setAccounts(accounts)

      // Load journal entries
      const { data: journalData, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false })
      if (journalError) throw journalError
      setJournalEntries((journalData || []).map(mapJournalEntry))

      // Calculate stats client-side
      const filters = {
        accountId: selectedAccountId || undefined,
        startDate: selectedPeriod?.startDate,
        endDate: selectedPeriod?.endDate,
      };

      // Determine initial capital for the equity curve
      let initialCapitalForEquity = 0;
      if (selectedAccountId) {
        const account = accounts.find(a => a.id === selectedAccountId);
        if (account) initialCapitalForEquity = account.initialCapital;
      } else {
        initialCapitalForEquity = accounts.reduce((sum, a) => sum + a.initialCapital, 0);
      }

      setDashboardStats(calculateDashboardStats(trades, filters));
      setAdvancedStats(calculateAdvancedStats(trades, filters));
      setEquityCurve(calculateEquityCurve(trades, initialCapitalForEquity, filters));
      setMonthlyPerformance(calculateMonthlyPerformance(trades, filters));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [
    user, selectedAccountId, selectedPeriod,
    setAccounts, setTrades, setJournalEntries,
    setDashboardStats, setAdvancedStats, setEquityCurve, setMonthlyPerformance,
    setNotificationPreferences,
  ])
  // Removing useEffect from here. The initial fetch and refreshTrigger listening is moved to Layout.tsx.

  // ─── ACCOUNTS ───────────────────────────────────────────────────────────────
  const createAccount = useCallback(async (data: Partial<Account>) => {
    if (!user) throw new Error('Not authenticated')
    const { data: row, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: data.name!,
        prop_firm: data.propFirm ?? null,
        initial_capital: data.initialCapital ?? 0,
        current_capital: data.currentCapital ?? data.initialCapital ?? 0,
        max_drawdown_percent: data.maxDrawdownPercent ?? 0,
        max_drawdown_amount: data.maxDrawdownAmount ?? 0,
        current_drawdown_amount: data.currentDrawdownAmount ?? 0,
        target_percent: data.targetPercent ?? 0,
        target_amount: data.targetAmount ?? 0,
        profit_percent: data.profitPercent ?? 0,
        profit_amount: data.profitAmount ?? 0,
        status: data.status ?? 'active',
      })
      .select()
      .single()
    if (error) throw error
    await loadAllData()
    return mapAccount(row)
  }, [user, loadAllData])

  const updateAccount = useCallback(async (id: string, data: Partial<Account>) => {
    if (!user) throw new Error('Not authenticated')
    const update: Record<string, any> = {}
    if (data.name !== undefined) update.name = data.name
    if (data.propFirm !== undefined) update.prop_firm = data.propFirm
    if (data.initialCapital !== undefined) update.initial_capital = data.initialCapital
    if (data.currentCapital !== undefined) update.current_capital = data.currentCapital
    if (data.maxDrawdownPercent !== undefined) update.max_drawdown_percent = data.maxDrawdownPercent
    if (data.maxDrawdownAmount !== undefined) update.max_drawdown_amount = data.maxDrawdownAmount
    if (data.currentDrawdownAmount !== undefined) update.current_drawdown_amount = data.currentDrawdownAmount
    if (data.targetPercent !== undefined) update.target_percent = data.targetPercent
    if (data.targetAmount !== undefined) update.target_amount = data.targetAmount
    if (data.profitPercent !== undefined) update.profit_percent = data.profitPercent
    if (data.profitAmount !== undefined) update.profit_amount = data.profitAmount
    if (data.status !== undefined) update.status = data.status
    update.updated_at = new Date().toISOString()

    const { data: row, error } = await supabase
      .from('accounts')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await loadAllData()
    return mapAccount(row)
  }, [user, loadAllData])

  const deleteAccount = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) throw error
    await loadAllData()
  }, [user, loadAllData])

  // ─── TRADES ─────────────────────────────────────────────────────────────────
  const createTrade = useCallback(async (data: Partial<Trade>) => {
    if (!user) throw new Error('Not authenticated')
    const { data: row, error } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        account_id: data.accountId!,
        date: data.date!,
        created_date_time: data.createdDateTime ?? null,
        asset: data.asset!,
        timeframe: data.timeframe!,
        direction: data.direction!,
        risk_percent: data.riskPercent ?? 0,
        entry_price: data.entryPrice ?? null,
        exit_price: data.exitPrice ?? null,
        stop_loss: data.stopLoss ?? null,
        take_profit: data.takeProfit ?? null,
        position_size: data.positionSize ?? null,
        result: data.result!,
        pnl_amount: data.pnlAmount ?? 0,
        pnl_percent: data.pnlPercent ?? 0,
        r_multiple: data.rMultiple ?? null,
        commission: data.commission ?? null,
        comment: data.comment ?? null,
        emotional_tag: data.emotionalTag ?? null,
        strategy: data.strategy ?? null,
        setup_type: data.setupType ?? null,
      })
      .select()
      .single()
    if (error) throw error
    await loadAllData()
    return mapTrade(row)
  }, [user, loadAllData])

  const createTrades = useCallback(async (tradesData: Partial<Trade>[]) => {
    if (!user) throw new Error('Not authenticated')
    if (tradesData.length === 0) return []
    const inserts = tradesData.map(data => ({
        user_id: user.id,
        account_id: data.accountId!,
        date: data.date!,
        created_date_time: data.createdDateTime ?? null,
        asset: data.asset!,
        timeframe: data.timeframe!,
        direction: data.direction!,
        risk_percent: data.riskPercent ?? 0,
        entry_price: data.entryPrice ?? null,
        exit_price: data.exitPrice ?? null,
        stop_loss: data.stopLoss ?? null,
        take_profit: data.takeProfit ?? null,
        position_size: data.positionSize ?? null,
        result: data.result!,
        pnl_amount: data.pnlAmount ?? 0,
        pnl_percent: data.pnlPercent ?? 0,
        r_multiple: data.rMultiple ?? null,
        commission: data.commission ?? null,
        comment: data.comment ?? null,
        emotional_tag: data.emotionalTag ?? null,
        strategy: data.strategy ?? null,
        setup_type: data.setupType ?? null,
    }))
    
    const { data: rows, error } = await supabase
      .from('trades')
      .insert(inserts)
      .select()
    if (error) throw error
    await loadAllData()
    return rows.map(mapTrade)
  }, [user, loadAllData])

  const updateTrade = useCallback(async (id: string, data: Partial<Trade>) => {
    if (!user) throw new Error('Not authenticated')
    const update: Record<string, any> = { updated_at: new Date().toISOString() }
    if (data.accountId !== undefined) update.account_id = data.accountId
    if (data.date !== undefined) update.date = data.date
    if (data.createdDateTime !== undefined) update.created_date_time = data.createdDateTime
    if (data.asset !== undefined) update.asset = data.asset
    if (data.timeframe !== undefined) update.timeframe = data.timeframe
    if (data.direction !== undefined) update.direction = data.direction
    if (data.riskPercent !== undefined) update.risk_percent = data.riskPercent
    if (data.entryPrice !== undefined) update.entry_price = data.entryPrice
    if (data.exitPrice !== undefined) update.exit_price = data.exitPrice
    if (data.stopLoss !== undefined) update.stop_loss = data.stopLoss
    if (data.takeProfit !== undefined) update.take_profit = data.takeProfit
    if (data.positionSize !== undefined) update.position_size = data.positionSize
    if (data.result !== undefined) update.result = data.result
    if (data.pnlAmount !== undefined) update.pnl_amount = data.pnlAmount
    if (data.pnlPercent !== undefined) update.pnl_percent = data.pnlPercent
    if (data.rMultiple !== undefined) update.r_multiple = data.rMultiple
    if (data.commission !== undefined) update.commission = data.commission
    if (data.comment !== undefined) update.comment = data.comment
    if (data.emotionalTag !== undefined) update.emotional_tag = data.emotionalTag
    if (data.strategy !== undefined) update.strategy = data.strategy
    if (data.setupType !== undefined) update.setup_type = data.setupType

    const { data: row, error } = await supabase
      .from('trades')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await loadAllData()
    return mapTrade(row)
  }, [user, loadAllData])

  const deleteTrade = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) throw error
    await loadAllData()
  }, [user, loadAllData])

  const deleteAllTrades = useCallback(async () => {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('trades').delete().eq('user_id', user.id)
    if (error) throw error
    await loadAllData()
  }, [user, loadAllData])

  // ─── JOURNAL ────────────────────────────────────────────────────────────────
  const createJournalEntry = useCallback(async (data: Partial<JournalEntry>) => {
    if (!user) throw new Error('Not authenticated')
    const { data: row, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        date: data.date!,
        title: data.title ?? null,
        content: data.content ?? '',
        mental_state: data.mentalState ?? null,
        discipline_score: data.disciplineScore ?? null,
        focus_score: data.focusScore ?? null,
        confidence: data.confidence ?? null,
        trading_plans: data.tradingPlans ?? null,
        setups_identified: data.setupsIdentified ?? null,
        lessons_learned: data.lessonsLearned ?? null,
        market_condition: data.marketCondition ?? null,
        pnl_summary: data.pnlSummary ?? null,
        next_actions: data.nextActions ?? null,
        references_text: data.references ?? null,
        tags: data.tags ?? null,
      })
      .select()
      .single()
    if (error) throw error
    await loadAllData()
    return mapJournalEntry(row)
  }, [user, loadAllData])

  const updateJournalEntry = useCallback(async (id: string, data: Partial<JournalEntry>) => {
    if (!user) throw new Error('Not authenticated')
    const update: Record<string, any> = { updated_at: new Date().toISOString() }
    if (data.date !== undefined) update.date = data.date
    if (data.title !== undefined) update.title = data.title
    if (data.content !== undefined) update.content = data.content
    if (data.mentalState !== undefined) update.mental_state = data.mentalState
    if (data.disciplineScore !== undefined) update.discipline_score = data.disciplineScore
    if (data.focusScore !== undefined) update.focus_score = data.focusScore
    if (data.confidence !== undefined) update.confidence = data.confidence
    if (data.tradingPlans !== undefined) update.trading_plans = data.tradingPlans
    if (data.setupsIdentified !== undefined) update.setups_identified = data.setupsIdentified
    if (data.lessonsLearned !== undefined) update.lessons_learned = data.lessonsLearned
    if (data.marketCondition !== undefined) update.market_condition = data.marketCondition
    if (data.pnlSummary !== undefined) update.pnl_summary = data.pnlSummary
    if (data.nextActions !== undefined) update.next_actions = data.nextActions
    if (data.references !== undefined) update.references_text = data.references
    if (data.tags !== undefined) update.tags = data.tags

    const { data: row, error } = await supabase
      .from('journal_entries')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await loadAllData()
    return mapJournalEntry(row)
  }, [user, loadAllData])

  const deleteJournalEntry = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('journal_entries').delete().eq('id', id)
    if (error) throw error
    await loadAllData()
  }, [user, loadAllData])

  // ─── SCREENSHOTS ────────────────────────────────────────────────────────────
  const saveScreenshot = useCallback(async (tradeId: string, imageData: string) => {
    if (!user) throw new Error('Not authenticated')
    const { data: row, error } = await supabase
      .from('screenshots')
      .insert({ user_id: user.id, trade_id: tradeId, image_data: imageData })
      .select()
      .single()
    if (error) throw error
    return row
  }, [user])

  const getScreenshots = useCallback(async (tradeId: string) => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('trade_id', tradeId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    } catch (err: any) {
      // Ignore if screenshots table doesn't exist (404)
      if (err?.code === 'PGRST205' || err?.status === 404) {
        console.log('[useDatabase] Screenshots table not found (non-critical)')
        return []
      }
      throw err
    }
  }, [])

  const deleteScreenshot = useCallback(async (id: string) => {
    const { error } = await supabase.from('screenshots').delete().eq('id', id)
    if (error) throw error
  }, [])

  // ─── EXPORT / FILE SYSTEM ───────────────────────────────────────────────────
  const exportTrades = useCallback(async (accountId?: string) => {
    let query = supabase.from('trades').select('*').order('date', { ascending: false })
    if (accountId) query = query.eq('account_id', accountId)
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(mapTrade)
  }, [])

  const saveCSV = useCallback(async (data: string, defaultName: string) => {
    try {
      if (window.electronAPI) {
        return await window.electronAPI.fs.saveCSV(data, defaultName)
      }
      // Browser fallback
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = defaultName
      a.click()
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('Error saving CSV:', error)
      return false
    }
  }, [])

  const selectImage = useCallback(async () => {
    try {
      if (window.electronAPI) {
        return await window.electronAPI.fs.selectImage()
      }
      return null
    } catch (error) {
      console.error('Error selecting image:', error)
      return null
    }
  }, [])

  return {
    loadAllData,
    createAccount,
    updateAccount,
    deleteAccount,
    createTrade,
    createTrades,
    updateTrade,
    deleteTrade,
    deleteAllTrades,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    saveScreenshot,
    getScreenshots,
    deleteScreenshot,
    exportTrades,
    saveCSV,
    selectImage,
  }
}
