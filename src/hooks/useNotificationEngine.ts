import { useEffect } from 'react'
import { useStore } from './useStore'
import { useToast } from './useToast'
import { isSameDay, differenceInDays } from 'date-fns'

export function useNotificationEngine() {
  const notificationPreferences = useStore(s => s.notificationPreferences)
  const trades = useStore(s => s.trades)
  const { toast } = useToast()

  useEffect(() => {
    // Ne rien faire si on n'a pas encore chargé les préférences
    if (!notificationPreferences) return

    const intervalId = setInterval(() => {
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0] // format YYYY-MM-DD
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      // ────────────────────────────────────────────────────────
      // 1. Rappel journal de trading (heure exacte)
      // ────────────────────────────────────────────────────────
      if (
        notificationPreferences.reminder_journal &&
        notificationPreferences.reminder_journal_time === currentTimeStr
      ) {
        const lastJournalReminder = localStorage.getItem('last_journal_reminder_date')
        
        // Si on a pas déjà notifié aujourd'hui
        if (lastJournalReminder !== todayStr) {
          // Vérifier si un trade a été inséré aujourd'hui
          const hasTradedToday = trades.some(t => {
            const tradeDate = new Date(t.createdDateTime || t.date)
            return isSameDay(tradeDate, now)
          })

          if (!hasTradedToday) {
            toast({
              title: 'Journal de Trading',
              description: "Il est l'heure de remplir votre journal ! Aucun trade n'a été documenté aujourd'hui.",
              variant: 'default', // Ou custom si on a
            })
            localStorage.setItem('last_journal_reminder_date', todayStr)
          }
        }
      }

      // ────────────────────────────────────────────────────────
      // 2. Rappel de discipline (inactivité > 3 jours)
      // ────────────────────────────────────────────────────────
      if (notificationPreferences.discipline_reminder) {
        const lastDisciplineReminder = localStorage.getItem('last_discipline_reminder_date')
        
        if (lastDisciplineReminder !== todayStr) {
          // Trouver le trade le plus récent
          if (trades.length > 0) {
            // les trades sont supposés être triés du plus récent au plus ancien, on va sécuriser.
            const sortedTrades = [...trades].sort(
              (a, b) => new Date(b.createdDateTime || b.date).getTime() - new Date(a.createdDateTime || a.date).getTime()
            )
            const lastTradeDate = new Date(sortedTrades[0].createdDateTime || sortedTrades[0].date)
            const daysInactive = differenceInDays(now, lastTradeDate)

            // Si inactif depuis 72h et plus
            if (daysInactive >= 3) {
              toast({
                title: 'Rappel de Discipline',
                description: `Cela fait ${daysInactive} jours que vous n'avez pas enregistré de trade. Ne perdez pas le rythme !`,
                variant: 'destructive',
              })
              localStorage.setItem('last_discipline_reminder_date', todayStr)
            }
          }
        }
      }

    }, 60000) // Vérification toutes les 60 secondes

    return () => clearInterval(intervalId)
  }, [notificationPreferences, trades, toast])
}
