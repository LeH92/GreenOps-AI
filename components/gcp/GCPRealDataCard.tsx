"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Cloud, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Leaf, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { formatCurrency } from "@/lib/format-utils";
import { GCPConnectButton } from "./GCPConnectButton";
import { GCPDisconnectButton } from "./GCPDisconnectButton";
import { useGCPStatus } from "@/hooks/useGCPStatus";

interface GCPRealDataCardProps {
  onOpenWizard: () => void;
}

export function GCPRealDataCard({ onOpenWizard }: GCPRealDataCardProps) {
  const gcpStatus = useGCPStatus();

  // Déterminer la couleur et l'icône du statut
  const getStatusDisplay = () => {
    if (gcpStatus.isLoading) {
      return {
        icon: <Clock className="h-4 w-4 text-blue-500" />,
        text: "Chargement...",
        color: "bg-blue-50 text-blue-700 border-blue-200"
      };
    }

    if (!gcpStatus.isConnected) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
        text: "Non connecté",
        color: "bg-gray-50 text-gray-700 border-gray-200"
      };
    }

    if (gcpStatus.totalMonthlyCost > 0) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: "Données réelles",
        color: "bg-green-50 text-green-700 border-green-200"
      };
    }

    return {
      icon: <Activity className="h-4 w-4 text-orange-500" />,
      text: "Connecté",
      color: "bg-orange-50 text-orange-700 border-orange-200"
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="provider-card-uniform">
      <CardHeader className="provider-card-content">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Cloud className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Cloud Platform</CardTitle>
              <CardDescription>
                Plateforme cloud de Google
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={statusDisplay.color}>
            {statusDisplay.icon}
            <span className="ml-1">{statusDisplay.text}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="provider-card-content space-y-4">
        {gcpStatus.isConnected ? (
          <>
            {/* Métriques principales avec vraies données */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Coût mensuel
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {gcpStatus.totalMonthlyCost > 0 ? 
                    formatCurrency(gcpStatus.totalMonthlyCost, gcpStatus.currency) : 
                    'Données en attente'
                  }
                </div>
                {gcpStatus.totalMonthlyCost > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Données réelles BigQuery
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Leaf className="h-4 w-4 mr-1" />
                  Empreinte carbone
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {gcpStatus.carbonFootprint > 0 ? 
                    `${gcpStatus.carbonFootprint.toFixed(1)} kg CO₂e` : 
                    'À configurer'
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  Export carbone requis
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Activity className="h-4 w-4 mr-1" />
                  Projets actifs
                </div>
                <div className="text-sm font-medium">
                  {gcpStatus.activeProjectsCount}/{gcpStatus.projectsCount}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Score optimisation
                </div>
                <div className="text-sm font-medium">
                  {gcpStatus.optimizationScore > 0 ? `${gcpStatus.optimizationScore}%` : 'En cours'}
                </div>
              </div>
            </div>

            {/* Économies potentielles */}
            {gcpStatus.totalMonthlyCost > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-800">Économies potentielles</p>
                    <p className="text-xs text-green-700">
                      {formatCurrency(gcpStatus.totalMonthlyCost * 0.2, gcpStatus.currency)}/mois estimé
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}

            {/* Statut de synchronisation */}
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Dernière sync: {gcpStatus.lastSync}</span>
              {gcpStatus.totalMonthlyCost > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Données réelles
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Cloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Connectez votre compte Google Cloud pour accéder aux analyses FinOps/GreenOps
            </p>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <div className="provider-card-actions">
        {gcpStatus.isConnected ? (
          <div className="flex space-x-2">
            <Button 
              onClick={onOpenWizard}
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={gcpStatus.isLoading}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurer
            </Button>
            <GCPDisconnectButton />
          </div>
        ) : (
          <GCPConnectButton />
        )}
      </div>
    </Card>
  );
}
