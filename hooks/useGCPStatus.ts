"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';

interface GCPConnectionData {
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'expired';
  accountEmail?: string;
  projectsCount: number;
  activeProjectsCount: number;
  totalMonthlyCost: number;
  currency: string;
  lastSync?: string;
  billingAccountsCount: number;
  syncStatus: string;
  optimizationScore?: number;
  carbonFootprint?: number;
  isLoading: boolean;
  error?: string;
}

export function useGCPStatus(): GCPConnectionData & {
  refresh: () => Promise<void>;
  disconnect: () => Promise<void>;
} {
  const [data, setData] = useState<GCPConnectionData>({
    isConnected: false,
    connectionStatus: 'disconnected',
    projectsCount: 0,
    activeProjectsCount: 0,
    totalMonthlyCost: 0,
    currency: 'USD',
    billingAccountsCount: 0,
    syncStatus: 'not_synced',
    isLoading: true
  });

  const [lastFetch, setLastFetch] = useState<number>(0);
  const { user, session } = useAuth();

  // Cache pendant 10 minutes (600000ms) pour réduire la fréquence des appels
  const CACHE_DURATION = 10 * 60 * 1000;

  const fetchGCPStatus = async (forceRefresh: boolean = false) => {
    if (!user || !session) {
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        isConnected: false,
        connectionStatus: 'disconnected'
      }));
      return;
    }

    // Vérifier le cache sauf si refresh forcé
    const now = Date.now();
    if (!forceRefresh && (now - lastFetch) < CACHE_DURATION && lastFetch > 0) {
      console.log('🔄 GCP Status: Utilisation du cache (dernière mise à jour il y a', Math.round((now - lastFetch) / 1000), 'secondes)');
      return;
    }

    console.log('🔄 GCP Status: Récupération des données depuis l\'API');
    setData(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // 1. Récupérer le statut de connexion
      const connectionResponse = await fetch('/api/gcp/connection-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (connectionResponse.ok) {
        const connectionData = await connectionResponse.json();
        
        if (connectionData.connection_status === 'connected') {
          // 2. Récupérer les métriques depuis Supabase
          const metricsResponse = await fetch('/api/gcp/metrics', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            }
          });

          let metricsData = null;
          if (metricsResponse.ok) {
            metricsData = await metricsResponse.json();
          }

          // Utiliser les données de connexion et les métriques calculées
          const projects = connectionData.account_info?.projects || [];
          const billingAccounts = connectionData.account_info?.billingAccounts || [];
          
          setData({
            isConnected: true,
            connectionStatus: 'connected',
            accountEmail: connectionData.account_info?.email,
            projectsCount: projects.length,
            activeProjectsCount: metricsData?.data?.activeProjects || projects.length,
            totalMonthlyCost: metricsData?.data?.totalMonthlyCost || 0,
            currency: metricsData?.data?.currency || 'EUR',
            lastSync: connectionData.last_sync ? formatLastSync(connectionData.last_sync) : 'Jamais',
            billingAccountsCount: billingAccounts.length,
            syncStatus: metricsData?.data?.syncStatus || 'pending',
            optimizationScore: metricsData?.data?.averageOptimizationScore || 0,
            carbonFootprint: metricsData?.data?.totalCarbonFootprint || 0,
            isLoading: false
          });

          // Mettre à jour le timestamp du cache
          setLastFetch(now);

        } else {
          // Connexion non active
          setData({
            isConnected: false,
            connectionStatus: connectionData.connection_status || 'disconnected',
            projectsCount: 0,
            activeProjectsCount: 0,
            totalMonthlyCost: 0,
            currency: 'USD',
            billingAccountsCount: 0,
            syncStatus: 'not_synced',
            isLoading: false
          });
        }

      } else if (connectionResponse.status === 401) {
        setData(prev => ({ 
          ...prev, 
          isLoading: false, 
          isConnected: false,
          connectionStatus: 'disconnected',
          error: 'Authentication required'
        }));
      } else {
        // Erreur de connexion
        setData(prev => ({ 
          ...prev, 
          isLoading: false, 
          isConnected: false,
          connectionStatus: 'error',
          error: 'Failed to fetch connection status'
        }));
      }

    } catch (error: any) {
      console.error('Error fetching GCP status:', error);
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        isConnected: false,
        connectionStatus: 'error',
        error: error.message
      }));
    }
  };

  const refresh = async () => {
    await fetchGCPStatus(true); // Force le refresh
  };

  const disconnect = async () => {
    // Cette fonction sera appelée par le GCPDisconnectButton
    // Après la déconnexion, on rafraîchit le statut
    await fetchGCPStatus(true); // Force le refresh
  };

  useEffect(() => {
    // Fetch initial seulement si pas de données en cache
    fetchGCPStatus(false);
  }, [user, session]);

  return {
    ...data,
    refresh,
    disconnect
  };
}

/**
 * Formate la date de dernière synchronisation avec des intervalles plus larges
 */
function formatLastSync(lastSync: string): string {
  const date = new Date(lastSync);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  // Intervalles plus larges pour éviter les mises à jour constantes
  if (diffInMinutes < 2) return 'À l\'instant';
  if (diffInMinutes < 5) return 'Il y a quelques minutes';
  if (diffInMinutes < 15) return 'Il y a 10min';
  if (diffInMinutes < 30) return 'Il y a 20min';
  if (diffInMinutes < 60) return 'Il y a 45min';
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 2) return 'Il y a 1h';
  if (diffInHours < 6) return `Il y a ${Math.floor(diffInHours / 2) * 2}h`; // Arrondi par 2h
  if (diffInHours < 24) return `Il y a ${Math.floor(diffInHours / 4) * 4}h`; // Arrondi par 4h
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Il y a ${diffInDays}j`;
  
  return date.toLocaleDateString('fr-FR');
}
