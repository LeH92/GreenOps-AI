import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Settings, RefreshCw, DollarSign, Activity, Zap, TrendingUp } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function OpenAIProviderPage() {
  const openaiModels = [
    {
      name: "GPT-4",
      status: "active",
      requests: "3,420",
      cost: "$487.20",
      avgLatency: "1.8s",
      successRate: "99.1%",
      usage: 85
    },
    {
      name: "GPT-3.5 Turbo", 
      status: "active",
      requests: "1,240",
      cost: "$124.50",
      avgLatency: "0.9s",
      successRate: "99.8%",
      usage: 45
    },
    {
      name: "DALL-E 3",
      status: "inactive",
      requests: "0",
      cost: "$0.00",
      avgLatency: "-",
      successRate: "-",
      usage: 0
    },
    {
      name: "Whisper",
      status: "active",
      requests: "156",
      cost: "$23.40",
      avgLatency: "2.1s",
      successRate: "98.7%",
      usage: 12
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return "text-red-600";
    if (usage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CompanyLogo company="openai" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">OpenAI</h1>
            <p className="text-muted-foreground">
              Gérez vos modèles et services OpenAI
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

      {/* Métriques OpenAI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$635.10</div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requêtes Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,816</div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles Actifs</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/4</div>
            <p className="text-xs text-muted-foreground">en utilisation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.2%</div>
            <p className="text-xs text-muted-foreground">taux de succès</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modèles OpenAI</CardTitle>
              <CardDescription>
                État et performance de vos modèles OpenAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openaiModels.map((model) => (
                  <div key={model.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <CompanyLogo company="openai" size={24} />
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {model.requests} requêtes • {model.avgLatency} latence
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={getStatusBadge(model.status)}
                      >
                        {model.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    
                    {model.status === "active" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Coût mensuel</p>
                          <p className="font-semibold text-green-600">{model.cost}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Taux de succès</p>
                          <p className="font-semibold text-green-600">{model.successRate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Utilisation</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={model.usage} className="w-16 h-2" />
                            <span className={`text-sm font-semibold ${getUsageColor(model.usage)}`}>
                              {model.usage}%
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Zap className="mr-2 h-4 w-4" />
                            Optimiser
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilisation par modèle</CardTitle>
                <CardDescription>Répartition des requêtes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {openaiModels.filter(m => m.status === 'active').map((model) => (
                    <div key={model.name} className="flex items-center justify-between">
                      <span className="text-sm">{model.name}</span>
                      <span className="font-semibold">{model.requests}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle</CardTitle>
                <CardDescription>Coûts des 3 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Décembre 2024</span>
                    <span className="font-semibold">$635.10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Novembre 2024</span>
                    <span className="font-semibold">$567.80</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Octobre 2024</span>
                    <span className="font-semibold">$489.30</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Insights et Recommandations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm">💡 Optimisation</h4>
                  <p className="text-xs text-green-700">
                    Utiliser GPT-3.5 Turbo pour 30% des tâches simples pourrait économiser $89/mois
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">📈 Tendance</h4>
                  <p className="text-xs text-blue-700">
                    Augmentation de 18% de l'utilisation de GPT-4 ce mois
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 text-sm">⚠️ Attention</h4>
                  <p className="text-xs text-yellow-700">
                    GPT-4 approche de la limite d'utilisation (85%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration OpenAI</CardTitle>
              <CardDescription>
                Paramètres de connexion et limites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Clé API OpenAI</p>
                    <p className="text-sm text-muted-foreground">sk-...****</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Organisation</p>
                    <p className="text-sm text-muted-foreground">GreenOps AI</p>
                  </div>
                  <Button variant="outline" size="sm">Changer</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Limites de taux</p>
                    <p className="text-sm text-muted-foreground">Tier 3 - 10,000 RPM</p>
                  </div>
                  <Button variant="outline" size="sm">Voir détails</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Budget mensuel</p>
                    <p className="text-sm text-muted-foreground">$800.00</p>
                  </div>
                  <Button variant="outline" size="sm">Ajuster</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
