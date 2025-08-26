import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Plus, Settings, CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, Activity, Zap } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/ui/company-logo";
import { AddProviderDialog } from "./add-provider-dialog";


export default function CloudProvidersPage() {
  const providers = [
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
  ];

  const totalCost = providers.reduce((sum, p) => sum + parseFloat(p.cost.replace('$', '').replace(',', '')), 0);
  const connectedProviders = providers.filter(p => p.status === 'connected').length;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fournisseurs Cloud</h1>
          <p className="text-muted-foreground">
            Connectez et gérez vos fournisseurs de services cloud
          </p>
        </div>
        <AddProviderDialog />
      </div>

      {/* Vue d'ensemble */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedProviders}/3</div>
            <p className="text-xs text-muted-foreground">connectés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">services surveillés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$234</div>
            <p className="text-xs text-muted-foreground">grâce aux optimisations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="connect">Connecter</TabsTrigger>
          <TabsTrigger value="manage">Gérer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => (
              <Card key={provider.name} className="relative overflow-hidden">
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
                        <Button variant="outline" size="sm" className="flex-1">
                          <Zap className="mr-2 h-4 w-4" />
                          Optimiser
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
                      <div className="pt-2">
                        <Link href={`/dashboard/cloud-providers/${provider.id}`}>
                          <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Connecter {provider.shortName}
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assistant de Connexion</CardTitle>
              <CardDescription>
                Connectez rapidement vos fournisseurs cloud avec notre assistant guidé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {providers.filter(p => p.status === "disconnected").map((provider) => (
                  <div key={provider.id} className="p-6 border rounded-lg text-center space-y-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-center">
                      <CompanyLogo company={provider.company} size={48} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{provider.shortName}</h3>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Complexité:</span>
                        <span className={getComplexityColor(provider.setupComplexity)}>
                          {provider.setupComplexity}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Durée:</span>
                        <span>{provider.estimatedTime}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/cloud-providers/${provider.id}`}>
                      <Button className="w-full">
                        Commencer
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pourquoi connecter vos fournisseurs cloud ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">💰 Économies</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifiez les ressources sous-utilisées et optimisez vos coûts automatiquement.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">📊 Visibilité</h4>
                  <p className="text-sm text-muted-foreground">
                    Vue centralisée de tous vos services cloud et de leur utilisation.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-600">🚨 Alertes</h4>
                  <p className="text-sm text-muted-foreground">
                    Recevez des alertes proactives sur les dépassements de budget.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">🌱 Durabilité</h4>
                  <p className="text-sm text-muted-foreground">
                    Surveillez et réduisez votre empreinte carbone cloud.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Fournisseurs</CardTitle>
              <CardDescription>
                Gérez les paramètres globaux de vos fournisseurs cloud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Synchronisation automatique</h4>
                    <p className="text-sm text-muted-foreground">
                      Fréquence de mise à jour des données cloud
                    </p>
                  </div>
                  <Button variant="outline">Configurer</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Alertes de coûts</h4>
                    <p className="text-sm text-muted-foreground">
                      Seuils d'alerte pour tous les fournisseurs
                    </p>
                  </div>
                  <Button variant="outline">Paramétrer</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Optimisations automatiques</h4>
                    <p className="text-sm text-muted-foreground">
                      Recommandations et actions automatisées
                    </p>
                  </div>
                  <Button variant="outline">Activer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
