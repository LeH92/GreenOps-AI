// Types for GCP OAuth integration
export interface GCPOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  expires_at: Date;
}

export interface GCPBillingAccount {
  name: string;
  open: boolean;
  displayName: string;
  masterBillingAccount?: string;
}

export interface GCPProject {
  projectId: string;
  name: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
  billingAccountName?: string;
}

export interface GCPBillingData {
  projectId: string;
  billingAccountId: string;
  cost: number;
  currency: string;
  startDate: string;
  endDate: string;
  services: GCPServiceUsage[];
}

export interface GCPServiceUsage {
  serviceName: string;
  displayName: string;
  cost: number;
  usage: number;
  unit: string;
}

export interface GCPBudget {
  name: string;
  displayName: string;
  budgetFilter: {
    projects?: string[];
    services?: string[];
  };
  amount: {
    specifiedAmount: {
      currencyCode: string;
      units: string;
    };
  };
  thresholdRules: Array<{
    thresholdPercent: number;
    spendBasis: string;
  }>;
}

export interface GCPConnectionStatus {
  id: string;
  user_id: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'expired';
  account_info: {
    email: string;
    name: string;
    billingAccounts: GCPBillingAccount[];
    projects: GCPProject[];
  };
  tokens_encrypted: string; // Encrypted GCPOAuthTokens
  last_sync: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GCPOAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface GCPAPIError {
  error: {
    code: number;
    message: string;
    status: string;
    details?: any[];
  };
}

export interface GCPDataFetchResult {
  success: boolean;
  data?: {
    billingAccounts: GCPBillingAccount[];
    projects: GCPProject[];
    billingData: GCPBillingData[];
    budgets: GCPBudget[];
    accountInfo: {
      email: string;
      name: string;
    };
  };
  error?: string;
}

// OAuth flow state management
export interface OAuthState {
  state: string;
  redirectUri: string;
  timestamp: number;
}

// Scopes required for GCP integration
export const GCP_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/cloud-billing',
  'https://www.googleapis.com/auth/cloud-billing.readonly',
  'https://www.googleapis.com/auth/bigquery.readonly',
  'https://www.googleapis.com/auth/monitoring.read',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  // Required to list projects (Cloud Resource Manager)
  'https://www.googleapis.com/auth/cloud-platform.read-only',
  'https://www.googleapis.com/auth/cloudplatformprojects.readonly'
] as const;

export type GCPScope = typeof GCP_OAUTH_SCOPES[number];
