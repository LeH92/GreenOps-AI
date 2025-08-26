import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, TreePine, Zap, TrendingDown, TrendingUp, Target, BarChart3 } from "lucide-react";

export default function CarbonPage() {
  const carbonMetrics = [
    {
      title: "Empreinte Carbone Totale",
      value: "15.6 kg CO₂",
      change: "-14.3%",
      trend: "down",
      description: "vs mois précédent",
      target: "12 kg CO₂"
    },
    {
      title: "Émissions IA/LLM",
      value: "8.4 kg CO₂",
      change: "-8.2%",
      trend: "down",
      description: "54% du total",
      target: "6 kg CO₂"
    },
    {
      title: "Infrastructure Cloud",
      value: "5.8 kg CO₂",
      change: "-18.5%",
      trend: "down",
      description: "37% du total",
      target: "4 kg CO₂"
    },
    {
      title: "Efficacité Carbone",
      value: "0.75 g/requête",
      change: "-22.1%",
      trend: "down",
      description: "amélioration continue",
      target: "0.60 g/requête"
    }
  ];

  const carbonByService = [
    { service: "OpenAI GPT-4", emissions: "4.2 kg CO₂", percentage: 27, efficiency: "Moyenne" },
    { service: "AWS EC2", emissions: "3.1 kg CO₂", percentage: 20, efficiency: "Bonne" },
    { service: "Anthropic Claude", emissions: "2.8 kg CO₂", percentage: 18, efficiency: "Excellente" },
    { service: "Google Cloud", emissions: "2.3 kg CO₂", percentage: 15, efficiency: "Très bonne" },
    { service: "Azure Functions", emissions: "1.9 kg CO₂", percentage: 12, efficiency: "Bonne" },
    { service: "Autres services", emissions: "1.3 kg CO₂", percentage: 8, efficiency: "Variable" }
  ];

  const sustainabilityActions = [
    {
      action: "Migration vers Claude-3",
      impact: "-2.1 kg CO₂/mois",
      status: "En cours",
      difficulty: "Facile"
    },
    {
      action: "Optimisation des requêtes IA",
      impact: "-1.8 kg CO₂/mois", 
      status: "Planifié",
      difficulty: "Moyenne"
    },
    {
      action: "Utilisation d'énergies renouvelables",
      impact: "-3.2 kg CO₂/mois",
      status: "Évaluation",
      difficulty: "Difficile"
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "down" ? 
      <TrendingDown className="h-4 w-4 text-green-500" /> : 
      <TrendingUp className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === "down" ? "text-green-600" : "text-red-600";
  };

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case "Excellente":
        return "bg-green-100 text-green-800 border-green-200";
      case "Très bonne":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Bonne":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Moyenne":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planifié":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Évaluation":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empreinte Carbone</h1>
          <p className="text-muted-foreground">
            Surveillez et réduisez l'impact environnemental de vos services
          </p>
        </div>
        <Button>
          <TreePine className="mr-2 h-4 w-4" />
          Plan d'action climat
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {carbonMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={getTrendColor(metric.trend)}>{metric.change}</span>
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
          <TabsTrigger value="services">Par service</TabsTrigger>
          <TabsTrigger value="actions">Actions durables</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span>Progrès vers l'objectif</span>
                </CardTitle>
                <CardDescription>
                  Objectif mensuel: 12 kg CO₂
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Émissions actuelles</span>
                    <span className="font-semibold">15.6 kg CO₂</span>
                  </div>
                  <Progress value={77} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>77% de l'objectif atteint</span>
                    <span className="text-green-600">-3.6 kg restant à économiser</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    🎯 Vous êtes sur la bonne voie ! Continuez les optimisations pour atteindre l'objectif.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Impact par région</span>
                </CardTitle>
                <CardDescription>
                  Émissions selon la localisation des services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">US-East (Virginie)</span>
                    <span className="font-semibold">6.2 kg CO₂</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Europe (Irlande)</span>
                    <span className="font-semibold">4.8 kg CO₂</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asia-Pacific (Tokyo)</span>
                    <span className="font-semibold">3.1 kg CO₂</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Autres régions</span>
                    <span className="font-semibold">1.5 kg CO₂</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Émissions par service</CardTitle>
              <CardDescription>
                Répartition détaillée de l'empreinte carbone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carbonByService.map((item, index) => (
                  <div key={item.service} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{item.service}</p>
                        <p className="text-sm text-muted-foreground">{item.percentage}% du total</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline"
                        className={getEfficiencyColor(item.efficiency)}
                      >
                        {item.efficiency}
                      </Badge>
                      <span className="font-semibold">{item.emissions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>Plan d'action durabilité</span>
              </CardTitle>
              <CardDescription>
                Actions pour réduire l'empreinte carbone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sustainabilityActions.map((action, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{action.action}</h4>
                      <Badge 
                        variant="outline"
                        className={getStatusColor(action.status)}
                      >
                        {action.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Impact estimé:</span>
                      <span className="font-semibold text-green-600">{action.impact}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Difficulté:</span>
                      <span>{action.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calculateur d'impact</CardTitle>
              <CardDescription>
                Estimez l'impact de vos optimisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800">💡 Conseil</h4>
                  <p className="text-sm text-blue-700">
                    Réduire de 20% l'utilisation de GPT-4 pourrait économiser 0.84 kg CO₂/mois.
                  </p>
                </div>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Calculer l'impact d'une action
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution de l'empreinte carbone</CardTitle>
              <CardDescription>
                Tendances et prévisions sur 6 mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Décembre 2024</span>
                  <span className="font-semibold">15.6 kg CO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Novembre 2024</span>
                  <span className="font-semibold">18.2 kg CO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Octobre 2024</span>
                  <span className="font-semibold">21.4 kg CO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Septembre 2024</span>
                  <span className="font-semibold">19.8 kg CO₂</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  📈 Tendance positive: -27% d'émissions sur les 3 derniers mois grâce aux optimisations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
