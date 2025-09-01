/**
 * GCP FinOps & GreenOps Data Fetcher
 * Collecte complète des données pour analyses FinOps/GreenOps selon les règles apigcprules
 */

import { google } from 'googleapis';
import { GCPOAuthTokens } from '@/types/gcp-oauth';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

export interface GCPFinOpsKPIs {
  // Données de base
  accountInfo: {
    email: string;
    name: string;
  };
  billingAccounts: GCPBillingAccountDetailed[];
  projects: GCPProjectDetailed[];
  
  // KPIs FinOps
  costKPIs: {
    totalMonthlyCost: number;
    currency: string;
    costByProject: ProjectCostSummary[];
    costByService: ServiceCostSummary[];
    costTrends: MonthlyCostTrend[];
  };
  
  // KPIs GreenOps
  carbonKPIs: {
    totalMonthlyCarbon: number; // kg CO2e
    carbonByProject: ProjectCarbonSummary[];
    carbonByService: ServiceCarbonSummary[];
    carbonTrends: MonthlyCarbonTrend[];
  };
  
  // Budgets et alertes
  budgets: GCPBudgetDetailed[];
  budgetUtilization: BudgetUtilization[];
  
  // Recommandations d'optimisation
  optimizationRecommendations: OptimizationRecommendation[];
  
  // Métriques de performance
  performanceMetrics: {
    dataFreshness: Date;
    apiCallsCount: number;
    processingTimeMs: number;
  };
}

export interface GCPBillingAccountDetailed {
  name: string;
  displayName: string;
  open: boolean;
  masterBillingAccount?: string;
  currency: string;
  projectCount: number;
  totalMonthlyCost: number;
  totalMonthlyCarbon: number;
}

export interface GCPProjectDetailed {
  projectId: string;
  name: string;
  projectNumber: string;
  billingAccountName: string;
  lifecycleState: string;
  createTime: string;
  // KPIs enrichis
  monthlyCost: number;
  monthlyCarbon: number;
  topServices: string[];
  hasExportBigQuery: boolean;
  hasCarbonExport: boolean;
}

export interface ProjectCostSummary {
  projectId: string;
  projectName: string;
  totalCost: number;
  currency: string;
  percentageOfTotal: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ServiceCostSummary {
  serviceId: string;
  serviceName: string;
  totalCost: number;
  currency: string;
  percentageOfTotal: number;
  projectsCount: number;
}

export interface MonthlyCostTrend {
  month: string; // YYYY-MM
  totalCost: number;
  currency: string;
  changeFromPrevious: number; // percentage
}

export interface ProjectCarbonSummary {
  projectId: string;
  projectName: string;
  totalCarbon: number; // kg CO2e
  percentageOfTotal: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ServiceCarbonSummary {
  serviceId: string;
  serviceName: string;
  totalCarbon: number; // kg CO2e
  percentageOfTotal: number;
  projectsCount: number;
}

export interface MonthlyCarbonTrend {
  month: string; // YYYY-MM
  totalCarbon: number; // kg CO2e
  changeFromPrevious: number; // percentage
}

export interface GCPBudgetDetailed {
  name: string;
  displayName: string;
  amount: {
    specifiedAmount?: {
      currencyCode: string;
      units: string;
    };
    lastPeriodAmount?: any;
  };
  budgetFilter: {
    projects?: string[];
    services?: string[];
    creditTypesTreatment?: string;
    calendarPeriod?: string;
  };
  thresholdRules: Array<{
    thresholdPercent: number;
    spendBasis: string;
  }>;
  // Données enrichies
  currentSpend?: number;
  utilizationPercentage?: number;
  projectedSpend?: number;
  alertsTriggered?: string[];
}

export interface BudgetUtilization {
  budgetName: string;
  budgetAmount: number;
  currentSpend: number;
  utilizationPercentage: number;
  projectedSpend: number;
  daysRemaining: number;
  status: 'on_track' | 'warning' | 'over_budget' | 'critical';
  nextThreshold?: number;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'cost' | 'carbon' | 'performance';
  title: string;
  description: string;
  projectId: string;
  serviceId: string;
  potentialSavings: number;
  potentialCarbonReduction: number;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export class GCPFinOpsDataFetcher {
  private oauth2Client: any;
  private tokens: GCPOAuthTokens;
  private bigQueryClient: any;
  private projectId: string;

  constructor(tokens: GCPOAuthTokens | string, projectId?: string) {
    // Parsing des tokens
    if (typeof tokens === 'string') {
      try {
        this.tokens = JSON.parse(tokens);
      } catch (error) {
        throw new Error('Invalid token format');
      }
    } else {
      this.tokens = tokens;
    }

    if (!this.tokens.access_token) {
      throw new Error('Access token is required');
    }

    // Normaliser les dates si nécessaire
    if (this.tokens.expires_at && typeof this.tokens.expires_at === 'string') {
      this.tokens.expires_at = new Date(this.tokens.expires_at);
    }
    if (this.tokens.expiry_date && typeof this.tokens.expiry_date === 'string') {
      this.tokens.expiry_date = new Date(this.tokens.expiry_date);
    }

    this.oauth2Client = gcpOAuthClient.getAuthenticatedClient(this.tokens);
    this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT_ID || 'greenops-ai-dashboard';
    
    // Initialiser BigQuery client
    this.bigQueryClient = google.bigquery({ version: 'v2', auth: this.oauth2Client });
    
    console.log('✅ GCP FinOps Data Fetcher initialized');
  }

  /**
   * Collecte complète de toutes les données FinOps/GreenOps
   */
  async fetchCompleteFinOpsData(): Promise<GCPFinOpsKPIs> {
    const startTime = Date.now();
    let apiCallsCount = 0;

    console.log('🚀 Starting complete FinOps/GreenOps data collection...');

    try {
      // Vérifier et rafraîchir les tokens si nécessaire
      if (gcpOAuthClient.isTokenExpired(this.tokens)) {
        console.log('🔄 Refreshing expired tokens...');
        this.tokens = await gcpOAuthClient.refreshAccessToken(this.tokens.refresh_token);
        this.oauth2Client = gcpOAuthClient.getAuthenticatedClient(this.tokens);
        apiCallsCount++;
      }

      // 1. Données de base (parallèle)
      console.log('📊 Fetching base data...');
      const [accountInfo, billingAccounts, projects] = await Promise.all([
        this.fetchAccountInfo(),
        this.fetchBillingAccountsDetailed(),
        this.fetchProjectsDetailed(),
      ]);
      apiCallsCount += 3;

      // 2. Budgets (parallèle avec base data)
      console.log('💰 Fetching budgets data...');
      const budgetsPromises = billingAccounts.map(account => 
        this.fetchBudgetsForAccount(account.name)
      );
      const budgetsArrays = await Promise.all(budgetsPromises);
      const budgets = budgetsArrays.flat();
      apiCallsCount += billingAccounts.length;

      // 3. Données BigQuery (coûts et carbone) - parallèle
      console.log('📈 Fetching BigQuery data (costs & carbon)...');
      const [costKPIs, carbonKPIs] = await Promise.all([
        this.fetchCostKPIs(billingAccounts, projects),
        this.fetchCarbonKPIs(billingAccounts, projects),
      ]);
      apiCallsCount += 2; // Approximation pour les requêtes BigQuery

      // 4. Utilisation des budgets (calculée)
      console.log('📊 Calculating budget utilization...');
      const budgetUtilization = this.calculateBudgetUtilization(budgets, costKPIs);

      // 5. Recommandations d'optimisation (basées sur les données)
      console.log('💡 Generating optimization recommendations...');
      const optimizationRecommendations = this.generateOptimizationRecommendations(
        costKPIs, carbonKPIs, projects
      );

      // 6. Enrichir les données de billing accounts
      const enrichedBillingAccounts = this.enrichBillingAccounts(
        billingAccounts, projects, costKPIs, carbonKPIs
      );

      const processingTimeMs = Date.now() - startTime;
      console.log(`✅ FinOps data collection completed in ${processingTimeMs}ms with ${apiCallsCount} API calls`);

      return {
        accountInfo,
        billingAccounts: enrichedBillingAccounts,
        projects,
        costKPIs,
        carbonKPIs,
        budgets,
        budgetUtilization,
        optimizationRecommendations,
        performanceMetrics: {
          dataFreshness: new Date(),
          apiCallsCount,
          processingTimeMs,
        },
      };

    } catch (error: any) {
      console.error('❌ Error in complete FinOps data fetch:', error);
      throw new Error(`FinOps data fetch failed: ${error.message}`);
    }
  }

  /**
   * Récupère les informations du compte utilisateur
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
      throw error;
    }
  }

  /**
   * Récupère les comptes de facturation avec détails enrichis
   */
  private async fetchBillingAccountsDetailed(): Promise<GCPBillingAccountDetailed[]> {
    try {
      const billing = google.cloudbilling({ version: 'v1', auth: this.oauth2Client });
      const { data } = await billing.billingAccounts.list();

      const accounts: GCPBillingAccountDetailed[] = [];
      
      for (const account of data.billingAccounts || []) {
        // Récupérer le nombre de projets pour chaque compte
        const projectsResponse = await billing.billingAccounts.projects.list({
          name: account.name,
        });

        accounts.push({
          name: account.name || '',
          displayName: account.displayName || '',
          open: account.open || false,
          masterBillingAccount: account.masterBillingAccount,
          currency: 'EUR', // Sera mis à jour avec les vraies données
          projectCount: projectsResponse.data.projectBillingInfo?.length || 0,
          totalMonthlyCost: 0, // Sera calculé plus tard
          totalMonthlyCarbon: 0, // Sera calculé plus tard
        });
      }

      return accounts;
    } catch (error: any) {
      console.error('Error fetching billing accounts:', error);
      throw error;
    }
  }

  /**
   * Récupère les projets avec détails enrichis
   */
  private async fetchProjectsDetailed(): Promise<GCPProjectDetailed[]> {
    try {
      const resourceManager = google.cloudresourcemanager({ version: 'v1', auth: this.oauth2Client });
      const { data } = await resourceManager.projects.list();

      const projects: GCPProjectDetailed[] = [];

      for (const project of data.projects || []) {
        // Récupérer les infos de facturation pour chaque projet
        let billingAccountName = '';
        try {
          const billing = google.cloudbilling({ version: 'v1', auth: this.oauth2Client });
          const billingInfo = await billing.projects.getBillingInfo({
            name: `projects/${project.projectId}`,
          });
          billingAccountName = billingInfo.data.billingAccountName || '';
        } catch (billingError) {
          console.warn(`No billing info for project ${project.projectId}`);
        }

        projects.push({
          projectId: project.projectId || '',
          name: project.name || '',
          projectNumber: project.projectNumber || '',
          billingAccountName,
          lifecycleState: project.lifecycleState || '',
          createTime: project.createTime || '',
          // Sera enrichi plus tard
          monthlyCost: 0,
          monthlyCarbon: 0,
          topServices: [],
          hasExportBigQuery: false, // Sera vérifié
          hasCarbonExport: false, // Sera vérifié
        });
      }

      return projects;
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Récupère les budgets pour un compte de facturation
   */
  private async fetchBudgetsForAccount(billingAccountName: string): Promise<GCPBudgetDetailed[]> {
    try {
      const budgets = google.cloudbilling({ version: 'v1beta1', auth: this.oauth2Client });
      const { data } = await budgets.billingAccounts.budgets.list({
        parent: billingAccountName,
      });

      return (data.budgets || []).map(budget => ({
        name: budget.name || '',
        displayName: budget.displayName || '',
        amount: budget.amount || {},
        budgetFilter: budget.budgetFilter || {},
        thresholdRules: budget.thresholdRules || [],
        // Sera enrichi avec les dépenses actuelles
        currentSpend: undefined,
        utilizationPercentage: undefined,
        projectedSpend: undefined,
        alertsTriggered: [],
      }));
    } catch (error: any) {
      console.warn(`Error fetching budgets for ${billingAccountName}:`, error.message);
      return [];
    }
  }

  /**
   * Récupère les KPIs de coût via BigQuery
   */
  private async fetchCostKPIs(
    billingAccounts: GCPBillingAccountDetailed[],
    projects: GCPProjectDetailed[]
  ): Promise<GCPFinOpsKPIs['costKPIs']> {
    try {
      // Pour chaque compte de facturation, essayer de récupérer les données BigQuery
      let totalMonthlyCost = 0;
      let currency = 'EUR';
      const costByProject: ProjectCostSummary[] = [];
      const costByService: ServiceCostSummary[] = [];
      const costTrends: MonthlyCostTrend[] = [];

      for (const account of billingAccounts) {
        try {
          // Essayer de trouver le bon projet et dataset pour les données de facturation
          // D'abord, lister les projets associés à ce compte de facturation
          const billingAccountId = account.name.split('/')[1];
          
          // Essayer plusieurs conventions de nommage possibles
          const possibleTableNames = [
            `\`carewashv1.gcp_billing_export_v1_${billingAccountId.replace(/-/g, '_')}\``,
            `\`carewashv1.finops_reports.gcp_billing_export_v1_${billingAccountId.replace(/-/g, '_')}\``,
            `\`care-wash-v3.gcp_billing_export_v1_${billingAccountId.replace(/-/g, '_')}\``,
            `\`${this.projectId}.billing_data.gcp_billing_export_v1_${billingAccountId.replace(/-/g, '_')}\``,
          ];

          let monthlyResult = null;
          let workingTableName = '';

          // Essayer chaque table jusqu'à en trouver une qui fonctionne
          for (const tableName of possibleTableNames) {
            try {
              console.log(`🔍 Trying table: ${tableName}`);
              
              const testQuery = `
                SELECT 
                  SUM(cost) as total_cost,
                  currency,
                  COUNT(*) as record_count
                FROM ${tableName}
                WHERE EXTRACT(MONTH FROM usage_start_time) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP())
                  AND EXTRACT(YEAR FROM usage_start_time) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP())
                GROUP BY currency
                LIMIT 1
              `;

              monthlyResult = await this.executeBigQueryQuery(testQuery, 'carewashv1');
              workingTableName = tableName;
              console.log(`✅ Found working table: ${tableName}`);
              break;
            } catch (tableError: any) {
              console.log(`❌ Table ${tableName} not accessible: ${tableError.message}`);
              continue;
            }
          }

          if (!monthlyResult || !workingTableName) {
            console.log(`⚠️ No billing export table found for account ${account.name}`);
            continue;
          }
          if (monthlyResult.rows && monthlyResult.rows.length > 0) {
            const row = monthlyResult.rows[0];
            const cost = parseFloat(row.f?.[0]?.v || '0');
            totalMonthlyCost += cost;
            currency = row.f?.[1]?.v || currency;
          }

          // Requête pour les coûts par projet
          const projectQuery = `
            SELECT 
              project.id as project_id,
              project.name as project_name,
              SUM(cost) as total_cost,
              currency
            FROM ${tableName}
            WHERE EXTRACT(MONTH FROM usage_start_time) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP())
              AND EXTRACT(YEAR FROM usage_start_time) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP())
            GROUP BY project.id, project.name, currency
            ORDER BY total_cost DESC
            LIMIT 20
          `;

          const projectResult = await this.executeBigQueryQuery(projectQuery);
          if (projectResult.rows) {
            for (const row of projectResult.rows) {
              const projectId = row.f?.[0]?.v || '';
              const projectName = row.f?.[1]?.v || projectId;
              const cost = parseFloat(row.f?.[2]?.v || '0');
              
              costByProject.push({
                projectId,
                projectName,
                totalCost: cost,
                currency: row.f?.[3]?.v || currency,
                percentageOfTotal: totalMonthlyCost > 0 ? (cost / totalMonthlyCost) * 100 : 0,
                trend: 'stable', // Sera calculé avec plus de données
              });
            }
          }

          // Requête pour les coûts par service
          const serviceQuery = `
            SELECT 
              service.id as service_id,
              service.description as service_name,
              SUM(cost) as total_cost,
              COUNT(DISTINCT project.id) as projects_count,
              currency
            FROM ${tableName}
            WHERE EXTRACT(MONTH FROM usage_start_time) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP())
              AND EXTRACT(YEAR FROM usage_start_time) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP())
            GROUP BY service.id, service.description, currency
            ORDER BY total_cost DESC
            LIMIT 15
          `;

          const serviceResult = await this.executeBigQueryQuery(serviceQuery);
          if (serviceResult.rows) {
            for (const row of serviceResult.rows) {
              const serviceId = row.f?.[0]?.v || '';
              const serviceName = row.f?.[1]?.v || serviceId;
              const cost = parseFloat(row.f?.[2]?.v || '0');
              const projectsCount = parseInt(row.f?.[3]?.v || '0');
              
              costByService.push({
                serviceId,
                serviceName,
                totalCost: cost,
                currency: row.f?.[4]?.v || currency,
                percentageOfTotal: totalMonthlyCost > 0 ? (cost / totalMonthlyCost) * 100 : 0,
                projectsCount,
              });
            }
          }

        } catch (queryError: any) {
          console.warn(`Could not fetch cost data for account ${account.name}:`, queryError.message);
          // Continue avec les autres comptes
        }
      }

      return {
        totalMonthlyCost,
        currency,
        costByProject,
        costByService,
        costTrends, // Sera implémenté avec plus de données historiques
      };

    } catch (error: any) {
      console.error('Error fetching cost KPIs:', error);
      // Retourner des données vides plutôt que d'échouer
      return {
        totalMonthlyCost: 0,
        currency: 'EUR',
        costByProject: [],
        costByService: [],
        costTrends: [],
      };
    }
  }

  /**
   * Récupère les KPIs carbone via BigQuery
   */
  private async fetchCarbonKPIs(
    billingAccounts: GCPBillingAccountDetailed[],
    projects: GCPProjectDetailed[]
  ): Promise<GCPFinOpsKPIs['carbonKPIs']> {
    try {
      let totalMonthlyCarbon = 0;
      const carbonByProject: ProjectCarbonSummary[] = [];
      const carbonByService: ServiceCarbonSummary[] = [];
      const carbonTrends: MonthlyCarbonTrend[] = [];

      for (const account of billingAccounts) {
        try {
          // Table d'export carbone (convention Google)
          const billingAccountId = account.name.split('/')[1];
          const tableName = `\`${this.projectId}.carbon_footprint.carbon_footprint\``;

          // Requête pour le carbone total du mois précédent (les données carbone ont du délai)
          const monthlyQuery = `
            SELECT 
              SUM(carbon_footprint_total_kgCO2e.market_based) as total_carbon
            FROM ${tableName}
            WHERE billing_account_id = '${billingAccountId}'
              AND usage_month = DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH)
          `;

          const monthlyResult = await this.executeBigQueryQuery(monthlyQuery);
          if (monthlyResult.rows && monthlyResult.rows.length > 0) {
            const carbon = parseFloat(monthlyResult.rows[0].f?.[0]?.v || '0');
            totalMonthlyCarbon += carbon;
          }

          // Requête pour le carbone par projet
          const projectQuery = `
            SELECT 
              project.id as project_id,
              project.name as project_name,
              SUM(carbon_footprint_total_kgCO2e.market_based) as total_carbon
            FROM ${tableName}
            WHERE billing_account_id = '${billingAccountId}'
              AND usage_month = DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH)
            GROUP BY project.id, project.name
            ORDER BY total_carbon DESC
            LIMIT 20
          `;

          const projectResult = await this.executeBigQueryQuery(projectQuery);
          if (projectResult.rows) {
            for (const row of projectResult.rows) {
              const projectId = row.f?.[0]?.v || '';
              const projectName = row.f?.[1]?.v || projectId;
              const carbon = parseFloat(row.f?.[2]?.v || '0');
              
              carbonByProject.push({
                projectId,
                projectName,
                totalCarbon: carbon,
                percentageOfTotal: totalMonthlyCarbon > 0 ? (carbon / totalMonthlyCarbon) * 100 : 0,
                trend: 'stable',
              });
            }
          }

        } catch (queryError: any) {
          console.warn(`Could not fetch carbon data for account ${account.name}:`, queryError.message);
        }
      }

      return {
        totalMonthlyCarbon,
        carbonByProject,
        carbonByService,
        carbonTrends,
      };

    } catch (error: any) {
      console.error('Error fetching carbon KPIs:', error);
      return {
        totalMonthlyCarbon: 0,
        carbonByProject: [],
        carbonByService: [],
        carbonTrends: [],
      };
    }
  }

  /**
   * Exécute une requête BigQuery
   */
  private async executeBigQueryQuery(query: string, projectId?: string): Promise<any> {
    try {
      const targetProjectId = projectId || this.projectId;
      console.log(`🔍 Executing BigQuery query on project: ${targetProjectId}`);
      
      const response = await this.bigQueryClient.jobs.query({
        projectId: targetProjectId,
        requestBody: {
          query,
          useLegacySql: false,
          timeoutMs: 30000,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('BigQuery query error:', error);
      throw error;
    }
  }

  /**
   * Calcule l'utilisation des budgets
   */
  private calculateBudgetUtilization(
    budgets: GCPBudgetDetailed[],
    costKPIs: GCPFinOpsKPIs['costKPIs']
  ): BudgetUtilization[] {
    return budgets.map(budget => {
      const budgetAmount = budget.amount.specifiedAmount ? 
        parseFloat(budget.amount.specifiedAmount.units) : 0;
      
      // Trouver les dépenses correspondant à ce budget
      let currentSpend = 0;
      if (budget.budgetFilter.projects && budget.budgetFilter.projects.length > 0) {
        // Budget spécifique à des projets
        currentSpend = costKPIs.costByProject
          .filter(p => budget.budgetFilter.projects!.includes(`projects/${p.projectId}`))
          .reduce((sum, p) => sum + p.totalCost, 0);
      } else {
        // Budget global
        currentSpend = costKPIs.totalMonthlyCost;
      }

      const utilizationPercentage = budgetAmount > 0 ? (currentSpend / budgetAmount) * 100 : 0;
      
      let status: BudgetUtilization['status'] = 'on_track';
      if (utilizationPercentage >= 100) status = 'over_budget';
      else if (utilizationPercentage >= 90) status = 'critical';
      else if (utilizationPercentage >= 75) status = 'warning';

      return {
        budgetName: budget.displayName,
        budgetAmount,
        currentSpend,
        utilizationPercentage,
        projectedSpend: currentSpend * (30 / new Date().getDate()), // Projection basique
        daysRemaining: 30 - new Date().getDate(),
        status,
        nextThreshold: budget.thresholdRules
          .map(rule => rule.thresholdPercent * 100)
          .find(threshold => threshold > utilizationPercentage),
      };
    });
  }

  /**
   * Génère des recommandations d'optimisation
   */
  private generateOptimizationRecommendations(
    costKPIs: GCPFinOpsKPIs['costKPIs'],
    carbonKPIs: GCPFinOpsKPIs['carbonKPIs'],
    projects: GCPProjectDetailed[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Recommandations basées sur les coûts
    costKPIs.costByProject.slice(0, 3).forEach((project, index) => {
      if (project.totalCost > 100) { // Seuil arbitraire
        recommendations.push({
          id: `cost-opt-${index}`,
          type: 'cost',
          title: `Optimiser les coûts du projet ${project.projectName}`,
          description: `Ce projet représente ${project.percentageOfTotal.toFixed(1)}% des coûts totaux (${project.totalCost.toFixed(2)} ${project.currency})`,
          projectId: project.projectId,
          serviceId: '',
          potentialSavings: project.totalCost * 0.2, // 20% d'économies potentielles
          potentialCarbonReduction: 0,
          implementation: 'Analyser les ressources sous-utilisées et optimiser les instances',
          priority: project.percentageOfTotal > 30 ? 'high' : 'medium',
          effort: 'medium',
        });
      }
    });

    // Recommandations basées sur les services coûteux
    costKPIs.costByService.slice(0, 2).forEach((service, index) => {
      if (service.totalCost > 50) {
        recommendations.push({
          id: `service-opt-${index}`,
          type: 'cost',
          title: `Optimiser l'utilisation de ${service.serviceName}`,
          description: `Ce service coûte ${service.totalCost.toFixed(2)} ${service.currency}/mois sur ${service.projectsCount} projets`,
          projectId: '',
          serviceId: service.serviceId,
          potentialSavings: service.totalCost * 0.15,
          potentialCarbonReduction: 0,
          implementation: 'Réviser la configuration et l\'utilisation de ce service',
          priority: 'medium',
          effort: 'low',
        });
      }
    });

    // Recommandations carbone
    carbonKPIs.carbonByProject.slice(0, 2).forEach((project, index) => {
      if (project.totalCarbon > 10) { // Seuil en kg CO2e
        recommendations.push({
          id: `carbon-opt-${index}`,
          type: 'carbon',
          title: `Réduire l'empreinte carbone de ${project.projectName}`,
          description: `Ce projet émet ${project.totalCarbon.toFixed(1)} kg CO2e/mois (${project.percentageOfTotal.toFixed(1)}% du total)`,
          projectId: project.projectId,
          serviceId: '',
          potentialSavings: 0,
          potentialCarbonReduction: project.totalCarbon * 0.25,
          implementation: 'Migrer vers des régions à faible émission carbone',
          priority: project.percentageOfTotal > 40 ? 'high' : 'medium',
          effort: 'medium',
        });
      }
    });

    return recommendations;
  }

  /**
   * Enrichit les comptes de facturation avec les KPIs
   */
  private enrichBillingAccounts(
    billingAccounts: GCPBillingAccountDetailed[],
    projects: GCPProjectDetailed[],
    costKPIs: GCPFinOpsKPIs['costKPIs'],
    carbonKPIs: GCPFinOpsKPIs['carbonKPIs']
  ): GCPBillingAccountDetailed[] {
    return billingAccounts.map(account => {
      // Projets liés à ce compte
      const accountProjects = projects.filter(p => p.billingAccountName === account.name);
      
      // Coûts liés à ce compte
      const accountCost = costKPIs.costByProject
        .filter(p => accountProjects.some(ap => ap.projectId === p.projectId))
        .reduce((sum, p) => sum + p.totalCost, 0);
      
      // Carbone lié à ce compte
      const accountCarbon = carbonKPIs.carbonByProject
        .filter(p => accountProjects.some(ap => ap.projectId === p.projectId))
        .reduce((sum, p) => sum + p.totalCarbon, 0);

      return {
        ...account,
        projectCount: accountProjects.length,
        totalMonthlyCost: accountCost,
        totalMonthlyCarbon: accountCarbon,
        currency: costKPIs.currency,
      };
    });
  }
}
