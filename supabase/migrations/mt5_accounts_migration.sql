-- ==========================================
-- MIGRATION: Table mt5_accounts
-- App: VAYNA Trading Journal
-- Purpose: Store MT5 credentials for Python sync script
-- ==========================================

-- 1. Create mt5_accounts table
CREATE TABLE IF NOT EXISTS public.mt5_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    login TEXT NOT NULL,
    investor_password TEXT NOT NULL,
    broker_server TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'mt5',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Policy: users can only see/manage their own MT5 accounts
CREATE POLICY "Users can manage their own mt5 accounts"
    ON public.mt5_accounts
    FOR ALL
    USING (auth.uid() = user_id);

-- 4. Add 'source' column to trades table if not already present
-- This allows the Python script to tag its inserts as 'mt5_sync'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'trades'
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.trades ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
END $$;

-- 5. Add 'ticket' column to trades table if not already present
-- Used by the Python script for deduplication (MT5 ticket number)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'trades'
        AND column_name = 'ticket'
    ) THEN
        ALTER TABLE public.trades ADD COLUMN ticket BIGINT;
    END IF;
END $$;

-- 6. Create unique index on ticket for upsert deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_trades_ticket_unique
    ON public.trades (user_id, ticket)
    WHERE ticket IS NOT NULL;

-- 7. Enable Realtime on trades table (for instant UI updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
