import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Settings, RefreshCw, DollarSign, Activity, Zap, TrendingUp, Sparkles, Image } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function GoogleAIProviderPage() {
  const googleModels = [
    {
      name: "Gemini Pro",
      status: "active",
      requests: "1,650",
      cost: "$156.40",
      avgLatency: "0.9s",
      successRate: "98.9%",
      usage: 52,
      type: "text"
    },
    {
      name: "Gemini Pro Vision", 
      status: "active",
      requests: "234",
      cost: "$45.60",
      avgLatency: "1.2s",
      successRate: "97.8%",
      usage: 25,
      type: "multimodal"
    },
    {
      name: "PaLM 2",
      status: "deprecated",
      requests: "0",
      cost: "$0.00",
      avgLatency: "-",
      successRate: "-",
      usage: 0,
      type: "text"
    },
    {
      name: "Imagen",
      status: "inactive",
      requests: "0",
      cost: "$0.00",
      avgLatency: "-",
      successRate: "-",
      usage: 0,
      type: "image"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      deprecated: "bg-red-100 text-red-800 border-red-200"
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "multimodal":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case "image":
        return <Image className="h-4 w-4 text-blue-600" />;
      default:
        return <CompanyLogo company="google-ai" size={16} />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return "text-red-600";
    if (usage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const totalCost = googleModels.reduce((sum, model) => 
    sum + parseFloat(model.cost.replace('$', '').replace(',', '')), 0
  );

  const totalRequests = googleModels
    .filter(m => m.status === 'active')
    .reduce((sum, model) => sum + parseInt(model.requests.replace(',', '')), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <CompanyLogo company="google-ai" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Google AI</h1>
            <p className="text-muted-foreground">
              Gérez vos modèles Gemini et services Google AI
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

      {/* Métriques Google AI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requêtes Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                          <div className="text-2xl font-bold">{totalRequests.toLocaleString('en-US')}</div>
            <p className="text-xs text-muted-foreground">modèles actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Modèles Actifs</CardTitle>
        <CompanyLogo company="google-ai" size={16} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2/4</div>
            <p className="text-xs text-muted-foreground">en utilisation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.4%</div>
            <p className="text-xs text-muted-foreground">taux de succès</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="multimodal">Multimodal</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modèles Google AI</CardTitle>
              <CardDescription>
                État et performance de vos modèles Google AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {googleModels.map((model) => (
                  <div key={model.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(model.type)}
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {model.type} • {model.requests} requêtes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {model.type}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={getStatusBadge(model.status)}
                        >
                          {model.status === "active" ? "Actif" : 
                           model.status === "deprecated" ? "Déprécié" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                    
                    {model.status === "active" && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Coût mensuel</p>
                          <p className="font-semibold text-yellow-600">{model.cost}</p>
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
                    )}

                    {model.status === "deprecated" && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          ⚠️ Ce modèle est déprécié. Migrez vers Gemini Pro pour de meilleures performances.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Migrer vers Gemini Pro
                        </Button>
                      </div>
                    )}

                    {model.status === "inactive" && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          Modèle disponible mais non configuré. Activez-le pour commencer à l'utiliser.
                        </p>
                        <Button size="sm" className="mt-2">
                          Activer {model.name}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multimodal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Capacités Multimodales</span>
              </CardTitle>
              <CardDescription>
                Fonctionnalités avancées de Gemini Pro Vision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">🖼️ Analyse d'images</h4>
                    <p className="text-sm text-purple-700">
                      Compréhension et description détaillée d'images
                    </p>
                    <div className="mt-2 text-xs text-purple-600">
                      234 requêtes ce mois • 97.8% précision
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 Graphiques & Diagrammes</h4>
                    <p className="text-sm text-blue-700">
                      Extraction de données depuis des graphiques et tableaux
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      Formats supportés: PNG, JPEG, WEBP, GIF
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">📝 OCR Avancé</h4>
                    <p className="text-sm text-green-700">
                      Reconnaissance de texte dans les images avec contexte
                    </p>
                    <div className="mt-2 text-xs text-green-600">
                      Support multilingue • Haute précision
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">🎯 Détection d'objets</h4>
                    <p className="text-sm text-yellow-700">
                      Identification et localisation d'objets dans les images
                    </p>
                    <div className="mt-2 text-xs text-yellow-600">
                      1000+ catégories d'objets reconnues
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exemples d'utilisation</CardTitle>
              <CardDescription>
                Cas d'usage typiques pour les capacités multimodales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Analyse de documents</p>
                    <p className="text-sm text-muted-foreground">Extraction de données depuis des PDF scannés</p>
                  </div>
                  <Button variant="outline" size="sm">Essayer</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Description d'images produits</p>
                    <p className="text-sm text-muted-foreground">Génération automatique de descriptions e-commerce</p>
                  </div>
                  <Button variant="outline" size="sm">Essayer</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Analyse de graphiques</p>
                    <p className="text-sm text-muted-foreground">Extraction de données depuis des charts et graphs</p>
                  </div>
                  <Button variant="outline" size="sm">Essayer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilisation par modèle</CardTitle>
                <CardDescription>Répartition des requêtes actives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {googleModels.filter(m => m.status === 'active').map((model) => (
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
                <CardTitle>Avantages Google AI</CardTitle>
                <CardDescription>Points forts des modèles Google</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Coût par token</span>
                    <span className="font-semibold text-green-600">Très faible</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vitesse</span>
                    <span className="font-semibold text-green-600">0.9s (Excellent)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Multimodal</span>
                    <span className="font-semibold text-purple-600">Leader</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Intégration</span>
                    <span className="font-semibold text-blue-600">Google Cloud</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations d'optimisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm">💰 Économique</h4>
                  <p className="text-xs text-green-700">
                    Gemini Pro est 10x moins cher que GPT-4 pour des tâches similaires
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">🚀 Performance</h4>
                  <p className="text-xs text-blue-700">
                    Latence de 0.9s, idéal pour les applications temps réel
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 text-sm">🎯 Spécialisation</h4>
                  <p className="text-xs text-purple-700">
                    Utilisez Gemini Pro Vision pour toutes les tâches multimodales
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Google AI</CardTitle>
              <CardDescription>
                Paramètres de connexion et limites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Clé API Google AI</p>
                    <p className="text-sm text-muted-foreground">AIza...****</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Projet Google Cloud</p>
                    <p className="text-sm text-muted-foreground">greenops-ai-prod</p>
                  </div>
                  <Button variant="outline" size="sm">Changer</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Limites de requêtes</p>
                    <p className="text-sm text-muted-foreground">60 requêtes/minute</p>
                  </div>
                  <Button variant="outline" size="sm">Augmenter</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Budget mensuel</p>
                    <p className="text-sm text-muted-foreground">$300.00</p>
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
