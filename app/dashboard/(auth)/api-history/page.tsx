import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Search, Filter, Download, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ApiHistoryPage() {
  const apiCalls = [
    {
      id: "call_001",
      timestamp: "2024-12-30 14:23:15",
      endpoint: "/api/v1/chat/completions",
      method: "POST",
      status: 200,
      latency: "1.8s",
      provider: "OpenAI",
      model: "gpt-4",
      tokens: 1250,
      cost: "$0.025",
      user: "user@example.com"
    },
    {
      id: "call_002", 
      timestamp: "2024-12-30 14:22:43",
      endpoint: "/api/v1/messages",
      method: "POST", 
      status: 200,
      latency: "1.1s",
      provider: "Anthropic",
      model: "claude-3-sonnet",
      tokens: 980,
      cost: "$0.019",
      user: "admin@company.com"
    },
    {
      id: "call_003",
      timestamp: "2024-12-30 14:21:12",
      endpoint: "/api/v1/chat/completions", 
      method: "POST",
      status: 429,
      latency: "0.2s",
      provider: "OpenAI",
      model: "gpt-4",
      tokens: 0,
      cost: "$0.000",
      user: "dev@startup.io"
    },
    {
      id: "call_004",
      timestamp: "2024-12-30 14:20:55",
      endpoint: "/api/v1/generate",
      method: "POST",
      status: 200,
      latency: "0.9s", 
      provider: "Google AI",
      model: "gemini-pro",
      tokens: 750,
      cost: "$0.012",
      user: "api@service.com"
    },
    {
      id: "call_005",
      timestamp: "2024-12-30 14:19:30",
      endpoint: "/api/v1/invoke",
      method: "POST",
      status: 500,
      latency: "5.0s",
      provider: "AWS Bedrock",
      model: "claude-v2",
      tokens: 0,
      cost: "$0.000", 
      user: "test@domain.com"
    }
  ];

  const errorTypes = [
    { code: "429", description: "Rate Limit Exceeded", count: 15, percentage: "0.5%" },
    { code: "500", description: "Internal Server Error", count: 8, percentage: "0.3%" },
    { code: "503", description: "Service Unavailable", count: 5, percentage: "0.2%" },
    { code: "401", description: "Unauthorized", count: 3, percentage: "0.1%" }
  ];

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status >= 400 && status < 500) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (status >= 400 && status < 500) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else {
      return "bg-red-100 text-red-800 border-red-200";
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

  const getLatencyColor = (latency: string) => {
    const value = parseFloat(latency);
    if (value <= 1.0) return "text-green-600";
    if (value <= 2.0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Appels API</h1>
          <p className="text-muted-foreground">
            Consultez l'historique détaillé de tous vos appels API
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher par endpoint, utilisateur, ou ID..." 
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Période
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls">Appels récents</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appels API récents</CardTitle>
              <CardDescription>
                Les 50 derniers appels API avec détails complets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(call.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-medium">{call.method}</span>
                          <span className="font-mono text-sm text-muted-foreground">{call.endpoint}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{call.timestamp}</span>
                          <span className={getProviderColor(call.provider)}>{call.provider}</span>
                          <span>{call.model}</span>
                          <span>{call.user}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={getStatusBadge(call.status)}
                        >
                          {call.status}
                        </Badge>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                          <span className={getLatencyColor(call.latency)}>{call.latency}</span>
                          <span>{call.tokens} tokens</span>
                          <span className="font-semibold text-green-600">{call.cost}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Types d'erreurs</span>
                </CardTitle>
                <CardDescription>
                  Répartition des erreurs par code de statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errorTypes.map((error) => (
                    <div key={error.code} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            {error.code}
                          </Badge>
                          <span className="font-medium">{error.description}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {error.percentage} des appels
                        </p>
                      </div>
                      <span className="font-semibold text-red-600">{error.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Erreurs récentes</CardTitle>
                <CardDescription>
                  Les dernières erreurs détectées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiCalls.filter(call => call.status >= 400).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(call.status)}
                          <span className="font-mono text-sm">{call.endpoint}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {call.timestamp} • {call.provider}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getStatusBadge(call.status)}
                      >
                        {call.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top utilisateurs</CardTitle>
                <CardDescription>
                  Utilisateurs les plus actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">user@example.com</span>
                    <span className="font-semibold">2,340</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">admin@company.com</span>
                    <span className="font-semibold">1,890</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">dev@startup.io</span>
                    <span className="font-semibold">1,520</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">api@service.com</span>
                    <span className="font-semibold">1,180</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modèles populaires</CardTitle>
                <CardDescription>
                  Modèles les plus utilisés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">gpt-4</span>
                    <span className="font-semibold">3,420</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">claude-3-sonnet</span>
                    <span className="font-semibold">2,890</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">gemini-pro</span>
                    <span className="font-semibold">1,650</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">claude-v2</span>
                    <span className="font-semibold">600</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heures de pointe</CardTitle>
                <CardDescription>
                  Répartition horaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">09:00 - 10:00</span>
                    <span className="font-semibold">520</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">14:00 - 15:00</span>
                    <span className="font-semibold">510</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">16:00 - 17:00</span>
                    <span className="font-semibold">490</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">11:00 - 12:00</span>
                    <span className="font-semibold">480</span>
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
