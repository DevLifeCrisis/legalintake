import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'attorney' | 'staff' | 'client'
          firm_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      matters: {
        Row: {
          id: string
          firm_id: string
          client_name: string
          client_email: string
          practice_area: string
          status: 'intake' | 'active' | 'closed' | 'conflict'
          intake_data: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['matters']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['matters']['Insert']>
      }
      questionnaires: {
        Row: {
          id: string
          firm_id: string
          name: string
          practice_area: string
          fields: QuestionnaireField[]
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['questionnaires']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['questionnaires']['Insert']>
      }
      documents: {
        Row: {
          id: string
          matter_id: string
          name: string
          type: 'upload' | 'engagement_letter'
          storage_path: string
          signed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      conflict_entries: {
        Row: {
          id: string
          firm_id: string
          name: string
          email: string | null
          phone: string | null
          matter_description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conflict_entries']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['conflict_entries']['Insert']>
      }
    }
  }
}

export type QuestionnaireField = {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'email' | 'phone' | 'number'
  required: boolean
  options?: string[]
  conditional?: {
    field: string
    value: string
  }
}
