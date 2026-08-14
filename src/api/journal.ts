import { supabase } from '@/lib/supabaseClient'
import type { JournalEntry } from '@/types'

// Map Supabase snake_case rows → camelCase types
export function mapJournalEntry(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    content: row.content,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getJournalEntries() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false })
    
  if (error) throw error
  return (data || []).map(mapJournalEntry)
}

export async function createJournalEntry(userId: string, data: Partial<JournalEntry>) {
  const { data: row, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      date: data.date!,
      title: data.title ?? '',
      content: data.content ?? '',
      tags: data.tags ?? [],
    })
    .select()
    .single()
    
  if (error) throw error
  return mapJournalEntry(row)
}

export async function updateJournalEntry(id: string, data: Partial<JournalEntry>) {
  const update: Record<string, any> = { updated_at: new Date().toISOString() }
  if (data.date !== undefined) update.date = data.date
  if (data.title !== undefined) update.title = data.title
  if (data.content !== undefined) update.content = data.content
  if (data.tags !== undefined) update.tags = data.tags

  const { data: row, error } = await supabase
    .from('journal_entries')
    .update(update)
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  return mapJournalEntry(row)
}

export async function deleteJournalEntry(id: string) {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id)
  if (error) throw error
  return id
}
