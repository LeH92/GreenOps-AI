import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Plus, 
  Settings, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Zap, 
  Bot, 
  Star, 
  Clock, 
  DollarSign,
  Activity,
  BarChart3,
  Target
} from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

export default function AIProvidersPage() {
  // Données des fournisseurs
  const aiProviders = [
    {
      name: "OpenAI",
      shortName: "OpenAI",
      status: "connected",
      lastSync: "Il y a 5min",
      monthlyRequests: "12.5K",
      totalCost: "$487.20",
      efficiency: "94%",
      company: "openai" as const,
      models: ["GPT-4", "GPT-3.5-turbo", "DALL-E 3"],
      activeModels: 3
    },
    {
      name: "Anthropic",
      shortName: "Anthropic", 
      status: "connected",
      lastSync: "Il y a 10min",
      monthlyRequests: "8.2K",
      totalCost: "$312.80",
      efficiency: "96%",
      company: "anthropic" as const,
      models: ["Claude-3 Sonnet", "Claude-3 Haiku", "Claude-2"],
      activeModels: 3
    },
    {
      name: "Google AI",
      shortName: "Google AI",
      status: "disconnected",
      lastSync: "Il y a 2 jours",
      monthlyRequests: "0",
      totalCost: "$0.00",
      efficiency: "N/A",
      company: "google-ai" as const,
      models: ["Gemini Pro", "Gemini Flash"],
      activeModels: 0
    }
  ];

  // Données des modèles
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
      status: "inactive",
      usage: "0 requêtes",
      cost: "$0.00",
      avgLatency: "N/A",
      successRate: "N/A",
      rating: 4.6,
      maxTokens: "32,768",
      costPer1k: "$0.0005",
      strengths: ["Vitesse", "Coût faible", "Multimodal"],
      weaknesses: ["Qualité variable"]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "disconnected":
      case "inactive":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "bg-green-100 text-green-800 border-green-200",
      active: "bg-green-100 text-green-800 border-green-200",
      disconnected: "bg-red-100 text-red-800 border-red-200",
      inactive: "bg-red-100 text-red-800 border-red-200"
    };
    
    return variants[status as keyof typeof variants] || variants.disconnected;
  };

  const totalRequests = aiProviders.reduce((sum, p) => sum + parseInt(p.monthlyRequests.replace('K', '000')), 0);
  const totalCost = aiProviders.reduce((sum, p) => sum + parseFloat(p.totalCost.replace('$', '')), 0);
  const connectedProviders = aiProviders.filter(p => p.status === 'connected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IA & LLM</h1>
          <p className="text-muted-foreground">
            Gérez vos fournisseurs et modèles d'IA
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un fournisseur
        </Button>
      </div>

      {/* Métriques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs Connectés</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedProviders}/{aiProviders.length}</div>
            <p className="text-xs text-muted-foreground">
              {((connectedProviders / aiProviders.length) * 100).toFixed(0)}% de connectivité
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requêtes Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalRequests / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">
              Ce mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Ce mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles Actifs</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.filter(m => m.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Sur {models.length} modèles
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {aiProviders.map((provider) => (
              <Card key={provider.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CompanyLogo company={provider.company} size={32} />
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{provider.models.length} modèles</p>
                      </div>
                    </div>
                    {getStatusIcon(provider.status)}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusBadge(provider.status)}
                  >
                    {provider.status === "connected" ? "Connecté" : "Déconnecté"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernière sync:</span>
                    <span>{provider.lastSync}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requêtes/mois:</span>
                    <span className="font-semibold">{provider.monthlyRequests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coût total:</span>
                    <span className="font-semibold text-green-600">{provider.totalCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Efficacité:</span>
                    <span className="font-semibold">{provider.efficiency}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Modèles actifs</span>
                      <span>{provider.activeModels}/{provider.models.length}</span>
                    </div>
                    <Progress value={(provider.activeModels / provider.models.length) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-6">
            {models.map((model) => (
              <Card key={model.name} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bot className="h-6 w-6 text-purple-600" />
                      <div>
                        <CardTitle className="text-xl">{model.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{model.provider} • {model.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(model.status)}
                      <Badge variant="outline" className={getStatusBadge(model.status)}>
                        {model.status === "active" ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{model.cost}</div>
                      <p className="text-xs text-muted-foreground">Coût mensuel</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{model.usage}</div>
                      <p className="text-xs text-muted-foreground">Requêtes</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{model.avgLatency}</div>
                      <p className="text-xs text-muted-foreground">Latence moyenne</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{model.successRate}</div>
                      <p className="text-xs text-muted-foreground">Taux de succès</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Points forts</h4>
                      <div className="space-y-1">
                        {model.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Limitations</h4>
                      <div className="space-y-1">
                        {model.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Coûts</CardTitle>
                <CardDescription>Par fournisseur ce mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiProviders.map((provider) => (
                    <div key={provider.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CompanyLogo company={provider.company} size={20} />
                        <span className="text-sm font-medium">{provider.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{provider.totalCost}</div>
                        <div className="text-xs text-muted-foreground">
                          {((parseFloat(provider.totalCost.replace('$', '')) / totalCost) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance des Modèles</CardTitle>
                <CardDescription>Comparaison des métriques clés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {models.filter(m => m.status === 'active').map((model) => (
                    <div key={model.name} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.provider}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{model.successRate}</div>
                        <div className="text-xs text-muted-foreground">{model.avgLatency}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
