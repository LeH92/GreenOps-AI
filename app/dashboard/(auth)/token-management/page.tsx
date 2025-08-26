import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, TrendingUp, TrendingDown, AlertTriangle, Target, Zap, DollarSign } from "lucide-react";

export default function TokenManagementPage() {
  const tokenMetrics = [
    {
      title: "Tokens Consommés",
      value: "2.4M",
      change: "+18.5%",
      trend: "up",
      description: "ce mois",
      limit: "5M"
    },
    {
      title: "Coût par Token",
      value: "$0.000037",
      change: "-12.3%",
      trend: "down",
      description: "prix moyen",
      limit: "optimisé"
    },
    {
      title: "Efficacité",
      value: "94.2%",
      change: "+5.8%",
      trend: "up",
      description: "utilisation",
      limit: "excellent"
    },
    {
      title: "Économies",
      value: "$234.10",
      change: "+28.7%",
      trend: "up",
      description: "grâce aux optimisations",
      limit: "ce mois"
    }
  ];

  const providerTokens = [
    {
      provider: "OpenAI",
      model: "GPT-4",
      consumed: "1.2M",
      limit: "2M",
      percentage: 60,
      cost: "$487.20",
      avgPerRequest: "1,250",
      efficiency: "excellent"
    },
    {
      provider: "Anthropic",
      model: "Claude-3",
      consumed: "980K",
      limit: "1.5M",
      percentage: 65,
      cost: "$312.80",
      avgPerRequest: "980",
      efficiency: "excellent"
    },
    {
      provider: "Google AI",
      model: "Gemini Pro",
      consumed: "520K",
      limit: "1M",
      percentage: 52,
      cost: "$156.40",
      avgPerRequest: "750",
      efficiency: "bon"
    },
    {
      provider: "AWS Bedrock",
      model: "Claude-v2",
      consumed: "180K",
      limit: "500K",
      percentage: 36,
      cost: "$89.20",
      avgPerRequest: "890",
      efficiency: "bon"
    }
  ];

  const optimizationTips = [
    {
      title: "Optimisation des prompts",
      impact: "Réduction de 15-25% des tokens",
      difficulty: "Facile",
      savings: "$89/mois",
      description: "Raccourcir les prompts système et utiliser des instructions plus concises"
    },
    {
      title: "Cache intelligent",
      impact: "Réduction de 30-40% des appels",
      difficulty: "Moyenne",
      savings: "$156/mois",
      description: "Mettre en cache les réponses fréquentes pour éviter les appels redondants"
    },
    {
      title: "Modèles alternatifs",
      impact: "Réduction de 20-35% des coûts",
      difficulty: "Moyenne",
      savings: "$123/mois",
      description: "Utiliser des modèles moins coûteux pour les tâches simples"
    },
    {
      title: "Batch processing",
      impact: "Réduction de 10-15% des coûts",
      difficulty: "Difficile",
      savings: "$67/mois",
      description: "Regrouper les requêtes similaires pour optimiser l'utilisation"
    }
  ];

  const tokenHistory = [
    { date: "30 Déc", tokens: "89.2K", cost: "$3.42", efficiency: 94 },
    { date: "29 Déc", tokens: "92.1K", cost: "$3.58", efficiency: 91 },
    { date: "28 Déc", tokens: "87.5K", cost: "$3.28", efficiency: 96 },
    { date: "27 Déc", tokens: "94.8K", cost: "$3.71", efficiency: 89 },
    { date: "26 Déc", tokens: "81.3K", cost: "$3.15", efficiency: 97 }
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

  const getProviderColor = (provider: string) => {
    const colors = {
      "OpenAI": "text-green-600",
      "Anthropic": "text-blue-600",
      "Google AI": "text-yellow-600",
      "AWS Bedrock": "text-orange-600"
    };
    return colors[provider as keyof typeof colors] || "text-gray-600";
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getEfficiencyBadge = (efficiency: string) => {
    const variants = {
      "excellent": "bg-green-100 text-green-800 border-green-200",
      "bon": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "moyen": "bg-orange-100 text-orange-800 border-orange-200"
    };
    return variants[efficiency as keyof typeof variants] || variants.moyen;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      "Facile": "text-green-600",
      "Moyenne": "text-yellow-600", 
      "Difficile": "text-red-600"
    };
    return colors[difficulty as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Tokens</h1>
          <p className="text-muted-foreground">
            Optimisez votre consommation de tokens et réduisez vos coûts
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Définir limites
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Optimiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tokenMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={getTrendColor(metric.trend, metric.title !== "Coût par Token")}>
                  {metric.change}
                </span>
                <span className="ml-1">{metric.description}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">{metric.limit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="optimization">Optimisation</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consommation par fournisseur</CardTitle>
              <CardDescription>
                Utilisation des tokens par provider et modèle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {providerTokens.map((provider) => (
                  <div key={provider.provider} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className={`font-semibold text-lg ${getProviderColor(provider.provider)}`}>
                          {provider.provider}
                        </h3>
                        <Badge variant="outline" className="bg-gray-100">
                          {provider.model}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={getEfficiencyBadge(provider.efficiency)}
                        >
                          {provider.efficiency}
                        </Badge>
                      </div>
                      <span className="font-semibold text-green-600">{provider.cost}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Tokens utilisés</span>
                        <span className="font-semibold">
                          {provider.consumed} / {provider.limit}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={provider.percentage} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs">
                          <span className={getUsageColor(provider.percentage)}>
                            {provider.percentage}% utilisé
                          </span>
                          <span className="text-muted-foreground">
                            {provider.avgPerRequest} tokens/requête
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

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>Recommandations d'optimisation</span>
              </CardTitle>
              <CardDescription>
                Stratégies pour réduire votre consommation de tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationTips.map((tip, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{tip.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {tip.savings}
                        </Badge>
                        <span className={`text-sm font-medium ${getDifficultyColor(tip.difficulty)}`}>
                          {tip.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">{tip.impact}</span>
                      <Button variant="outline" size="sm">
                        Appliquer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analyse des patterns</CardTitle>
              <CardDescription>
                Insights sur votre utilisation des tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">📊 Pattern détecté</h4>
                  <p className="text-xs text-blue-700">
                    85% de vos tokens sont utilisés entre 9h-17h. Considérez un cache pour les requêtes répétitives.
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm">💡 Opportunité</h4>
                  <p className="text-xs text-green-700">
                    30% de vos prompts dépassent 500 tokens. Une optimisation pourrait économiser $67/mois.
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 text-sm">⚠️ Attention</h4>
                  <p className="text-xs text-yellow-700">
                    OpenAI représente 50% de vos coûts mais seulement 40% de l'efficacité. Évaluez des alternatives.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Historique quotidien</span>
                </CardTitle>
                <CardDescription>
                  Consommation des 5 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenHistory.map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{day.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Efficacité: {day.efficiency}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{day.tokens}</p>
                        <p className="text-sm text-green-600">{day.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances mensuelles</CardTitle>
                <CardDescription>
                  Évolution sur les 6 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Décembre 2024</span>
                    <span className="font-semibold">2.4M tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Novembre 2024</span>
                    <span className="font-semibold">2.1M tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Octobre 2024</span>
                    <span className="font-semibold">1.8M tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Septembre 2024</span>
                    <span className="font-semibold">1.6M tokens</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    📈 Croissance de 50% en 3 mois, mais coût par token réduit de 12% grâce aux optimisations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
