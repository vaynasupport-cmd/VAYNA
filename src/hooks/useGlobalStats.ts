import { useMemo } from 'react'
import { useAccountsQuery } from '@/hooks/queries/useAccounts'
import { useTradesQuery } from '@/hooks/queries/useTrades'
import { useJournalQuery } from '@/hooks/queries/useJournal'
import { useStore } from '@/hooks/useStore'
import {
  calculateDashboardStats,
  calculateAdvancedStats,
  calculateEquityCurve,
  calculateMonthlyPerformance,
} from '@/lib/statsCalculator'

export function useGlobalStats() {
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccountsQuery()
  const { data: trades = [], isLoading: isLoadingTrades } = useTradesQuery()
  const { data: journalEntries = [], isLoading: isLoadingJournal } = useJournalQuery()
  
  const selectedAccountId = useStore(s => s.selectedAccountId)
  const selectedPeriod = useStore(s => s.selectedPeriod)

  // Calcule les stats pour les comptes (le status validé/perdu/drawdown actuel)
  const calculatedAccounts = useMemo(() => {
    return accounts.map(account => {
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
        currentDrawdownAmount: Math.max(0, -totalPnl),
        status: autoStatus as typeof account.status,
      };
    });
  }, [accounts, trades])

  const filters = useMemo(() => ({
    accountId: selectedAccountId || undefined,
    startDate: selectedPeriod?.startDate,
    endDate: selectedPeriod?.endDate,
  }), [selectedAccountId, selectedPeriod])

  // Stats calculées
  const dashboardStats = useMemo(() => calculateDashboardStats(trades, filters), [trades, filters])
  const advancedStats = useMemo(() => calculateAdvancedStats(trades, filters), [trades, filters])
  
  const equityCurve = useMemo(() => {
    let initialCapitalForEquity = 0;
    if (selectedAccountId) {
      const account = accounts.find(a => a.id === selectedAccountId);
      if (account) initialCapitalForEquity = account.initialCapital;
    } else {
      initialCapitalForEquity = accounts.reduce((sum, a) => sum + a.initialCapital, 0);
    }
    return calculateEquityCurve(trades, initialCapitalForEquity, filters)
  }, [trades, accounts, selectedAccountId, filters])

  const monthlyPerformance = useMemo(() => calculateMonthlyPerformance(trades, filters), [trades, filters])

  return {
    accounts: calculatedAccounts, // Les comptes avec les drawdowns calculés
    trades, // Les trades bruts (sans filtres, ou tu peux les filtrer si tu veux)
    journalEntries, // Entrées de journal
    isLoading: isLoadingAccounts || isLoadingTrades || isLoadingJournal,
    dashboardStats,
    advancedStats,
    equityCurve,
    monthlyPerformance,
  }
}
