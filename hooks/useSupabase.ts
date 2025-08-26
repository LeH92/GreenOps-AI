'use client'

import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { 
  CostMetrics, 
  ProviderConnection, 
  Budget, 
  BudgetAlert,
  ProviderType,
  AlertSeverity 
} from '@/types/greenops'
import type { 
  Provider, 
  CostRecord, 
  Budget as BudgetRow, 
  Alert as AlertRow 
} from '@/types/supabase'

/**
 * Authentication hook for Supabase
 * Manages user authentication state and provides auth methods
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  }

  /**
   * Sign in with GitHub OAuth
   */
  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGitHub,
    signOut
  }
}

/**
 * Data management hook for Supabase
 * Provides methods to fetch and manage GreenOps AI data
 */
export const useSupabaseData = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get cost metrics for a user
   */
  const getCostMetrics = async (userId: string): Promise<CostMetrics> => {
    setLoading(true)
    setError(null)

    try {
      // Get cost records for the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: costRecords, error: costError } = await supabase
        .from('cost_records')
        .select(`
          *,
          providers!inner(user_id)
        `)
        .eq('providers.user_id', userId)
        .gte('timestamp', thirtyDaysAgo.toISOString())

      if (costError) throw costError

      // Get usage events for the same period
      const { data: usageEvents, error: usageError } = await supabase
        .from('usage_events')
        .select(`
          *,
          providers!inner(user_id)
        `)
        .eq('providers.user_id', userId)
        .gte('timestamp', thirtyDaysAgo.toISOString())

      if (usageError) throw usageError

      // Calculate metrics
      const totalCost = costRecords?.reduce((sum, record) => sum + record.cost_usd, 0) || 0
      const totalTokens = usageEvents?.reduce((sum, event) => sum + event.total_tokens, 0) || 0
      const totalRequests = usageEvents?.reduce((sum, event) => sum + event.requests_count, 0) || 0
      const carbonFootprint = usageEvents?.reduce((sum, event) => sum + event.carbon_grams, 0) || 0

      // Calculate trend (simplified - would need previous period data)
      const trend = 0 // TODO: Implement trend calculation

      return {
        totalCost,
        totalTokens,
        totalRequests,
        carbonFootprint: carbonFootprint / 1000, // Convert to kg
        trend,
        currency: 'USD',
        period: 'monthly'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost metrics')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get provider connections for a user
   */
  const getProviders = async (userId: string): Promise<ProviderConnection[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data: providers, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      // Transform to ProviderConnection format
      const connections: ProviderConnection[] = providers?.map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type as ProviderType,
        status: provider.is_active ? 'connected' : 'disconnected',
        lastSync: provider.last_sync_at ? new Date(provider.last_sync_at) : null,
        monthlyCost: 0, // TODO: Calculate from cost_records
        isActive: provider.is_active,
        config: provider.config as Record<string, any>
      })) || []

      return connections
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get budgets for a user
   */
  const getBudgets = async (userId: string): Promise<Budget[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) throw error

      // Transform to Budget format
      const transformedBudgets: Budget[] = budgets?.map(budget => {
        const currentSpend = 0 // TODO: Calculate from cost_records
        const percentUsed = (currentSpend / budget.amount) * 100

        return {
          id: budget.id,
          name: budget.name,
          amount: budget.amount,
          currency: budget.currency,
          period: budget.period,
          startDate: new Date(budget.start_date),
          endDate: new Date(budget.end_date),
          currentSpend,
          percentUsed,
          alertThresholds: budget.alert_thresholds,
          status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'healthy',
          isActive: budget.is_active,
          providers: [], // TODO: Get associated providers
          trend: 0, // TODO: Calculate trend
          createdAt: new Date(budget.created_at),
          updatedAt: new Date(budget.updated_at)
        }
      }) || []

      return transformedBudgets
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get budget alerts for a user
   */
  const getAlerts = async (userId: string): Promise<BudgetAlert[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data: alerts, error } = await supabase
        .from('alerts')
        .select(`
          *,
          budgets(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform to BudgetAlert format
      const budgetAlerts: BudgetAlert[] = alerts?.map(alert => ({
        id: alert.id,
        budgetName: (alert.budgets as any)?.name || 'Unknown Budget',
        currentSpend: alert.actual_value,
        budgetAmount: alert.threshold_value,
        threshold: (alert.actual_value / alert.threshold_value) * 100,
        severity: alert.severity as AlertSeverity,
        message: alert.message,
        isRead: alert.is_read,
        createdAt: new Date(alert.created_at),
        type: alert.type
      })) || []

      return budgetAlerts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new provider connection
   */
  const createProvider = async (providerData: {
    name: string
    type: ProviderType
    apiKey: string
    config?: Record<string, any>
  }) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('providers')
        .insert({
          name: providerData.name,
          type: providerData.type,
          api_key_encrypted: providerData.apiKey, // TODO: Encrypt API key
          config: providerData.config || {},
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new budget
   */
  const createBudget = async (budgetData: {
    name: string
    amount: number
    period: 'monthly' | 'quarterly' | 'yearly'
    startDate: Date
    endDate: Date
    alertThresholds: number[]
  }) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          name: budgetData.name,
          amount: budgetData.amount,
          period: budgetData.period,
          start_date: budgetData.startDate.toISOString().split('T')[0],
          end_date: budgetData.endDate.toISOString().split('T')[0],
          alert_thresholds: budgetData.alertThresholds,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getCostMetrics,
    getProviders,
    getBudgets,
    getAlerts,
    createProvider,
    createBudget
  }
}
