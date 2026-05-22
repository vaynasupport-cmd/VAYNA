-- ============================================================
-- VAYNA — Script SQL Supabase
-- Exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLE : accounts
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  prop_firm               TEXT,
  initial_capital         NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_capital         NUMERIC(15,2) NOT NULL DEFAULT 0,
  max_drawdown_percent    NUMERIC(8,4)  NOT NULL DEFAULT 0,
  max_drawdown_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_drawdown_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  target_percent          NUMERIC(8,4)  NOT NULL DEFAULT 0,
  target_amount           NUMERIC(15,2) NOT NULL DEFAULT 0,
  profit_percent          NUMERIC(8,4)  NOT NULL DEFAULT 0,
  profit_amount           NUMERIC(15,2) NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'lost', 'validated')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts: users see only their own"
  ON public.accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ────────────────────────────────────────────────────────────
-- 2. TABLE : trades
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trades (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id        UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  created_date_time TIMESTAMPTZ,
  asset             TEXT NOT NULL DEFAULT '',
  timeframe         TEXT NOT NULL DEFAULT '1h',
  direction         TEXT NOT NULL CHECK (direction IN ('BUY', 'SELL')),
  risk_percent      NUMERIC(8,4)  NOT NULL DEFAULT 0,
  entry_price       NUMERIC(20,8),
  exit_price        NUMERIC(20,8),
  stop_loss         NUMERIC(20,8),
  take_profit       NUMERIC(20,8),
  position_size     NUMERIC(20,8),
  result            TEXT NOT NULL
                      CHECK (result IN ('TP', 'SL', 'BE', 'GAIN', 'PERTE', 'BE+', 'BE-')),
  pnl_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
  pnl_percent       NUMERIC(10,4) NOT NULL DEFAULT 0,
  r_multiple        NUMERIC(10,4),
  commission        NUMERIC(10,4),
  comment           TEXT,
  emotional_tag     TEXT,
  strategy          TEXT,
  setup_type        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trades: users see only their own"
  ON public.trades FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index pour les filtres fréquents
CREATE INDEX IF NOT EXISTS idx_trades_user_id      ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id   ON public.trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_date         ON public.trades(date DESC);


-- ────────────────────────────────────────────────────────────
-- 3. TABLE : screenshots
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.screenshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id    UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  image_data  TEXT NOT NULL,  -- base64 encoded image
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "screenshots: users see only their own"
  ON public.screenshots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_screenshots_trade_id ON public.screenshots(trade_id);


-- ────────────────────────────────────────────────────────────
-- 4. TABLE : journal_entries
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date               DATE NOT NULL,
  title              TEXT,
  content            TEXT NOT NULL DEFAULT '',
  mental_state       TEXT,
  discipline_score   SMALLINT CHECK (discipline_score BETWEEN 0 AND 10),
  focus_score        SMALLINT CHECK (focus_score BETWEEN 0 AND 10),
  confidence         SMALLINT CHECK (confidence BETWEEN 0 AND 10),
  trading_plans      TEXT,
  setups_identified  TEXT,
  lessons_learned    TEXT,
  market_condition   TEXT,
  pnl_summary        TEXT,
  next_actions       TEXT,
  "references"       TEXT,
  tags               TEXT[],
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_entries: users see only their own"
  ON public.journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date    ON public.journal_entries(date DESC);


-- ────────────────────────────────────────────────────────────
-- VÉRIFICATION : lister les tables créées
-- ────────────────────────────────────────────────────────────
SELECT table_name, row_security
FROM information_schema.tables
LEFT JOIN pg_class c ON c.relname = table_name
WHERE table_schema = 'public'
  AND table_name IN ('accounts', 'trades', 'screenshots', 'journal_entries')
ORDER BY table_name;
