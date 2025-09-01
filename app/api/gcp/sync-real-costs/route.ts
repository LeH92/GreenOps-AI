import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { gcpOAuthClient } from '@/lib/gcp/oauth-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/sync-real-costs
 * Synchronisation complète avec vos vraies données BigQuery carewashv1
 */
export async function POST(request: NextRequest) {
  const userEmail = 'hlamyne@gmail.com';
  const targetProject = 'carewashv1';
  const targetDataset = 'finops_reports';
  const targetTable = 'gcp_billing_export_resource_v1_01CAF1_7432C8_A5273E';
  
  try {
    console.log(`💰 Syncing REAL costs from ${targetProject}.${targetDataset}.${targetTable}...`);
    
    // Récupérer votre connexion
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('tokens_encrypted')
      .eq('user_id', userEmail)
      .eq('connection_status', 'connected')
      .single();

    if (!connection || !connection.tokens_encrypted) {
      return NextResponse.json({ 
        error: 'No connection found'
      }, { status: 404 });
    }

    // Initialiser BigQuery avec vos tokens
    const tokens = JSON.parse(connection.tokens_encrypted);
    if (tokens.expires_at && typeof tokens.expires_at === 'string') {
      tokens.expires_at = new Date(tokens.expires_at);
    }
    
    const oauth2Client = gcpOAuthClient.getAuthenticatedClient(tokens);
    const bigquery = google.bigquery({ version: 'v2', auth: oauth2Client });

    // Requête simplifiée pour vos vraies données de coûts
    const detailedCostQuery = `
      SELECT 
        project.id as project_id,
        project.name as project_name,
        service.description as service_name,
        SUM(cost) as total_cost,
        currency,
        COUNT(*) as record_count
      FROM \`${targetProject}.${targetDataset}.${targetTable}\`
      WHERE cost > 0
      GROUP BY 
        project.id, project.name, service.description, currency
      ORDER BY total_cost DESC
      LIMIT 20
    `;

    console.log('📊 Executing detailed cost analysis...');
    
    const { data: costResult } = await bigquery.jobs.query({
      projectId: targetProject,
      requestBody: {
        query: detailedCostQuery,
        useLegacySql: false,
        timeoutMs: 30000,
      },
    });

    const realCostsData = {
      totalCost: 0,
      currency: 'EUR',
      projectCosts: new Map(),
      serviceCosts: new Map(),
      dailyCosts: new Map(),
      locationCosts: new Map(),
      records: [],
    };

    if (costResult.rows && costResult.rows.length > 0) {
      console.log(`✅ Found ${costResult.rows.length} detailed cost records`);
      
      for (const row of costResult.rows) {
        const projectId = row.f?.[0]?.v || '';
        const projectName = row.f?.[1]?.v || projectId;
        const serviceName = row.f?.[2]?.v || 'Unknown';
        const cost = parseFloat(row.f?.[3]?.v || '0');
        const currency = row.f?.[4]?.v || 'EUR';
        const recordCount = parseInt(row.f?.[5]?.v || '0');

        realCostsData.totalCost += cost;
        realCostsData.currency = currency;

        // Agréger par projet
        if (!realCostsData.projectCosts.has(projectId)) {
          realCostsData.projectCosts.set(projectId, {
            projectId,
            projectName,
            totalCost: 0,
            services: new Set(),
            records: 0,
          });
        }
        const projectData = realCostsData.projectCosts.get(projectId);
        projectData.totalCost += cost;
        projectData.services.add(serviceName);
        projectData.records += recordCount;

        // Agréger par service
        if (!realCostsData.serviceCosts.has(serviceName)) {
          realCostsData.serviceCosts.set(serviceName, {
            serviceName,
            totalCost: 0,
            projects: new Set(),
          });
        }
        const serviceData = realCostsData.serviceCosts.get(serviceName);
        serviceData.totalCost += cost;
        serviceData.projects.add(projectId);

        // Stocker le détail
        realCostsData.records.push({
          projectId,
          projectName,
          serviceName,
          cost,
          currency,
          recordCount,
        });
      }
    }

    // Convertir les Maps en arrays pour la réponse
    const projectCostsArray = Array.from(realCostsData.projectCosts.values()).map(p => ({
      ...p,
      services: Array.from(p.services),
      costPercentage: realCostsData.totalCost > 0 ? (p.totalCost / realCostsData.totalCost) * 100 : 0,
    }));

    const serviceCostsArray = Array.from(realCostsData.serviceCosts.values()).map(s => ({
      ...s,
      projects: Array.from(s.projects),
      projectsCount: s.projects.size,
      costPercentage: realCostsData.totalCost > 0 ? (s.totalCost / realCostsData.totalCost) * 100 : 0,
    }));

    // Mettre à jour Supabase avec les VRAIES données
    console.log('💾 Updating Supabase with REAL cost data...');
    
    // Mettre à jour les projets avec les vrais coûts
    let projectsUpdated = 0;
    for (const projectCost of projectCostsArray) {
      const { error } = await supabase
        .from('gcp_projects')
        .update({
          monthly_cost: projectCost.totalCost,
          cost_percentage: projectCost.costPercentage,
          has_export_bigquery: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userEmail)
        .eq('project_id', projectCost.projectId);

      if (!error) {
        projectsUpdated++;
        console.log(`✅ Updated ${projectCost.projectName}: ${projectCost.totalCost} EUR`);
      }
    }

    // Stocker les services avec vrais coûts
    let servicesStored = 0;
    for (const serviceCost of serviceCostsArray) {
      const { error } = await supabase
        .from('gcp_services_usage')
        .upsert({
          user_id: userEmail,
          service_id: serviceCost.serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          service_name: serviceCost.serviceName,
          usage_month: new Date().toISOString().slice(0, 7),
          monthly_cost: serviceCost.totalCost,
          currency: realCostsData.currency,
          cost_percentage: serviceCost.costPercentage,
          projects_count: serviceCost.projectsCount,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,service_id,usage_month'
        });

      if (!error) {
        servicesStored++;
      }
    }

    // Mettre à jour la connexion avec le total réel
    await supabase
      .from('gcp_connections')
      .update({
        total_monthly_cost: realCostsData.totalCost,
        currency: realCostsData.currency,
        last_finops_sync: new Date().toISOString(),
        finops_sync_status: 'completed_with_bigquery',
      })
      .eq('user_id', userEmail);

    console.log(`✅ REAL costs sync completed: ${realCostsData.totalCost} ${realCostsData.currency}`);

    return NextResponse.json({
      success: true,
      message: 'REAL BigQuery costs synchronized successfully!',
      realData: {
        totalCost: realCostsData.totalCost,
        currency: realCostsData.currency,
        projectCosts: projectCostsArray,
        serviceCosts: serviceCostsArray.slice(0, 10),
        recordsAnalyzed: realCostsData.records.length,
        projectsUpdated,
        servicesStored,
      },
      bigQueryInfo: {
        project: targetProject,
        dataset: targetDataset,
        table: targetTable,
        recordsFound: costResult.rows?.length || 0,
      }
    });

  } catch (error: any) {
    console.error('❌ Real costs sync error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      userEmail,
    }, { status: 500 });
  }
}
