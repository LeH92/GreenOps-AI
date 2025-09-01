"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { Cloud, Plus, Settings, CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, Activity, Zap, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/ui/company-logo";
import { GCPConnectButton } from "@/components/gcp/GCPConnectButton";
import { GCPDisconnectButton } from "@/components/gcp/GCPDisconnectButton";
import { GCPRealDataCard } from "@/components/gcp/GCPRealDataCard";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/format-utils";
import { GCPWizard2Steps } from "@/components/gcp/GCPWizard2Steps";
import { GCPDebugPanel } from "@/components/gcp/GCPDebugPanel";
import { useGCPStatus } from "@/hooks/useGCPStatus";
import { useAuth } from '@/src/hooks/useAuth';


export default function CloudProvidersPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const gcpStatus = useGCPStatus();
  const { user, session } = useAuth();
  const [providers, setProviders] = useState([
    {
      id: "aws",
      name: "Amazon Web Services",
      shortName: "AWS",
      status: "connected",
      lastSync: "Il y a 2h",
      cost: "$993.00",
      services: 5,
      activeServices: 4,
      color: "orange",
      company: "aws" as const,
      description: "Services cloud complets d'Amazon",
      potentialSavings: "15-25%",
      estimatedTime: "10-15 min",
      finOpsFeatures: ["Cost Explorer", "Budgets", "Reserved Instances", "Savings Plans"]
    },
    // GCP sera géré dynamiquement via useGCPStatus
    {
      id: "azure",
      name: "Microsoft Azure",
      shortName: "Azure",
      status: "disconnected",
      lastSync: "Jamais",
      cost: "$0.00",
      services: 4,
      activeServices: 0,
      color: "blue",
      company: "azure" as const,
      description: "Plateforme cloud enterprise de Microsoft",
      potentialSavings: "20-30%",
      estimatedTime: "15-20 min",
      finOpsFeatures: ["Cost Management", "Advisor", "Hybrid Benefit", "Reservations"]
    }
  ]);

  // Fonction pour déconnecter un fournisseur
  const handleDisconnect = async (providerId: string) => {
    if (providerId === 'gcp') {
      // Pour GCP, on utilise l'API de déconnexion
      // Le GCPConnectButton gère déjà la déconnexion
      // On met à jour juste l'état local
      setProviders(prevProviders => 
        prevProviders.map(provider => 
          provider.id === providerId 
            ? {
                ...provider,
                status: "disconnected",
                lastSync: "Jamais",
                cost: "$0.00",
                activeServices: 0
              }
            : provider
        )
      );
    } else {
      // Pour les autres fournisseurs, déconnexion simple
      setProviders(prevProviders => 
        prevProviders.map(provider => 
          provider.id === providerId 
            ? {
                ...provider,
                status: "disconnected",
                lastSync: "Jamais",
                cost: "$0.00",
                activeServices: 0
              }
            : provider
        )
      );
    }
  };

  // Fonction pour connecter un fournisseur
  const handleConnect = (providerId: string) => {
    setProviders(prevProviders => 
      prevProviders.map(provider => 
        provider.id === providerId 
          ? {
              ...provider,
              status: "connected",
              lastSync: "Il y a quelques secondes",
              cost: provider.id === "aws" ? "$993.00" : provider.id === "gcp" ? "$734.80" : "$456.20",
              activeServices: provider.services - 1
            }
          : provider
      )
    );
  };

  // Liste des fournisseurs (GCP géré séparément)
  const allProviders = providers;

  const totalCost = allProviders.reduce((sum, p) => {
    return sum + parseFloat(p.cost.replace('$', '').replace(',', ''));
  }, 0) + gcpStatus.totalMonthlyCost; // Ajouter GCP séparément
  
  const connectedProviders = allProviders.filter(p => p.status === 'connected').length + 
    (gcpStatus.isConnected ? 1 : 0); // Ajouter GCP si connecté

  // Effet pour ouvrir automatiquement le wizard après OAuth (une seule fois)
  useEffect(() => {
    console.log('🔍 useEffect triggered - checking URL parameters...');
    console.log('🔍 Current URL:', window.location.href);
    
    const urlParams = new URLSearchParams(window.location.search);
    const autoOpenWizard = urlParams.get('auto_open_wizard');
    const gcpStatus = urlParams.get('gcp_status');
    const message = urlParams.get('message');
    
    console.log('🔍 URL Parameters found:', {
      autoOpenWizard,
      gcpStatus,
      message,
      allParams: Object.fromEntries(urlParams.entries())
    });
    
    if (autoOpenWizard === 'true' && gcpStatus === 'connected') {
      console.log('🎯 Opening wizard automatically!');
      setIsWizardOpen(true);
      
      // Nettoyer l'URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auto_open_wizard');
      newUrl.searchParams.delete('gcp_status');
      newUrl.searchParams.delete('message');
      newUrl.searchParams.delete('timestamp');
      window.history.replaceState({}, '', newUrl.toString());
      
      console.log('🧹 URL cleaned:', newUrl.toString());
    } else {
      console.log('❌ Wizard not opened - conditions not met:', {
        autoOpenWizard: autoOpenWizard === 'true',
        gcpStatus: gcpStatus === 'connected'
      });
    }
  }, []); // Dépendances vides pour ne s'exécuter qu'une fois

  // Gérer la sélection d'un projet
  const handleProjectSelected = (project: any) => {
    console.log('Projet sélectionné:', project);
    // Mettre à jour le statut du fournisseur GCP
    handleConnect('gcp');
    setIsWizardOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "disconnected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "bg-green-100 text-green-800 border-green-200",
      disconnected: "bg-red-100 text-red-800 border-red-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return variants[status as keyof typeof variants] || variants.warning;
  };

  const getSavingsColor = (savings: string) => {
    const percentage = parseInt(savings.split('-')[0]);
    if (percentage >= 20) return "text-green-600";
    if (percentage >= 15) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <div className="space-y-8">
      {/* Header moderne */}
      <div className="modern-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="desktop-title">Fournisseurs Cloud</h1>
            <p className="desktop-subtitle">
              Connectez et gérez efficacement tous vos fournisseurs de services cloud depuis une interface centralisée
            </p>
          </div>
          {/* Debug info temporaire */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded space-y-2">
            <div>User: {user?.email || 'Non connecté'}</div>
            <div>Session: {session ? '✅' : '❌'}</div>
            <div>Token: {session?.access_token ? '✅' : '❌'}</div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={async () => {
                console.log('🧪 Test OAuth initiation manually...');
                if (!user || !session) {
                  alert('Pas d\'utilisateur connecté');
                  return;
                }
                
                try {
                  const response = await fetch('/api/gcp/initiate-oauth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessToken: session.access_token }),
                  });
                  
                  const data = await response.json();
                  console.log('Test response:', data);
                  
                  if (response.ok) {
                    alert('OAuth URL généré: ' + data.authUrl.substring(0, 100) + '...');
                  } else {
                    alert('Erreur: ' + data.error);
                  }
                } catch (error: any) {
                  console.error('Test error:', error);
                  alert('Erreur test: ' + error.message);
                }
              }}
              className="mt-1"
            >
              Test OAuth
            </Button>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble - Design moderne */}
      <div className="modern-grid modern-grid-metrics">
        <Card className="metric-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Coût Total</div>
            <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCost)}</div>
              <div className="text-xs text-muted-foreground">ce mois</div>
            </div>
            <div className="flex items-center space-x-1 mt-3">
              <div className="text-xs font-medium text-green-600">
                {formatCurrency(Math.round(totalCost / 12))}/mois
              </div>
              <div className="text-xs text-muted-foreground">en moyenne</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Fournisseurs</div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
              <Cloud className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{connectedProviders}/3</div>
              <div className="text-xs text-muted-foreground">connectés</div>
            </div>
            <div className="flex items-center space-x-1 mt-3">
              <div className="text-xs font-medium text-blue-600">
                {Math.round((connectedProviders / 3) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">taux de connexion</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Services Actifs</div>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-muted-foreground">services surveillés</div>
            </div>
            <div className="flex items-center space-x-1 mt-3">
              <div className="text-xs font-medium text-purple-600">80%</div>
              <div className="text-xs text-muted-foreground">utilisation moyenne</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Économies</div>
            <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">$234</div>
              <div className="text-xs text-muted-foreground">grâce aux optimisations</div>
            </div>
            <div className="flex items-center space-x-1 mt-3">
              <div className="text-xs font-medium text-green-600">+12%</div>
              <div className="text-xs text-muted-foreground">vs mois dernier</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section principale - 3 cartes par ligne avec hauteur uniforme */}
      <div className="space-y-6">
        <div className="providers-grid-uniform">
          {/* Carte GCP spécialisée avec vraies données */}
          <GCPRealDataCard onOpenWizard={() => setIsWizardOpen(true)} />
          
          {/* Autres fournisseurs cloud */}
          {providers.map((provider) => (
              <Card key={provider.name} className="provider-card-uniform modern-card group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <CompanyLogo company={provider.company} size={32} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.shortName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(provider.status)}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusBadge(provider.status)}
                  >
                    {provider.status === "connected" ? "Connecté" : "Déconnecté"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                  {provider.id === 'gcp' && gcpStatus.isLoading ? (
                    // État de chargement pour GCP
                    <div className="space-y-3 animate-pulse">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Chargement...</span>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Projets:</span>
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded"></div>
                    </div>
                  ) : provider.status === "connected" ? (
                    <>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coût mensuel:</span>
                          <span className="font-semibold text-green-600">{provider.cost}</span>
                        </div>
                        
                        {provider.id === 'gcp' ? (
                          // Métriques spéciales pour GCP
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Projets actifs:</span>
                              <span>{provider.activeServices}/{provider.services}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Comptes facturation:</span>
                              <span>{(provider as any).billingAccountsCount || 0}</span>
                            </div>
                            {(provider as any).optimizationScore && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Score d'optimisation:</span>
                                  <span className="font-medium">{(provider as any).optimizationScore}/100</span>
                                </div>
                                <Progress value={(provider as any).optimizationScore} className="h-2" />
                              </div>
                            )}
                            {(provider as any).carbonFootprint && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Empreinte carbone:</span>
                                <span className="text-xs text-green-600">{(provider as any).carbonFootprint.toFixed(2)} kg CO2</span>
                              </div>
                            )}
                          </>
                        ) : (
                          // Métriques standards pour autres fournisseurs
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Services:</span>
                              <span>{provider.activeServices}/{provider.services}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Utilisation:</span>
                                <span>{Math.round((provider.activeServices / provider.services) * 100)}%</span>
                              </div>
                              <Progress value={(provider.activeServices / provider.services) * 100} className="h-2" />
                            </div>
                          </>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dernière sync:</span>
                          <div className="flex items-center gap-1">
                            {provider.id === 'gcp' && !gcpStatus.isLoading && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            )}
                            <span className={provider.id === 'gcp' && gcpStatus.syncStatus === 'error' ? 'text-red-600' : ''}>
                              {provider.lastSync}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-4 mt-auto">
                        <Link href={`/dashboard/cloud-providers/${provider.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full h-10">
                            <Settings className="mr-2 h-4 w-4" />
                            Gérer
                          </Button>
                        </Link>
                        {provider.id === 'gcp' ? (
                          // Pour GCP, bouton de déconnexion avec le vrai workflow
                          <GCPDisconnectButton 
                            onDisconnected={() => {
                              // Rafraîchir le statut GCP après déconnexion
                              gcpStatus.refresh();
                            }}
                            className="flex-1"
                          />
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-10 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDisconnect(provider.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Déconnexion
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span>Économies potentielles:</span>
                          </div>
                          <span className={`font-semibold ${getSavingsColor((provider as any).potentialSavings)}`}>
                            {(provider as any).potentialSavings}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Temps de setup:</span>
                          </div>
                          <span>{provider.estimatedTime}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span>Fonctionnalités FinOps:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {((provider as any).finOpsFeatures || []).map((feature: string, index: number) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-4 mt-auto">
                        {provider.id === 'gcp' ? (
                          <GCPConnectButton 
                            onConnectionChange={(status) => {
                              // Le GCPConnectButton gère sa propre logique OAuth
                              // On met à jour juste l'état local pour l'UI
                              if (status === 'connected') {
                                setProviders(prevProviders => 
                                  prevProviders.map(p => 
                                    p.id === 'gcp' 
                                      ? { ...p, status: 'connected' }
                                      : p
                                  )
                                );
                              } else if (status === 'disconnected') {
                                setProviders(prevProviders => 
                                  prevProviders.map(p => 
                                    p.id === 'gcp' 
                                      ? { ...p, status: 'disconnected' }
                                      : p
                                  )
                                );
                              }
                            }}
                            showStatus={false}
                            className="w-full h-10"
                          />
                        ) : (
                          <Button 
                            className="w-full h-10"
                            onClick={() => handleConnect(provider.id)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Connecter {provider.shortName}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Wizard en 2 étapes pour la configuration GCP */}
      <GCPWizard2Steps
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onProjectSelected={handleProjectSelected}
      />

      {/* Panel de debug GCP */}
      <GCPDebugPanel />
    </div>
  );
}
