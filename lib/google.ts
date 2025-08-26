import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Types pour les réponses Google APIs
export interface BillingAccount {
  name: string;
  open: boolean;
  displayName: string;
  masterBillingAccount: string;
}

export interface Project {
  projectId: string;
  name: string;
  projectNumber: string;
  lifecycleState: string;
}

export interface ServiceCost {
  service: string;
  total_cost: number;
  currency: string;
  period: string;
}

// Configuration OAuth2 Client
export function getOAuthClient(accessToken: string, refreshToken?: string): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

// Lister les comptes de facturation
export async function listBillingAccounts(oauth: OAuth2Client): Promise<BillingAccount[]> {
  try {
    const cloudbilling = google.cloudbilling('v1');
    
    const response = await cloudbilling.billingAccounts.list({
      auth: oauth,
    });

    return response.data.billingAccounts || [];
  } catch (error) {
    console.error('Error fetching billing accounts:', error);
    throw new Error(`Failed to fetch billing accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Lister les projets
export async function listProjects(oauth: OAuth2Client): Promise<Project[]> {
  try {
    const cloudresourcemanager = google.cloudresourcemanager('v1');
    
    const response = await cloudresourcemanager.projects.list({
      auth: oauth,
    });

    return response.data.projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Récupérer les coûts depuis BigQuery
export async function bigQueryCostsWithGoogleApis(
  oauth: OAuth2Client, 
  path: string
): Promise<ServiceCost[]> {
  try {
    const bigquery = google.bigquery('v2');
    
    // Parser le path (format: "projectId.dataset")
    const [projectId, dataset] = path.split('.');
    
    if (!projectId || !dataset) {
      throw new Error('Invalid path format. Expected: "projectId.dataset"');
    }

    // Calculer les dates (30 derniers jours)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Requête BigQuery pour les coûts par service
    const query = `
      SELECT 
        service.description as service,
        SUM(cost) as total_cost,
        currency,
        FORMAT_DATE('%Y-%m', usage_start_time) as period
      FROM \`${projectId}.${dataset}.gcp_billing_export_v1_*\`
      WHERE _TABLE_SUFFIX BETWEEN '${startDateStr.replace(/-/g, '')}' AND '${endDateStr.replace(/-/g, '')}'
        AND usage_start_time >= TIMESTAMP('${startDateStr}')
        AND usage_start_time < TIMESTAMP('${endDateStr}')
      GROUP BY service.description, currency, period
      ORDER BY total_cost DESC
    `;

    const response = await bigquery.jobs.query({
      auth: oauth,
      projectId: projectId,
      requestBody: {
        query: query,
        useLegacySql: false,
      },
    });

    const rows = response.data.rows || [];
    
    return rows.map((row: any) => ({
      service: row.f[0].v || 'Unknown',
      total_cost: parseFloat(row.f[1].v) || 0,
      currency: row.f[2].v || 'USD',
      period: row.f[3].v || '',
    }));

  } catch (error) {
    console.error('Error fetching BigQuery costs:', error);
    
    // Retourner des données mockées en cas d'erreur pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data for development');
      return [
        {
          service: 'Compute Engine',
          total_cost: 1250.50,
          currency: 'USD',
          period: '2024-01',
        },
        {
          service: 'Cloud Storage',
          total_cost: 450.25,
          currency: 'USD',
          period: '2024-01',
        },
        {
          service: 'BigQuery',
          total_cost: 200.75,
          currency: 'USD',
          period: '2024-01',
        },
        {
          service: 'Cloud Functions',
          total_cost: 150.30,
          currency: 'USD',
          period: '2024-01',
        },
        {
          service: 'Cloud Run',
          total_cost: 89.45,
          currency: 'USD',
          period: '2024-01',
        },
      ];
    }
    
    throw new Error(`Failed to fetch BigQuery costs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fonction utilitaire pour valider les tokens
export async function validateTokens(accessToken: string, refreshToken?: string): Promise<boolean> {
  try {
    const oauth = getOAuthClient(accessToken, refreshToken);
    
    // Test simple avec l'API userinfo
    const oauth2 = google.oauth2('v2');
    await oauth2.userinfo.get({ auth: oauth });
    
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

// Fonction pour obtenir les informations du projet
export async function getProjectInfo(oauth: OAuth2Client, projectId: string) {
  try {
    const cloudresourcemanager = google.cloudresourcemanager('v1');
    
    const response = await cloudresourcemanager.projects.get({
      auth: oauth,
      projectId: projectId,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching project info:', error);
    throw new Error(`Failed to fetch project info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fonction pour lister les datasets BigQuery
export async function listBigQueryDatasets(oauth: OAuth2Client, projectId: string) {
  try {
    const bigquery = google.bigquery('v2');
    
    const response = await bigquery.datasets.list({
      auth: oauth,
      projectId: projectId,
    });

    return response.data.datasets || [];
  } catch (error) {
    console.error('Error fetching BigQuery datasets:', error);
    throw new Error(`Failed to fetch BigQuery datasets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
