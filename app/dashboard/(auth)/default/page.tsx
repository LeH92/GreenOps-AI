import { generateMeta } from "@/lib/utils";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { 
  CostOverviewCard,
  CarbonFootprintCard,
  ApiRequestsCard,
  ProvidersStatusCard,
  AlertsCard,
  OptimizationRecommendationsCard,
  CostEvolutionChart,
  CarbonFootprintChart,
  LogosShowcase
} from "@/app/dashboard/(auth)/default/components";
import { Download, RefreshCw, Settings, TrendingUp } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "GreenOps AI Dashboard",
    description:
      "Dashboard FinOps/GreenOps moderne pour la gestion des coûts cloud et l'optimisation de l'empreinte carbone. Built with shadcn/ui.",
    canonical: "/default"
  });
}

export default function Page() {
  return (
    <div className="dashboard-container">
      {/* Header compact */}
      <div className="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">GreenOps AI Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Surveillance en temps réel de vos coûts cloud et empreinte carbone
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CustomDateRangePicker />
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Layout principal optimisé */}
      <div className="dashboard-layout">
        {/* Colonne principale gauche */}
        <div className="dashboard-main-column">
          {/* Métriques compactes */}
          <div className="metrics-grid">
            <CostOverviewCard />
            <CarbonFootprintCard />
            <ApiRequestsCard />
            <div className="metric-card group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-muted-foreground">Économies</div>
                <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">$234</div>
                  <div className="text-xs text-muted-foreground">grâce aux optimisations</div>
                </div>
                <div className="flex items-center space-x-1 mt-3">
                  <div className="text-xs font-medium text-green-600">+12%</div>
                  <div className="text-xs text-muted-foreground">vs mois dernier</div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques côte à côte */}
          <div className="charts-grid">
            <CostEvolutionChart />
            <CarbonFootprintChart />
          </div>

          {/* Statut des fournisseurs élargi */}
          <div className="providers-section">
            <ProvidersStatusCard />
          </div>
        </div>

        {/* Colonne sidebar droite */}
        <div className="dashboard-sidebar">
          {/* Recommandations optimisées */}
          <div className="recommendations-section">
            <OptimizationRecommendationsCard />
          </div>

          {/* Alertes compactes */}
          <div className="alerts-section">
            <AlertsCard />
          </div>

          {/* Actions rapides compactes */}
          <div className="actions-section">
            <div className="modern-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Actions Rapides</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-2 hover:bg-primary/5 transition-all"
                >
                  <div className="p-1.5 rounded bg-primary/10 text-primary">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">Configurer</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-2 hover:bg-blue-500/5 transition-all"
                >
                  <div className="p-1.5 rounded bg-blue-100 text-blue-600">
                    <Download className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">Rapport</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-2 hover:bg-green-500/5 transition-all"
                >
                  <div className="p-1.5 rounded bg-green-100 text-green-600">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">Sync</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-2 hover:bg-purple-500/5 transition-all"
                >
                  <div className="p-1.5 rounded bg-purple-100 text-purple-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">Analyser</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
