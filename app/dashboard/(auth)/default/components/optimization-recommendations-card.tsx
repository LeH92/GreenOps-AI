import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, DollarSign, Leaf, TrendingUp, Target, Sparkles } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span>Recommandations d'Optimisation</span>
        </CardTitle>
        <CardDescription>
          Économies potentielles et améliorations détectées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Économies totales</p>
              <p className="text-sm text-green-700">${totalSavings.toFixed(0)}/mois</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(recommendation.type)}
                  <h4 className="font-medium text-sm">{recommendation.title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getImpactBadge(recommendation.impact)}>
                    {recommendation.impact === "high" ? "Élevé" : 
                     recommendation.impact === "medium" ? "Moyen" : "Faible"}
                  </Badge>
                  <Badge variant="outline" className={getStatusBadge(recommendation.status)}>
                    {getStatusText(recommendation.status)}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {recommendation.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Économies</span>
                  <span className="font-semibold text-green-600">{recommendation.savings}</span>
                </div>
                
                {recommendation.status === "in-progress" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span>{recommendation.progress}%</span>
                    </div>
                    <Progress value={recommendation.progress} className="h-2" />
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  {recommendation.status === "pending" && (
                    <Button size="sm" className="flex-1">
                      <Zap className="mr-2 h-4 w-4" />
                      Appliquer
                    </Button>
                  )}
                  {recommendation.status === "in-progress" && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Suivre
                    </Button>
                  )}
                  {recommendation.status === "completed" && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Voir détails
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full">
            Voir toutes les recommandations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
