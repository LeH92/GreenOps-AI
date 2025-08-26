/**
 * Provider types supported by GreenOps AI
 */
export enum ProviderType {
  OPENAI = 'openai',
  AWS = 'aws',
  GCP = 'gcp',
  AZURE = 'azure'
}

/**
 * Alert severity levels for budget and cost alerts
 */
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Budget status based on current spending vs budget amount
 */
export enum BudgetStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  EXCEEDED = 'exceeded'
}

/**
 * Provider connection status
 */
export type ProviderStatus = 'connected' | 'disconnected' | 'error'

/**
 * Cost metrics for dashboard overview
 * Aggregated data across all providers
 */
export interface CostMetrics {
  /** Total cost in USD for the current period */
  totalCost: number
  /** Total tokens consumed across all AI services */
  totalTokens: number
  /** Total number of API requests made */
  totalRequests: number
  /** Carbon footprint in kilograms CO2 equivalent */
  carbonFootprint: number
  /** Percentage change from previous period */
  trend: number
  /** Currency used for cost calculations */
  currency: string
  /** Period this data represents (e.g., 'monthly', 'weekly') */
  period: string
}

/**
 * Provider connection information
 * Represents a connected cloud or AI service provider
 */
export interface ProviderConnection {
  /** Unique identifier for the provider connection */
  id: string
  /** Display name for the provider */
  name: string
  /** Type of provider (OpenAI, AWS, GCP, Azure) */
  type: ProviderType
  /** Current connection status */
  status: ProviderStatus
  /** Last successful data synchronization */
  lastSync: Date | null
  /** Monthly cost for this provider */
  monthlyCost: number
  /** Error message if connection failed */
  errorMessage?: string
  /** Provider-specific configuration */
  config?: Record<string, any>
  /** Whether the provider is currently active */
  isActive: boolean
}

/**
 * Budget alert information
 * Generated when spending approaches or exceeds budget thresholds
 */
export interface BudgetAlert {
  /** Unique identifier for the alert */
  id: string
  /** Name of the budget that triggered the alert */
  budgetName: string
  /** Current spending amount */
  currentSpend: number
  /** Total budget amount */
  budgetAmount: number
  /** Threshold percentage that triggered the alert */
  threshold: number
  /** Alert severity level */
  severity: AlertSeverity
  /** Human-readable alert message */
  message: string
  /** Whether the alert has been read by the user */
  isRead: boolean
  /** Alert creation timestamp */
  createdAt: Date
  /** Alert type (budget_threshold, cost_spike, usage_anomaly) */
  type: string
}

/**
 * Budget information
 * Represents a spending budget for cost management
 */
export interface Budget {
  /** Unique identifier for the budget */
  id: string
  /** Display name for the budget */
  name: string
  /** Total budget amount */
  amount: number
  /** Currency for the budget */
  currency: string
  /** Budget period (monthly, quarterly, yearly) */
  period: 'monthly' | 'quarterly' | 'yearly'
  /** Budget start date */
  startDate: Date
  /** Budget end date */
  endDate: Date
  /** Current spending amount */
  currentSpend: number
  /** Percentage of budget used */
  percentUsed: number
  /** Alert threshold percentages */
  alertThresholds: number[]
  /** Current budget status */
  status: BudgetStatus
  /** Whether the budget is currently active */
  isActive: boolean
  /** Associated providers for this budget */
  providers: string[]
  /** Spending trend percentage */
  trend: number
  /** Budget creation timestamp */
  createdAt: Date
  /** Budget last update timestamp */
  updatedAt: Date
}

/**
 * Cost chart data for Recharts visualization
 * Daily cost breakdown by provider
 */
export interface CostChartData {
  /** Date in YYYY-MM-DD format */
  date: string
  /** OpenAI costs for this date */
  openai: number
  /** AWS costs for this date */
  aws: number
  /** GCP costs for this date */
  gcp: number
  /** Azure costs for this date */
  azure: number
  /** Total costs across all providers */
  total: number
  /** Carbon footprint for this date (kg CO2) */
  carbon: number
}

/**
 * Usage chart data for Recharts visualization
 * Daily usage metrics
 */
export interface UsageChartData {
  /** Date in YYYY-MM-DD format */
  date: string
  /** Total tokens consumed */
  tokens: number
  /** Total API requests made */
  requests: number
  /** Total cost in USD */
  cost: number
  /** Carbon footprint in kg CO2 */
  carbon: number
  /** Average response latency in milliseconds */
  avgLatency?: number
}

/**
 * Carbon footprint breakdown
 * Detailed carbon emissions by service type
 */
export interface CarbonFootprint {
  /** Total carbon footprint in kg CO2 */
  total: number
  /** Carbon emissions by service type */
  breakdown: {
    /** AI inference emissions */
    ai_inference: number
    /** Cloud compute emissions */
    cloud_compute: number
    /** Data transfer emissions */
    data_transfer: number
    /** Storage emissions */
    storage: number
  }
  /** Trend percentage from previous period */
  trend: number
  /** Carbon offset recommendations */
  offsetRecommendations: {
    /** Offset provider name */
    provider: string
    /** Cost to offset emissions */
    cost: number
    /** Offset amount in kg CO2 */
    amount: number
  }[]
}

/**
 * Service usage breakdown
 * Detailed usage metrics by service/model
 */
export interface ServiceUsage {
  /** Service or model name */
  name: string
  /** Provider type */
  provider: ProviderType
  /** Total tokens consumed */
  tokens: number
  /** Total requests made */
  requests: number
  /** Total cost in USD */
  cost: number
  /** Carbon footprint in kg CO2 */
  carbon: number
  /** Usage percentage of total */
  percentage: number
}

/**
 * Regional cost and carbon data
 * Breakdown by geographic region
 */
export interface RegionalData {
  /** Region name */
  region: string
  /** Total cost for this region */
  cost: number
  /** Carbon intensity for this region (gCO2/kWh) */
  carbonIntensity: number
  /** Carbon footprint for this region */
  carbonFootprint: number
  /** Usage percentage in this region */
  usagePercentage: number
}

/**
 * Optimization recommendation
 * Suggestions for cost and carbon reduction
 */
export interface OptimizationRecommendation {
  /** Recommendation title */
  title: string
  /** Detailed description */
  description: string
  /** Potential cost savings */
  costSavings: number
  /** Potential carbon reduction */
  carbonReduction: number
  /** Implementation difficulty (1-5) */
  difficulty: number
  /** Recommendation category */
  category: 'cost' | 'carbon' | 'performance' | 'efficiency'
  /** Action items for implementation */
  actions: string[]
}
