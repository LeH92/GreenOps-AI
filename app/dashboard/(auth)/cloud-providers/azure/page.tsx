import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, CheckCircle, XCircle, Settings, RefreshCw, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function AzureProviderPage() {
  const azureServices = [
    {
      name: "Virtual Machines",
      status: "disconnected",
      cost: "$0.00",
      usage: "0 instances",
      region: "East US"
    },
    {
      name: "Storage Account",
      status: "disconnected", 
      cost: "$0.00",
      usage: "0 TB",
      region: "East US"
    },
    {
      name: "Azure Functions",
      status: "disconnected",
      cost: "$0.00",
      usage: "0 invocations",
      region: "East US"
    },
    {
      name: "Cognitive Services",
      status: "disconnected",
      cost: "$0.00",
      usage: "0 requêtes",
      region: "East US"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "bg-green-100 text-green-800 border-green-200",
      error: "bg-red-100 text-red-800 border-red-200",
      disconnected: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return variants[status as keyof typeof variants] || variants.disconnected;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CompanyLogo company="azure" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Microsoft Azure</h1>
            <p className="text-muted-foreground">
              Configurez et gérez vos services Azure
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" disabled>
            <RefreshCw className="mr-2 h-4 w-4" />
            Synchroniser
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Connecter Azure
          </Button>
        </div>
      </div>

      {/* Métriques Azure */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">$0.00</div>
            <p className="text-xs text-muted-foreground">non connecté</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/4</div>
            <p className="text-xs text-muted-foreground">déconnectés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">-</div>
            <p className="text-xs text-muted-foreground">non configuré</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">Déconnecté</div>
            <p className="text-xs text-muted-foreground">configuration requise</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="setup">Configuration</TabsTrigger>
          <TabsTrigger value="help">Aide</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Azure</CardTitle>
              <CardDescription>
                Services disponibles une fois Azure connecté
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {azureServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg opacity-50">
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
                        Déconnecté
                      </Badge>
                      <span className="font-semibold text-gray-400">{service.cost}</span>
                      <Button variant="outline" size="sm" disabled>
                        Gérer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commencer avec Azure</CardTitle>
              <CardDescription>
                Connectez votre compte Azure pour commencer le monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Azure non connecté</h3>
                <p className="text-muted-foreground mb-4">
                  Configurez votre connexion Azure pour commencer à surveiller vos coûts et services.
                </p>
                <Button>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurer Azure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Azure</CardTitle>
              <CardDescription>
                Étapes pour connecter votre compte Microsoft Azure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Créer une App Registration</h4>
                    <p className="text-sm text-muted-foreground">
                      Dans Azure Portal, créez une nouvelle App Registration pour GreenOps AI
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Guide</Button>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Configurer les permissions</h4>
                    <p className="text-sm text-muted-foreground">
                      Attribuez les rôles Reader et Cost Management Reader
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Aide</Button>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Obtenir les credentials</h4>
                    <p className="text-sm text-muted-foreground">
                      Récupérez Tenant ID, Client ID et Client Secret
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Copier</Button>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">4</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Connecter à GreenOps</h4>
                    <p className="text-sm text-muted-foreground">
                      Saisissez vos credentials dans GreenOps AI
                    </p>
                  </div>
                  <Button>Configurer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aide et Documentation</CardTitle>
              <CardDescription>
                Ressources pour configurer Azure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📚 Documentation</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Guide complet pour connecter Azure à GreenOps AI
                  </p>
                  <Button variant="outline" size="sm">Voir le guide</Button>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🎥 Tutoriel vidéo</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Configuration pas à pas en 5 minutes
                  </p>
                  <Button variant="outline" size="sm">Regarder</Button>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">💬 Support</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Besoin d'aide ? Contactez notre équipe support
                  </p>
                  <Button variant="outline" size="sm">Contacter</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
