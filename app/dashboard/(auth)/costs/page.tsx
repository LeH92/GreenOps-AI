import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter } from "lucide-react";

export default function CostsPage() {
  const costMetrics = [
    {
      title: "Coût Total Mensuel",
      value: "$1,847.50",
      change: "+11.9%",
      trend: "up",
      description: "vs mois précédent"
    },
    {
      title: "Coût Moyen Journalier",
      value: "$61.58",
      change: "-2.3%",
      trend: "down", 
      description: "derniers 30 jours"
    },
    {
      title: "Coût par Requête",
      value: "$0.089",
      change: "+5.2%",
      trend: "up",
      description: "moyenne pondérée"
    },
    {
      title: "Économies Réalisées",
      value: "$234.10",
      change: "+18.7%",
      trend: "up",
      description: "grâce aux optimisations"
    }
  ];

  const topServices = [
    { name: "OpenAI GPT-4", cost: "$487.20", percentage: "26.4%", trend: "up" },
    { name: "AWS EC2", cost: "$423.80", percentage: "22.9%", trend: "stable" },
    { name: "Anthropic Claude", cost: "$312.80", percentage: "16.9%", trend: "up" },
    { name: "Google Cloud Storage", cost: "$198.50", percentage: "10.7%", trend: "down" },
    { name: "Azure Functions", cost: "$156.30", percentage: "8.5%", trend: "up" }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-600";
      case "down":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coûts & Usage</h1>
          <p className="text-muted-foreground">
            Analyse détaillée des coûts et de l'utilisation des services
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {costMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className={getTrendColor(metric.trend)}>{metric.change}</span>
                <span className="ml-1">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="services">Par service</TabsTrigger>
          <TabsTrigger value="providers">Par fournisseur</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des coûts</CardTitle>
                <CardDescription>
                  Distribution des coûts par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Services IA/LLM</span>
                    <span className="font-semibold">$800.00 (43%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Infrastructure Cloud</span>
                    <span className="font-semibold">$647.50 (35%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stockage & Données</span>
                    <span className="font-semibold">$280.00 (15%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Autres services</span>
                    <span className="font-semibold">$120.00 (7%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle</CardTitle>
                <CardDescription>
                  Coûts des 6 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Décembre 2024</span>
                    <span className="font-semibold">$1,847.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Novembre 2024</span>
                    <span className="font-semibold">$1,651.20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Octobre 2024</span>
                    <span className="font-semibold">$1,423.80</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Septembre 2024</span>
                    <span className="font-semibold">$1,298.50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des services les plus coûteux</CardTitle>
              <CardDescription>
                Services avec les coûts les plus élevés ce mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.percentage} du total</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{service.cost}</span>
                      {getTrendIcon(service.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coûts par fournisseur</CardTitle>
              <CardDescription>
                Répartition des coûts par fournisseur de services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">OpenAI</span>
                  <span className="font-semibold">$487.20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Amazon Web Services</span>
                  <span className="font-semibold">$623.30</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anthropic</span>
                  <span className="font-semibold">$312.80</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Google Cloud</span>
                  <span className="font-semibold">$298.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microsoft Azure</span>
                  <span className="font-semibold">$125.70</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des tendances</CardTitle>
              <CardDescription>
                Évolution des coûts et prévisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800">Tendance positive</h4>
                  <p className="text-sm text-green-700">
                    Les optimisations IA ont permis de réduire les coûts par requête de 12% ce mois.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">Attention requise</h4>
                  <p className="text-sm text-yellow-700">
                    L'utilisation d'OpenAI GPT-4 augmente de 15% par semaine. Considérez des alternatives plus économiques.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
