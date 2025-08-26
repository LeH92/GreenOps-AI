import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export function CostOverviewCard() {
  const totalCost = 1727.80;
  const budget = 2000;
  const usagePercentage = (totalCost / budget) * 100;
  const isOverBudget = usagePercentage > 100;
  const isNearLimit = usagePercentage > 80;

  const getStatusColor = () => {
    if (isOverBudget) return "text-red-600";
    if (isNearLimit) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (isNearLimit) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <TrendingUp className="h-4 w-4 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (isOverBudget) return "bg-red-100 text-red-800 border-red-200";
    if (isNearLimit) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Coût Total Mensuel</CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">${totalCost.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mb-3">
          Budget: ${budget.toLocaleString()}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Utilisation du budget</span>
            <span className={getStatusColor()}>
              {usagePercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercentage, 100)} 
            className="h-2"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Badge variant="outline" className={getStatusBadge()}>
            {isOverBudget ? "Dépassé" : isNearLimit ? "Attention" : "Normal"}
          </Badge>
          <div className="text-xs text-muted-foreground">
            Reste: ${(budget - totalCost).toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
