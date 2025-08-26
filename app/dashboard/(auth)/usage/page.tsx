import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, TrendingDown, Calendar, Download, Zap, Clock } from "lucide-react";

export default function UsagePage() {
  const usageMetrics = [
    {
      title: "Total Requêtes",
      value: "8,560",
      change: "+8.5%",
      trend: "up",
      description: "ce mois",
      unit: "requêtes"
    },
    {
      title: "Tokens Consommés",
      value: "2.4M",
      change: "+12.3%",
      trend: "up",
      description: "tokens totaux",
      unit: "tokens"
    },
    {
      title: "Temps de Réponse Moyen",
      value: "1.2s",
      change: "-5.8%",
      trend: "down",
      description: "amélioration",
      unit: "secondes"
    },
    {
      title: "Taux de Succès",
      value: "99.2%",
      change: "+0.3%",
      trend: "up",
      description: "fiabilité",
      unit: "pourcentage"
    }
  ];

  const serviceUsage = [
    {
      service: "OpenAI GPT-4",
      requests: "3,420",
      tokens: "1.2M",
      avgLatency: "1.8s",
      cost: "$487.20",
      trend: "up"
    },
    {
      service: "Anthropic Claude",
      requests: "2,890",
      tokens: "980K",
      avgLatency: "1.1s", 
      cost: "$312.80",
      trend: "up"
    },
    {
      service: "Google Gemini",
      requests: "1,650",
      tokens: "520K",
      avgLatency: "0.9s",
      cost: "$156.40",
      trend: "stable"
    },
    {
      service: "AWS Bedrock",
      requests: "600",
      tokens: "180K",
      avgLatency: "1.5s",
      cost: "$89.20",
      trend: "down"
    }
  ];

  const peakHours = [
    { hour: "09:00", requests: 450, percentage: 85 },
    { hour: "10:00", requests: 520, percentage: 98 },
    { hour: "11:00", requests: 480, percentage: 90 },
    { hour: "14:00", requests: 510, percentage: 96 },
    { hour: "15:00", requests: 490, percentage: 92 },
    { hour: "16:00", requests: 460, percentage: 87 }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string, isPositive: boolean = true) => {
    if (trend === "up") {
      return isPositive ? "text-green-600" : "text-red-600";
    }
    if (trend === "down") {
      return isPositive ? "text-red-600" : "text-green-600";
    }
    return "text-gray-600";
  };

  const getLatencyColor = (latency: string) => {
    const value = parseFloat(latency);
    if (value <= 1.0) return "text-green-600";
    if (value <= 1.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports d'Usage</h1>
          <p className="text-muted-foreground">
            Analysez l'utilisation détaillée de vos services IA et cloud
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Période
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {usageMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className={getTrendColor(metric.trend, metric.title !== "Temps de Réponse Moyen")}>
                  {metric.change}
                </span>
                <span className="ml-1">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Par service</TabsTrigger>
          <TabsTrigger value="timeline">Chronologie</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage par service IA</CardTitle>
              <CardDescription>
                Détail de l'utilisation de chaque service ce mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceUsage.map((service, index) => (
                  <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{service.requests} requêtes</span>
                          <span>{service.tokens} tokens</span>
                          <span className={getLatencyColor(service.avgLatency)}>
                            {service.avgLatency} latence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-green-600">{service.cost}</span>
                      {getTrendIcon(service.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Heures de pointe</span>
                </CardTitle>
                <CardDescription>
                  Répartition des requêtes par heure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {peakHours.map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{hour.hour}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${hour.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-16 text-right">
                          {hour.requests}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution hebdomadaire</CardTitle>
                <CardDescription>
                  Requêtes des 7 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Aujourd'hui</span>
                    <span className="font-semibold">1,240 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hier</span>
                    <span className="font-semibold">1,180 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Il y a 2 jours</span>
                    <span className="font-semibold">1,350 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Il y a 3 jours</span>
                    <span className="font-semibold">1,290 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Il y a 4 jours</span>
                    <span className="font-semibold">1,150 requêtes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Performance par modèle</span>
                </CardTitle>
                <CardDescription>
                  Temps de réponse et fiabilité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">GPT-4</p>
                      <p className="text-sm text-muted-foreground">Latence: 1.8s</p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      98.9% uptime
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Claude-3</p>
                      <p className="text-sm text-muted-foreground">Latence: 1.1s</p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      99.5% uptime
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Gemini Pro</p>
                      <p className="text-sm text-muted-foreground">Latence: 0.9s</p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      99.8% uptime
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Codes de réponse</CardTitle>
                <CardDescription>
                  Distribution des statuts de réponse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">200 (Succès)</span>
                    <span className="font-semibold text-green-600">8,490 (99.2%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">429 (Rate Limit)</span>
                    <span className="font-semibold text-yellow-600">45 (0.5%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">500 (Erreur Serveur)</span>
                    <span className="font-semibold text-red-600">15 (0.2%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Timeout</span>
                    <span className="font-semibold text-red-600">10 (0.1%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top utilisateurs</CardTitle>
                <CardDescription>
                  Utilisateurs avec le plus de requêtes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">user@example.com</span>
                    <span className="font-semibold">2,340 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">admin@company.com</span>
                    <span className="font-semibold">1,890 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">dev@startup.io</span>
                    <span className="font-semibold">1,520 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">api@service.com</span>
                    <span className="font-semibold">1,180 requêtes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insights & Tendances</CardTitle>
                <CardDescription>
                  Analyses et recommandations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm">📈 Croissance</h4>
                    <p className="text-xs text-blue-700">
                      +8.5% d'utilisation ce mois, principalement sur GPT-4
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm">⚡ Performance</h4>
                    <p className="text-xs text-green-700">
                      Latence améliorée de 5.8% grâce aux optimisations
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 text-sm">💡 Recommandation</h4>
                    <p className="text-xs text-yellow-700">
                      Considérez Claude-3 pour réduire les coûts de 25%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
