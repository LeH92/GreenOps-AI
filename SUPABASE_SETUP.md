# GreenOps AI - Supabase Setup Documentation

## Overview

This document describes the complete Supabase setup for GreenOps AI, including database schema, TypeScript types, authentication, and data management utilities.

## File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   └── mockData.ts          # Mock data utilities
├── types/
│   ├── supabase.ts          # Database TypeScript types
│   └── greenops.ts          # Application TypeScript types
├── hooks/
│   └── useSupabase.ts       # React hooks for Supabase
└── data/
    ├── mock-costs.json      # Mock cost data
    ├── mock-providers.json  # Mock provider data
    ├── mock-budgets.json    # Mock budget data
    └── mock-usage.json      # Mock usage data
```

## Database Schema

### Tables

#### 1. providers
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to users)
- **name**: String
- **type**: Enum ('openai', 'aws', 'gcp', 'azure')
- **api_key_encrypted**: String
- **config**: JSONB
- **is_active**: Boolean
- **last_sync_at**: Timestamp
- **created_at**: Timestamp
- **updated_at**: Timestamp

#### 2. cost_records
- **id**: UUID (Primary Key)
- **provider_id**: UUID (Foreign Key to providers)
- **service**: String
- **cost_usd**: Decimal
- **currency**: String
- **timestamp**: Timestamptz
- **period**: String
- **region**: String
- **metadata**: JSONB
- **created_at**: Timestamp

#### 3. budgets
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to users)
- **name**: String
- **amount**: Decimal
- **currency**: String
- **period**: Enum ('monthly', 'quarterly', 'yearly')
- **start_date**: Date
- **end_date**: Date
- **alert_thresholds**: Decimal Array
- **is_active**: Boolean
- **created_at**: Timestamp
- **updated_at**: Timestamp

#### 4. usage_events
- **id**: UUID (Primary Key)
- **provider_id**: UUID (Foreign Key to providers)
- **model**: String
- **prompt_tokens**: Integer
- **completion_tokens**: Integer
- **total_tokens**: Integer
- **requests_count**: Integer
- **cost_usd**: Decimal
- **carbon_grams**: Decimal
- **timestamp**: Timestamptz
- **metadata**: JSONB
- **created_at**: Timestamp

#### 5. alerts
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to users)
- **budget_id**: UUID (Foreign Key to budgets, nullable)
- **type**: String
- **title**: String
- **message**: Text
- **severity**: Enum ('low', 'medium', 'high', 'critical')
- **threshold_value**: Decimal
- **actual_value**: Decimal
- **is_read**: Boolean
- **is_sent**: Boolean
- **sent_at**: Timestamptz
- **created_at**: Timestamp

## TypeScript Types

### Database Types (types/supabase.ts)
- Complete type definitions for all database tables
- Row, Insert, and Update types for each table
- Relationship definitions
- Type aliases for common operations

### Application Types (types/greenops.ts)
- **ProviderType**: Enum for supported providers
- **AlertSeverity**: Enum for alert severity levels
- **BudgetStatus**: Enum for budget status
- **CostMetrics**: Interface for aggregated cost data
- **ProviderConnection**: Interface for provider connections
- **Budget**: Interface for budget information
- **BudgetAlert**: Interface for budget alerts
- **CostChartData**: Interface for Recharts cost data
- **UsageChartData**: Interface for Recharts usage data
- **CarbonFootprint**: Interface for carbon footprint data
- **ServiceUsage**: Interface for service usage breakdown
- **RegionalData**: Interface for regional cost/carbon data
- **OptimizationRecommendation**: Interface for optimization suggestions

## Supabase Configuration

### Client Setup (lib/supabase.ts)
- Configured with provided credentials
- Auth options: autoRefreshToken, persistSession, detectSessionInUrl
- Helper functions for session and user management
- Storage and functions clients
- Type-safe database operations

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://viuthldgizphvrvueppf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## React Hooks

### useSupabaseAuth
- **State**: user, session, loading
- **Functions**: signIn, signUp, signInWithGitHub, signOut
- **Features**: Automatic session management, auth state changes

### useSupabaseData
- **Functions**: getCostMetrics, getProviders, getBudgets, getAlerts
- **Features**: Row Level Security, error handling, loading states
- **CRUD Operations**: createProvider, createBudget

## Mock Data System

### Data Files
- **mock-costs.json**: 30 days of realistic cost data
- **mock-providers.json**: 4 providers with different statuses
- **mock-budgets.json**: 4 budgets with alerts
- **mock-usage.json**: Weekly usage and carbon footprint data

### Mock Data Utilities (lib/mockData.ts)
- **isDryRun**: Environment-based mock data control
- **simulateLoading**: Realistic loading delays
- **Data Transformers**: Convert JSON to TypeScript types
- **Formatting Functions**: Currency, percentage, number formatting
- **Utility Functions**: Date ranges, aggregation, trend calculation

## Authentication Flow

1. **Sign Up**: Email/password or GitHub OAuth
2. **Sign In**: Email/password or GitHub OAuth
3. **Session Management**: Automatic token refresh
4. **Sign Out**: Clear session and redirect

## Data Management Patterns

### Row Level Security (RLS)
- All queries filter by user_id
- Automatic data isolation per user
- Secure provider and budget access

### Error Handling
- Consistent error patterns across hooks
- User-friendly error messages
- Loading states for better UX

### Data Transformation
- Database types to application types
- Aggregation and calculation utilities
- Chart-ready data formatting

## Usage Examples

### Authentication
```typescript
const { user, signIn, signOut } = useSupabaseAuth()

// Sign in
await signIn('user@example.com', 'password')

// Sign out
await signOut()
```

### Data Fetching
```typescript
const { getCostMetrics, getProviders } = useSupabaseData()

// Get cost metrics
const metrics = await getCostMetrics(userId)

// Get providers
const providers = await getProviders(userId)
```

### Mock Data
```typescript
import { getMockCostMetrics, isDryRun } from '@/lib/mockData'

// Use mock data in development
if (isDryRun) {
  const metrics = await getMockCostMetrics()
}
```

## Security Considerations

1. **API Key Encryption**: Provider API keys should be encrypted
2. **Row Level Security**: All tables have RLS policies
3. **Input Validation**: Validate all user inputs
4. **Error Handling**: Don't expose sensitive information in errors
5. **Session Management**: Secure session handling

## Performance Optimizations

1. **Connection Pooling**: Supabase handles connection management
2. **Caching**: Implement caching for frequently accessed data
3. **Pagination**: Use pagination for large datasets
4. **Real-time**: Use Supabase real-time subscriptions for live updates

## Development Workflow

1. **Local Development**: Use mock data with `isDryRun`
2. **Testing**: Use mock data for unit tests
3. **Production**: Connect to real Supabase instance
4. **Migration**: Use Supabase migrations for schema changes

## Next Steps

1. **Database Setup**: Create tables in Supabase dashboard
2. **RLS Policies**: Configure Row Level Security policies
3. **Authentication**: Set up auth providers in Supabase
4. **Real-time**: Implement real-time subscriptions
5. **Monitoring**: Set up error monitoring and logging

## Troubleshooting

### Common Issues
1. **Type Errors**: Ensure TypeScript types match database schema
2. **Auth Issues**: Check environment variables and auth configuration
3. **RLS Errors**: Verify Row Level Security policies
4. **Connection Issues**: Check Supabase URL and API key

### Debug Mode
```typescript
// Enable debug logging
const supabase = createClient(url, key, {
  auth: { debug: true }
})
```

---

*This setup provides a complete foundation for GreenOps AI with Supabase, including authentication, data management, and development utilities.*
