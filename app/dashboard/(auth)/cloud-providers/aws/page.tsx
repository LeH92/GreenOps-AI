import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Cloud, CheckCircle, XCircle, Settings, RefreshCw, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function AwsProviderPage() {
  const awsServices = [
    {
      name: "EC2",
      status: "connected",
      cost: "$423.80",
      usage: "15 instances",
      region: "us-east-1"
    },
    {
      name: "S3",
      status: "connected", 
      cost: "$156.30",
      usage: "2.3 TB",
      region: "us-east-1"
    },
    {
      name: "Lambda",
      status: "connected",
      cost: "$89.20",
      usage: "1.2M invocations",
      region: "us-east-1"
    },
    {
      name: "RDS",
      status: "error",
      cost: "$234.50",
      usage: "3 instances",
      region: "us-west-2"
    },
    {
      name: "Bedrock",
      status: "connected",
      cost: "$89.20",
      usage: "600 requêtes",
      region: "us-east-1"
    }
  ];

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
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <CompanyLogo company="aws" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Amazon Web Services</h1>
            <p className="text-muted-foreground">
              Gérez vos services et ressources AWS
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

      {/* Métriques AWS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$993.00</div>
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
            <CardTitle className="text-sm font-medium">Régions</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">us-east-1, us-west-2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
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
              <CardTitle>Services AWS</CardTitle>
              <CardDescription>
                État et utilisation de vos services Amazon Web Services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {awsServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">AWS {service.name}</p>
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
                      <span className="font-semibold text-orange-600">{service.cost}</span>
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
                <CardDescription>Par service AWS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {awsServices.map((service) => (
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
                <CardDescription>Coûts AWS des 3 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Décembre 2024</span>
                    <span className="font-semibold">$993.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Novembre 2024</span>
                    <span className="font-semibold">$887.20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Octobre 2024</span>
                    <span className="font-semibold">$756.80</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration AWS</CardTitle>
              <CardDescription>
                Paramètres de connexion et synchronisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Clés d'accès AWS</p>
                    <p className="text-sm text-muted-foreground">AKIA...****</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Régions surveillées</p>
                    <p className="text-sm text-muted-foreground">us-east-1, us-west-2</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Synchronisation automatique</p>
                    <p className="text-sm text-muted-foreground">Toutes les 2 heures</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
