import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

/**
 * Supabase client configuration for GreenOps AI
 * Handles authentication, database operations, and real-time subscriptions
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://viuthldgizphvrvueppf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdXRobGRnaXpwaHZydnVlcHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjMxOTEsImV4cCI6MjA3MTczOTE5MX0.62IVqt5K4g1Euk5RlVk5cZ-hb9-7ASvFWFhWSCBpGOU'

/**
 * Main Supabase client instance
 * Configured with auth options for optimal user experience
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Supabase storage client for file uploads and management
 * Used for storing reports, exports, and user uploads
 */
export const supabaseStorage = supabase.storage

/**
 * Supabase functions client for serverless operations
 * Used for cost calculations, carbon footprint analysis, and data processing
 */
export const supabaseFunctions = supabase.functions

/**
 * Helper function to get the current user session
 * @returns Promise<Session | null> - Current user session or null if not authenticated
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

/**
 * Helper function to get the current user
 * @returns Promise<User | null> - Current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

/**
 * Helper function to sign out the current user
 * @returns Promise<{ error: AuthError | null }> - Sign out result
 */
export const signOut = async () => {
  return await supabase.auth.signOut()
}

/**
 * Type-safe database client with full TypeScript support
 * Provides autocomplete and type checking for all database operations
 */
export type SupabaseClient = typeof supabase

/**
 * Database types for type-safe operations
 */
export type { Database } from '@/types/supabase'
