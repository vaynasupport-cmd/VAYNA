-- ============================================================
--  Table: notification_preferences
--  Exécuter ce script dans Supabase > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id               uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reminder_journal         boolean  DEFAULT true,
  reminder_journal_time    text     DEFAULT '20:00',
  performance_alerts       boolean  DEFAULT true,
  discipline_reminder      boolean  DEFAULT false,
  system_notifications     boolean  DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- RLS : chaque utilisateur ne voit que ses propres préférences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification_preferences"
  ON public.notification_preferences
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger auto-update de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'notification_preferences_updated_at'
  ) THEN
    CREATE TRIGGER notification_preferences_updated_at
      BEFORE UPDATE ON public.notification_preferences
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
