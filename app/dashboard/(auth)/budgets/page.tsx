import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function BudgetsPage() {
  const budgets = [
    {
      name: "Budget IA Global",
      allocated: 2000,
      spent: 1847.50,
      percentage: 92.4,
      status: "warning",
      period: "Mensuel",
      remaining: 152.50
    },
    {
      name: "Infrastructure Cloud",
      allocated: 1500,
      spent: 1247.30,
      percentage: 83.2,
      status: "healthy",
      period: "Mensuel", 
      remaining: 252.70
    },
    {
      name: "OpenAI Services",
      allocated: 800,
      spent: 487.20,
      percentage: 60.9,
      status: "healthy",
      period: "Mensuel",
      remaining: 312.80
    },
    {
      name: "Stockage & Données",
      allocated: 300,
      spent: 298.50,
      percentage: 99.5,
      status: "critical",
      period: "Mensuel",
      remaining: 1.50
    }
  ];

  const alerts = [
    {
      budget: "Stockage & Données",
      message: "Budget presque épuisé (99.5%)",
      severity: "critical",
      time: "Il y a 2h"
    },
    {
      budget: "Budget IA Global", 
      message: "Seuil de 90% atteint",
      severity: "warning",
      time: "Il y a 4h"
    },
    {
      budget: "Infrastructure Cloud",
      message: "Utilisation normale (83.2%)",
      severity: "info",
      time: "Il y a 1j"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    };
    
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Gérez vos budgets et surveillez vos dépenses
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer un budget
        </Button>
      </div>

      {/* Vue d'ensemble des budgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,600</div>
            <p className="text-xs text-muted-foreground">
              Alloué ce mois
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépensé</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,880.50</div>
            <p className="text-xs text-muted-foreground">
              84.4% du budget total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restant</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$719.50</div>
            <p className="text-xs text-muted-foreground">
              15.6% disponible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">
              Budgets en alerte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des budgets */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Budgets actifs</h3>
          {budgets.map((budget) => (
            <Card key={budget.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{budget.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={getStatusBadge(budget.status)}
                  >
                    {budget.status === "healthy" ? "Sain" : 
                     budget.status === "warning" ? "Attention" : "Critique"}
                  </Badge>
                </div>
                <CardDescription>{budget.period}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dépensé</span>
                    <span className="font-semibold">
                      ${budget.spent.toFixed(2)} / ${budget.allocated.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={budget.percentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{budget.percentage.toFixed(1)}% utilisé</span>
                    <span className={getStatusColor(budget.status)}>
                      ${budget.remaining.toFixed(2)} restant
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alertes et notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alertes récentes</h3>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications de budget</CardTitle>
              <CardDescription>
                Alertes et mises à jour importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{alert.budget}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommandations</CardTitle>
              <CardDescription>
                Suggestions pour optimiser vos budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">Optimisation IA</h4>
                  <p className="text-xs text-blue-700">
                    Considérez Claude-3 pour réduire les coûts OpenAI de 25%.
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm">Stockage efficace</h4>
                  <p className="text-xs text-green-700">
                    Archivez les données anciennes pour libérer 40% du budget stockage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
