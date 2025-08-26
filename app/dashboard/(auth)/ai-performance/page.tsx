import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, TrendingDown, Target, BarChart3, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function AiPerformancePage() {
  const performanceMetrics = [
    {
      title: "Score Performance Global",
      value: "94.2",
      change: "+5.8%",
      trend: "up",
      description: "sur 100",
      target: "95+"
    },
    {
      title: "Temps de Réponse Moyen",
      value: "1.34s",
      change: "-12.3%",
      trend: "down",
      description: "amélioration",
      target: "< 1.5s"
    },
    {
      title: "Efficacité Énergétique",
      value: "87%",
      change: "+8.1%",
      trend: "up",
      description: "optimisation carbone",
      target: "90%"
    },
    {
      title: "Qualité des Réponses",
      value: "4.7/5",
      change: "+3.2%",
      trend: "up",
      description: "satisfaction utilisateur",
      target: "4.8/5"
    }
  ];

  const modelPerformance = [
    {
      model: "GPT-4",
      provider: "OpenAI",
      overallScore: 92,
      speed: 78,
      accuracy: 96,
      efficiency: 85,
      cost: 65,
      reliability: 94,
      trend: "stable",
      issues: 2
    },
    {
      model: "Claude-3 Sonnet",
      provider: "Anthropic",
      overallScore: 95,
      speed: 89,
      accuracy: 94,
      efficiency: 91,
      cost: 82,
      reliability: 97,
      trend: "improving",
      issues: 0
    },
    {
      model: "Gemini Pro",
      provider: "Google AI",
      overallScore: 88,
      speed: 95,
      accuracy: 85,
      efficiency: 93,
      cost: 96,
      reliability: 82,
      trend: "improving",
      issues: 3
    },
    {
      model: "Claude-2",
      provider: "AWS Bedrock",
      overallScore: 89,
      speed: 84,
      accuracy: 92,
      efficiency: 88,
      cost: 78,
      reliability: 98,
      trend: "declining",
      issues: 1
    }
  ];

  const benchmarkResults = [
    {
      category: "Raisonnement Logique",
      gpt4: 94,
      claude3: 91,
      gemini: 85,
      claude2: 88,
      bestModel: "GPT-4"
    },
    {
      category: "Compréhension de Contexte",
      gpt4: 89,
      claude3: 96,
      gemini: 82,
      claude2: 90,
      bestModel: "Claude-3"
    },
    {
      category: "Génération de Code",
      gpt4: 95,
      claude3: 88,
      gemini: 83,
      claude2: 85,
      bestModel: "GPT-4"
    },
    {
      category: "Analyse de Données",
      gpt4: 92,
      claude3: 94,
      gemini: 87,
      claude2: 89,
      bestModel: "Claude-3"
    },
    {
      category: "Créativité",
      gpt4: 96,
      claude3: 89,
      gemini: 84,
      claude2: 86,
      bestModel: "GPT-4"
    }
  ];

  const performanceIssues = [
    {
      model: "GPT-4",
      issue: "Latence élevée aux heures de pointe",
      severity: "medium",
      impact: "15% des requêtes > 3s",
      solution: "Load balancing avec Claude-3"
    },
    {
      model: "Gemini Pro",
      issue: "Qualité inconsistante",
      severity: "medium",
      impact: "8% de réponses non satisfaisantes",
      solution: "Ajustement des prompts"
    },
    {
      model: "GPT-4",
      issue: "Coût élevé pour tâches simples",
      severity: "low",
      impact: "30% de surcoût",
      solution: "Router vers modèles moins chers"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string, isPositiveMetric: boolean = true) => {
    if (trend === "up" || trend === "improving") {
      return isPositiveMetric ? "text-green-600" : "text-red-600";
    }
    if (trend === "down" || trend === "declining") {
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return variants[severity as keyof typeof variants] || variants.low;
  };

  const getBestModelBadge = (model: string) => {
    const colors = {
      "GPT-4": "bg-green-100 text-green-800",
      "Claude-3": "bg-blue-100 text-blue-800",
      "Gemini": "bg-yellow-100 text-yellow-800",
      "Claude-2": "bg-orange-100 text-orange-800"
    };
    return colors[model as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance IA</h1>
          <p className="text-muted-foreground">
            Analysez et optimisez les performances de vos modèles IA
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Benchmark
          </Button>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Optimiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={getTrendColor(metric.trend, metric.title !== "Temps de Réponse Moyen")}>
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="issues">Problèmes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance par modèle</CardTitle>
              <CardDescription>
                Scores détaillés de performance pour chaque modèle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modelPerformance.map((model) => (
                  <div key={model.model} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className={`font-semibold text-lg ${getProviderColor(model.provider)}`}>
                          {model.model}
                        </h3>
                        <Badge variant="outline" className="bg-gray-100">
                          {model.provider}
                        </Badge>
                        {getTrendIcon(model.trend)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl font-bold ${getScoreColor(model.overallScore)}`}>
                          {model.overallScore}
                        </span>
                        {model.issues > 0 && (
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            {model.issues} problème{model.issues > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vitesse</span>
                          <span className="font-semibold">{model.speed}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(model.speed)}`}
                            style={{ width: `${model.speed}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Précision</span>
                          <span className="font-semibold">{model.accuracy}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(model.accuracy)}`}
                            style={{ width: `${model.accuracy}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Efficacité</span>
                          <span className="font-semibold">{model.efficiency}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(model.efficiency)}`}
                            style={{ width: `${model.efficiency}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Coût</span>
                          <span className="font-semibold">{model.cost}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(model.cost)}`}
                            style={{ width: `${model.cost}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fiabilité</span>
                          <span className="font-semibold">{model.reliability}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(model.reliability)}`}
                            style={{ width: `${model.reliability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résultats des benchmarks</CardTitle>
              <CardDescription>
                Performance comparative par catégorie de tâches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {benchmarkResults.map((benchmark) => (
                  <div key={benchmark.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{benchmark.category}</h4>
                      <Badge className={getBestModelBadge(benchmark.bestModel)}>
                        Meilleur: {benchmark.bestModel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>GPT-4</span>
                          <span className={`font-semibold ${getScoreColor(benchmark.gpt4)}`}>
                            {benchmark.gpt4}
                          </span>
                        </div>
                        <Progress value={benchmark.gpt4} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Claude-3</span>
                          <span className={`font-semibold ${getScoreColor(benchmark.claude3)}`}>
                            {benchmark.claude3}
                          </span>
                        </div>
                        <Progress value={benchmark.claude3} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Gemini</span>
                          <span className={`font-semibold ${getScoreColor(benchmark.gemini)}`}>
                            {benchmark.gemini}
                          </span>
                        </div>
                        <Progress value={benchmark.gemini} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Claude-2</span>
                          <span className={`font-semibold ${getScoreColor(benchmark.claude2)}`}>
                            {benchmark.claude2}
                          </span>
                        </div>
                        <Progress value={benchmark.claude2} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
                <CardDescription>
                  Optimisations basées sur les benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm">🎯 Spécialisation</h4>
                    <p className="text-xs text-green-700">
                      Utiliser GPT-4 pour le code et la créativité, Claude-3 pour l'analyse
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm">⚡ Performance</h4>
                    <p className="text-xs text-blue-700">
                      Claude-3 excellent pour les contextes longs et l'analyse de données
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 text-sm">💰 Économies</h4>
                    <p className="text-xs text-yellow-700">
                      Gemini Pro pour les tâches simples peut réduire les coûts de 40%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution des scores</CardTitle>
                <CardDescription>
                  Tendances sur les 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Score global moyen</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">+2.3 points</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vitesse moyenne</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">+5.1 points</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Précision moyenne</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">+1.8 points</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efficacité énergétique</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">+3.2 points</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>Problèmes de performance</span>
              </CardTitle>
              <CardDescription>
                Issues identifiés et solutions recommandées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceIssues.map((issue, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(issue.severity)}
                        <div>
                          <h4 className="font-semibold">{issue.model}</h4>
                          <p className="text-sm text-muted-foreground">{issue.issue}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={getSeverityBadge(issue.severity)}
                      >
                        {issue.severity === "high" ? "Critique" : 
                         issue.severity === "medium" ? "Moyen" : "Faible"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Impact:</span>
                        <span className="font-medium">{issue.impact}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Solution recommandée:</span>
                        <span className="font-medium text-blue-600">{issue.solution}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Appliquer la solution
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring en temps réel</CardTitle>
              <CardDescription>
                Surveillance continue des performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Système de monitoring</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Alertes automatiques</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Configuré
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Auto-scaling</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    En test
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
