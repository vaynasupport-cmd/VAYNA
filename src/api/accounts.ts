import { supabase } from '@/lib/supabaseClient'
import type { Account } from '@/types'

// Map Supabase snake_case rows → camelCase types
export function mapAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    propFirm: row.prop_firm,
    initialCapital: row.initial_capital,
    currentCapital: row.current_capital,
    maxDrawdownPercent: row.max_drawdown_percent,
    maxDrawdownAmount: row.max_drawdown_amount,
    currentDrawdownAmount: row.current_drawdown_amount,
    targetPercent: row.target_percent,
    targetAmount: row.target_amount,
    profitPercent: row.profit_percent,
    profitAmount: row.profit_amount,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) throw error
  return (data || []).map(mapAccount)
}

export async function createAccount(userId: string, data: Partial<Account>) {
  const { data: row, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name: data.name!,
      prop_firm: data.propFirm ?? null,
      initial_capital: data.initialCapital ?? 0,
      current_capital: data.currentCapital ?? data.initialCapital ?? 0,
      max_drawdown_percent: data.maxDrawdownPercent ?? 0,
      max_drawdown_amount: data.maxDrawdownAmount ?? 0,
      current_drawdown_amount: data.currentDrawdownAmount ?? 0,
      target_percent: data.targetPercent ?? 0,
      target_amount: data.targetAmount ?? 0,
      profit_percent: data.profitPercent ?? 0,
      profit_amount: data.profitAmount ?? 0,
      status: data.status ?? 'active',
    })
    .select()
    .single()
    
  if (error) throw error
  return mapAccount(row)
}

export async function updateAccount(id: string, data: Partial<Account>) {
  const update: Record<string, any> = {}
  if (data.name !== undefined) update.name = data.name
  if (data.propFirm !== undefined) update.prop_firm = data.propFirm
  if (data.initialCapital !== undefined) update.initial_capital = data.initialCapital
  if (data.currentCapital !== undefined) update.current_capital = data.currentCapital
  if (data.maxDrawdownPercent !== undefined) update.max_drawdown_percent = data.maxDrawdownPercent
  if (data.maxDrawdownAmount !== undefined) update.max_drawdown_amount = data.maxDrawdownAmount
  if (data.currentDrawdownAmount !== undefined) update.current_drawdown_amount = data.currentDrawdownAmount
  if (data.targetPercent !== undefined) update.target_percent = data.targetPercent
  if (data.targetAmount !== undefined) update.target_amount = data.targetAmount
  if (data.profitPercent !== undefined) update.profit_percent = data.profitPercent
  if (data.profitAmount !== undefined) update.profit_amount = data.profitAmount
  if (data.status !== undefined) update.status = data.status
  update.updated_at = new Date().toISOString()

  const { data: row, error } = await supabase
    .from('accounts')
    .update(update)
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  return mapAccount(row)
}

export async function deleteAccount(id: string) {
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) throw error
  return id
}
