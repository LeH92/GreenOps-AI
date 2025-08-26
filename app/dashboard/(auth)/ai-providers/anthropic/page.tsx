import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Settings, RefreshCw, DollarSign, Activity, Zap, TrendingUp, Shield } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function AnthropicProviderPage() {
  const anthropicModels = [
    {
      name: "Claude-3 Sonnet",
      status: "active",
      requests: "2,890",
      cost: "$312.80",
      avgLatency: "1.1s",
      successRate: "99.5%",
      usage: 65,
      contextLength: "200K"
    },
    {
      name: "Claude-3 Haiku", 
      status: "active",
      requests: "456",
      cost: "$45.60",
      avgLatency: "0.8s",
      successRate: "99.2%",
      usage: 25,
      contextLength: "200K"
    },
    {
      name: "Claude-2.1",
      status: "active",
      requests: "234",
      cost: "$23.40",
      avgLatency: "1.3s",
      successRate: "98.9%",
      usage: 15,
      contextLength: "200K"
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

  const totalCost = anthropicModels.reduce((sum, model) => 
    sum + parseFloat(model.cost.replace('$', '').replace(',', '')), 0
  );

  const totalRequests = anthropicModels.reduce((sum, model) => 
    sum + parseInt(model.requests.replace(',', '')), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CompanyLogo company="anthropic" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Anthropic</h1>
            <p className="text-muted-foreground">
              Gérez vos modèles Claude et services Anthropic
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

      {/* Métriques Anthropic */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requêtes Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles Actifs</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/3</div>
            <p className="text-xs text-muted-foreground">tous actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiabilité</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
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
          <TabsTrigger value="safety">Sécurité</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modèles Claude</CardTitle>
              <CardDescription>
                État et performance de vos modèles Anthropic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anthropicModels.map((model) => (
                  <div key={model.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <CompanyLogo company="anthropic" size={24} />
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {model.contextLength} tokens • {model.requests} requêtes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {model.contextLength} contexte
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={getStatusBadge(model.status)}
                        >
                          Actif
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Coût mensuel</p>
                        <p className="font-semibold text-blue-600">{model.cost}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Latence moy.</p>
                        <p className="font-semibold text-green-600">{model.avgLatency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Succès</p>
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
                          Tester
                        </Button>
                      </div>
                    </div>
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
                  {anthropicModels.map((model) => (
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
                <CardTitle>Performance comparative</CardTitle>
                <CardDescription>vs autres fournisseurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latence moyenne</span>
                    <span className="font-semibold text-green-600">1.1s (Excellent)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fiabilité</span>
                    <span className="font-semibold text-green-600">99.2% (Excellent)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Coût/token</span>
                    <span className="font-semibold text-blue-600">$0.000015 (Bon)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contexte long</span>
                    <span className="font-semibold text-purple-600">200K (Leader)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Avantages Claude</CardTitle>
              <CardDescription>Points forts des modèles Anthropic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">🧠 Contexte long</h4>
                  <p className="text-sm text-muted-foreground">
                    200K tokens de contexte pour analyser des documents entiers
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">🛡️ Sécurité</h4>
                  <p className="text-sm text-muted-foreground">
                    Modèles entraînés avec Constitutional AI pour plus de sécurité
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">📝 Précision</h4>
                  <p className="text-sm text-muted-foreground">
                    Excellent pour l'analyse de texte et la compréhension nuancée
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-600">⚡ Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Latence optimale et taux de succès de 99.2%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Sécurité et Constitutional AI</span>
              </CardTitle>
              <CardDescription>
                Fonctionnalités de sécurité des modèles Claude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Filtres de contenu</h4>
                  <p className="text-sm text-green-700">
                    Détection automatique de contenu inapproprié ou dangereux
                  </p>
                  <div className="mt-2 text-xs text-green-600">
                    99.8% de précision • 0 faux positifs ce mois
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔒 Confidentialité</h4>
                  <p className="text-sm text-blue-700">
                    Vos données ne sont pas utilisées pour l'entraînement
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    Conformité RGPD • Chiffrement de bout en bout
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 Constitutional AI</h4>
                  <p className="text-sm text-purple-700">
                    Modèles entraînés pour être utiles, inoffensifs et honnêtes
                  </p>
                  <div className="mt-2 text-xs text-purple-600">
                    Réduction de 95% des réponses problématiques
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring de sécurité</CardTitle>
              <CardDescription>Surveillance en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Requêtes filtrées</p>
                    <p className="text-sm text-muted-foreground">0.2% ce mois</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Normal
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Violations détectées</p>
                    <p className="text-sm text-muted-foreground">0 incidents</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Sécurisé
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Score de confiance</p>
                    <p className="text-sm text-muted-foreground">99.2% moyen</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Excellent
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Anthropic</CardTitle>
              <CardDescription>
                Paramètres de connexion et limites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Clé API Anthropic</p>
                    <p className="text-sm text-muted-foreground">sk-ant-...****</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Limites de taux</p>
                    <p className="text-sm text-muted-foreground">40,000 tokens/min</p>
                  </div>
                  <Button variant="outline" size="sm">Voir détails</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Budget mensuel</p>
                    <p className="text-sm text-muted-foreground">$500.00</p>
                  </div>
                  <Button variant="outline" size="sm">Ajuster</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Filtres de sécurité</p>
                    <p className="text-sm text-muted-foreground">Niveau élevé</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
