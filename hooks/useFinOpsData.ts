/**
 * Hook personnalisé pour récupérer et gérer les données FinOps/GreenOps
 * Optimisé selon les règles apigcprules avec cache et gestion d'erreurs
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/src/hooks/useAuth';

export interface FinOpsKPIs {
  // Métriques globales
  totalMonthlyCost: number;
  totalMonthlyCarbon: number;
  currency: string;
  
  // Projets
  totalProjects: number;
  topCostProjects: Array<{
    projectId: string;
    projectName: string;
    monthlyCost: number;
    costPercentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  
  topCarbonProjects: Array<{
    projectId: string;
    projectName: string;
    monthlyCarbon: number;
    carbonPercentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  
  // Services
  topCostServices: Array<{
    serviceId: string;
    serviceName: string;
    monthlyCost: number;
    costPercentage: number;
    projectsCount: number;
  }>;
  
  // Budgets
  budgets: Array<{
    budgetName: string;
    budgetAmount: number;
    currentSpend: number;
    utilizationPercentage: number;
    status: 'on_track' | 'warning' | 'over_budget' | 'critical';
    projectedSpend: number;
  }>;
  
  // Recommandations
  recommendations: Array<{
    id: string;
    type: 'cost' | 'carbon' | 'performance';
    title: string;
    description: string;
    potentialSavings: number;
    potentialCarbonReduction: number;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  }>;
  
  // Anomalies
  costAnomalies: Array<{
    id: string;
    projectId: string;
    serviceName: string;
    anomalyType: 'spike' | 'unusual_pattern' | 'budget_exceeded';
    severity: 'low' | 'medium' | 'high' | 'critical';
    currentCost: number;
    expectedCost: number;
    variancePercentage: number;
    date: string;
    status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  }>;
  
  // Tendances
  monthlyTrends: Array<{
    month: string;
    totalCost: number;
    totalCarbon: number;
    costChangePercentage: number;
    carbonChangePercentage: number;
  }>;
}

export interface UseFinOpsDataReturn {
  data: FinOpsKPIs | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  markRecommendationAsCompleted: (recommendationId: string) => Promise<void>;
  dismissAnomaly: (anomalyId: string) => Promise<void>;
}

// Cache avec TTL de 10 minutes pour éviter trop d'appels API
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let cachedData: FinOpsKPIs | null = null;
let cacheTimestamp: number = 0;

export function useFinOpsData(): UseFinOpsDataReturn {
  const [data, setData] = useState<FinOpsKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, session } = useAuth();

  // Fonction pour récupérer les données depuis Supabase
  const fetchFinOpsData = useCallback(async (useCache: boolean = true): Promise<void> => {
    if (!user || !session) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    // Vérifier le cache
    const now = Date.now();
    if (useCache && cachedData && (now - cacheTimestamp) < CACHE_TTL) {
      console.log('📊 Using cached FinOps data');
      setData(cachedData);
      setLastUpdated(new Date(cacheTimestamp));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Fetching fresh FinOps data from API...');

      const response = await fetch('/api/gcp/finops-dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch FinOps data');
      }

      const result = await response.json();
      
      if (result.success) {
        const finOpsData = result.data as FinOpsKPIs;
        
        // Mettre à jour le cache
        cachedData = finOpsData;
        cacheTimestamp = now;
        
        setData(finOpsData);
        setLastUpdated(new Date());
        
        console.log('✅ FinOps data loaded successfully:', {
          projects: finOpsData.totalProjects,
          cost: finOpsData.totalMonthlyCost,
          carbon: finOpsData.totalMonthlyCarbon,
          recommendations: finOpsData.recommendations.length,
        });
      } else {
        throw new Error(result.error || 'Invalid response format');
      }

    } catch (err: any) {
      console.error('❌ Error fetching FinOps data:', err);
      setError(err.message);
      
      // En cas d'erreur, utiliser les données en cache si disponibles
      if (cachedData) {
        console.log('⚠️ Using stale cached data due to error');
        setData(cachedData);
        setLastUpdated(new Date(cacheTimestamp));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  // Fonction pour actualiser les budgets spécifiquement
  const refreshBudgets = useCallback(async (): Promise<void> => {
    if (!user || !session) return;

    try {
      const response = await fetch('/api/gcp/budgets-refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Invalider le cache et recharger
        cacheTimestamp = 0;
        await fetchFinOpsData(false);
      }
    } catch (err: any) {
      console.error('Error refreshing budgets:', err);
    }
  }, [user, session, fetchFinOpsData]);

  // Fonction pour actualiser les recommandations
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    if (!user || !session) return;

    try {
      const response = await fetch('/api/gcp/recommendations-refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        cacheTimestamp = 0;
        await fetchFinOpsData(false);
      }
    } catch (err: any) {
      console.error('Error refreshing recommendations:', err);
    }
  }, [user, session, fetchFinOpsData]);

  // Fonction pour marquer une recommandation comme terminée
  const markRecommendationAsCompleted = useCallback(async (recommendationId: string): Promise<void> => {
    if (!user || !session) return;

    try {
      const response = await fetch('/api/gcp/recommendations/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommendationId }),
      });

      if (response.ok) {
        // Mettre à jour localement
        if (data) {
          const updatedData = {
            ...data,
            recommendations: data.recommendations.map(rec => 
              rec.id === recommendationId 
                ? { ...rec, status: 'completed' as const }
                : rec
            ),
          };
          setData(updatedData);
          cachedData = updatedData;
        }
      }
    } catch (err: any) {
      console.error('Error marking recommendation as completed:', err);
    }
  }, [user, session, data]);

  // Fonction pour rejeter une anomalie
  const dismissAnomaly = useCallback(async (anomalyId: string): Promise<void> => {
    if (!user || !session) return;

    try {
      const response = await fetch('/api/gcp/anomalies/dismiss', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anomalyId }),
      });

      if (response.ok) {
        // Mettre à jour localement
        if (data) {
          const updatedData = {
            ...data,
            costAnomalies: data.costAnomalies.filter(anomaly => anomaly.id !== anomalyId),
          };
          setData(updatedData);
          cachedData = updatedData;
        }
      }
    } catch (err: any) {
      console.error('Error dismissing anomaly:', err);
    }
  }, [user, session, data]);

  // Fonction de refresh général (force le rechargement)
  const refresh = useCallback(async (): Promise<void> => {
    cacheTimestamp = 0; // Invalider le cache
    await fetchFinOpsData(false);
  }, [fetchFinOpsData]);

  // Charger les données au montage et quand l'utilisateur change
  useEffect(() => {
    if (user && session) {
      fetchFinOpsData();
    } else {
      setData(null);
      setIsLoading(false);
      setError('User not authenticated');
    }
  }, [user, session, fetchFinOpsData]);

  // Auto-refresh toutes les 10 minutes si la page est active
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && user && session) {
        console.log('🔄 Auto-refreshing FinOps data...');
        fetchFinOpsData(false); // Force refresh
      }
    }, CACHE_TTL);

    return () => clearInterval(interval);
  }, [user, session, fetchFinOpsData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    refreshBudgets,
    refreshRecommendations,
    markRecommendationAsCompleted,
    dismissAnomaly,
  };
}

// Hook pour les métriques de performance (monitoring du hook lui-même)
export function useFinOpsPerformance() {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    lastError: null as string | null,
  });

  const recordApiCall = useCallback((responseTime: number, fromCache: boolean, error?: string) => {
    setMetrics(prev => ({
      ...prev,
      apiCalls: prev.apiCalls + 1,
      cacheHits: fromCache ? prev.cacheHits + 1 : prev.cacheHits,
      cacheMisses: fromCache ? prev.cacheMisses : prev.cacheMisses + 1,
      averageResponseTime: (prev.averageResponseTime + responseTime) / 2,
      lastError: error || prev.lastError,
    }));
  }, []);

  return { metrics, recordApiCall };
}

// Utilitaires pour formater les données
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCarbon = (amount: number): string => {
  if (amount < 1) {
    return `${(amount * 1000).toFixed(0)} g CO₂e`;
  }
  return `${amount.toFixed(1)} kg CO₂e`;
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

export const formatTrend = (trend: 'increasing' | 'decreasing' | 'stable'): { icon: string; color: string; label: string } => {
  switch (trend) {
    case 'increasing':
      return { icon: '📈', color: 'text-red-600', label: 'En hausse' };
    case 'decreasing':
      return { icon: '📉', color: 'text-green-600', label: 'En baisse' };
    default:
      return { icon: '➡️', color: 'text-gray-600', label: 'Stable' };
  }
};

export const getBudgetStatusColor = (status: string): string => {
  switch (status) {
    case 'on_track':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'over_budget':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'critical':
      return 'text-red-800 bg-red-100 border-red-300';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};
