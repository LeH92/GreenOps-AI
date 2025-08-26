export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      providers: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'openai' | 'aws' | 'gcp' | 'azure'
          api_key_encrypted: string
          config: Json
          is_active: boolean
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'openai' | 'aws' | 'gcp' | 'azure'
          api_key_encrypted: string
          config?: Json
          is_active?: boolean
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'openai' | 'aws' | 'gcp' | 'azure'
          api_key_encrypted?: string
          config?: Json
          is_active?: boolean
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cost_records: {
        Row: {
          id: string
          provider_id: string
          service: string
          cost_usd: number
          currency: string
          timestamp: string
          period: string
          region: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          service: string
          cost_usd: number
          currency?: string
          timestamp: string
          period: string
          region?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          service?: string
          cost_usd?: number
          currency?: string
          timestamp?: string
          period?: string
          region?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_records_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          currency: string
          period: 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string
          alert_thresholds: number[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          currency?: string
          period: 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string
          alert_thresholds?: number[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          currency?: string
          period?: 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string
          alert_thresholds?: number[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_events: {
        Row: {
          id: string
          provider_id: string
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          requests_count: number
          cost_usd: number
          carbon_grams: number
          timestamp: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          requests_count: number
          cost_usd: number
          carbon_grams: number
          timestamp: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          model?: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          requests_count?: number
          cost_usd?: number
          carbon_grams?: number
          timestamp?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          }
        ]
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          budget_id: string | null
          type: string
          title: string
          message: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          threshold_value: number
          actual_value: number
          is_read: boolean
          is_sent: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          budget_id?: string | null
          type: string
          title: string
          message: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          threshold_value: number
          actual_value: number
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget_id?: string | null
          type?: string
          title?: string
          message?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          threshold_value?: number
          actual_value?: number
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Type aliases for common database operations
 */
export type Provider = Database['public']['Tables']['providers']['Row']
export type ProviderInsert = Database['public']['Tables']['providers']['Insert']
export type ProviderUpdate = Database['public']['Tables']['providers']['Update']

export type CostRecord = Database['public']['Tables']['cost_records']['Row']
export type CostRecordInsert = Database['public']['Tables']['cost_records']['Insert']
export type CostRecordUpdate = Database['public']['Tables']['cost_records']['Update']

export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']

export type UsageEvent = Database['public']['Tables']['usage_events']['Row']
export type UsageEventInsert = Database['public']['Tables']['usage_events']['Insert']
export type UsageEventUpdate = Database['public']['Tables']['usage_events']['Update']

export type Alert = Database['public']['Tables']['alerts']['Row']
export type AlertInsert = Database['public']['Tables']['alerts']['Insert']
export type AlertUpdate = Database['public']['Tables']['alerts']['Update']
