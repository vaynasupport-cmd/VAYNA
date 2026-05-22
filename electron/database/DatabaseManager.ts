import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export class DatabaseManager {
  private db: Database.Database | null = null
  private dbPath: string

  constructor(dbPath: string) {
    this.dbPath = dbPath
    // Ensure directory exists
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  async initialize(): Promise<void> {
    this.db = new Database(this.dbPath)
    this.db.pragma('journal_mode = WAL')
    this.createTables()
  }

  private createTables(): void {
    if (!this.db) return

    // Accounts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        propFirm TEXT,
        initialCapital REAL NOT NULL DEFAULT 0,
        currentCapital REAL NOT NULL DEFAULT 0,
        maxDrawdownPercent REAL NOT NULL DEFAULT 10,
        maxDrawdownAmount REAL NOT NULL DEFAULT 0,
        currentDrawdownAmount REAL NOT NULL DEFAULT 0,
        targetPercent REAL NOT NULL DEFAULT 10,
        targetAmount REAL NOT NULL DEFAULT 0,
        profitPercent REAL NOT NULL DEFAULT 0,
        profitAmount REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `)

    // Trades table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL,
        date TEXT NOT NULL,
        asset TEXT NOT NULL,
        timeframe TEXT NOT NULL,
        direction TEXT NOT NULL,
        riskPercent REAL NOT NULL DEFAULT 1,
        entryPrice REAL,
        exitPrice REAL,
        stopLoss REAL,
        takeProfit REAL,
        positionSize REAL,
        result TEXT NOT NULL,
        pnlAmount REAL NOT NULL DEFAULT 0,
        pnlPercent REAL NOT NULL DEFAULT 0,
        rMultiple REAL,
        commission REAL DEFAULT 0,
        comment TEXT,
        emotionalTag TEXT,
        strategy TEXT,
        setupType TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `)

    // Screenshots table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS screenshots (
        id TEXT PRIMARY KEY,
        tradeId TEXT NOT NULL,
        imageData TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (tradeId) REFERENCES trades(id) ON DELETE CASCADE
      )
    `)

    // Journal entries table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        mentalState TEXT,
        disciplineScore INTEGER,
        focusScore INTEGER,
        confidence INTEGER,
        tradingPlans TEXT,
        setupsIdentified TEXT,
        lessonsLearned TEXT,
        marketCondition TEXT,
        pnlSummary TEXT,
        nextActions TEXT,
        references_text TEXT,
        tags TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `)

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_trades_account ON trades(accountId);
      CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);
      CREATE INDEX IF NOT EXISTS idx_screenshots_trade ON screenshots(tradeId);
      CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);
    `)

    // Run migrations to add missing columns
    this.migrateJournalEntries()
    this.migrateTradesSchema()
  }

  private migrateTradesSchema(): void {
    if (!this.db) return

    try {
      const tableInfo = this.db.prepare("PRAGMA table_info(trades)").all() as any[]
      const columnNames = tableInfo.map(col => col.name)

      if (!columnNames.includes('createdDateTime')) {
        console.log('Adding missing column: createdDateTime')
        this.db.exec(`ALTER TABLE trades ADD COLUMN createdDateTime TEXT`)
      }
    } catch (error) {
      console.error('Migration error for trades:', error)
    }
  }

  private migrateJournalEntries(): void {
    if (!this.db) return

    try {
      // Get table info
      const tableInfo = this.db.prepare("PRAGMA table_info(journal_entries)").all() as any[]
      const columnNames = tableInfo.map(col => col.name)

      const columnsToAdd = [
        { name: 'confidence', type: 'INTEGER' },
        { name: 'tradingPlans', type: 'TEXT' },
        { name: 'setupsIdentified', type: 'TEXT' },
        { name: 'lessonsLearned', type: 'TEXT' },
        { name: 'marketCondition', type: 'TEXT' },
        { name: 'pnlSummary', type: 'TEXT' },
        { name: 'nextActions', type: 'TEXT' },
        { name: 'references_text', type: 'TEXT' },
      ]

      for (const col of columnsToAdd) {
        if (!columnNames.includes(col.name)) {
          console.log(`Adding missing column: ${col.name}`)
          this.db.exec(`ALTER TABLE journal_entries ADD COLUMN ${col.name} ${col.type}`)
        }
      }
    } catch (error) {
      console.error('Migration error:', error)
    }
  }

  // Accounts CRUD
  getAllAccounts(): any[] {
    if (!this.db) return []
    const stmt = this.db.prepare('SELECT * FROM accounts ORDER BY createdAt DESC')
    return stmt.all()
  }

  getAccountById(id: string): any | null {
    if (!this.db) return null
    const stmt = this.db.prepare('SELECT * FROM accounts WHERE id = ?')
    return stmt.get(id) || null
  }

  createAccount(data: any): any {
    if (!this.db) throw new Error('Database not initialized')
    
    const id = uuidv4()
    const now = new Date().toISOString()
    const targetAmount = data.initialCapital * (data.targetPercent / 100)
    const maxDrawdownAmount = data.initialCapital * (data.maxDrawdownPercent / 100)

    const stmt = this.db.prepare(`
      INSERT INTO accounts (
        id, name, propFirm, initialCapital, currentCapital, maxDrawdownPercent,
        maxDrawdownAmount, currentDrawdownAmount, targetPercent, targetAmount,
        profitPercent, profitAmount, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.name,
      data.propFirm || null,
      data.initialCapital || 0,
      data.initialCapital || 0,
      data.maxDrawdownPercent || 10,
      maxDrawdownAmount,
      0,
      data.targetPercent || 10,
      targetAmount,
      0,
      0,
      data.status || 'active',
      now,
      now
    )

    return this.getAccountById(id)
  }

  updateAccount(id: string, data: any): any {
    if (!this.db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const account = this.getAccountById(id)
    if (!account) throw new Error('Account not found')

    // Recalculate derived values
    const initialCapital = data.initialCapital !== undefined ? data.initialCapital : account.initialCapital
    const targetPercent = data.targetPercent !== undefined ? data.targetPercent : account.targetPercent
    const maxDrawdownPercent = data.maxDrawdownPercent !== undefined ? data.maxDrawdownPercent : account.maxDrawdownPercent
    
    const targetAmount = initialCapital * (targetPercent / 100)
    const maxDrawdownAmount = initialCapital * (maxDrawdownPercent / 100)

    const stmt = this.db.prepare(`
      UPDATE accounts SET
        name = ?,
        propFirm = ?,
        initialCapital = ?,
        currentCapital = ?,
        maxDrawdownPercent = ?,
        maxDrawdownAmount = ?,
        currentDrawdownAmount = ?,
        targetPercent = ?,
        targetAmount = ?,
        profitPercent = ?,
        profitAmount = ?,
        status = ?,
        updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      data.name !== undefined ? data.name : account.name,
      data.propFirm !== undefined ? data.propFirm : account.propFirm,
      initialCapital,
      data.currentCapital !== undefined ? data.currentCapital : account.currentCapital,
      maxDrawdownPercent,
      maxDrawdownAmount,
      data.currentDrawdownAmount !== undefined ? data.currentDrawdownAmount : account.currentDrawdownAmount,
      targetPercent,
      targetAmount,
      data.profitPercent !== undefined ? data.profitPercent : account.profitPercent,
      data.profitAmount !== undefined ? data.profitAmount : account.profitAmount,
      data.status !== undefined ? data.status : account.status,
      now,
      id
    )

    return this.getAccountById(id)
  }

  deleteAccount(id: string): boolean {
    if (!this.db) return false
    const stmt = this.db.prepare('DELETE FROM accounts WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  // Trades CRUD
  getAllTrades(filters?: any): any[] {
    if (!this.db) return []
    
    let query = `
      SELECT t.*, a.name as accountName, a.propFirm 
      FROM trades t
      LEFT JOIN accounts a ON t.accountId = a.id
    `
    const params: any[] = []

    if (filters) {
      const conditions: string[] = []
      
      if (filters.accountId) {
        conditions.push('t.accountId = ?')
        params.push(filters.accountId)
      }
      if (filters.startDate) {
        conditions.push('t.date >= ?')
        params.push(filters.startDate)
      }
      if (filters.endDate) {
        conditions.push('t.date <= ?')
        params.push(filters.endDate)
      }
      if (filters.result) {
        conditions.push('t.result = ?')
        params.push(filters.result)
      }
      if (filters.direction) {
        conditions.push('t.direction = ?')
        params.push(filters.direction)
      }
      if (filters.asset) {
        conditions.push('t.asset LIKE ?')
        params.push(`%${filters.asset}%`)
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
    }

    query += ' ORDER BY t.date DESC, t.createdAt DESC'

    const stmt = this.db.prepare(query)
    return stmt.all(...params)
  }

  getTradeById(id: string): any | null {
    if (!this.db) return null
    const stmt = this.db.prepare(`
      SELECT t.*, a.name as accountName, a.propFirm 
      FROM trades t
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.id = ?
    `)
    return stmt.get(id) || null
  }

  createTrade(data: any): any {
    if (!this.db) throw new Error('Database not initialized')
    
    const id = uuidv4()
    const now = new Date().toISOString()

    // Get account for calculations
    const account = this.getAccountById(data.accountId)
    if (!account) throw new Error('Account not found')

    // Calculate P&L percentage based on risk
    const pnlPercent = data.riskPercent > 0 ? (data.pnlAmount / (account.currentCapital * (data.riskPercent / 100))) * data.riskPercent : 0
    
    // Calculate R Multiple
    let rMultiple = null
    if (data.riskPercent > 0 && account.currentCapital > 0) {
      const riskAmount = account.currentCapital * (data.riskPercent / 100)
      rMultiple = riskAmount > 0 ? data.pnlAmount / riskAmount : 0
    }

    const stmt = this.db.prepare(`
      INSERT INTO trades (
        id, accountId, date, createdDateTime, asset, timeframe, direction, riskPercent,
        entryPrice, exitPrice, stopLoss, takeProfit, positionSize,
        result, pnlAmount, pnlPercent, rMultiple, commission, comment,
        emotionalTag, strategy, setupType, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.accountId,
      data.date,
      data.createdDateTime || now,
      data.asset,
      data.timeframe,
      data.direction,
      data.riskPercent || 1,
      data.entryPrice || null,
      data.exitPrice || null,
      data.stopLoss || null,
      data.takeProfit || null,
      data.positionSize || null,
      data.result,
      data.pnlAmount || 0,
      pnlPercent,
      rMultiple,
      data.commission || 0,
      data.comment || null,
      data.emotionalTag || null,
      data.strategy || null,
      data.setupType || null,
      now,
      now
    )

    // Update account capital
    this.updateAccountCapital(data.accountId, data.pnlAmount || 0)

    return this.getTradeById(id)
  }

  updateTrade(id: string, data: any): any {
    if (!this.db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const trade = this.getTradeById(id)
    if (!trade) throw new Error('Trade not found')

    // Get account for calculations
    const account = this.getAccountById(trade.accountId)
    if (!account) throw new Error('Account not found')

    // Calculate difference in P&L for account update
    const oldPnl = trade.pnlAmount
    const newPnl = data.pnlAmount !== undefined ? data.pnlAmount : oldPnl
    const pnlDiff = newPnl - oldPnl

    // Recalculate R Multiple
    const riskPercent = data.riskPercent !== undefined ? data.riskPercent : trade.riskPercent
    let rMultiple = null
    if (riskPercent > 0 && account.currentCapital > 0) {
      const riskAmount = account.currentCapital * (riskPercent / 100)
      rMultiple = riskAmount > 0 ? newPnl / riskAmount : 0
    }

    const stmt = this.db.prepare(`
      UPDATE trades SET
        date = ?,
        createdDateTime = ?,
        asset = ?,
        timeframe = ?,
        direction = ?,
        riskPercent = ?,
        entryPrice = ?,
        exitPrice = ?,
        stopLoss = ?,
        takeProfit = ?,
        positionSize = ?,
        result = ?,
        pnlAmount = ?,
        rMultiple = ?,
        commission = ?,
        comment = ?,
        emotionalTag = ?,
        strategy = ?,
        setupType = ?,
        updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      data.date !== undefined ? data.date : trade.date,
      data.createdDateTime !== undefined ? data.createdDateTime : trade.createdDateTime,
      data.asset !== undefined ? data.asset : trade.asset,
      data.timeframe !== undefined ? data.timeframe : trade.timeframe,
      data.direction !== undefined ? data.direction : trade.direction,
      riskPercent,
      data.entryPrice !== undefined ? data.entryPrice : trade.entryPrice,
      data.exitPrice !== undefined ? data.exitPrice : trade.exitPrice,
      data.stopLoss !== undefined ? data.stopLoss : trade.stopLoss,
      data.takeProfit !== undefined ? data.takeProfit : trade.takeProfit,
      data.positionSize !== undefined ? data.positionSize : trade.positionSize,
      data.result !== undefined ? data.result : trade.result,
      newPnl,
      rMultiple,
      data.commission !== undefined ? data.commission : trade.commission,
      data.comment !== undefined ? data.comment : trade.comment,
      data.emotionalTag !== undefined ? data.emotionalTag : trade.emotionalTag,
      data.strategy !== undefined ? data.strategy : trade.strategy,
      data.setupType !== undefined ? data.setupType : trade.setupType,
      now,
      id
    )

    // Update account capital if P&L changed
    if (pnlDiff !== 0) {
      this.updateAccountCapital(trade.accountId, pnlDiff)
    }

    return this.getTradeById(id)
  }

  deleteTrade(id: string): boolean {
    if (!this.db) return false
    
    const trade = this.getTradeById(id)
    if (trade) {
      // Reverse the P&L from account
      this.updateAccountCapital(trade.accountId, -trade.pnlAmount)
    }

    const stmt = this.db.prepare('DELETE FROM trades WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  private updateAccountCapital(accountId: string, pnlAmount: number): void {
    const account = this.getAccountById(accountId)
    if (!account) return

    const newCapital = account.currentCapital + pnlAmount
    const profitAmount = newCapital - account.initialCapital
    const profitPercent = account.initialCapital > 0 ? (profitAmount / account.initialCapital) * 100 : 0
    
    // Calculate drawdown
    let currentDrawdownAmount = 0
    if (profitAmount < 0) {
      currentDrawdownAmount = Math.abs(profitAmount)
    }

    // Determine status
    let status = account.status
    if (currentDrawdownAmount >= account.maxDrawdownAmount) {
      status = 'lost'
    } else if (profitAmount >= account.targetAmount) {
      status = 'validated'
    }

    this.updateAccount(accountId, {
      currentCapital: newCapital,
      profitAmount,
      profitPercent,
      currentDrawdownAmount,
      status
    })
  }

  // Helper function to normalize journal entry data
  private normalizeJournalEntry(entry: any): any {
    if (!entry) return null
    return {
      ...entry,
      references: entry.references_text || null,
      tags: typeof entry.tags === 'string' ? JSON.parse(entry.tags || '[]') : entry.tags
    }
  }

  private normalizeJournalEntries(entries: any[]): any[] {
    return entries.map(e => this.normalizeJournalEntry(e))
  }

  // Journal Entries CRUD
  getAllJournalEntries(filters?: any): any[] {
    if (!this.db) return []
    
    let query = 'SELECT * FROM journal_entries'
    const params: any[] = []

    if (filters) {
      const conditions: string[] = []
      
      if (filters.startDate) {
        conditions.push('date >= ?')
        params.push(filters.startDate)
      }
      if (filters.endDate) {
        conditions.push('date <= ?')
        params.push(filters.endDate)
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
    }

    query += ' ORDER BY date DESC, createdAt DESC'

    const stmt = this.db.prepare(query)
    const entries = stmt.all(...params)
    return this.normalizeJournalEntries(entries)
  }

  createJournalEntry(data: any): any {
    if (!this.db) throw new Error('Database not initialized')
    
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO journal_entries (
        id, date, title, content, mentalState, disciplineScore,
        focusScore, confidence, tradingPlans, setupsIdentified,
        lessonsLearned, marketCondition, pnlSummary, nextActions,
        references_text, tags, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.date,
      data.title || null,
      data.content,
      data.mentalState || null,
      data.disciplineScore || null,
      data.focusScore || null,
      data.confidence || null,
      data.tradingPlans || null,
      data.setupsIdentified || null,
      data.lessonsLearned || null,
      data.marketCondition || null,
      data.pnlSummary || null,
      data.nextActions || null,
      data.references || null,
      data.tags ? JSON.stringify(data.tags) : null,
      now,
      now
    )

    const stmt2 = this.db.prepare('SELECT * FROM journal_entries WHERE id = ?')
    return this.normalizeJournalEntry(stmt2.get(id))
  }

  updateJournalEntry(id: string, data: any): any {
    if (!this.db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const entry = this.getAllJournalEntries().find(e => e.id === id)
    if (!entry) throw new Error('Journal entry not found')

    const stmt = this.db.prepare(`
      UPDATE journal_entries SET
        date = ?,
        title = ?,
        content = ?,
        mentalState = ?,
        disciplineScore = ?,
        focusScore = ?,
        confidence = ?,
        tradingPlans = ?,
        setupsIdentified = ?,
        lessonsLearned = ?,
        marketCondition = ?,
        pnlSummary = ?,
        nextActions = ?,
        references_text = ?,
        tags = ?,
        updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      data.date !== undefined ? data.date : entry.date,
      data.title !== undefined ? data.title : entry.title,
      data.content !== undefined ? data.content : entry.content,
      data.mentalState !== undefined ? data.mentalState : entry.mentalState,
      data.disciplineScore !== undefined ? data.disciplineScore : entry.disciplineScore,
      data.focusScore !== undefined ? data.focusScore : entry.focusScore,
      data.confidence !== undefined ? data.confidence : entry.confidence,
      data.tradingPlans !== undefined ? data.tradingPlans : entry.tradingPlans,
      data.setupsIdentified !== undefined ? data.setupsIdentified : entry.setupsIdentified,
      data.lessonsLearned !== undefined ? data.lessonsLearned : entry.lessonsLearned,
      data.marketCondition !== undefined ? data.marketCondition : entry.marketCondition,
      data.pnlSummary !== undefined ? data.pnlSummary : entry.pnlSummary,
      data.nextActions !== undefined ? data.nextActions : entry.nextActions,
      data.references !== undefined ? data.references : entry.references,
      data.tags !== undefined ? JSON.stringify(data.tags) : (typeof entry.tags === 'string' ? entry.tags : JSON.stringify(entry.tags)),
      now,
      id
    )

    const stmt2 = this.db.prepare('SELECT * FROM journal_entries WHERE id = ?')
    return this.normalizeJournalEntry(stmt2.get(id))
  }

  deleteJournalEntry(id: string): boolean {
    if (!this.db) return false
    const stmt = this.db.prepare('DELETE FROM journal_entries WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  // Screenshots
  saveScreenshot(tradeId: string, imageData: string): any {
    if (!this.db) throw new Error('Database not initialized')
    
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO screenshots (id, tradeId, imageData, createdAt)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(id, tradeId, imageData, now)

    const stmt2 = this.db.prepare('SELECT * FROM screenshots WHERE id = ?')
    return stmt2.get(id)
  }

  getScreenshotsByTrade(tradeId: string): any[] {
    if (!this.db) return []
    const stmt = this.db.prepare('SELECT * FROM screenshots WHERE tradeId = ? ORDER BY createdAt DESC')
    return stmt.all(tradeId)
  }

  deleteScreenshot(id: string): boolean {
    if (!this.db) return false
    const stmt = this.db.prepare('DELETE FROM screenshots WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  // Helper pour construire les clauses WHERE
  private buildFiltersWhereClause(filters?: any, prefix: string = '') {
    const conditions: string[] = []
    const params: any[] = []

    if (filters) {
      if (filters.accountId) {
        conditions.push(`${prefix}accountId = ?`)
        params.push(filters.accountId)
      }
      if (filters.startDate) {
        conditions.push(`${prefix}date >= ?`)
        params.push(filters.startDate)
      }
      if (filters.endDate) {
        conditions.push(`${prefix}date <= ?`)
        params.push(filters.endDate)
      }
    }

    return {
      whereClause: conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '',
      andClause: conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '',
      conditions,
      params
    }
  }

  // Statistics
  getDashboardStats(filters?: any): any {
    if (!this.db) return null

    const { whereClause, andClause, conditions, params } = this.buildFiltersWhereClause(filters)

    let query = 'SELECT COUNT(*) as totalTrades, SUM(pnlAmount) as totalPnl FROM trades' + whereClause
    const tradesStats = this.db.prepare(query).get(...params) as any

    // Win rate
    let winQuery = "SELECT COUNT(*) as wins FROM trades WHERE result IN ('TP', 'GAIN', 'BE+')" + andClause
    const winStats = this.db.prepare(winQuery).get(...params) as any

    // Loss count
    let lossQuery = "SELECT COUNT(*) as losses FROM trades WHERE result IN ('SL', 'PERTE')" + andClause
    const lossStats = this.db.prepare(lossQuery).get(...params) as any

    const totalTrades = tradesStats.totalTrades || 0
    const wins = winStats.wins || 0
    const losses = lossStats.losses || 0
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

    // Current drawdown
    const accountId = filters?.accountId
    const account = accountId ? this.getAccountById(accountId) : null
    const currentDrawdown = account ? account.currentDrawdownAmount : 0
    const maxDrawdown = account ? account.maxDrawdownAmount : 0

    return {
      totalTrades,
      totalPnl: tradesStats.totalPnl || 0,
      winRate,
      wins,
      losses,
      currentDrawdown,
      maxDrawdown,
      drawdownPercent: maxDrawdown > 0 ? (currentDrawdown / maxDrawdown) * 100 : 0
    }
  }

  getAdvancedStats(filters?: any): any {
    if (!this.db) return null

    const { whereClause, andClause, params } = this.buildFiltersWhereClause(filters)

    // Average win/loss
    const avgWin = this.db.prepare(`
      SELECT AVG(pnlAmount) as avg FROM trades 
      ${whereClause ? whereClause + ' AND' : 'WHERE'} pnlAmount > 0
    `).get(...params) as any

    const avgLoss = this.db.prepare(`
      SELECT AVG(pnlAmount) as avg FROM trades 
      ${whereClause ? whereClause + ' AND' : 'WHERE'} pnlAmount < 0
    `).get(...params) as any

    // Profit factor
    const grossProfit = this.db.prepare(`
      SELECT SUM(pnlAmount) as sum FROM trades 
      ${whereClause ? whereClause + ' AND' : 'WHERE'} pnlAmount > 0
    `).get(...params) as any

    const grossLoss = this.db.prepare(`
      SELECT SUM(ABS(pnlAmount)) as sum FROM trades 
      ${whereClause ? whereClause + ' AND' : 'WHERE'} pnlAmount < 0
    `).get(...params) as any

    const profitFactor = grossLoss.sum > 0 ? (grossProfit.sum || 0) / grossLoss.sum : grossProfit.sum || 0

    // Expectancy
    const winRate = this.getDashboardStats(filters)?.winRate || 0
    const avgWinAmount = avgWin.avg || 0
    const avgLossAmount = Math.abs(avgLoss.avg || 0)
    const expectancy = (winRate / 100) * avgWinAmount - (1 - winRate / 100) * avgLossAmount

    // Consecutive wins/losses
    const trades = this.db.prepare(`
      SELECT result FROM trades ${whereClause} ORDER BY date DESC, createdAt DESC
    `).all(...params) as any[]

    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0
    let currentStreak = 0
    let currentStreakType = ''

    for (const trade of trades) {
      const isWin = ['TP', 'GAIN', 'BE+'].includes(trade.result)
      const isLoss = ['SL', 'PERTE', 'BE-'].includes(trade.result)

      if (isWin) {
        if (currentStreakType === 'win') {
          currentStreak++
        } else {
          currentStreak = 1
          currentStreakType = 'win'
        }
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentStreak)
      } else if (isLoss) {
        if (currentStreakType === 'loss') {
          currentStreak++
        } else {
          currentStreak = 1
          currentStreakType = 'loss'
        }
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak)
      }
    }

    return {
      avgWin: avgWinAmount,
      avgLoss: avgLossAmount,
      profitFactor,
      expectancy,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      grossProfit: grossProfit.sum || 0,
      grossLoss: grossLoss.sum || 0
    }
  }

  getEquityCurve(filters?: any): any[] {
    if (!this.db) return []

    const { whereClause, params } = this.buildFiltersWhereClause(filters)

    const query = `
      SELECT date, pnlAmount 
      FROM trades 
      ${whereClause}
      ORDER BY date ASC, createdAt ASC
    `

    const trades = this.db.prepare(query).all(...params) as any[]
    
    const accountId = filters?.accountId
    const account = accountId ? this.getAccountById(accountId) : null
    let initialCapital = account ? account.initialCapital : 100000
    
    const result: any[] = []
    
    // If there are trades, add initial point before the first trade
    if (trades.length > 0) {
      const firstTradeDate = trades[0].date
      result.push({
        date: firstTradeDate,
        equity: Math.round(initialCapital * 100) / 100,
        pnl: 0
      })
    }
    
    // Add points for each trade
    let equity = initialCapital
    trades.forEach(trade => {
      equity += trade.pnlAmount
      result.push({
        date: trade.date,
        equity: Math.round(equity * 100) / 100,
        pnl: trade.pnlAmount
      })
    })
    
    return result
  }

  getMonthlyPerformance(filters?: any): any[] {
    if (!this.db) return []

    const { whereClause, params } = this.buildFiltersWhereClause(filters)

    const results = this.db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COUNT(*) as trades,
        SUM(pnlAmount) as pnl,
        SUM(CASE WHEN pnlAmount > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN pnlAmount < 0 THEN 1 ELSE 0 END) as losses
      FROM trades
      ${whereClause}
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
    `).all(...params) as any[]

    return results.map(r => ({
      month: r.month,
      trades: r.trades,
      pnl: r.pnl || 0,
      wins: r.wins,
      losses: r.losses,
      winRate: r.trades > 0 ? (r.wins / r.trades) * 100 : 0
    }))
  }

  getDayPerformance(filters?: any): any[] {
    if (!this.db) return []

    const { whereClause, params } = this.buildFiltersWhereClause(filters)

    const results = this.db.prepare(`
      SELECT 
        CAST(strftime('%w', date) as INTEGER) as dayOfWeek,
        COUNT(*) as trades,
        SUM(pnlAmount) as pnl,
        SUM(CASE WHEN pnlAmount > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN pnlAmount < 0 THEN 1 ELSE 0 END) as losses,
        AVG(pnlAmount) as avgPnl
      FROM trades
      ${whereClause}
      GROUP BY strftime('%w', date)
      ORDER BY dayOfWeek
    `).all(...params) as any[]

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

    return results.map(r => ({
      day: dayNames[r.dayOfWeek],
      dayOfWeek: r.dayOfWeek,
      trades: r.trades,
      pnl: r.pnl || 0,
      wins: r.wins,
      losses: r.losses,
      winRate: r.trades > 0 ? (r.wins / r.trades) * 100 : 0,
      avgPnl: r.avgPnl || 0
    }))
  }

  getHourPerformance(filters?: any): any[] {
    if (!this.db) return []

    let { whereClause, params } = this.buildFiltersWhereClause(filters)
    
    if (whereClause) {
      whereClause += ' AND createdDateTime IS NOT NULL'
    } else {
      whereClause = 'WHERE createdDateTime IS NOT NULL'
    }

    const results = this.db.prepare(`
      SELECT 
        CAST(strftime('%H', createdDateTime) as INTEGER) as hour,
        COUNT(*) as trades,
        SUM(pnlAmount) as pnl,
        SUM(CASE WHEN pnlAmount > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN pnlAmount < 0 THEN 1 ELSE 0 END) as losses,
        AVG(pnlAmount) as avgPnl
      FROM trades
      ${whereClause}
      GROUP BY strftime('%H', createdDateTime)
      ORDER BY hour
    `).all(...params) as any[]

    return results.map(r => ({
      hour: `${String(r.hour).padStart(2, '0')}:00`,
      hourNum: r.hour,
      trades: r.trades,
      pnl: r.pnl || 0,
      wins: r.wins,
      losses: r.losses,
      winRate: r.trades > 0 ? (r.wins / r.trades) * 100 : 0,
      avgPnl: r.avgPnl || 0
    }))
  }

  getAllTradesForExport(accountId?: string): any[] {
    return this.getAllTrades(accountId ? { accountId } : undefined)
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}
