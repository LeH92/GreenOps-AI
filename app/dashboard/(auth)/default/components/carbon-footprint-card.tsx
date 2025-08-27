import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingDown, TreePine, Recycle } from "lucide-react";
import { formatPercentage } from "@/lib/format-utils";

export function CarbonFootprintCard() {
  const carbonFootprint = 15.6; // kg CO2
  const target = 20; // kg CO2
  const usagePercentage = (carbonFootprint / target) * 100;
  const isGood = usagePercentage < 80;
  const isWarning = usagePercentage >= 80 && usagePercentage < 100;
  const isCritical = usagePercentage >= 100;

  const getStatusColor = () => {
    if (isCritical) return "text-red-600";
    if (isWarning) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusIcon = () => {
    if (isCritical) return <TreePine className="h-4 w-4 text-red-600" />;
    if (isWarning) return <TreePine className="h-4 w-4 text-yellow-600" />;
    return <Leaf className="h-4 w-4 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (isCritical) return "bg-red-100 text-red-800 border-red-200";
    if (isWarning) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusText = () => {
    if (isCritical) return "Critique";
    if (isWarning) return "Attention";
    return "Excellent";
  };

  const getEfficiencyText = () => {
    if (isGood) return "22% plus efficace que la moyenne";
    if (isWarning) return "5% au-dessus de la moyenne";
    return "15% au-dessus de la moyenne";
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Empreinte Carbone</CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">{carbonFootprint} kg CO2</div>
        <p className="text-xs text-muted-foreground mb-3">
          Objectif: {target} kg CO2
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Utilisation de l'objectif</span>
            <span className={getStatusColor()}>
              {formatPercentage(usagePercentage)}
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercentage, 100)} 
            className="h-2"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Badge variant="outline" className={getStatusBadge()}>
            {getStatusText()}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {getEfficiencyText()}
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Recycle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Optimisations actives
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Économies de 2.3 kg CO2 grâce aux optimisations automatiques
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
