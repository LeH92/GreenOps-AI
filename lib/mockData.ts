import costData from '@/data/mock-costs.json'
import providerData from '@/data/mock-providers.json'
import budgetData from '@/data/mock-budgets.json'
import usageData from '@/data/mock-usage.json'

import type {
  CostMetrics,
  ProviderConnection,
  Budget,
  BudgetAlert,
  CostChartData,
  UsageChartData,
  ProviderType,
  AlertSeverity
} from '@/types/greenops'

/**
 * Check if we're in dry run mode (using mock data)
 * Can be controlled via NODE_ENV or DRY_RUN environment variable
 */
export const isDryRun = process.env.NODE_ENV === 'development' || process.env.DRY_RUN === 'true'

/**
 * Simulate loading delay for realistic user experience
 * @param data - Data to return after delay
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Promise with the data
 */
export const simulateLoading = async <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

/**
 * Get mock cost metrics calculated from cost data
 * @returns Promise<CostMetrics> - Aggregated cost metrics
 */
export const getMockCostMetrics = async (): Promise<CostMetrics> => {
  const currentMonth = costData.monthlyTotals.currentMonth
  const previousMonth = costData.monthlyTotals.previousMonth
  
  // Calculate trend percentage
  const trend = ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
  
  // Calculate total tokens and requests from usage data
  const totalTokens = usageData.serviceBreakdown.openai.tokens
  const totalRequests = Object.values(usageData.serviceBreakdown).reduce((sum, service) => sum + service.requests, 0)
  
  return {
    totalCost: currentMonth.total,
    totalTokens,
    totalRequests,
    carbonFootprint: currentMonth.carbonKg,
    trend,
    currency: 'USD',
    period: 'monthly'
  }
}

/**
 * Transform provider data to ProviderConnection format
 * @returns Promise<ProviderConnection[]> - Array of provider connections
 */
export const getMockProviders = async (): Promise<ProviderConnection[]> => {
  return providerData.providers.map(provider => ({
    id: provider.id,
    name: provider.name,
    type: provider.type as ProviderType,
    status: provider.status as 'connected' | 'disconnected' | 'error',
    lastSync: provider.lastSync ? new Date(provider.lastSync) : null,
    monthlyCost: provider.monthlyCost,
    isActive: provider.isActive,
    config: provider.config,
    errorMessage: provider.errorMessage || undefined
  }))
}

/**
 * Transform budget data to Budget format
 * @returns Promise<Budget[]> - Array of budgets
 */
export const getMockBudgets = async (): Promise<Budget[]> => {
  return budgetData.budgets.map(budget => ({
    id: budget.id,
    name: budget.name,
    amount: budget.amount,
    currency: budget.currency,
    period: budget.period as 'monthly' | 'quarterly' | 'yearly',
    startDate: new Date(budget.startDate),
    endDate: new Date(budget.endDate),
    currentSpend: budget.currentSpend,
    percentUsed: budget.percentUsed,
    alertThresholds: budget.alertThresholds,
    status: budget.status as 'healthy' | 'warning' | 'exceeded',
    isActive: budget.isActive,
    providers: budget.providers,
    trend: budget.trend,
    createdAt: new Date(budget.createdAt),
    updatedAt: new Date(budget.updatedAt)
  }))
}

/**
 * Transform alert data to BudgetAlert format
 * @returns Promise<BudgetAlert[]> - Array of budget alerts
 */
export const getMockBudgetAlerts = async (): Promise<BudgetAlert[]> => {
  return budgetData.alerts.map(alert => ({
    id: alert.id,
    budgetName: alert.budgetName,
    currentSpend: alert.currentSpend,
    budgetAmount: alert.budgetAmount,
    threshold: alert.threshold,
    severity: alert.severity as AlertSeverity,
    message: alert.message,
    isRead: alert.isRead,
    createdAt: new Date(alert.createdAt),
    type: alert.type
  }))
}

/**
 * Transform daily cost data to CostChartData format for Recharts
 * @returns Promise<CostChartData[]> - Array of cost chart data points
 */
export const getMockCostChart = async (): Promise<CostChartData[]> => {
  return costData.dailyCosts.map(day => ({
    date: day.date,
    openai: day.openai,
    aws: day.aws,
    gcp: day.gcp,
    azure: day.azure,
    total: day.total,
    carbon: day.carbonKg
  }))
}

/**
 * Transform weekly usage data to UsageChartData format for Recharts
 * @returns Promise<UsageChartData[]> - Array of usage chart data points
 */
export const getMockUsageChart = async (): Promise<UsageChartData[]> => {
  return usageData.weeklyUsage.map(day => ({
    date: day.date,
    tokens: day.tokens,
    requests: day.requests,
    cost: day.cost,
    carbon: day.carbon,
    avgLatency: day.avgLatency
  }))
}

/**
 * Get carbon footprint data
 * @returns Promise<CarbonFootprint> - Carbon footprint breakdown
 */
export const getMockCarbonFootprint = async () => {
  return usageData.carbonFootprint
}

/**
 * Get service usage breakdown
 * @returns Promise<ServiceUsage[]> - Array of service usage data
 */
export const getMockServiceUsage = async () => {
  return Object.entries(usageData.serviceBreakdown).map(([service, data]) => ({
    name: service.charAt(0).toUpperCase() + service.slice(1),
    provider: service as ProviderType,
    tokens: data.tokens,
    requests: data.requests,
    cost: data.cost,
    carbon: data.carbon,
    percentage: data.percentage
  }))
}

/**
 * Get regional data
 * @returns Promise<RegionalData[]> - Array of regional data
 */
export const getMockRegionalData = async () => {
  return usageData.regionalData
}

/**
 * Get optimization recommendations
 * @returns Promise<OptimizationRecommendation[]> - Array of optimization recommendations
 */
export const getMockOptimizationRecommendations = async () => {
  return usageData.optimizationRecommendations
}

/**
 * Format currency values
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format percentage values
 * @param value - Value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format large numbers with appropriate suffixes
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Calculate trend percentage between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Trend percentage
 */
export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Get date range for the last N days
 * @param days - Number of days to go back
 * @returns Array of date strings in YYYY-MM-DD format
 */
export const getDateRange = (days: number): string[] => {
  const dates: string[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

/**
 * Aggregate data by date range
 * @param data - Array of data points with date property
 * @param dateRange - Array of date strings
 * @param key - Property to aggregate
 * @returns Aggregated data object
 */
export const aggregateByDate = <T extends { date: string }>(
  data: T[],
  dateRange: string[],
  key: keyof Omit<T, 'date'>
): Record<string, number> => {
  const aggregated: Record<string, number> = {}
  
  dateRange.forEach(date => {
    aggregated[date] = data
      .filter(item => item.date === date)
      .reduce((sum, item) => sum + (Number(item[key]) || 0), 0)
  })
  
  return aggregated
}

/**
 * Mock data utilities for development and testing
 */
export const mockDataUtils = {
  isDryRun,
  simulateLoading,
  getMockCostMetrics,
  getMockProviders,
  getMockBudgets,
  getMockBudgetAlerts,
  getMockCostChart,
  getMockUsageChart,
  getMockCarbonFootprint,
  getMockServiceUsage,
  getMockRegionalData,
  getMockOptimizationRecommendations,
  formatCurrency,
  formatPercentage,
  formatNumber,
  calculateTrend,
  getDateRange,
  aggregateByDate
}

export default mockDataUtils
