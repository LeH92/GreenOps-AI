"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { Cloud, Plus, Settings, CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/ui/company-logo";
import { GCPConnectButton } from "@/components/gcp/GCPConnectButton";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/format-utils";
import { GCPWizard2Steps } from "@/components/gcp/GCPWizard2Steps";


export default function CloudProvidersPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
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
      setupComplexity: "Moyenne",
      estimatedTime: "10-15 min"
    },
    {
      id: "gcp",
      name: "Google Cloud Platform",
      shortName: "GCP",
      status: "connected", 
      lastSync: "Il y a 1h",
      cost: "$734.80",
      services: 5,
      activeServices: 4,
      color: "blue",
      company: "google-cloud" as const,
      description: "Plateforme cloud de Google avec IA intégrée",
      setupComplexity: "Facile",
      estimatedTime: "5-10 min"
    },
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
      setupComplexity: "Difficile",
      estimatedTime: "15-20 min"
    }
  ]);

  // Fonction pour déconnecter un fournisseur
  const handleDisconnect = (providerId: string) => {
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

  const totalCost = providers.reduce((sum, p) => sum + parseFloat(p.cost.replace('$', '').replace(',', '')), 0);
  const connectedProviders = providers.filter(p => p.status === 'connected').length;

  // Effet pour ouvrir automatiquement le wizard après OAuth
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
  }, []);

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

  const getComplexityColor = (complexity: string) => {
    const colors = {
      "Facile": "text-green-600",
      "Moyenne": "text-yellow-600",
      "Difficile": "text-red-600"
    };
    return colors[complexity as keyof typeof colors] || "text-gray-600";
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

      {/* Section principale - 3 cartes par ligne */}
      <div className="space-y-6">
        <div className="providers-grid-3-cols">
            {providers.map((provider) => (
              <Card key={provider.name} className="modern-card group cursor-pointer">
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
                <CardContent className="space-y-4">
                  {provider.status === "connected" ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coût mensuel:</span>
                          <span className="font-semibold text-green-600">{provider.cost}</span>
                        </div>
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
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dernière sync:</span>
                          <span>{provider.lastSync}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Link href={`/dashboard/cloud-providers/${provider.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            Gérer
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDisconnect(provider.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Déconnexion
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Complexité:</span>
                          <span className={`font-semibold ${getComplexityColor(provider.setupComplexity)}`}>
                            {provider.setupComplexity}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Temps estimé:</span>
                          <span>{provider.estimatedTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Services disponibles:</span>
                          <span>{provider.services}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
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
                            className="w-full"
                          />
                        ) : (
                          <Button 
                            className="w-full"
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
    </div>
  );
}
