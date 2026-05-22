import { supabase } from './supabaseClient'

export interface NotificationPreferences {
  reminder_journal: boolean
  reminder_journal_time: string
  performance_alerts: boolean
  discipline_reminder: boolean
  system_notifications: boolean
}

const DEFAULT_PREFS: NotificationPreferences = {
  reminder_journal: true,
  reminder_journal_time: '20:00',
  performance_alerts: true,
  discipline_reminder: false,
  system_notifications: true,
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return DEFAULT_PREFS

  return {
    reminder_journal: data.reminder_journal ?? DEFAULT_PREFS.reminder_journal,
    reminder_journal_time: data.reminder_journal_time ?? DEFAULT_PREFS.reminder_journal_time,
    performance_alerts: data.performance_alerts ?? DEFAULT_PREFS.performance_alerts,
    discipline_reminder: data.discipline_reminder ?? DEFAULT_PREFS.discipline_reminder,
    system_notifications: data.system_notifications ?? DEFAULT_PREFS.system_notifications,
  }
}

export async function upsertNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: userId, ...prefs },
      { onConflict: 'user_id' }
    )

  return { error: error as Error | null }
}
