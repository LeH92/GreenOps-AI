import { google } from 'googleapis';
import { 
  GCPOAuthTokens, 
  GCPBillingAccount, 
  GCPProject, 
  GCPBillingData, 
  GCPBudget, 
  GCPDataFetchResult,
  GCPServiceUsage 
} from '@/types/gcp-oauth';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

export class GCPDataFetcher {
  private oauth2Client: any;
  private tokens: GCPOAuthTokens;

  constructor(tokens: GCPOAuthTokens | string) {
    // Si c'est une string, c'est probablement des tokens encryptés
    if (typeof tokens === 'string') {
      try {
        this.tokens = JSON.parse(tokens);
        console.log('🔓 Tokens décryptés depuis string:', {
          hasAccessToken: !!this.tokens.access_token,
          hasRefreshToken: !!this.tokens.refresh_token,
          expiresAt: this.tokens.expires_at,
          expiryDate: this.tokens.expiry_date,
          tokenType: this.tokens.token_type
        });
      } catch (error) {
        console.error('❌ Erreur parsing tokens:', error);
        throw new Error('Invalid token format. Expected GCPOAuthTokens or valid JSON string.');
      }
    } else {
      this.tokens = tokens;
      console.log('🔓 Tokens reçus directement:', {
        hasAccessToken: !!this.tokens.access_token,
        hasRefreshToken: !!this.tokens.refresh_token,
        expiresAt: this.tokens.expires_at,
        expiryDate: this.tokens.expiry_date,
        tokenType: this.tokens.token_type
      });
    }
    
    // Vérifier que les tokens sont valides
    if (!this.tokens.access_token) {
      throw new Error('Access token is required');
    }
    
    // Normaliser les dates si nécessaire
    if (this.tokens.expires_at && typeof this.tokens.expires_at === 'string') {
      this.tokens.expires_at = new Date(this.tokens.expires_at);
    }
    
    this.oauth2Client = gcpOAuthClient.getAuthenticatedClient(this.tokens);
    console.log('✅ OAuth2 client créé avec succès');
  }

  /**
   * Fetch all initial data after OAuth connection
   */
  async fetchInitialData(): Promise<GCPDataFetchResult> {
    try {
      console.log('Starting initial GCP data fetch...');

      // Check if tokens need refresh
      if (gcpOAuthClient.isTokenExpired(this.tokens)) {
        console.log('Tokens expired, refreshing...');
        this.tokens = await gcpOAuthClient.refreshAccessToken(this.tokens.refresh_token);
        this.oauth2Client = gcpOAuthClient.getAuthenticatedClient(this.tokens);
      }

      // Fetch user info first
      const accountInfo = await this.fetchAccountInfo();
      console.log('Account info fetched:', accountInfo.email);

      // Fetch billing accounts
      const billingAccounts = await this.fetchBillingAccounts();
      console.log(`Found ${billingAccounts.length} billing accounts`);

      // Fetch projects
      const projects = await this.fetchProjects();
      console.log(`Found ${projects.length} projects`);

      // Fetch recent billing data (last 30 days)
      const billingData = await this.fetchRecentBillingData(billingAccounts, projects);
      console.log(`Fetched billing data for ${billingData.length} project-billing combinations`);

      // Fetch budgets
      const budgets = await this.fetchBudgets(billingAccounts);
      console.log(`Found ${budgets.length} budgets`);

      return {
        success: true,
        data: {
          accountInfo,
          billingAccounts,
          projects,
          billingData,
          budgets,
        },
      };

    } catch (error: any) {
      console.error('Error fetching initial GCP data:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch GCP data',
      };
    }
  }

  /**
   * Fetch user account information
   */
  private async fetchAccountInfo(): Promise<{ email: string; name: string }> {
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      return {
        email: data.email || '',
        name: data.name || '',
      };
    } catch (error: any) {
      console.error('Error fetching account info:', error);
      throw new Error(`Failed to fetch account info: ${error.message}`);
    }
  }

  /**
   * Fetch all accessible billing accounts
   */
  private async fetchBillingAccounts(): Promise<GCPBillingAccount[]> {
    try {
      const billing = google.cloudbilling({ version: 'v1', auth: this.oauth2Client });
      const { data } = await billing.billingAccounts.list();

      return (data.billingAccounts || []).map(account => ({
        name: account.name || '',
        open: account.open || false,
        displayName: account.displayName || '',
        masterBillingAccount: account.masterBillingAccount,
      }));
    } catch (error: any) {
      console.error('Error fetching billing accounts:', error);
      // Don't throw error, return empty array - user might not have billing access
      return [];
    }
  }

  /**
   * Fetch all accessible projects
   */
  private async fetchProjects(): Promise<GCPProject[]> {
    try {
      const resourceManager = google.cloudresourcemanager({ version: 'v1', auth: this.oauth2Client });
      const { data } = await resourceManager.projects.list();

      const projects: GCPProject[] = [];

      for (const project of data.projects || []) {
        // Get billing info for each project
        let billingAccountName = '';
        try {
          const billing = google.cloudbilling({ version: 'v1', auth: this.oauth2Client });
          const billingInfo = await billing.projects.getBillingInfo({
            name: `projects/${project.projectId}`,
          });
          billingAccountName = billingInfo.data.billingAccountName || '';
        } catch (billingError) {
          // Project might not have billing enabled or no access
          console.warn(`No billing info for project ${project.projectId}`);
        }

        projects.push({
          projectId: project.projectId || '',
          name: project.name || '',
          projectNumber: project.projectNumber || '',
          lifecycleState: project.lifecycleState || '',
          createTime: project.createTime || '',
          billingAccountName,
        });
      }

      return projects;
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  /**
   * Fetch recent billing data (last 30 days)
   */
  private async fetchRecentBillingData(
    billingAccounts: GCPBillingAccount[], 
    projects: GCPProject[]
  ): Promise<GCPBillingData[]> {
    const billingData: GCPBillingData[] = [];

    // Get date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    for (const billingAccount of billingAccounts) {
      if (!billingAccount.open) continue;

      try {
        // Extract billing account ID from name (format: billingAccounts/XXXXXX-XXXXXX-XXXXXX)
        const billingAccountId = billingAccount.name.split('/')[1];
        
        // Use BigQuery to get billing data
        const bigquery = google.bigquery({ version: 'v2', auth: this.oauth2Client });
        
        // Query to get billing data grouped by project and service
        const query = `
          SELECT 
            project.id as project_id,
            service.description as service_name,
            SUM(cost) as total_cost,
            currency,
            usage.unit as usage_unit,
            SUM(usage.amount) as total_usage
          FROM \`${billingAccountId}.gcp_billing_export_v1_${billingAccountId.replace(/-/g, '_')}\`
          WHERE _PARTITIONTIME >= TIMESTAMP('${startDateStr}')
            AND _PARTITIONTIME <= TIMESTAMP('${endDateStr}')
          GROUP BY project_id, service_name, currency, usage_unit
          ORDER BY total_cost DESC
          LIMIT 100
        `;

        const { data } = await bigquery.jobs.query({
          requestBody: {
            query,
            useLegacySql: false,
          },
        });

        if (data.rows) {
          for (const row of data.rows) {
            const [projectId, serviceName, totalCost, currency, usageUnit, totalUsage] = row.f?.map(f => f.v) || [];

            // Find matching project
            const project = projects.find(p => p.projectId === projectId);
            if (!project) continue;

            // Check if we already have data for this project
            let projectBillingData = billingData.find(
              bd => bd.projectId === projectId && bd.billingAccountId === billingAccountId
            );

            if (!projectBillingData) {
              projectBillingData = {
                projectId: projectId || '',
                billingAccountId,
                cost: 0,
                currency: currency || 'USD',
                startDate: startDateStr,
                endDate: endDateStr,
                services: [],
              };
              billingData.push(projectBillingData);
            }

            // Add service usage
            const serviceUsage: GCPServiceUsage = {
              serviceName: serviceName || '',
              displayName: serviceName || '',
              cost: parseFloat(totalCost || '0'),
              usage: parseFloat(totalUsage || '0'),
              unit: usageUnit || '',
            };

            projectBillingData.services.push(serviceUsage);
            projectBillingData.cost += serviceUsage.cost;
          }
        }

      } catch (error: any) {
        console.warn(`Error fetching billing data for account ${billingAccount.name}:`, error.message);
        // Continue with other billing accounts
        continue;
      }
    }

    return billingData;
  }

  /**
   * Fetch budgets for billing accounts
   */
  private async fetchBudgets(billingAccounts: GCPBillingAccount[]): Promise<GCPBudget[]> {
    const budgets: GCPBudget[] = [];

    for (const billingAccount of billingAccounts) {
      try {
        const billing = google.cloudbilling({ version: 'v1', auth: this.oauth2Client });
        const { data } = await billing.billingAccounts.budgets.list({
          parent: billingAccount.name,
        });

        for (const budget of data.budgets || []) {
          budgets.push({
            name: budget.name || '',
            displayName: budget.displayName || '',
            budgetFilter: budget.budgetFilter || {},
            amount: budget.amount || { specifiedAmount: { currencyCode: 'USD', units: '0' } },
            thresholdRules: budget.thresholdRules || [],
          });
        }
      } catch (error: any) {
        console.warn(`Error fetching budgets for ${billingAccount.name}:`, error.message);
        // Continue with other billing accounts
        continue;
      }
    }

    return budgets;
  }

  /**
   * Refresh data (for subsequent syncs)
   */
  async refreshData(): Promise<GCPDataFetchResult> {
    return this.fetchInitialData();
  }

  /**
   * Fetch specific project billing data
   */
  async fetchProjectBillingData(
    projectId: string, 
    billingAccountId: string, 
    startDate: string, 
    endDate: string
  ): Promise<GCPBillingData | null> {
    try {
      // Similar to fetchRecentBillingData but for a specific project
      const bigquery = google.bigquery({ version: 'v2', auth: this.oauth2Client });
      
      const query = `
        SELECT 
          service.description as service_name,
          SUM(cost) as total_cost,
          currency,
          usage.unit as usage_unit,
          SUM(usage.amount) as total_usage
        FROM \`${billingAccountId}.gcp_billing_export_v1_${billingAccountId.replace(/-/g, '_')}\`
        WHERE project.id = '${projectId}'
          AND _PARTITIONTIME >= TIMESTAMP('${startDate}')
          AND _PARTITIONTIME <= TIMESTAMP('${endDate}')
        GROUP BY service_name, currency, usage_unit
        ORDER BY total_cost DESC
      `;

      const { data } = await bigquery.jobs.query({
        requestBody: {
          query,
          useLegacySql: false,
        },
      });

      const services: GCPServiceUsage[] = [];
      let totalCost = 0;
      let currency = 'USD';

      if (data.rows) {
        for (const row of data.rows) {
          const [serviceName, cost, curr, usageUnit, usage] = row.f?.map(f => f.v) || [];
          
          const serviceUsage: GCPServiceUsage = {
            serviceName: serviceName || '',
            displayName: serviceName || '',
            cost: parseFloat(cost || '0'),
            usage: parseFloat(usage || '0'),
            unit: usageUnit || '',
          };

          services.push(serviceUsage);
          totalCost += serviceUsage.cost;
          currency = curr || currency;
        }
      }

      return {
        projectId,
        billingAccountId,
        cost: totalCost,
        currency,
        startDate,
        endDate,
        services,
      };

    } catch (error: any) {
      console.error(`Error fetching billing data for project ${projectId}:`, error);
      return null;
    }
  }
}
