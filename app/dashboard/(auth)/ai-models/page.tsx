import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Bot, TrendingUp, TrendingDown, Zap, Star, Clock, DollarSign } from "lucide-react";

export default function AiModelsPage() {
  const models = [
    {
      name: "GPT-4",
      provider: "OpenAI",
      category: "Chat/Completion",
      status: "active",
      usage: "3,420 requêtes",
      cost: "$487.20",
      avgLatency: "1.8s",
      successRate: "99.1%",
      rating: 4.8,
      maxTokens: "8,192",
      costPer1k: "$0.03",
      strengths: ["Raisonnement complexe", "Code", "Créativité"],
      weaknesses: ["Coût élevé", "Latence"]
    },
    {
      name: "Claude-3 Sonnet",
      provider: "Anthropic", 
      category: "Chat/Completion",
      status: "active",
      usage: "2,890 requêtes",
      cost: "$312.80",
      avgLatency: "1.1s",
      successRate: "99.5%",
      rating: 4.9,
      maxTokens: "200,000",
      costPer1k: "$0.015",
      strengths: ["Contexte long", "Sécurité", "Précision"],
      weaknesses: ["Disponibilité limitée"]
    },
    {
      name: "Gemini Pro",
      provider: "Google AI",
      category: "Chat/Completion",
      status: "active",
      usage: "1,650 requêtes",
      cost: "$156.40",
      avgLatency: "0.9s",
      successRate: "98.9%",
      rating: 4.6,
      maxTokens: "32,768",
      costPer1k: "$0.0005",
      strengths: ["Vitesse", "Coût faible", "Multimodal"],
      weaknesses: ["Qualité variable"]
    },
    {
      name: "Claude-2",
      provider: "AWS Bedrock",
      category: "Chat/Completion",
      status: "deprecated",
      usage: "600 requêtes",
      cost: "$89.20",
      avgLatency: "1.5s",
      successRate: "99.8%",
      rating: 4.4,
      maxTokens: "100,000",
      costPer1k: "$0.008",
      strengths: ["Fiabilité", "Contexte long"],
      weaknesses: ["Performance inférieure", "Déprécié"]
    }
  ];

  const modelComparison = [
    {
      metric: "Vitesse",
      gpt4: 7,
      claude3: 9,
      gemini: 10,
      claude2: 8
    },
    {
      metric: "Qualité",
      gpt4: 10,
      claude3: 9,
      gemini: 7,
      claude2: 8
    },
    {
      metric: "Coût",
      gpt4: 3,
      claude3: 6,
      gemini: 10,
      claude2: 7
    },
    {
      metric: "Fiabilité",
      gpt4: 8,
      claude3: 10,
      gemini: 7,
      claude2: 9
    }
  ];

  const recommendations = [
    {
      scenario: "Tâches complexes de raisonnement",
      recommended: "GPT-4",
      alternative: "Claude-3 Sonnet",
      reason: "Meilleure performance sur les tâches analytiques complexes"
    },
    {
      scenario: "Traitement de documents longs",
      recommended: "Claude-3 Sonnet",
      alternative: "Claude-2",
      reason: "Contexte de 200K tokens, idéal pour l'analyse de documents"
    },
    {
      scenario: "Applications à fort volume",
      recommended: "Gemini Pro",
      alternative: "Claude-3 Sonnet",
      reason: "Coût très faible et latence optimale"
    },
    {
      scenario: "Applications critiques",
      recommended: "Claude-3 Sonnet",
      alternative: "Claude-2",
      reason: "Taux de succès le plus élevé (99.5%)"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      deprecated: "bg-red-100 text-red-800 border-red-200",
      beta: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return variants[status as keyof typeof variants] || variants.active;
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

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getLatencyColor = (latency: string) => {
    const value = parseFloat(latency);
    if (value <= 1.0) return "text-green-600";
    if (value <= 1.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getMetricColor = (value: number) => {
    if (value >= 8) return "bg-green-500";
    if (value >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modèles IA</h1>
          <p className="text-muted-foreground">
            Gérez et comparez vos modèles d'intelligence artificielle
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Zap className="mr-2 h-4 w-4" />
            Benchmark
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            Nouveau modèle
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {models.map((model) => (
              <Card key={model.name} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bot className={`h-6 w-6 ${getProviderColor(model.provider)}`} />
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <span className={getProviderColor(model.provider)}>
                            {model.provider}
                          </span>
                          <span>•</span>
                          <span>{model.category}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={getStatusBadge(model.status)}
                    >
                      {model.status === "active" ? "Actif" : 
                       model.status === "deprecated" ? "Déprécié" : "Beta"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(model.rating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {model.rating}/5
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Métriques principales */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Usage:</span>
                      <p className="font-semibold">{model.usage}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Coût:</span>
                      <p className="font-semibold text-green-600">{model.cost}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Latence:</span>
                      <p className={`font-semibold ${getLatencyColor(model.avgLatency)}`}>
                        {model.avgLatency}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Succès:</span>
                      <p className="font-semibold text-green-600">{model.successRate}</p>
                    </div>
                  </div>

                  {/* Spécifications */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tokens max:</span>
                      <span className="font-medium">{model.maxTokens}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Coût/1K tokens:</span>
                      <span className="font-medium">{model.costPer1k}</span>
                    </div>
                  </div>

                  {/* Forces et faiblesses */}
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Points forts:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.strengths.map((strength, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700 text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-700 mb-1">Limitations:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.weaknesses.map((weakness, index) => (
                          <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Clock className="mr-2 h-4 w-4" />
                      Tester
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Analyser coûts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison des performances</CardTitle>
              <CardDescription>
                Comparaison sur les métriques clés (score sur 10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modelComparison.map((metric) => (
                  <div key={metric.metric} className="space-y-3">
                    <h4 className="font-medium">{metric.metric}</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>GPT-4</span>
                          <span className="font-semibold">{metric.gpt4}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getMetricColor(metric.gpt4)}`}
                            style={{ width: `${metric.gpt4 * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Claude-3</span>
                          <span className="font-semibold">{metric.claude3}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getMetricColor(metric.claude3)}`}
                            style={{ width: `${metric.claude3 * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Gemini</span>
                          <span className="font-semibold">{metric.gemini}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getMetricColor(metric.gemini)}`}
                            style={{ width: `${metric.gemini * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Claude-2</span>
                          <span className="font-semibold">{metric.claude2}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getMetricColor(metric.claude2)}`}
                            style={{ width: `${metric.claude2 * 10}%` }}
                          />
                        </div>
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
                <CardTitle>Coût vs Performance</CardTitle>
                <CardDescription>
                  Rapport qualité-prix des modèles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Meilleur rapport</span>
                      <Badge className="bg-green-100 text-green-800">Claude-3 Sonnet</Badge>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Excellent équilibre performance/coût
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">Plus économique</span>
                      <Badge className="bg-blue-100 text-blue-800">Gemini Pro</Badge>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Coût le plus faible pour usage intensif
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-yellow-800">Plus performant</span>
                      <Badge className="bg-yellow-100 text-yellow-800">GPT-4</Badge>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Meilleure qualité pour tâches complexes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation recommandée</CardTitle>
                <CardDescription>
                  Répartition optimale selon vos besoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tâches complexes</span>
                      <span className="font-semibold">GPT-4 (30%)</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage général</span>
                      <span className="font-semibold">Claude-3 (40%)</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fort volume</span>
                      <span className="font-semibold">Gemini Pro (25%)</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Applications critiques</span>
                      <span className="font-semibold">Claude-2 (5%)</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>Recommandations par cas d'usage</span>
              </CardTitle>
              <CardDescription>
                Choisissez le bon modèle selon votre contexte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{rec.scenario}</h4>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {rec.recommended}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Alternative:</span>
                      <span className="font-medium">{rec.alternative}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimisations suggérées</CardTitle>
              <CardDescription>
                Actions pour améliorer votre utilisation des modèles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm">💰 Économies</h4>
                  <p className="text-xs text-green-700">
                    Migrer 40% des requêtes GPT-4 vers Claude-3 pourrait économiser $125/mois.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">⚡ Performance</h4>
                  <p className="text-xs text-blue-700">
                    Utiliser Gemini Pro pour les tâches simples réduirait la latence moyenne de 0.4s.
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 text-sm">🔄 Redondance</h4>
                  <p className="text-xs text-yellow-700">
                    Configurer Claude-3 comme fallback pour GPT-4 améliorerait la disponibilité.
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
