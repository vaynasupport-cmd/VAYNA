/**
 * ══════════════════════════════════════════════════════════════════════════════
 * VAYNA — Demo Data Generator (v3 – 461 trades, realistic P&L per asset)
 * ──────────────────────────────────────────────────────────────────────────────
 * FTMO 100K : 250 trades  |  The5ers 40K : 83 trades  |  Perso 10K : 128 trades
 * Some assets are NET LOSERS to give realistic "Performance par Paire" charts.
 * Prop firm rules match real FTMO & The5%ers parameters.
 * All demo entities tagged "[DEMO]" for clean bulk-delete.
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { supabase } from './supabaseClient'

const DEMO_TAG = '[DEMO]'

// ─── Seeded PRNG (deterministic) ─────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(424242)

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}
function randBetween(min: number, max: number): number {
  return min + rand() * (max - min)
}
function randInt(min: number, max: number): number {
  return Math.floor(randBetween(min, max + 1))
}
function roundTo(n: number, decimals: number): number {
  const f = Math.pow(10, decimals)
  return Math.round(n * f) / f
}
function daysAgoDate(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
function dateTimeAgo(daysBack: number, hour: number, minute: number): string {
  const d = new Date(); d.setDate(d.getDate() - daysBack)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ─── Asset Configs with WIN BIAS ─────────────────────────────────────────────
// winBias: 0.0 = always lose, 0.5 = coin flip, 0.75 = strong winner
interface AssetConfig {
  name: string; basePrice: number; pipSize: number; avgSlPips: number
  decimals: number; category: string; winBias: number
}

const ALL_ASSETS: AssetConfig[] = [
  // FOREX — mix of winners and losers
  { name: 'EUR/USD',  basePrice: 1.0880, pipSize: 0.0001, avgSlPips: 25, decimals: 5, category: 'forex', winBias: 0.68 },
  { name: 'GBP/USD',  basePrice: 1.2720, pipSize: 0.0001, avgSlPips: 30, decimals: 5, category: 'forex', winBias: 0.55 },
  { name: 'USD/JPY',  basePrice: 155.50, pipSize: 0.01,   avgSlPips: 30, decimals: 3, category: 'forex', winBias: 0.62 },
  { name: 'EUR/JPY',  basePrice: 164.20, pipSize: 0.01,   avgSlPips: 35, decimals: 3, category: 'forex', winBias: 0.50 },
  { name: 'GBP/JPY',  basePrice: 197.00, pipSize: 0.01,   avgSlPips: 40, decimals: 3, category: 'forex', winBias: 0.35 }, // NET LOSER
  { name: 'AUD/USD',  basePrice: 0.6590, pipSize: 0.0001, avgSlPips: 20, decimals: 5, category: 'forex', winBias: 0.38 }, // NET LOSER
  { name: 'USD/CAD',  basePrice: 1.3680, pipSize: 0.0001, avgSlPips: 25, decimals: 5, category: 'forex', winBias: 0.60 },
  { name: 'EUR/GBP',  basePrice: 0.8560, pipSize: 0.0001, avgSlPips: 20, decimals: 5, category: 'forex', winBias: 0.40 }, // NET LOSER
  { name: 'NZD/USD',  basePrice: 0.6100, pipSize: 0.0001, avgSlPips: 20, decimals: 5, category: 'forex', winBias: 0.42 }, // NET LOSER
  { name: 'USD/CHF',  basePrice: 0.8820, pipSize: 0.0001, avgSlPips: 22, decimals: 5, category: 'forex', winBias: 0.58 },
  // INDICES — mostly winners
  { name: 'NAS100',   basePrice: 18800, pipSize: 1,   avgSlPips: 60, decimals: 1, category: 'index', winBias: 0.72 },
  { name: 'US30',     basePrice: 40500, pipSize: 1,   avgSlPips: 70, decimals: 1, category: 'index', winBias: 0.65 },
  { name: 'SPX500',   basePrice: 5200,  pipSize: 0.1, avgSlPips: 15, decimals: 2, category: 'index', winBias: 0.60 },
  { name: 'DAX40',    basePrice: 18200, pipSize: 1,   avgSlPips: 50, decimals: 1, category: 'index', winBias: 0.45 }, // SLIGHT LOSER
  // CRYPTO — volatile, mixed
  { name: 'BTC/USD',  basePrice: 68000, pipSize: 1,    avgSlPips: 1500, decimals: 0, category: 'crypto', winBias: 0.63 },
  { name: 'ETH/USD',  basePrice: 3300,  pipSize: 0.1,  avgSlPips: 80,   decimals: 1, category: 'crypto', winBias: 0.55 },
  { name: 'SOL/USD',  basePrice: 145,   pipSize: 0.01, avgSlPips: 5,    decimals: 2, category: 'crypto', winBias: 0.33 }, // NET LOSER
  // COMMODITIES — gold is the star
  { name: 'XAU/USD',  basePrice: 2420,  pipSize: 0.1,  avgSlPips: 120, decimals: 2, category: 'commodity', winBias: 0.75 }, // BIG WINNER
  { name: 'XAG/USD',  basePrice: 28.50, pipSize: 0.01, avgSlPips: 30,  decimals: 3, category: 'commodity', winBias: 0.48 },
]

// ─── Metadata pools ──────────────────────────────────────────────────────────
const TIMEFRAMES = ['5m', '15m', '30m', '1h', '4h']
const STRATEGIES = [
  'Breakout London', 'Breakout NY', 'Trend continuation', 'Counter-trend',
  'Supply/Demand', 'Order Block', 'Momentum', 'Range', 'Scalping',
  'Swing', 'ICT', 'Smart Money', 'Price Action', 'News Trading',
]
const SETUPS = [
  'Range breakout', 'Bull flag', 'Bear flag', 'Double top', 'Double bottom',
  'Head & shoulders', 'VWAP bounce', 'VWAP reclaim', 'Order block',
  'FVG fill', 'Pullback to EMA', 'Morning star', 'Bearish engulfing',
  'Bullish engulfing', 'Pin bar', 'Divergence RSI', 'Support bounce',
  'Resistance rejection', 'Triangle breakout', 'Higher low', 'Lower high',
  'Consolidation break', 'Trend line bounce', 'Fibonacci retracement',
  'Cup & handle', 'Golden cross', 'Hammer', 'Shooting star',
]
const WIN_EMOTIONS = ['confiant', 'calme', 'satisfaction', 'discipliné', 'serein', 'excité']
const LOSS_EMOTIONS = ['stressé', 'frustration', 'impatience', 'peur', 'avidité', 'anxieux']
const NEUTRAL_EMOTIONS = ['neutre', 'calme', 'discipliné']

// ─── Account profiles ────────────────────────────────────────────────────────
interface AccountProfile {
  accountId: string; count: number; spreadDays: number
  tpRange: [number, number]; gainRange: [number, number]
  slRange: [number, number]; perteRange: [number, number]
  beRange: [number, number]
  assetPool: AssetConfig[]
}

function getProfiles(ids: string[]): AccountProfile[] {
  const forexCommo = ALL_ASSETS.filter(a => a.category === 'forex' || a.category === 'commodity')
  return [
    {
      accountId: ids[0], count: 250, spreadDays: 180,
      tpRange: [200, 2200], gainRange: [80, 1500],
      slRange: [-180, -1400], perteRange: [-120, -800],
      beRange: [-40, 40],
      assetPool: ALL_ASSETS.filter(a => a.category !== 'crypto'), // FTMO = forex/indices/commo
    },
    {
      accountId: ids[1], count: 83, spreadDays: 120,
      tpRange: [50, 550], gainRange: [30, 400],
      slRange: [-60, -380], perteRange: [-40, -280],
      beRange: [-15, 15],
      assetPool: forexCommo, // The5ers = forex/commo
    },
    {
      accountId: ids[2], count: 128, spreadDays: 150,
      tpRange: [25, 450], gainRange: [15, 350],
      slRange: [-35, -320], perteRange: [-20, -250],
      beRange: [-12, 12],
      assetPool: ALL_ASSETS, // Personal = everything
    },
  ]
}

// ─── Trade generator (per-asset win bias for realistic P&L per pair) ─────────
function generateTrades(userId: string, profile: AccountProfile): any[] {
  const trades: any[] = []

  for (let i = 0; i < profile.count; i++) {
    const dayBack = Math.floor((i / profile.count) * profile.spreadDays) + 1
    const hour = randInt(7, 22)
    const minute = randInt(0, 11) * 5
    const asset = pick(profile.assetPool)
    const direction = rand() > 0.48 ? 'BUY' : 'SELL'
    const timeframe = pick(TIMEFRAMES)
    const strategy = pick(STRATEGIES)
    const setup = pick(SETUPS)
    const riskPercent = pick([0.25, 0.5, 0.5, 0.75, 1, 1, 1, 1, 1.5, 1.5, 2])

    // ── Per-asset win/loss decision using the asset's winBias ──
    const isWin = rand() < asset.winBias
    let result: string
    let pnl: number
    let emotion: string

    if (isWin) {
      // Winning trade
      if (rand() < 0.65) {
        result = 'TP'
        pnl = roundTo(randBetween(profile.tpRange[0], profile.tpRange[1]), 2)
      } else if (rand() < 0.85) {
        result = 'GAIN'
        pnl = roundTo(randBetween(profile.gainRange[0], profile.gainRange[1]), 2)
      } else {
        result = 'BE+'
        pnl = roundTo(randBetween(5, profile.beRange[1] + 30), 2)
      }
      emotion = pick(WIN_EMOTIONS)
    } else {
      // Losing trade
      const lossRoll = rand()
      if (lossRoll < 0.50) {
        result = 'SL'
        pnl = roundTo(randBetween(profile.slRange[0], profile.slRange[1]), 2)
      } else if (lossRoll < 0.80) {
        result = 'PERTE'
        pnl = roundTo(randBetween(profile.perteRange[0], profile.perteRange[1]), 2)
      } else if (lossRoll < 0.92) {
        result = 'BE'
        pnl = 0
        emotion = pick(NEUTRAL_EMOTIONS)
      } else {
        result = 'BE-'
        pnl = roundTo(randBetween(profile.beRange[0] - 30, -5), 2)
      }
      emotion = emotion! || pick(LOSS_EMOTIONS)
    }

    // ── Prices ──
    const priceVar = asset.basePrice * 0.03 * (rand() - 0.5)
    const entryPrice = roundTo(asset.basePrice + priceVar, asset.decimals)
    const slDist = asset.pipSize * asset.avgSlPips * randBetween(0.6, 1.5)
    const tpDist = slDist * randBetween(1.2, 3.0)

    let exitPrice: number, stopLoss: number, takeProfit: number
    if (direction === 'BUY') {
      stopLoss = roundTo(entryPrice - slDist, asset.decimals)
      takeProfit = roundTo(entryPrice + tpDist, asset.decimals)
      exitPrice = (result === 'TP' || result === 'GAIN' || result === 'BE+')
        ? roundTo(entryPrice + tpDist * randBetween(0.4, 1.0), asset.decimals)
        : (result === 'SL' || result === 'PERTE')
          ? roundTo(entryPrice - slDist * randBetween(0.6, 1.0), asset.decimals)
          : roundTo(entryPrice + (rand() - 0.5) * slDist * 0.08, asset.decimals)
    } else {
      stopLoss = roundTo(entryPrice + slDist, asset.decimals)
      takeProfit = roundTo(entryPrice - tpDist, asset.decimals)
      exitPrice = (result === 'TP' || result === 'GAIN' || result === 'BE+')
        ? roundTo(entryPrice - tpDist * randBetween(0.4, 1.0), asset.decimals)
        : (result === 'SL' || result === 'PERTE')
          ? roundTo(entryPrice + slDist * randBetween(0.6, 1.0), asset.decimals)
          : roundTo(entryPrice + (rand() - 0.5) * slDist * 0.08, asset.decimals)
    }

    trades.push({
      user_id: userId,
      account_id: profile.accountId,
      date: daysAgoDate(dayBack),
      created_date_time: dateTimeAgo(dayBack, hour, minute),
      asset: asset.name,
      timeframe, direction, risk_percent: riskPercent,
      entry_price: entryPrice, exit_price: exitPrice,
      stop_loss: stopLoss, take_profit: takeProfit,
      position_size: null, result,
      pnl_amount: pnl, pnl_percent: 0,
      r_multiple: pnl !== 0 ? roundTo(pnl / (riskPercent * 500), 2) : 0,
      commission: null, swap: null,
      comment: `${DEMO_TAG} ${strategy} — ${setup}`,
      emotional_tag: emotion, strategy, setup_type: setup,
    })
  }
  return trades
}

// ─── Build all 461 trades ────────────────────────────────────────────────────
function getDemoTrades(userId: string, accountIds: string[]) {
  const profiles = getProfiles(accountIds)
  return [
    ...generateTrades(userId, profiles[0]), // 250
    ...generateTrades(userId, profiles[1]), // 83
    ...generateTrades(userId, profiles[2]), // 128
  ]
}

// ─── DEMO ACCOUNTS (real FTMO & The5ers rules) ──────────────────────────────
function getDemoAccounts(userId: string) {
  return [
    {
      // FTMO 100K Challenge — real rules
      // Target: 10% ($10 000), Max Loss: 10% ($10 000), Daily Max Loss: 5% ($5 000)
      user_id: userId,
      name: `${DEMO_TAG} FTMO Challenge 100K`,
      prop_firm: 'FTMO',
      initial_capital: 100000,
      current_capital: 107450,   // show some profit already made
      max_drawdown_percent: 10,  // FTMO max loss = 10%
      max_drawdown_amount: 10000,
      current_drawdown_amount: 1850, // some drawdown used
      target_percent: 10,        // FTMO target = 10%
      target_amount: 10000,
      profit_percent: 7.45,
      profit_amount: 7450,
      status: 'active' as const,
    },
    {
      // The5%ers Hyper Growth $40K — real rules
      // Target: 8% ($3 200), Max Drawdown: 8% relative ($3 200)
      user_id: userId,
      name: `${DEMO_TAG} The5%ers 40K`,
      prop_firm: 'The5%ers',
      initial_capital: 40000,
      current_capital: 41280,
      max_drawdown_percent: 8,   // The5ers max DD = 8%
      max_drawdown_amount: 3200,
      current_drawdown_amount: 620,
      target_percent: 8,         // The5ers target = 8%
      target_amount: 3200,
      profit_percent: 3.2,
      profit_amount: 1280,
      status: 'active' as const,
    },
    {
      // Personal account — no prop firm rules
      user_id: userId,
      name: `${DEMO_TAG} Compte Personnel`,
      prop_firm: null,
      initial_capital: 10000,
      current_capital: 11340,
      max_drawdown_percent: 25,
      max_drawdown_amount: 2500,
      current_drawdown_amount: 480,
      target_percent: 50,
      target_amount: 5000,
      profit_percent: 13.4,
      profit_amount: 1340,
      status: 'active' as const,
    },
  ]
}

// ─── DEMO JOURNAL ENTRIES (12 entries) ───────────────────────────────────────
function getDemoJournalEntries(userId: string) {
  return [
    {
      user_id: userId, date: daysAgoDate(170),
      title: `${DEMO_TAG} Première Semaine — Démarrage Solide`,
      content: 'Session très disciplinée. J\'ai suivi mon plan à la lettre et pris uniquement les setups validés. Le breakout EUR/USD était parfait, entrée précise sur le range. Seul le trade GBP/USD était un faux signal que j\'aurais dû éviter — la structure n\'était pas assez claire.',
      mental_state: 'bon', discipline_score: 8, focus_score: 7, confidence: 7,
      trading_plans: 'Focus sur les breakouts London session. Limiter à 2 trades/jour max.',
      setups_identified: 'Range breakout EUR/USD ✅\nDouble top GBP/USD ❌ (faux signal)\nBull flag XAU/USD ✅',
      lessons_learned: 'Les faux breakouts sur GBP sont fréquents le vendredi après-midi. Éviter ce créneau horaire.',
      market_condition: 'Tendance haussière', pnl_summary: '+1 475$',
      next_actions: 'Ajouter un filtre de volume pour les breakouts GBP.',
      references_text: null, tags: ['breakout', 'london-session', 'discipline'],
    },
    {
      user_id: userId, date: daysAgoDate(150),
      title: `${DEMO_TAG} Analyse du Premier Mois`,
      content: 'Fin du premier mois. WR ~62%, PF 1.8. Les meilleurs trades viennent du Gold et NAS100. Les pertes principales viennent du GBP/JPY et AUD/USD — ces paires ne correspondent pas à mon style. Je dois les éliminer.',
      mental_state: 'bon', discipline_score: 7, focus_score: 8, confidence: 7,
      trading_plans: 'Éliminer GBP/JPY et AUD/USD du watchlist. Se concentrer sur les top 5 paires.',
      setups_identified: 'Trend continuation Gold ✅ (best setup)\nVWAP NAS100 ✅\nCounter-trend GBP/JPY ❌ x3',
      lessons_learned: 'Trader moins de paires mais mieux les connaître est plus rentable. GBP/JPY est un piège.',
      market_condition: 'Range', pnl_summary: '+3 200$',
      next_actions: 'Créer un tableau de bord par paire. Backtester FVG Gold.',
      references_text: null, tags: ['analyse', 'statistiques', 'optimisation'],
    },
    {
      user_id: userId, date: daysAgoDate(120),
      title: `${DEMO_TAG} Semaine Difficile — Drawdown -3.2%`,
      content: '5 SL consécutifs sur des paires forex. Le marché était en range serré et mes breakouts ont tous échoué. J\'ai failli over-trader pour me refaire mais j\'ai arrêté à temps. Le drawdown atteint -3.2% sur FTMO. L\'AUD/USD m\'a encore piégé.',
      mental_state: 'mauvais', discipline_score: 5, focus_score: 4, confidence: 3,
      trading_plans: 'STOP trading 24h. Revenir avec un plan clair. Pas de breakouts en range.',
      setups_identified: 'False breakout EUR/USD ❌\nFalse breakout GBP/USD ❌\nRange trap NAS100 ❌\nAUD/USD SL ❌',
      lessons_learned: 'En range, les breakouts sont des pièges. Le repos est plus rentable que le revenge trading.',
      market_condition: 'Range', pnl_summary: '-2 800$',
      next_actions: 'Journée off. Méditation. Plan "range only" pour mardi.',
      references_text: null, tags: ['drawdown', 'discipline', 'pause', 'gestion-risque'],
    },
    {
      user_id: userId, date: daysAgoDate(100),
      title: `${DEMO_TAG} Récupération — Sessions Tokyo & London`,
      content: 'Après la pause, retour avec un mindset clair. Ajout de la session Tokyo : résultats excellents sur USD/JPY. La London produit les meilleurs trades sur EUR/USD et Gold. Le NZD/USD reste un piège, encore un SL dessus.',
      mental_state: 'excellent', discipline_score: 9, focus_score: 9, confidence: 8,
      trading_plans: 'Dual-session: Tokyo pour JPY, London pour EUR/Gold. Blacklister NZD/USD.',
      setups_identified: 'Order block USD/JPY ✅ (Tokyo)\nBreakout EUR/USD ✅ (London)\nTrend cont. Gold ✅\nNZD/USD SL ❌',
      lessons_learned: 'La session Tokyo ouvre des opportunités. Le JPY est plus prévisible en session asiatique.',
      market_condition: 'Tendance haussière', pnl_summary: '+4 150$',
      next_actions: 'Formaliser la stratégie Tokyo. Documenter les entry criteria.',
      references_text: null, tags: ['tokyo', 'london', 'récupération', 'jpy'],
    },
    {
      user_id: userId, date: daysAgoDate(80),
      title: `${DEMO_TAG} 100 Trades Milestone — Bilan FTMO`,
      content: 'Cap des 100 trades sur FTMO. WR 63.5%, PF 1.95. Top 3: XAU/USD, NAS100, EUR/USD. Drawdown max: 4.1%. GBP/JPY et AUD/USD restent négatifs — je les évite maintenant. Le plan fonctionne.',
      mental_state: 'excellent', discipline_score: 9, focus_score: 8, confidence: 9,
      trading_plans: 'Maintenir le cap. Augmenter sizing de 0.5R à 1R sur les setups A+.',
      setups_identified: 'FVG Gold ✅ (17 trades, 76% WR)\nVWAP NAS100 ✅ (12 trades, 67% WR)\nBreakout EUR/USD ✅ (15 trades, 60% WR)',
      lessons_learned: 'La consistance bat la perf isolée. 100 trades à 63% WR > 10 trades à 90% WR.',
      market_condition: 'Tendance haussière', pnl_summary: '+8 400$ cumulé',
      next_actions: 'Préparer la phase 2 du challenge FTMO.',
      references_text: null, tags: ['milestone', '100-trades', 'bilan', 'consistance'],
    },
    {
      user_id: userId, date: daysAgoDate(60),
      title: `${DEMO_TAG} Semaine NAS100 — Momentum Fort`,
      content: 'Excellent momentum indices. NAS100 très lisible avec des VWAP clairs. Position augmentée car setup très consistent. Gold continue en tendance haussière.',
      mental_state: 'excellent', discipline_score: 9, focus_score: 9, confidence: 8,
      trading_plans: 'Profiter du momentum indices. Biais long NAS100 > 18400.',
      setups_identified: 'VWAP reclaim NAS100 ✅ (+1200$)\nPullback EMA Gold ✅\nBE EUR/USD — manque de follow-through',
      lessons_learned: 'En forte tendance, le R:R est beaucoup plus favorable. Laisser courir les winners.',
      market_condition: 'Tendance haussière', pnl_summary: '+2 625$',
      next_actions: 'Préparer une stratégie short en cas de retournement.',
      references_text: null, tags: ['momentum', 'nas100', 'trend-following', 'gold'],
    },
    {
      user_id: userId, date: daysAgoDate(43),
      title: `${DEMO_TAG} Gestion du Risque — Avidité sur GBP`,
      content: 'L\'avidité a pris le dessus sur GBP/USD — position prise trop tôt sans confirmation. NAS100 a sauvé la journée avec un bull flag. DAX40 m\'a aussi piégé avec un faux breakout. EUR/GBP reste négatif.',
      mental_state: 'neutre', discipline_score: 6, focus_score: 7, confidence: 6,
      trading_plans: 'Réduire l\'exposition vendredi. Attendre les confirmations.',
      setups_identified: 'Failed breakdown GBP/USD ❌\nBull flag NAS100 ✅ (+1500$)\nDAX40 false break ❌\nEUR/GBP SL ❌',
      lessons_learned: 'L\'avidité = ennemi #1. Patience = meilleurs trades. POST-IT: "WAIT FOR CONFIRMATION".',
      market_condition: 'Volatile', pnl_summary: '+820$',
      next_actions: 'Jour de repos demain. Revoir règles de confirmation.',
      references_text: null, tags: ['gestion-risque', 'patience', 'confirmation', 'avidité'],
    },
    {
      user_id: userId, date: daysAgoDate(28),
      title: `${DEMO_TAG} Retour en Force — Discipline 10/10`,
      content: 'Après repos lundi, état d\'esprit clair. Tous les trades parfaitement exécutés. USD/CAD excellent sur order block. US30 superbe higher high. SOL/USD m\'a encore piégé — cette crypto est trop volatile.',
      mental_state: 'excellent', discipline_score: 10, focus_score: 9, confidence: 9,
      trading_plans: 'Routine pré-marché: méditation 10 min avant les charts.',
      setups_identified: 'Higher high US30 ✅\nResistance rejection NAS100 ✅\nOrder block USD/CAD ✅\nSOL/USD SL ❌',
      lessons_learned: 'Le repos fait partie du trading. Esprit clair = bonnes décisions. 1 jour OFF/semaine.',
      market_condition: 'Tendance haussière', pnl_summary: '+1 480$',
      next_actions: 'Continuer méditation. Rest day chaque lundi. Blacklister SOL.',
      references_text: null, tags: ['repos', 'routine', 'discipline', 'méditation'],
    },
    {
      user_id: userId, date: daysAgoDate(18),
      title: `${DEMO_TAG} Crypto Week — BTC en ATH`,
      content: 'Semaine forte sur le perso. BTC a cassé son ATH, 3 trades en trend following. ETH suit. SOL a donné un cup & handle mais exit prématurée. Attention à l\'overconfidence.',
      mental_state: 'bon', discipline_score: 7, focus_score: 8, confidence: 8,
      trading_plans: 'Biais long crypto tant que BTC > 70K. Pullbacks altcoins.',
      setups_identified: 'ATH breakout BTC ✅\nCup & handle SOL ✅ (sorti trop tôt)\nHigher low ETH ✅\nFailed short BTC ❌',
      lessons_learned: 'En bull run crypto, NE PAS shorter. Uniquement longs + pullbacks.',
      market_condition: 'Tendance haussière', pnl_summary: '+1 200$ (perso)',
      next_actions: 'Si BTC < 68K, sortir toutes les positions.',
      references_text: null, tags: ['crypto', 'btc', 'ath', 'bull-run'],
    },
    {
      user_id: userId, date: daysAgoDate(10),
      title: `${DEMO_TAG} Supply Zone EUR/USD + FVG Gold`,
      content: 'Supply zone EUR/USD parfaite avec bearish pin bar. Gold FVG fill magnifique. XAG/USD a donné un faux signal — l\'argent est moins fiable que l\'or.',
      mental_state: 'bon', discipline_score: 8, focus_score: 8, confidence: 8,
      trading_plans: 'Gold en tendance majeure: pullbacks long. EUR/USD: niveaux clés.',
      setups_identified: 'Bearish pin bar EUR/USD ✅ (+350$)\nFVG fill XAU/USD ✅ (+1400$)\nXAG/USD false ❌\nGBP/USD range ✅ (+140$)',
      lessons_learned: 'FVG Gold H1 = excellent R:R. XAG moins fiable que XAU.',
      market_condition: 'Tendance haussière', pnl_summary: '+1 890$',
      next_actions: 'Backtester FVG Gold sur 100 trades historiques.',
      references_text: null, tags: ['supply-zone', 'fvg', 'gold', 'technique'],
    },
    {
      user_id: userId, date: daysAgoDate(5),
      title: `${DEMO_TAG} Bilan — Objectif FTMO 10% en Vue`,
      content: 'FTMO à +7.45%. WR 63%, PF 1.85. Top actifs: XAU/USD, NAS100, EUR/USD. Pires: GBP/JPY (-1200$), AUD/USD (-800$), NZD/USD (-450$). Le drawdown est resté sous contrôle à 1.85%.',
      mental_state: 'excellent', discipline_score: 9, focus_score: 9, confidence: 9,
      trading_plans: 'Ne rien changer. Rester discipliné. Les 2.55% restants viendront naturellement.',
      setups_identified: 'Top 3 setups:\n1. FVG Gold (82% WR)\n2. VWAP NAS100 (71% WR)\n3. Breakout EUR/USD (65% WR)\n\nWorst: Counter-trend GBP/JPY (25% WR)',
      lessons_learned: 'La patience est la clé. Se concentrer sur le process, pas sur l\'argent.',
      market_condition: 'Tendance haussière', pnl_summary: '+7 450$ cumulé FTMO',
      next_actions: 'Focus total 2 prochaines semaines. Zéro risque inutile.',
      references_text: null, tags: ['bilan', 'objectif', 'ftmo', 'challenge', 'discipline'],
    },
    {
      user_id: userId, date: daysAgoDate(2),
      title: `${DEMO_TAG} Résistance à la Tentation — Counter-trend`,
      content: 'Encore cédé à un counter-trend NAS100 (double top) → SL. C\'est récurrent. Le trade EUR/USD The5ers était propre. EUR/GBP m\'a encore piégé. Il faut arrêter de chercher les tops et supprimer EUR/GBP du watchlist.',
      mental_state: 'neutre', discipline_score: 5, focus_score: 6, confidence: 5,
      trading_plans: 'Semaine prochaine : INTERDICTION counter-trend. Trend only.',
      setups_identified: 'Double top NAS100 ❌ (-400$)\nMorning star EUR/USD ✅ (+140$)\nEUR/GBP SL ❌ (-180$)\nBTC breakout ✅ (+120$)',
      lessons_learned: 'Counter-trend = -1 850$ total. EUR/GBP = -620$ total. SUPPRIMER ces deux habitudes.',
      market_condition: 'Volatile', pnl_summary: '-320$',
      next_actions: 'Règle stricte: PAS de counter-trend 2 semaines. Supprimer EUR/GBP.',
      references_text: null, tags: ['counter-trend', 'discipline', 'erreur-récurrente'],
    },
  ]
}

// ─── SEED ────────────────────────────────────────────────────────────────────
export async function seedDemoData(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Accounts
    const { data: rows, error: accErr } = await supabase
      .from('accounts').insert(getDemoAccounts(userId)).select()
    if (accErr) throw new Error(`Accounts: ${accErr.message}`)
    if (!rows || rows.length < 3) throw new Error('Failed to create demo accounts')
    const ids = rows.map((a: any) => a.id)

    // 2. Trades (461 total, batched by 20)
    const trades = getDemoTrades(userId, ids)
    for (let i = 0; i < trades.length; i += 20) {
      const { error } = await supabase.from('trades').insert(trades.slice(i, i + 20))
      if (error) throw new Error(`Trades batch ${Math.floor(i / 20)}: ${error.message}`)
    }

    // 3. Journal (12 entries)
    const { error: jErr } = await supabase
      .from('journal_entries').insert(getDemoJournalEntries(userId))
    if (jErr) throw new Error(`Journal: ${jErr.message}`)

    return { success: true }
  } catch (err: any) {
    console.error('[DemoData] Seed error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

// ─── CLEAR ───────────────────────────────────────────────────────────────────
export async function clearDemoData(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: accs, error: fErr } = await supabase
      .from('accounts').select('id').eq('user_id', userId).like('name', `${DEMO_TAG}%`)
    if (fErr) throw new Error(`Find: ${fErr.message}`)
    const demoIds = (accs || []).map((a: any) => a.id)

    if (demoIds.length > 0) {
      const { error: tErr } = await supabase.from('trades').delete().in('account_id', demoIds)
      if (tErr) throw new Error(`Del trades: ${tErr.message}`)
      const { error: aErr } = await supabase.from('accounts').delete().in('id', demoIds)
      if (aErr) throw new Error(`Del accounts: ${aErr.message}`)
    }

    const { error: jErr } = await supabase
      .from('journal_entries').delete().eq('user_id', userId).like('title', `${DEMO_TAG}%`)
    if (jErr) throw new Error(`Del journal: ${jErr.message}`)

    return { success: true }
  } catch (err: any) {
    console.error('[DemoData] Clear error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

// ─── CHECK ───────────────────────────────────────────────────────────────────
export async function hasDemoData(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('accounts').select('id').eq('user_id', userId).like('name', `${DEMO_TAG}%`).limit(1)
  if (error) return false
  return (data || []).length > 0
}
