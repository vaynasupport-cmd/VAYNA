import { supabase } from '@/lib/supabaseClient'
import type { Trade } from '@/types'

// Map Supabase snake_case rows → camelCase types
export function mapTrade(row: any): Trade {
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

export async function getTrades() {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('date', { ascending: false })
    
  if (error) throw error
  return (data || []).map(mapTrade)
}

export async function createTrade(userId: string, data: Partial<Trade>) {
  const { data: row, error } = await supabase
    .from('trades')
    .insert({
      user_id: userId,
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
  return mapTrade(row)
}

export async function createTrades(userId: string, tradesData: Partial<Trade>[]) {
  if (tradesData.length === 0) return []
  const inserts = tradesData.map(data => ({
      user_id: userId,
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
  return rows.map(mapTrade)
}

export async function updateTrade(id: string, data: Partial<Trade>) {
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
  return mapTrade(row)
}

export async function deleteTrade(id: string) {
  const { error } = await supabase.from('trades').delete().eq('id', id)
  if (error) throw error
  return id
}

export async function deleteAllTrades(userId: string) {
  const { error } = await supabase.from('trades').delete().eq('user_id', userId)
  if (error) throw error
}

// ─── SCREENSHOTS ────────────────────────────────────────────────────────────
export async function saveScreenshot(userId: string, tradeId: string, imageData: string) {
  const { data: row, error } = await supabase
    .from('screenshots')
    .insert({ user_id: userId, trade_id: tradeId, image_data: imageData })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function getScreenshots(tradeId: string) {
  try {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true })
      
    if (error) throw error
    return data || []
  } catch (err: any) {
    if (err?.code === 'PGRST205' || err?.status === 404) {
      return []
    }
    throw err
  }
}

export async function deleteScreenshot(id: string) {
  const { error } = await supabase.from('screenshots').delete().eq('id', id)
  if (error) throw error
  return id
}
