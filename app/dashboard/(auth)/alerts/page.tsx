import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertTriangle, CheckCircle, Clock, Settings, Plus, Filter } from "lucide-react";

export default function AlertsPage() {
  const activeAlerts = [
    {
      id: 1,
      title: "Budget Stockage Critique",
      message: "Le budget stockage a atteint 99.5% de sa limite (298.50$ / 300$)",
      severity: "critical",
      category: "budget",
      time: "Il y a 2h",
      service: "Google Cloud Storage",
      threshold: "95%",
      current: "99.5%"
    },
    {
      id: 2,
      title: "Seuil Budget IA Atteint",
      message: "Le budget IA global a dépassé le seuil de 90% (1847.50$ / 2000$)",
      severity: "warning",
      category: "budget",
      time: "Il y a 4h",
      service: "Budget IA Global",
      threshold: "90%",
      current: "92.4%"
    },
    {
      id: 3,
      title: "Pic d'Utilisation OpenAI",
      message: "Utilisation inhabituelle détectée: +45% par rapport à la moyenne",
      severity: "warning",
      category: "usage",
      time: "Il y a 6h",
      service: "OpenAI GPT-4",
      threshold: "20%",
      current: "45%"
    }
  ];

  const recentAlerts = [
    {
      id: 4,
      title: "Optimisation Carbone Réussie",
      message: "Réduction de 14.3% des émissions CO₂ ce mois",
      severity: "success",
      category: "carbon",
      time: "Il y a 1j",
      resolved: true
    },
    {
      id: 5,
      title: "Connexion AWS Restaurée",
      message: "La connexion AWS a été rétablie après maintenance",
      severity: "info",
      category: "provider",
      time: "Il y a 2j",
      resolved: true
    }
  ];

  const alertRules = [
    {
      name: "Budget > 90%",
      category: "budget",
      enabled: true,
      threshold: "90%",
      notifications: ["Email", "Dashboard"]
    },
    {
      name: "Budget > 95%",
      category: "budget", 
      enabled: true,
      threshold: "95%",
      notifications: ["Email", "SMS", "Dashboard"]
    },
    {
      name: "Pic d'usage +30%",
      category: "usage",
      enabled: true,
      threshold: "30%",
      notifications: ["Email", "Dashboard"]
    },
    {
      name: "Émissions CO₂ +20%",
      category: "carbon",
      enabled: false,
      threshold: "20%",
      notifications: ["Email"]
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "bg-red-100 text-red-800 border-red-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      success: "bg-green-100 text-green-800 border-green-200",
      info: "bg-blue-100 text-blue-800 border-blue-200"
    };
    
    return variants[severity as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      budget: "bg-purple-100 text-purple-800 border-purple-200",
      usage: "bg-blue-100 text-blue-800 border-blue-200",
      carbon: "bg-green-100 text-green-800 border-green-200",
      provider: "bg-orange-100 text-orange-800 border-orange-200"
    };
    
    return variants[category as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      budget: "Budget",
      usage: "Usage",
      carbon: "Carbone",
      provider: "Fournisseur"
    };
    
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertes</h1>
          <p className="text-muted-foreground">
            Surveillez les notifications et gérez vos règles d'alerte
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle règle
          </Button>
        </div>
      </div>

      {/* Résumé des alertes */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">
              Action immédiate requise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolues Aujourd'hui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">5</div>
            <p className="text-xs text-muted-foreground">
              Problèmes réglés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Règles Actives</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Règles configurées
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Alertes actives</TabsTrigger>
          <TabsTrigger value="recent">Récentes</TabsTrigger>
          <TabsTrigger value="rules">Règles</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length > 0 ? (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(alert.severity)}
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline"
                          className={getCategoryBadge(alert.category)}
                        >
                          {getCategoryLabel(alert.category)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getSeverityBadge(alert.severity)}
                        >
                          {alert.severity === "critical" ? "Critique" : "Attention"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{alert.service}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Seuil configuré:</span>
                      <span className="font-medium">{alert.threshold}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valeur actuelle:</span>
                      <span className="font-medium text-red-600">{alert.current}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {alert.time}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Ignorer
                        </Button>
                        <Button size="sm">
                          Résoudre
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h3 className="text-lg font-semibold">Aucune alerte active</h3>
                  <p className="text-muted-foreground">Tous vos services fonctionnent normalement</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <Card key={alert.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      {alert.resolved && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Résolu
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant="outline"
                      className={getCategoryBadge(alert.category)}
                    >
                      {getCategoryLabel(alert.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{alert.message}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {alert.time}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Règles d'alerte configurées</CardTitle>
              <CardDescription>
                Gérez vos seuils et notifications d'alerte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge 
                            variant="outline" 
                            className={getCategoryBadge(rule.category)}
                            size="sm"
                          >
                            {getCategoryLabel(rule.category)}
                          </Badge>
                          <span>Seuil: {rule.threshold}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-muted-foreground">
                        {rule.notifications.join(", ")}
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
