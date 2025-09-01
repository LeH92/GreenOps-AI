"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';

interface GCPRecommendation {
  id: string;
  type: 'cost' | 'carbon' | 'performance';
  title: string;
  description: string;
  savings: string;
  impact: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

interface UseGCPDataReturn {
  recommendations: GCPRecommendation[];
  totalSavings: number;
  isLoading: boolean;
  error: string | null;
  projects: any[];
  billingAccounts: any[];
  costData: any[];
  carbonData: any[];
  refresh: () => Promise<void>;
}

// Cache pour éviter trop d'appels API
let cachedData: any = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useGCPData(): UseGCPDataReturn {
  const [data, setData] = useState<UseGCPDataReturn>({
    recommendations: [],
    totalSavings: 0,
    isLoading: true,
    error: null,
    projects: [],
    billingAccounts: [],
    costData: [],
    carbonData: [],
    refresh: async () => {},
  });

  const { user, session } = useAuth();

  const fetchGCPData = async (forceRefresh: boolean = false) => {
    if (!user || !session) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'User not authenticated',
      }));
      return;
    }

    // Vérifier le cache
    const now = Date.now();
    if (!forceRefresh && cachedData && (now - lastFetch) < CACHE_DURATION) {
      console.log('📊 Using cached GCP data');
      setData(prev => ({ ...prev, ...cachedData, isLoading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('📊 Fetching real GCP FinOps data...');

      // Récupérer les vraies données depuis notre API FinOps
      const [metricsResponse, userDataResponse] = await Promise.all([
        fetch('/api/gcp/metrics', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }),
        fetch(`/api/debug/user-finops-data?userId=${user.email}`)
      ]);

      let metricsData = null;
      let userData = null;

      if (metricsResponse.ok) {
        metricsData = await metricsResponse.json();
      }

      if (userDataResponse.ok) {
        userData = await userDataResponse.json();
      }

      // Traiter les recommandations réelles
      const realRecommendations: GCPRecommendation[] = [];
      
      if (userData?.userData?.recommendations?.data) {
        // Recommandations depuis Supabase
        userData.userData.recommendations.data.forEach((rec: any) => {
          realRecommendations.push({
            id: rec.recommendation_id,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            savings: rec.potential_savings > 0 ? 
              `${rec.potential_savings.toFixed(2)} EUR/mois` : 
              'À évaluer',
            impact: rec.priority, // high/medium/low
            status: rec.status,
            progress: rec.status === 'completed' ? 100 : 
                     rec.status === 'in_progress' ? 50 : 0,
          });
        });
      }

      // Si pas de recommandations réelles, générer des recommandations intelligentes
      if (realRecommendations.length === 0 && metricsData?.data) {
        const metrics = metricsData.data;
        
        // Recommandation basée sur les vraies données
        if (metrics.totalMonthlyCost > 0) {
          realRecommendations.push({
            id: 'real-cost-optimization',
            type: 'cost',
            title: 'Optimiser les coûts actuels',
            description: `Vous dépensez ${metrics.totalMonthlyCost.toFixed(2)} ${metrics.currency}/mois. Analysez les services les plus coûteux.`,
            savings: `${(metrics.totalMonthlyCost * 0.15).toFixed(2)} ${metrics.currency}/mois`,
            impact: 'high',
            status: 'pending',
            progress: 0,
          });
        }

        // Recommandation BigQuery si pas configuré
        if (!metrics.hasRealData) {
          realRecommendations.push({
            id: 'setup-bigquery',
            type: 'performance',
            title: 'Configurer les exports BigQuery',
            description: 'Activez les exports de facturation pour des analyses détaillées.',
            savings: 'Analyses précises',
            impact: 'high',
            status: 'pending',
            progress: 0,
          });
        }

        // Recommandation sur les comptes fermés
        if (userData?.userData?.billingAccounts?.data) {
          const closedAccounts = userData.userData.billingAccounts.data.filter((acc: any) => !acc.is_open);
          if (closedAccounts.length > 0) {
            realRecommendations.push({
              id: 'closed-accounts',
              type: 'cost',
              title: `${closedAccounts.length} compte(s) fermé(s)`,
              description: 'Vérifiez les projets liés aux comptes fermés.',
              savings: 'Éviter les frais',
              impact: 'medium',
              status: 'pending',
              progress: 0,
            });
          }
        }
      }

      // Calculer les économies totales
      const totalSavings = realRecommendations.reduce((sum, rec) => {
        const savings = parseFloat(rec.savings.replace(/[^0-9.]/g, '')) || 0;
        return sum + savings;
      }, 0);

      const newData = {
        recommendations: realRecommendations,
        totalSavings,
        isLoading: false,
        error: null,
        projects: userData?.userData?.projects?.data || [],
        billingAccounts: userData?.userData?.billingAccounts?.data || [],
        costData: userData?.userData?.services?.data || [],
        carbonData: [],
        refresh: () => fetchGCPData(true),
      };

      // Mettre à jour le cache
      cachedData = newData;
      lastFetch = now;

      setData(newData);

      console.log('✅ Real GCP data loaded:', {
        recommendations: realRecommendations.length,
        totalSavings,
        projects: newData.projects.length,
        billingAccounts: newData.billingAccounts.length,
      });

    } catch (error: any) {
      console.error('❌ Error fetching GCP data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    fetchGCPData();
  }, [user, session]);

  return data;
}