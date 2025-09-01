import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/debug-insert
 * Debug et insertion forcée avec gestion d'erreurs détaillée
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug insert with detailed error handling...');
    
    const userEmail = 'hlamyne@gmail.com';
    const totalCost = 6.79;
    
    // Nettoyer d'abord toutes les données existantes pour cet utilisateur
    console.log('🧹 Cleaning existing data...');
    await supabase.from('gcp_projects').delete().eq('user_id', userEmail);
    await supabase.from('gcp_services_usage').delete().eq('user_id', userEmail);
    await supabase.from('gcp_optimization_recommendations').delete().eq('user_id', userEmail);
    
    // Récupérer la connexion
    const { data: connection } = await supabase
      .from('gcp_connections')
      .select('*')
      .eq('user_id', userEmail)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'No connection found' }, { status: 404 });
    }

    const projects = connection.account_info?.projects || [];
    console.log(`📊 Found ${projects.length} projects in connection`);

    const results = {
      projects: [],
      services: [],
      recommendations: [],
      errors: []
    };

    // 1. Insérer les projets un par un avec gestion d'erreurs
    for (const project of projects) {
      try {
        const projectCost = totalCost / projects.length;
        
        const { data, error } = await supabase
          .from('gcp_projects')
          .insert({
            user_id: userEmail,
            project_id: project.projectId,
            project_name: project.name,
            project_number: project.projectNumber,
            billing_account_name: project.billingAccountName,
            billing_account_id: project.billingAccountName?.split('/')[1] || '',
            lifecycle_state: project.lifecycleState || 'ACTIVE',
            monthly_cost: projectCost,
            monthly_carbon: projectCost * 0.1,
            cost_percentage: (projectCost / totalCost) * 100,
            carbon_percentage: (projectCost / totalCost) * 100,
            cost_trend: 'stable',
            carbon_trend: 'stable',
            has_export_bigquery: project.projectId === 'carewashv1',
            is_selected: true,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error(`❌ Project ${project.name} error:`, error);
          results.errors.push(`Project ${project.name}: ${error.message}`);
        } else {
          console.log(`✅ Project inserted: ${project.name}`);
          results.projects.push(project.name);
        }
      } catch (err: any) {
        console.error(`❌ Project ${project.name} exception:`, err);
        results.errors.push(`Project ${project.name}: ${err.message}`);
      }
    }

    // 2. Insérer les services un par un
    const services = [
      { id: 'compute-engine', name: 'Compute Engine', cost: totalCost * 0.4 },
      { id: 'cloud-storage', name: 'Cloud Storage', cost: totalCost * 0.2 },
      { id: 'bigquery', name: 'BigQuery', cost: totalCost * 0.2 },
      { id: 'other-services', name: 'Other Services', cost: totalCost * 0.2 }
    ];

    for (const service of services) {
      try {
        const { data, error } = await supabase
          .from('gcp_services_usage')
          .insert({
            user_id: userEmail,
            service_id: service.id,
            service_name: service.name,
            usage_month: new Date().toISOString().slice(0, 7),
            monthly_cost: service.cost,
            currency: 'EUR',
            cost_percentage: (service.cost / totalCost) * 100,
            projects_count: projects.length,
            total_usage: service.cost,
            usage_unit: 'EUR',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error(`❌ Service ${service.name} error:`, error);
          results.errors.push(`Service ${service.name}: ${error.message}`);
        } else {
          console.log(`✅ Service inserted: ${service.name}`);
          results.services.push(service.name);
        }
      } catch (err: any) {
        console.error(`❌ Service ${service.name} exception:`, err);
        results.errors.push(`Service ${service.name}: ${err.message}`);
      }
    }

    // 3. Insérer les recommandations une par une
    const recommendations = [
      {
        id: 'cost-optimization-real',
        type: 'cost',
        title: `Optimisation coûts réels (${totalCost} EUR/mois)`,
        description: `Vos coûts actuels sont de ${totalCost} EUR/mois. Économies de ${(totalCost * 0.15).toFixed(2)} EUR possibles.`,
        potential_savings: totalCost * 0.15,
        potential_carbon_reduction: totalCost * 0.01,
        priority: 'high',
        effort: 'medium',
      },
      {
        id: 'bigquery-analysis',
        type: 'performance',
        title: 'Analyse BigQuery disponible',
        description: 'Le projet carewashv1 a des exports BigQuery. Analysez les coûts détaillés.',
        potential_savings: totalCost * 0.1,
        potential_carbon_reduction: 0.1,
        priority: 'high',
        effort: 'low',
      }
    ];

    for (const rec of recommendations) {
      try {
        const { data, error } = await supabase
          .from('gcp_optimization_recommendations')
          .insert({
            user_id: userEmail,
            recommendation_id: rec.id,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            project_id: '',
            service_id: '',
            potential_savings: rec.potential_savings,
            potential_carbon_reduction: rec.potential_carbon_reduction,
            implementation: 'Analyser et optimiser les ressources',
            priority: rec.priority,
            effort: rec.effort,
            status: 'pending',
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error(`❌ Recommendation ${rec.title} error:`, error);
          results.errors.push(`Recommendation ${rec.title}: ${error.message}`);
        } else {
          console.log(`✅ Recommendation inserted: ${rec.title}`);
          results.recommendations.push(rec.title);
        }
      } catch (err: any) {
        console.error(`❌ Recommendation ${rec.title} exception:`, err);
        results.errors.push(`Recommendation ${rec.title}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Debug insert completed',
      results,
      summary: {
        projectsInserted: results.projects.length,
        servicesInserted: results.services.length,
        recommendationsInserted: results.recommendations.length,
        totalErrors: results.errors.length,
      }
    });

  } catch (error: any) {
    console.error('❌ Debug insert error:', error);
    return NextResponse.json({
      error: 'Debug insert failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to debug insert' });
}
