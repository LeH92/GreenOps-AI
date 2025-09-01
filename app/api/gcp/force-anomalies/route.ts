import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/gcp/force-anomalies
 * Force l'insertion d'anomalies avec colonnes minimales
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 Forcing anomalies insertion...');
    
    const userEmail = 'hlamyne@gmail.com';
    const TOTAL_MONTHLY_COST = 6.79;
    
    // Supprimer les anciennes anomalies
    await supabase
      .from('gcp_cost_anomalies')
      .delete()
      .eq('user_id', userEmail);

    const results = {
      anomaliesStored: 0,
      errors: [] as string[],
    };

    // Créer des anomalies de test avec colonnes minimales
    const testAnomalies = [
      {
        user_id: userEmail,
        anomaly_date: new Date().toISOString().split('T')[0],
        anomaly_type: 'spike',
        severity: 'medium',
        current_cost: 2.72, // Compute Engine
        expected_cost: 1.70,
        variance_percentage: 60,
        currency: 'EUR',
        description: 'Compute Engine coûte 2.72 EUR (40% du total), légèrement au-dessus de la moyenne attendue.',
        status: 'open',
        created_at: new Date().toISOString(),
      },
      {
        user_id: userEmail,
        anomaly_date: new Date().toISOString().split('T')[0],
        anomaly_type: 'unusual_pattern',
        severity: 'low',
        current_cost: TOTAL_MONTHLY_COST,
        expected_cost: 5.0,
        variance_percentage: 36,
        currency: 'EUR',
        description: `Coût total mensuel (${TOTAL_MONTHLY_COST} EUR) supérieur à la baseline de 5 EUR. Surveillance recommandée.`,
        status: 'open',
        created_at: new Date().toISOString(),
      }
    ];

    // Insérer une anomalie à la fois pour détecter les erreurs
    for (const anomaly of testAnomalies) {
      try {
        console.log('🚨 Inserting anomaly:', anomaly.description.substring(0, 50) + '...');
        
        const { error } = await supabase
          .from('gcp_cost_anomalies')
          .insert(anomaly);

        if (error) {
          console.error('❌ Anomaly error:', error);
          results.errors.push(`Anomaly insertion: ${error.message}`);
        } else {
          results.anomaliesStored++;
          console.log(`✅ Anomaly stored: ${anomaly.anomaly_type}`);
        }
      } catch (err: any) {
        results.errors.push(`Anomaly exception: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: results.anomaliesStored > 0,
      message: `Anomalies force sync: ${results.anomaliesStored} stored`,
      data: {
        anomaliesStored: results.anomaliesStored,
        errors: results.errors,
        anomaliesCreated: testAnomalies.map(a => ({
          type: a.anomaly_type,
          severity: a.severity,
          cost: a.current_cost + ' EUR',
          variance: a.variance_percentage.toFixed(1) + '%',
          description: a.description.substring(0, 80) + '...'
        }))
      }
    });

  } catch (error: any) {
    console.error('❌ Force anomalies error:', error);
    return NextResponse.json({
      error: 'Force anomalies failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to force anomalies insertion' });
}
