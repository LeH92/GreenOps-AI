"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Cloud, CheckCircle, XCircle, Settings, RefreshCw, AlertTriangle, DollarSign, Activity, Loader2, TrendingUp, Zap, Leaf } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useGCPData } from "@/hooks/useGCPData";
import { formatCurrency } from "@/lib/format-utils";

export default function GcpProviderPage() {
  const { projects, services, recommendations, totalCost, totalCarbon, totalSavings, isLoading, error, costData } = useGCPData();
  
  // Calculer les coûts par catégorie depuis les données existantes
  const costsByCategory = costData?.reduce((acc: any, service: any) => {
    const category = service.service_category || 'other';
    acc[category] = (acc[category] || 0) + (service.monthly_cost || 0);
    return acc;
  }, {}) || {};

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

  const getStatusIcon = (cost: number) => {
    if (cost > 0) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (cost: number) => {
    if (cost > 0) return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CompanyLogo company="google-cloud" size={40} />
          <div>
            <h1 className="text-3xl font-bold">Google Cloud Platform</h1>
            <p className="text-muted-foreground">
              {projects.length > 0 
                ? `${projects.length} projet(s) connecté(s) - Dernière sync: ${projects[0]?.last_sync ? new Date(projects[0].last_sync).toLocaleString('fr-FR') : 'Jamais'}`
                : 'Aucun projet connecté - Connectez-vous via la page Fournisseurs Cloud'
              }
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configurer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              {services.length} service(s) actif(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empreinte Carbone</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCarbon.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">CO2 ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies Potentielles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">
              {recommendations.length} recommandation(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut Global</CardTitle>
            {projects.length > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${projects.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {projects.length > 0 ? 'Connecté' : 'Déconnecté'}
            </div>
            <p className="text-xs text-muted-foreground">
              {projects.length > 0 ? 'Données synchronisées' : 'Aucune donnée disponible'}
            </p>
          </CardContent>
        </Card>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun projet GCP connecté</h3>
            <p className="text-muted-foreground mb-4">
              Connectez votre compte Google Cloud Platform pour voir vos données de coûts et d'utilisation.
            </p>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Configurer GCP
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            {/* Coûts par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle>Coûts par Catégorie</CardTitle>
                <CardDescription>Répartition de vos coûts GCP par type de service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(costsByCategory)
                    .sort(([,a], [,b]) => b.cost - a.cost)
                    .map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="min-w-[80px] justify-center">
                            {category.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="font-medium">{formatCurrency(data.cost)}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.count} service(s) • {data.carbon.toFixed(1)} kg CO2
                            </p>
                          </div>
                        </div>
                        <Progress 
                          value={(data.cost / totalCost) * 100} 
                          className="w-24 h-2" 
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Liste des services */}
            <Card>
              <CardHeader>
                <CardTitle>Services Détaillés</CardTitle>
                <CardDescription>Liste complète de vos services GCP avec coûts et utilisation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.slice(0, 10).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.cost_amount)}
                        <div>
                          <p className="font-medium">{service.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.usage_amount} {service.usage_unit} • {service.region}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(service.cost_amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {(service.carbon_footprint_grams / 1000).toFixed(2)} kg CO2
                        </p>
                      </div>
                    </div>
                  ))}
                  {services.length > 10 && (
                    <div className="text-center pt-4">
                      <Button variant="outline">
                        Voir tous les services ({services.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommandations d'Optimisation</CardTitle>
                <CardDescription>Suggestions pour réduire vos coûts et votre empreinte carbone</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune recommandation disponible pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex space-x-4">
                            <span className="text-green-600 font-medium">
                              💰 {formatCurrency(rec.potential_monthly_savings)}/mois
                            </span>
                            {rec.carbon_reduction_kg > 0 && (
                              <span className="text-blue-600 font-medium">
                                🌱 -{rec.carbon_reduction_kg} kg CO2
                              </span>
                            )}
                          </div>
                          <Badge variant="outline">
                            Effort: {rec.implementation_effort}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projets GCP</CardTitle>
                <CardDescription>Vue d'ensemble de vos projets Google Cloud Platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{project.project_name}</h4>
                        <Badge variant={project.sync_status === 'completed' ? 'default' : 'secondary'}>
                          {project.sync_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">ID: {project.project_id}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Coût mensuel</p>
                          <p className="font-semibold">{formatCurrency(project.current_month_cost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Empreinte carbone</p>
                          <p className="font-semibold">{project.carbon_footprint_kg} kg CO2</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Score d'optimisation</p>
                          <p className="font-semibold">{project.optimization_score}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dernière sync</p>
                          <p className="font-semibold">
                            {project.last_sync ? new Date(project.last_sync).toLocaleDateString('fr-FR') : 'Jamais'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
