import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/test/bigquery-costs-direct
 * Test direct des coûts BigQuery avec votre connexion stockée
 */
export async function POST(request: NextRequest) {
  const userEmail = 'hlamyne@gmail.com';
  
  try {
    console.log(`💰 Testing BigQuery costs for ${userEmail}...`);
    
    // Récupérer votre connexion directement
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted')
      .eq('user_id', userEmail)
      .eq('connection_status', 'connected')
      .single();

    if (!connection || !connection.tokens_encrypted) {
      return NextResponse.json({ 
        error: 'No connection found for user'
      }, { status: 404 });
    }

    // Initialiser BigQuery
    const tokens = JSON.parse(connection.tokens_encrypted);
    
    // Normaliser les dates
    if (tokens.expires_at && typeof tokens.expires_at === 'string') {
      tokens.expires_at = new Date(tokens.expires_at);
    }
    
    const oauth2Client = gcpOAuthClient.getAuthenticatedClient(tokens);
    const bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });

    console.log('🔍 Listing datasets in carewashv1...');
    
    // Lister les datasets
    const { data: datasetsResponse } = await bigquery.datasets.list({
      projectId: 'carewashv1'
    });

    const datasets = datasetsResponse.datasets || [];
    console.log(`📊 Found ${datasets.length} datasets:`, 
      datasets.map(d => d.datasetReference?.datasetId));

    const analysisResults = [];

    // Analyser chaque dataset
    for (const dataset of datasets) {
      const datasetId = dataset.datasetReference?.datasetId;
      if (!datasetId) continue;

      try {
        console.log(`🔍 Analyzing dataset: ${datasetId}`);
        
        const { data: tablesResponse } = await bigquery.tables.list({
          projectId: 'carewashv1',
          datasetId: datasetId
        });

        const tables = tablesResponse.tables || [];
        console.log(`📋 Dataset ${datasetId} has ${tables.length} tables:`, 
          tables.map(t => t.tableReference?.tableId).slice(0, 3));

        // Chercher les tables de facturation
        const billingTables = tables.filter(table => {
          const tableId = table.tableReference?.tableId || '';
          return tableId.includes('gcp_billing_export') || 
                 tableId.includes('billing_export');
        });

        if (billingTables.length > 0) {
          console.log(`💰 Found ${billingTables.length} billing tables in ${datasetId}`);
          
          // Tester une requête simple sur la première table
          const firstTable = billingTables[0];
          const tableId = firstTable.tableReference?.tableId;
          
          try {
            const testQuery = `
              SELECT 
                COUNT(*) as total_records,
                SUM(cost) as total_cost,
                currency,
                MIN(usage_start_time) as earliest_date,
                MAX(usage_start_time) as latest_date
              FROM \`carewashv1.${datasetId}.${tableId}\`
              WHERE cost > 0
              GROUP BY currency
              LIMIT 5
            `;

            console.log(`🧪 Testing query on ${datasetId}.${tableId}...`);
            
            const { data: testResult } = await bigquery.jobs.query({
              projectId: 'carewashv1',
              requestBody: {
                query: testQuery,
                useLegacySql: false,
                timeoutMs: 15000,
              },
            });

            if (testResult.rows && testResult.rows.length > 0) {
              const row = testResult.rows[0];
              const totalRecords = parseInt(row.f?.[0]?.v || '0');
              const totalCost = parseFloat(row.f?.[1]?.v || '0');
              const currency = row.f?.[2]?.v || 'EUR';
              const earliestDate = row.f?.[3]?.v || '';
              const latestDate = row.f?.[4]?.v || '';

              analysisResults.push({
                dataset: datasetId,
                table: tableId,
                status: 'SUCCESS',
                totalRecords,
                totalCost,
                currency,
                dataRange: { earliestDate, latestDate },
                hasRealCosts: totalCost > 0,
              });

              console.log(`✅ ${datasetId}.${tableId}: ${totalRecords} records, ${totalCost} ${currency} total`);
            } else {
              analysisResults.push({
                dataset: datasetId,
                table: tableId,
                status: 'NO_DATA',
                message: 'Table exists but no cost data found',
              });
            }

          } catch (queryError: any) {
            console.error(`❌ Query error on ${tableId}:`, queryError.message);
            analysisResults.push({
              dataset: datasetId,
              table: tableId,
              status: 'QUERY_ERROR',
              error: queryError.message,
            });
          }
        }

        analysisResults.push({
          dataset: datasetId,
          totalTables: tables.length,
          billingTables: billingTables.length,
          tableNames: tables.map(t => t.tableReference?.tableId),
        });

      } catch (datasetError: any) {
        console.error(`❌ Dataset error for ${datasetId}:`, datasetError.message);
        analysisResults.push({
          dataset: datasetId,
          status: 'DATASET_ERROR',
          error: datasetError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'BigQuery analysis completed',
      userEmail,
      projectAnalyzed: 'carewashv1',
      datasetsFound: datasets.length,
      analysisResults,
      summary: {
        hasWorkingTables: analysisResults.some(r => r.status === 'SUCCESS'),
        totalCostFound: analysisResults
          .filter(r => r.totalCost)
          .reduce((sum, r) => sum + (r.totalCost || 0), 0),
        workingTables: analysisResults
          .filter(r => r.status === 'SUCCESS')
          .map(r => `${r.dataset}.${r.table}`),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ BigQuery test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      userEmail,
    }, { status: 500 });
  }
}
