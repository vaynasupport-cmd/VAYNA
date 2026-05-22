-- =====================================================
-- MIGRATION: Ajouter support auto-import MT4/MT5
-- =====================================================

-- 1. Ajouter colonnes à la table trades
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS ticket BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS sl DECIMAL(10,5),
ADD COLUMN IF NOT EXISTS tp DECIMAL(10,5);

-- 2. Créer index UNIQUE sur (ticket, user_id) pour déduplication
-- (Note: ticket seul est unique car les tickets MT sont uniques globalement par broker)
CREATE UNIQUE INDEX IF NOT EXISTS idx_trades_ticket_unique ON public.trades(ticket) WHERE ticket IS NOT NULL;

-- 3. Trigger pour auto-remplir updated_at sur trades
DROP TRIGGER IF EXISTS update_trades_updated_at ON public.trades;
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Créer un type ENUM pour les sources si pas déjà présent
-- (utile pour ajouter des contraintes plus tard)
DO $$ 
BEGIN
    CREATE TYPE trade_source AS ENUM ('manual', 'mt4_auto', 'mt5_auto');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 5. Optionnel: créer une table de logs pour tracker les imports MT
DROP TABLE IF EXISTS public.mt_import_logs CASCADE;

CREATE TABLE IF NOT EXISTS public.mt_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket BIGINT,
    symbol TEXT,
    status TEXT, -- 'success', 'duplicate', 'error'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mt_import_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.mt_import_logs;
CREATE POLICY "Users can view their own logs" ON public.mt_import_logs
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- ROLLBACK (if needed):
-- ALTER TABLE public.trades DROP COLUMN IF EXISTS ticket;
-- ALTER TABLE public.trades DROP COLUMN IF EXISTS source;
-- ALTER TABLE public.trades DROP COLUMN IF EXISTS sl;
-- ALTER TABLE public.trades DROP COLUMN IF EXISTS tp;
-- DROP INDEX IF EXISTS idx_trades_ticket_unique;
-- DROP TABLE IF EXISTS public.mt_import_logs;
-- =====================================================
