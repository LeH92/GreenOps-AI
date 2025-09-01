import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gcp/detect-bigquery-datasets
 * Détecte automatiquement les datasets BigQuery disponibles pour FinOps
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Detecting BigQuery datasets for FinOps...');
    
    // Authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Récupérer la connexion GCP
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted, account_info')
      .eq('user_id', user.email)
      .eq('connection_status', 'connected')
      .single();

    if (!connection || !connection.tokens_encrypted) {
      return NextResponse.json({ 
        error: 'No active GCP connection found'
      }, { status: 404 });
    }

    // Récupérer les projets du compte
    const projects = connection.account_info?.projects || [];
    const detectedDatasets = [];

    // Parser les tokens
    const tokens = JSON.parse(connection.tokens_encrypted);
    const oauth2Client = gcpOAuthClient.getAuthenticatedClient(tokens);
    const bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });

    // Pour chaque projet, chercher les datasets BigQuery
    for (const project of projects) {
      try {
        console.log(`🔍 Checking BigQuery datasets in project: ${project.projectId}`);
        
        const { data } = await bigquery.datasets.list({
          projectId: project.projectId,
        });

        if (data.datasets) {
          for (const dataset of data.datasets) {
            const datasetId = dataset.datasetReference?.datasetId;
            if (!datasetId) continue;

            // Vérifier si c'est un dataset de facturation ou carbone
            const isFinOpsDataset = 
              datasetId.includes('billing') || 
              datasetId.includes('export') || 
              datasetId.includes('finops') ||
              datasetId.includes('carbon') ||
              datasetId.includes('gcp_billing');

            if (isFinOpsDataset) {
              // Lister les tables dans ce dataset
              try {
                const tablesResponse = await bigquery.tables.list({
                  projectId: project.projectId,
                  datasetId: datasetId,
                });

                const tables = tablesResponse.data.tables || [];
                const billingTables = tables.filter(table => 
                  table.tableReference?.tableId?.includes('gcp_billing_export') ||
                  table.tableReference?.tableId?.includes('billing_export')
                );

                const carbonTables = tables.filter(table => 
                  table.tableReference?.tableId?.includes('carbon_footprint')
                );

                if (billingTables.length > 0 || carbonTables.length > 0) {
                  detectedDatasets.push({
                    projectId: project.projectId,
                    projectName: project.name,
                    datasetId,
                    datasetName: dataset.friendlyName || datasetId,
                    location: dataset.location,
                    billingTables: billingTables.map(t => ({
                      tableId: t.tableReference?.tableId,
                      createdTime: t.creationTime,
                      lastModified: t.lastModifiedTime,
                    })),
                    carbonTables: carbonTables.map(t => ({
                      tableId: t.tableReference?.tableId,
                      createdTime: t.creationTime,
                      lastModified: t.lastModifiedTime,
                    })),
                    totalTables: tables.length,
                  });
                }
              } catch (tablesError: any) {
                console.warn(`Could not list tables in ${datasetId}:`, tablesError.message);
              }
            }
          }
        }
      } catch (projectError: any) {
        console.warn(`Could not access BigQuery in project ${project.projectId}:`, projectError.message);
      }
    }

    // Analyser les datasets trouvés
    const analysis = {
      totalProjects: projects.length,
      projectsWithBigQuery: detectedDatasets.length,
      totalDatasets: detectedDatasets.length,
      billingExportsFound: detectedDatasets.filter(d => d.billingTables.length > 0).length,
      carbonExportsFound: detectedDatasets.filter(d => d.carbonTables.length > 0).length,
      recommendedProject: detectedDatasets.length > 0 ? detectedDatasets[0].projectId : projects[0]?.projectId,
    };

    console.log('✅ BigQuery detection completed:', analysis);

    return NextResponse.json({
      success: true,
      data: {
        detectedDatasets,
        analysis,
        projects: projects.map(p => ({
          projectId: p.projectId,
          name: p.name,
          hasBigQuery: detectedDatasets.some(d => d.projectId === p.projectId),
        })),
      }
    });

  } catch (error: any) {
    console.error('❌ Error detecting BigQuery datasets:', error);
    
    return NextResponse.json({
      error: 'Failed to detect BigQuery datasets',
      details: error.message
    }, { status: 500 });
  }
}
