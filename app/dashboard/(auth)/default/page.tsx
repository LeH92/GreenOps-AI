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
import { Download, RefreshCw, Settings } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header avec métriques principales */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GreenOps AI Dashboard</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos coûts cloud, empreinte carbone et optimisations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CustomDateRangePicker />
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Exporter</span>
          </Button>
        </div>
      </div>

      {/* Métriques principales - 4 cartes en haut */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CostOverviewCard />
        <CarbonFootprintCard />
        <ApiRequestsCard />
        <div className="flex items-center justify-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">$234</div>
            <p className="text-sm text-muted-foreground">Économies ce mois</p>
            <p className="text-xs text-green-600">+12% vs mois dernier</p>
          </div>
        </div>
      </div>

      {/* Section principale - 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche - 2 cartes */}
        <div className="space-y-6">
          <ProvidersStatusCard />
          <AlertsCard />
        </div>

        {/* Colonne centrale - 1 grande carte */}
        <div className="lg:col-span-2">
          <OptimizationRecommendationsCard />
        </div>
      </div>

      {/* Section inférieure - Graphiques et détails */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CostEvolutionChart />
        <CarbonFootprintChart />
      </div>

      {/* Section actions rapides */}
      <div className="p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Settings className="h-6 w-6" />
            <span className="text-sm">Configurer un fournisseur</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Download className="h-6 w-6" />
            <span className="text-sm">Télécharger un rapport</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <RefreshCw className="h-6 w-6" />
            <span className="text-sm">Synchroniser les données</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Settings className="h-6 w-6" />
            <span className="text-sm">Paramètres avancés</span>
          </Button>
        </div>
      </div>

      {/* Showcase des logos */}
      <LogosShowcase />
    </div>
  );
}
