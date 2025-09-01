"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, DollarSign, Leaf, TrendingUp, Zap, Clock, Loader2, AlertTriangle } from "lucide-react";
import { useGCPData } from "@/hooks/useGCPData";
import { formatCurrency } from "@/lib/format-utils";

export function GCPRecommendationsCard() {
  const { recommendations, totalSavings, isLoading, error } = useGCPData();

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Recommandations GCP</span>
          </CardTitle>
          <CardDescription>Optimisations basées sur vos données réelles</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2">Chargement...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Recommandations GCP</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-red-600">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Erreur de chargement</span>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (category: string) => {
    switch (category) {
      case "cost":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "sustainability":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "performance":
        return <Zap className="h-4 w-4 text-blue-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeBadge = (category: string) => {
    switch (category) {
      case "cost":
        return "bg-green-100 text-green-800 border-green-200";
      case "sustainability":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "performance":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Recommandations GCP</span>
            </CardTitle>
            <CardDescription>
              {recommendations.length > 0 
                ? `${recommendations.length} recommandation(s) basée(s) sur vos données réelles`
                : 'Aucune recommandation disponible'
              }
            </CardDescription>
          </div>
          {totalSavings > 0 && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {formatCurrency(totalSavings)}/mois
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Synchronisez vos projets GCP pour obtenir des recommandations personnalisées
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(rec.category)}
                      <Badge variant="outline" className={getTypeBadge(rec.category)}>
                        {rec.category}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={getPriorityBadge(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{rec.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-green-600 font-medium">
                        💰 {formatCurrency(rec.potential_monthly_savings)}/mois
                      </span>
                      {rec.carbon_reduction_kg > 0 && (
                        <span className="text-emerald-600 font-medium">
                          🌱 -{rec.carbon_reduction_kg} kg CO2
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Voir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {recommendations.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  Voir toutes les recommandations ({recommendations.length})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

