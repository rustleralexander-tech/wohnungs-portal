import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser (use anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side operations (use service role key)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey)

// Database types (for TypeScript)
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          name: string
          description: string
          address: string
          images: string[] | null
          capacity: number
          rules: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['properties']['Row']>
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          guest_name: string
          email: string
          phone: string
          check_in: string
          check_out: string
          status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'
          total_price: number | null
          payment_method: 'bank_transfer' | 'stripe' | 'paypal' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Row']>
      }
      guests: {
        Row: {
          id: string
          email: string
          phone: string
          document_type: string
          document_url: string | null
          document_verified: boolean
          contract_url: string | null
          contract_signed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['guests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['guests']['Row']>
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          method: 'bank_transfer' | 'stripe' | 'paypal'
          status: 'pending' | 'completed' | 'failed'
          transaction_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Row']>
      }
    }
  }
}
