"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Cloud, CheckCircle, XCircle, Settings, RefreshCw, AlertTriangle, DollarSign, Activity, Loader2, TrendingUp, Zap } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useGCPData, useGCPCostsByCategory } from "@/hooks/useGCPData";
import { formatCurrency } from "@/lib/format-utils";

export default function GcpProviderPage() {
  const { projects, services, recommendations, totalCost, totalCarbon, totalSavings, isLoading, error } = useGCPData();
  const { costsByCategory } = useGCPCostsByCategory();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Chargement des données GCP...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <span>Erreur lors du chargement des données GCP: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "bg-green-100 text-green-800 border-green-200",
      error: "bg-red-100 text-red-800 border-red-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return variants[status as keyof typeof variants] || variants.warning;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CompanyLogo company="google-cloud" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Google Cloud Platform</h1>
            <p className="text-muted-foreground">
              Gérez vos services et ressources GCP
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Synchroniser
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configurer
          </Button>
        </div>
      </div>

      {/* Métriques GCP */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$734.80</div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4/5</div>
            <p className="text-xs text-muted-foreground">connectés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projet Principal</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GreenOps</div>
            <p className="text-xs text-muted-foreground">greenops-ai-prod</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1h</div>
            <p className="text-xs text-muted-foreground">il y a</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="costs">Coûts détaillés</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Google Cloud</CardTitle>
              <CardDescription>
                État et utilisation de vos services Google Cloud Platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gcpServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.region} • {service.usage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant="outline"
                        className={getStatusBadge(service.status)}
                      >
                        {service.status === "connected" ? "Connecté" : 
                         service.status === "error" ? "Erreur" : "Attention"}
                      </Badge>
                      <span className="font-semibold text-blue-600">{service.cost}</span>
                      <Button variant="outline" size="sm">
                        Gérer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des coûts</CardTitle>
                <CardDescription>Par service GCP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gcpServices.map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <span className="text-sm">{service.name}</span>
                      <span className="font-semibold">{service.cost}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle</CardTitle>
                <CardDescription>Coûts GCP des 3 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Décembre 2024</span>
                    <span className="font-semibold">$734.80</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Novembre 2024</span>
                    <span className="font-semibold">$689.20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Octobre 2024</span>
                    <span className="font-semibold">$612.50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Google Cloud</CardTitle>
              <CardDescription>
                Paramètres de connexion et synchronisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Service Account</p>
                    <p className="text-sm text-muted-foreground">greenops-service@greenops-ai-prod.iam.gserviceaccount.com</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Projet surveillé</p>
                    <p className="text-sm text-muted-foreground">greenops-ai-prod</p>
                  </div>
                  <Button variant="outline" size="sm">Changer</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">APIs activées</p>
                    <p className="text-sm text-muted-foreground">Billing, Compute Engine, AI Platform</p>
                  </div>
                  <Button variant="outline" size="sm">Gérer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
