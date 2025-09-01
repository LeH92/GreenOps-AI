"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Cloud,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useEffect, useState } from "react";
import { GCPConnectionStatus } from '@/types/gcp-oauth';
import { useAuth } from '@/src/hooks/useAuth';
import { GCPConnectionModal } from './GCPConnectionModal';
import { GCPDisconnectDialog } from './GCPDisconnectDialog';

interface GCPConnectButtonProps {
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'error' | 'expired') => void;
  showStatus?: boolean;
  className?: string;
}

export function GCPConnectButton({ onConnectionChange, showStatus = true, className }: GCPConnectButtonProps) {
  const [connectionStatus, setConnectionStatus] = useState<GCPConnectionStatus['connection_status']>('disconnected');
  const [connectionInfo, setConnectionInfo] = useState<GCPConnectionStatus['account_info'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && session) {
      checkConnectionStatus();
    } else {
      setIsLoading(false);
    }
  }, [user, session]);

  /**
   * Check current GCP connection status from API
   */
  const checkConnectionStatus = async () => {
    if (!user || !session) {
      console.log('No user or session:', { user: !!user, session: !!session });
      setConnectionStatus('disconnected');
      setIsLoading(false);
      return;
    }
    
    console.log('Session debug:', { 
      hasSession: !!session, 
      hasAccessToken: !!session.access_token,
      accessTokenLength: session.access_token?.length || 0 
    });
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/gcp/connection-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      
      if (response.ok) {
        const data: GCPConnectionStatus = await response.json();
        setConnectionStatus(data.connection_status);
        setConnectionInfo(data.account_info);
        onConnectionChange?.(data.connection_status);
      } else if (response.status === 401) {
        setConnectionStatus('disconnected');
        setConnectionInfo(null);
        onConnectionChange?.('disconnected');
      } else {
        console.warn('Unexpected response status:', response.status);
        setConnectionStatus('disconnected');
        setConnectionInfo(null);
        onConnectionChange?.('disconnected');
      }
    } catch (error) {
      console.error('Error checking GCP connection status:', error);
      setConnectionStatus('disconnected');
      setConnectionInfo(null);
      onConnectionChange?.('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initiate OAuth connection
   */
  const handleConnect = async () => {
    console.log('🔄 handleConnect called - GCP OAuth initiation');
    console.log('User:', user?.email);
    console.log('Session:', !!session);
    console.log('Access Token:', session?.access_token?.substring(0, 20) + '...');
    
    if (!user || !session) {
      console.log('❌ No user or session available');
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setConnectionStatus('connecting');
    console.log('🔄 Setting loading state...');

    try {
      console.log('📡 Calling /api/gcp/initiate-oauth...');
      
      // Call the new endpoint that accepts the token in the body
      const response = await fetch('/api/gcp/initiate-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.access_token,
        }),
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ OAuth URL generated:', data.authUrl);
        
        toast({
          title: "Redirection vers Google",
          description: "Vous allez être redirigé vers Google pour l'authentification...",
        });
        
        // Redirect to the Google OAuth URL
        console.log('🚀 Redirecting to:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to initiate OAuth');
      }
      
    } catch (error: any) {
      console.error('❌ Error initiating OAuth:', error);
      
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible d'initier la connexion OAuth",
        variant: "destructive",
      });
      
      setConnectionStatus('error');
      setIsLoading(false);
      onConnectionChange?.('error');
    }
  };

  /**
   * Handle project selection from modal
   */
  const handleProjectSelected = (project: any) => {
    console.log('Project selected:', project);
    // Ici vous pouvez ajouter la logique pour traiter le projet sélectionné
    onConnectionChange?.('connected');
  };

  /**
   * Open project selection modal (now handled automatically by the page)
   */
  const openProjectModal = () => {
    // This is now handled automatically by the page after OAuth
    console.log('Modal opening is now handled automatically by the page');
  };

  /**
   * Open disconnect dialog
   */
  const handleDisconnectClick = () => {
    setIsDisconnectDialogOpen(true);
  };

  /**
   * Handle successful disconnection from dialog
   */
  const handleDisconnected = () => {
    setConnectionStatus('disconnected');
    setConnectionInfo(null);
    onConnectionChange?.('disconnected');
  };

  /**
   * Refresh connection data
   */
  const handleRefresh = async () => {
    if (!user || !session) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/gcp/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Données actualisées",
          description: `${data.projectsCount || 0} projets synchronisés`,
        });
        
        await checkConnectionStatus();
      } else {
        throw new Error('Échec de l\'actualisation');
      }
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      
      toast({
        title: "Erreur d'actualisation",
        description: error.message || "Impossible d'actualiser les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Cloud className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return "bg-green-100 text-green-800 border-green-200";
      case 'disconnected':
        return "bg-red-100 text-red-800 border-red-200";
      case 'error':
      case 'expired':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };



  // Render the appropriate button based on connection status
  const renderButton = () => {
    if (!user || !session) {
      return (
        <Button 
          className={className} 
          onClick={() => {
            console.log('❌ User not authenticated - redirecting to login');
            toast({
              title: "Authentification requise",
              description: "Redirection vers la page de connexion...",
              variant: "destructive",
            });
            window.location.href = '/login';
          }}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Connecter Google Cloud
        </Button>
      );
    }

    if (!showStatus || connectionStatus === 'disconnected' || connectionStatus === 'error' || connectionStatus === 'expired') {
      return (
        <Button 
          className={className} 
          onClick={handleConnect} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Connecter Google Cloud
            </>
          )}
        </Button>
      );
    }

    // Connected state - show manage and disconnect buttons
    return (
      <div className="flex space-x-2 pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={openProjectModal} disabled={isLoading}>
          <Settings className="mr-2 h-4 w-4" />
          Gérer
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleDisconnectClick}
          disabled={isLoading}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Existing button logic */}
      {renderButton()}
      
      {/* Project Selection Modal */}
      <GCPConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectSelected={handleProjectSelected}
      />

      {/* Disconnect Confirmation Dialog */}
      <GCPDisconnectDialog
        isOpen={isDisconnectDialogOpen}
        onClose={() => setIsDisconnectDialogOpen(false)}
        onDisconnected={handleDisconnected}
        connectionInfo={{
          projectsCount: connectionInfo?.projects?.length || 0,
          billingDataCount: 0, // À calculer depuis l'API si nécessaire
          lastSync: 'Il y a 1h' // À récupérer depuis connectionInfo
        }}
      />
    </>
  );
}
