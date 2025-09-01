import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-bigquery-costs
 * Synchronise les vrais coûts depuis les exports BigQuery de carewashv1
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('💰 Starting BigQuery costs synchronization for carewashv1...');
    
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

    const userEmail = 'hlamyne@gmail.com'; // Votre vraie adresse
    console.log(`✅ Syncing BigQuery costs for: ${userEmail}`);

    // Récupérer la connexion GCP
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted')
      .eq('user_id', userEmail)
      .eq('connection_status', 'connected')
      .single();

    if (!connection || !connection.tokens_encrypted) {
      return NextResponse.json({ 
        error: 'No active GCP connection found'
      }, { status: 404 });
    }

    // Initialiser BigQuery client
    const tokens = JSON.parse(connection.tokens_encrypted);
    const oauth2Client = gcpOAuthClient.getAuthenticatedClient(tokens);
    const bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });

    // Détecter les datasets disponibles dans carewashv1
    console.log('🔍 Detecting available datasets in carewashv1...');
    
    const { data: datasetsResponse } = await bigquery.datasets.list({
      projectId: 'carewashv1'
    });

    const datasets = datasetsResponse.datasets || [];
    console.log(`📊 Found ${datasets.length} datasets in carewashv1:`, 
      datasets.map(d => d.datasetReference?.datasetId));

    const costsData = {
      totalMonthlyCost: 0,
      currency: 'EUR',
      costsByProject: [],
      costsByService: [],
      datasetsAnalyzed: [],
      tablesFound: [],
    };

    // Analyser chaque dataset pour trouver les tables de facturation
    for (const dataset of datasets) {
      const datasetId = dataset.datasetReference?.datasetId;
      if (!datasetId) continue;

      try {
        console.log(`🔍 Analyzing dataset: ${datasetId}`);
        
        // Lister les tables dans ce dataset
        const { data: tablesResponse } = await bigquery.tables.list({
          projectId: 'carewashv1',
          datasetId: datasetId
        });

        const tables = tablesResponse.tables || [];
        const billingTables = tables.filter(table => {
          const tableId = table.tableReference?.tableId || '';
          return tableId.includes('gcp_billing_export') || 
                 tableId.includes('billing_export') ||
                 tableId.includes('gcp_billing');
        });

        costsData.datasetsAnalyzed.push({
          datasetId,
          totalTables: tables.length,
          billingTables: billingTables.length,
          tableNames: tables.map(t => t.tableReference?.tableId).slice(0, 5), // Premiers 5
        });

        // Si on trouve des tables de facturation, les analyser
        for (const table of billingTables) {
          const tableId = table.tableReference?.tableId;
          if (!tableId) continue;

          try {
            console.log(`💰 Analyzing billing table: ${datasetId}.${tableId}`);
            
            // Requête pour obtenir les coûts du mois courant
            const costQuery = `
              SELECT 
                project.id as project_id,
                project.name as project_name,
                service.description as service_name,
                SUM(cost) as total_cost,
                currency,
                COUNT(*) as record_count,
                MIN(usage_start_time) as earliest_date,
                MAX(usage_start_time) as latest_date
              FROM \`carewashv1.${datasetId}.${tableId}\`
              WHERE cost > 0
                AND usage_start_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAYS)
              GROUP BY project.id, project.name, service.description, currency
              ORDER BY total_cost DESC
              LIMIT 20
            `;

            console.log(`🔍 Executing cost query on carewashv1.${datasetId}.${tableId}`);
            
            const { data: queryResult } = await bigquery.jobs.query({
              projectId: 'carewashv1',
              requestBody: {
                query: costQuery,
                useLegacySql: false,
                timeoutMs: 30000,
              },
            });

            if (queryResult.rows && queryResult.rows.length > 0) {
              console.log(`✅ Found ${queryResult.rows.length} cost records in ${tableId}`);
              
              costsData.tablesFound.push({
                dataset: datasetId,
                table: tableId,
                recordsFound: queryResult.rows.length,
                hasRecentData: true,
              });

              // Traiter les résultats
              for (const row of queryResult.rows) {
                const projectId = row.f?.[0]?.v || '';
                const projectName = row.f?.[1]?.v || projectId;
                const serviceName = row.f?.[2]?.v || 'Unknown';
                const cost = parseFloat(row.f?.[3]?.v || '0');
                const currency = row.f?.[4]?.v || 'EUR';
                const recordCount = parseInt(row.f?.[5]?.v || '0');

                if (cost > 0) {
                  costsData.totalMonthlyCost += cost;
                  costsData.currency = currency;

                  // Ajouter aux coûts par projet
                  let projectCost = costsData.costsByProject.find(p => p.projectId === projectId);
                  if (!projectCost) {
                    projectCost = {
                      projectId,
                      projectName,
                      totalCost: 0,
                      currency,
                      services: [],
                      recordCount: 0,
                    };
                    costsData.costsByProject.push(projectCost);
                  }
                  
                  projectCost.totalCost += cost;
                  projectCost.recordCount += recordCount;
                  projectCost.services.push({
                    serviceName,
                    cost,
                    recordCount,
                  });

                  // Ajouter aux coûts par service
                  let serviceCost = costsData.costsByService.find(s => s.serviceName === serviceName);
                  if (!serviceCost) {
                    serviceCost = {
                      serviceName,
                      totalCost: 0,
                      currency,
                      projectsCount: 0,
                      projects: [],
                    };
                    costsData.costsByService.push(serviceCost);
                  }
                  
                  serviceCost.totalCost += cost;
                  if (!serviceCost.projects.includes(projectId)) {
                    serviceCost.projects.push(projectId);
                    serviceCost.projectsCount++;
                  }
                }
              }
            } else {
              console.log(`⚠️ No cost data found in ${tableId}`);
              costsData.tablesFound.push({
                dataset: datasetId,
                table: tableId,
                recordsFound: 0,
                hasRecentData: false,
              });
            }

          } catch (queryError: any) {
            console.warn(`❌ Could not query table ${datasetId}.${tableId}:`, queryError.message);
            costsData.tablesFound.push({
              dataset: datasetId,
              table: tableId,
              error: queryError.message,
              hasRecentData: false,
            });
          }
        }

      } catch (datasetError: any) {
        console.warn(`❌ Could not analyze dataset ${datasetId}:`, datasetError.message);
      }
    }

    // Mettre à jour les projets avec les vrais coûts
    let projectsUpdated = 0;
    for (const projectCost of costsData.costsByProject) {
      try {
        const costPercentage = costsData.totalMonthlyCost > 0 ? 
          (projectCost.totalCost / costsData.totalMonthlyCost) * 100 : 0;

        const { error } = await supabase
          .from('gcp_projects')
          .update({
            monthly_cost: projectCost.totalCost,
            cost_percentage: costPercentage,
            has_export_bigquery: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userEmail)
          .eq('project_id', projectCost.projectId);

        if (!error) {
          projectsUpdated++;
          console.log(`✅ Updated project ${projectCost.projectName} with cost: ${projectCost.totalCost} ${projectCost.currency}`);
        }
      } catch (err: any) {
        console.error(`❌ Error updating project ${projectCost.projectId}:`, err.message);
      }
    }

    // Stocker les données de services
    let servicesStored = 0;
    for (const serviceCost of costsData.costsByService) {
      try {
        const costPercentage = costsData.totalMonthlyCost > 0 ? 
          (serviceCost.totalCost / costsData.totalMonthlyCost) * 100 : 0;

        const { error } = await supabase
          .from('gcp_services_usage')
          .upsert({
            user_id: userEmail,
            service_id: serviceCost.serviceName.toLowerCase().replace(/\s+/g, '-'),
            service_name: serviceCost.serviceName,
            usage_month: new Date().toISOString().slice(0, 7),
            monthly_cost: serviceCost.totalCost,
            currency: serviceCost.currency,
            cost_percentage: costPercentage,
            projects_count: serviceCost.projectsCount,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,service_id,usage_month'
          });

        if (!error) {
          servicesStored++;
        }
      } catch (err: any) {
        console.error(`❌ Error storing service ${serviceCost.serviceName}:`, err.message);
      }
    }

    // Mettre à jour la connexion avec les totaux
    await supabase
      .from('gcp_connections')
      .update({
        total_monthly_cost: costsData.totalMonthlyCost,
        currency: costsData.currency,
        last_finops_sync: new Date().toISOString(),
        finops_sync_status: 'completed',
      })
      .eq('user_id', userEmail);

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ BigQuery costs sync completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'BigQuery costs synchronization completed',
      data: {
        totalMonthlyCost: costsData.totalMonthlyCost,
        currency: costsData.currency,
        projectsWithCosts: costsData.costsByProject.length,
        servicesAnalyzed: costsData.costsByService.length,
        projectsUpdated,
        servicesStored,
        datasetsAnalyzed: costsData.datasetsAnalyzed.length,
        tablesFound: costsData.tablesFound.length,
        processingTime,
      },
      details: {
        costsByProject: costsData.costsByProject,
        costsByService: costsData.costsByService.slice(0, 10), // Top 10
        datasetsAnalyzed: costsData.datasetsAnalyzed,
        tablesFound: costsData.tablesFound,
      }
    });

  } catch (error: any) {
    console.error('❌ BigQuery costs synchronization error:', error);
    
    return NextResponse.json({
      error: 'BigQuery costs synchronization failed',
      details: error.message
    }, { status: 500 });
  }
}
