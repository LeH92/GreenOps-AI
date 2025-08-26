import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle, Zap } from "lucide-react";

export default function ApiOverviewPage() {
  const apiMetrics = [
    {
      title: "Total Appels API",
      value: "8,560",
      change: "+12.3%",
      trend: "up",
      description: "ce mois",
      period: "vs mois précédent"
    },
    {
      title: "Succès Rate",
      value: "99.2%",
      change: "+0.3%",
      trend: "up", 
      description: "fiabilité",
      period: "amélioration continue"
    },
    {
      title: "Latence Moyenne",
      value: "1.2s",
      change: "-8.5%",
      trend: "down",
      description: "temps de réponse",
      period: "optimisation réussie"
    },
    {
      title: "Coût par Appel",
      value: "$0.089",
      change: "-5.2%",
      trend: "down",
      description: "économie",
      period: "grâce aux optimisations"
    }
  ];

  const topEndpoints = [
    { 
      endpoint: "/api/v1/chat/completions", 
      calls: "3,420",
      success: "99.1%",
      avgLatency: "1.8s",
      provider: "OpenAI"
    },
    {
      endpoint: "/api/v1/messages",
      calls: "2,890", 
      success: "99.5%",
      avgLatency: "1.1s",
      provider: "Anthropic"
    },
    {
      endpoint: "/api/v1/generate",
      calls: "1,650",
      success: "98.9%",
      avgLatency: "0.9s", 
      provider: "Google AI"
    },
    {
      endpoint: "/api/v1/invoke",
      calls: "600",
      success: "99.8%",
      avgLatency: "1.5s",
      provider: "AWS Bedrock"
    }
  ];

  const recentActivity = [
    {
      time: "Il y a 2 min",
      event: "Pic d'utilisation détecté",
      endpoint: "/api/v1/chat/completions",
      status: "warning",
      details: "+45% vs moyenne"
    },
    {
      time: "Il y a 15 min", 
      event: "Optimisation appliquée",
      endpoint: "/api/v1/messages",
      status: "success",
      details: "Latence réduite de 12%"
    },
    {
      time: "Il y a 1h",
      event: "Nouveau fournisseur connecté",
      endpoint: "Google AI",
      status: "info",
      details: "Configuration terminée"
    },
    {
      time: "Il y a 2h",
      event: "Alerte budget résolue",
      endpoint: "OpenAI",
      status: "success", 
      details: "Seuil optimisé"
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const getTrendColor = (trend: string, isPositive: boolean = true) => {
    if (trend === "up") {
      return isPositive ? "text-green-600" : "text-red-600";
    }
    return isPositive ? "text-red-600" : "text-green-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getProviderColor = (provider: string) => {
    const colors = {
      "OpenAI": "text-green-600",
      "Anthropic": "text-blue-600", 
      "Google AI": "text-yellow-600",
      "AWS Bedrock": "text-orange-600"
    };
    return colors[provider as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble API</h1>
          <p className="text-muted-foreground">
            Surveillez les performances et l'utilisation de vos appels API
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Temps réel
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Optimiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apiMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={getTrendColor(metric.trend, metric.title !== "Latence Moyenne" && metric.title !== "Coût par Appel")}>
                  {metric.change}
                </span>
                <span className="ml-1">{metric.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">Top Endpoints</TabsTrigger>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
          <TabsTrigger value="health">Santé des API</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints les plus utilisés</CardTitle>
              <CardDescription>
                Classement par nombre d'appels ce mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEndpoints.map((endpoint, index) => (
                  <div key={endpoint.endpoint} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium font-mono text-sm">{endpoint.endpoint}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className={getProviderColor(endpoint.provider)}>
                            {endpoint.provider}
                          </span>
                          <span>{endpoint.calls} appels</span>
                          <span className="text-green-600">{endpoint.success} succès</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{endpoint.avgLatency}</p>
                      <p className="text-xs text-muted-foreground">latence moy.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Activité en temps réel</span>
              </CardTitle>
              <CardDescription>
                Événements et alertes récents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.event}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.endpoint}</p>
                      <p className="text-xs text-blue-600">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>État des services</span>
                </CardTitle>
                <CardDescription>
                  Statut en temps réel des fournisseurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">OpenAI</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Opérationnel
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Anthropic</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Opérationnel
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Google AI</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Dégradé
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques de performance</CardTitle>
                <CardDescription>
                  Indicateurs clés des dernières 24h
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime moyen</span>
                    <span className="font-semibold text-green-600">99.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Erreurs 5xx</span>
                    <span className="font-semibold text-red-600">0.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate limits</span>
                    <span className="font-semibold text-yellow-600">0.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P95 Latence</span>
                    <span className="font-semibold">2.1s</span>
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
