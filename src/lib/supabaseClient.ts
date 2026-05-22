import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          prop_firm: string | null
          initial_capital: number
          current_capital: number
          max_drawdown_percent: number
          max_drawdown_amount: number
          current_drawdown_amount: number
          target_percent: number
          target_amount: number
          profit_percent: number
          profit_amount: number
          status: 'active' | 'lost' | 'validated'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>
      }
      trades: {
        Row: {
          id: string
          user_id: string
          account_id: string
          date: string
          created_date_time: string | null
          asset: string
          timeframe: string
          direction: 'BUY' | 'SELL'
          risk_percent: number
          entry_price: number | null
          exit_price: number | null
          stop_loss: number | null
          take_profit: number | null
          position_size: number | null
          result: 'TP' | 'SL' | 'BE' | 'GAIN' | 'PERTE' | 'BE+' | 'BE-'
          pnl_amount: number
          pnl_percent: number
          r_multiple: number | null
          commission: number | null
          comment: string | null
          emotional_tag: string | null
          strategy: string | null
          setup_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['trades']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['trades']['Insert']>
      }
      screenshots: {
        Row: {
          id: string
          user_id: string
          trade_id: string
          image_data: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['screenshots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['screenshots']['Insert']>
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          title: string | null
          content: string
          mental_state: string | null
          discipline_score: number | null
          focus_score: number | null
          confidence: number | null
          trading_plans: string | null
          setups_identified: string | null
          lessons_learned: string | null
          market_condition: string | null
          pnl_summary: string | null
          next_actions: string | null
          references: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['journal_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>
      }
    }
  }
}
