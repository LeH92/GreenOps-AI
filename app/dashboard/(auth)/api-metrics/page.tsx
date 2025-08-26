import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown, Clock, Zap, Target, AlertTriangle } from "lucide-react";

export default function ApiMetricsPage() {
  const performanceMetrics = [
    {
      title: "Throughput",
      value: "285 req/min",
      change: "+15.2%",
      trend: "up",
      description: "requêtes par minute",
      target: "300 req/min"
    },
    {
      title: "P95 Latence",
      value: "2.1s",
      change: "-8.3%",
      trend: "down",
      description: "95e percentile",
      target: "< 2.0s"
    },
    {
      title: "Taux d'Erreur",
      value: "0.8%",
      change: "-12.5%",
      trend: "down",
      description: "erreurs totales",
      target: "< 1.0%"
    },
    {
      title: "Disponibilité",
      value: "99.4%",
      change: "+0.2%",
      trend: "up",
      description: "uptime SLA",
      target: "99.9%"
    }
  ];

  const providerMetrics = [
    {
      provider: "OpenAI",
      requests: "3,420",
      avgLatency: "1.8s",
      errorRate: "0.9%",
      uptime: "99.1%",
      efficiency: 94,
      cost: "$487.20"
    },
    {
      provider: "Anthropic", 
      requests: "2,890",
      avgLatency: "1.1s",
      errorRate: "0.5%",
      uptime: "99.5%",
      efficiency: 96,
      cost: "$312.80"
    },
    {
      provider: "Google AI",
      requests: "1,650",
      avgLatency: "0.9s",
      errorRate: "1.1%",
      uptime: "98.9%",
      efficiency: 92,
      cost: "$156.40"
    },
    {
      provider: "AWS Bedrock",
      requests: "600",
      avgLatency: "1.5s", 
      errorRate: "0.2%",
      uptime: "99.8%",
      efficiency: 98,
      cost: "$89.20"
    }
  ];

  const timeSeriesData = [
    { time: "00:00", requests: 45, latency: 1.2, errors: 0 },
    { time: "04:00", requests: 23, latency: 1.1, errors: 1 },
    { time: "08:00", requests: 180, latency: 1.8, errors: 2 },
    { time: "12:00", requests: 285, latency: 2.1, errors: 3 },
    { time: "16:00", requests: 260, latency: 1.9, errors: 1 },
    { time: "20:00", requests: 120, latency: 1.4, errors: 0 }
  ];

  const alerts = [
    {
      metric: "Latence P95",
      current: "2.1s",
      threshold: "2.0s",
      severity: "warning",
      trend: "stable"
    },
    {
      metric: "Taux d'erreur Google AI",
      current: "1.1%", 
      threshold: "1.0%",
      severity: "warning",
      trend: "increasing"
    },
    {
      metric: "Throughput",
      current: "285 req/min",
      threshold: "300 req/min",
      severity: "info",
      trend: "improving"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string, isPositiveMetric: boolean = true) => {
    if (trend === "up") {
      return isPositiveMetric ? "text-green-600" : "text-red-600";
    }
    if (trend === "down") {
      return isPositiveMetric ? "text-red-600" : "text-green-600";
    }
    return "text-gray-600";
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

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return "text-green-600";
    if (efficiency >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      critical: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return variants[severity as keyof typeof variants] || variants.info;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métriques API</h1>
          <p className="text-muted-foreground">
            Analysez les performances détaillées de vos APIs
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Temps réel
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Optimiser
          </Button>
        </div>
      </div>

      {/* Métriques de performance principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={getTrendColor(metric.trend, metric.title !== "P95 Latence" && metric.title !== "Taux d'Erreur")}>
                  {metric.change}
                </span>
                <span className="ml-1">{metric.description}</span>
              </div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Target className="h-3 w-3 mr-1" />
                <span>Objectif: {metric.target}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Par fournisseur</TabsTrigger>
          <TabsTrigger value="timeline">Évolution</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance par fournisseur</CardTitle>
              <CardDescription>
                Métriques détaillées pour chaque provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {providerMetrics.map((provider) => (
                  <div key={provider.provider} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className={`font-semibold text-lg ${getProviderColor(provider.provider)}`}>
                          {provider.provider}
                        </h3>
                        <Badge variant="outline" className="bg-gray-100">
                          {provider.requests} requêtes
                        </Badge>
                      </div>
                      <span className="font-semibold text-green-600">{provider.cost}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Latence moyenne</p>
                        <p className="font-semibold">{provider.avgLatency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Taux d'erreur</p>
                        <p className="font-semibold text-red-600">{provider.errorRate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Disponibilité</p>
                        <p className="font-semibold text-green-600">{provider.uptime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Efficacité</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={provider.efficiency} className="w-16 h-2" />
                          <span className={`font-semibold ${getEfficiencyColor(provider.efficiency)}`}>
                            {provider.efficiency}%
                          </span>
                        </div>
                      </div>
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
                <CardTitle>Évolution du throughput</CardTitle>
                <CardDescription>
                  Requêtes par heure sur 24h
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeSeriesData.map((data) => (
                    <div key={data.time} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.time}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(data.requests / 285) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-16 text-right">
                          {data.requests}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution de la latence</CardTitle>
                <CardDescription>
                  Temps de réponse moyen par heure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeSeriesData.map((data) => (
                    <div key={data.time} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.time}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${data.latency > 2.0 ? 'bg-red-500' : data.latency > 1.5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${(data.latency / 2.5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-16 text-right">
                          {data.latency}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>Alertes de performance</span>
              </CardTitle>
              <CardDescription>
                Métriques nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <p className="font-medium">{alert.metric}</p>
                        <p className="text-sm text-muted-foreground">
                          Seuil: {alert.threshold} • Tendance: {alert.trend}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline"
                        className={getSeverityBadge(alert.severity)}
                      >
                        {alert.severity === "warning" ? "Attention" : "Info"}
                      </Badge>
                      <span className="font-semibold">{alert.current}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations d'optimisation</CardTitle>
              <CardDescription>
                Actions suggérées pour améliorer les performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">🚀 Performance</h4>
                  <p className="text-xs text-blue-700">
                    Migrer 30% des requêtes OpenAI vers Anthropic pour réduire la latence de 0.7s
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm">💰 Coût</h4>
                  <p className="text-xs text-green-700">
                    Optimiser les prompts pour réduire les tokens de 15% et économiser $89/mois
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 text-sm">⚡ Fiabilité</h4>
                  <p className="text-xs text-yellow-700">
                    Implémenter un retry automatique pour réduire les erreurs de 0.3%
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
