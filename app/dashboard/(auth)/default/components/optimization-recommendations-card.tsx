import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, DollarSign, Leaf, TrendingUp, Target, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/format-utils";

export function OptimizationRecommendationsCard() {
  const recommendations = [
    {
      id: 1,
      type: "cost",
      title: "Instances EC2 sous-utilisées",
      description: "3 instances EC2 utilisées à moins de 20%",
      savings: "$156/mois",
      impact: "high",
      status: "pending",
      progress: 0
    },
    {
      id: 2,
      type: "carbon",
      title: "Migration vers des régions vertes",
      description: "Déplacer les workloads vers des régions alimentées en énergies renouvelables",
      savings: "2.3 kg CO2/mois",
      impact: "medium",
      status: "in-progress",
      progress: 65
    },
    {
      id: 3,
      type: "performance",
      title: "Optimisation des modèles IA",
      description: "Utiliser GPT-3.5 pour 30% des tâches simples",
      savings: "$89/mois",
      impact: "high",
      status: "completed",
      progress: 100
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cost":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "carbon":
        return <Leaf className="h-4 w-4 text-blue-600" />;
      case "performance":
        return <Zap className="h-4 w-4 text-yellow-600" />;
      default:
        return <Target className="h-4 w-4 text-purple-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return variants[impact as keyof typeof variants] || variants.low;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-gray-100 text-gray-800 border-gray-200",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "in-progress":
        return "En cours";
      case "completed":
        return "Terminé";
      default:
        return "Inconnu";
    }
  };

  const totalSavings = recommendations.reduce((sum, rec) => {
    const savings = parseFloat(rec.savings.replace(/[^0-9.]/g, ''));
    return sum + savings;
  }, 0);

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Sparkles className="h-4 w-4" />
          <span>Recommandations</span>
        </CardTitle>
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">Économies totales</p>
              <p className="text-xs text-green-700">{formatCurrency(totalSavings)}/mois</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 2).map((recommendation) => (
          <div key={recommendation.id} className="p-2.5 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getTypeIcon(recommendation.type)}
                <h4 className="font-medium text-xs">{recommendation.title}</h4>
              </div>
              <Badge variant="outline" className={`text-xs ${getImpactBadge(recommendation.impact)}`}>
                {recommendation.impact === "high" ? "H" : 
                 recommendation.impact === "medium" ? "M" : "L"}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {recommendation.description}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-green-600">{recommendation.savings}</span>
              {recommendation.status === "in-progress" && (
                <div className="flex items-center space-x-1">
                  <Progress value={recommendation.progress} className="h-1 w-12" />
                  <span className="text-xs text-muted-foreground">{recommendation.progress}%</span>
                </div>
              )}
              {recommendation.status === "pending" && (
                <Button size="sm" className="h-6 px-2 text-xs">
                  Appliquer
                </Button>
              )}
              {recommendation.status === "completed" && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                  ✓
                </Badge>
              )}
            </div>
          </div>
        ))}

        <div className="pt-1">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs">
            Voir toutes ({recommendations.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
