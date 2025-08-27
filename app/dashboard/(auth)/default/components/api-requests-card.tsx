import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { formatInteger, formatPercentage } from "@/lib/format-utils";

export function ApiRequestsCard() {
  const totalRequests = 8560;
  const successfulRequests = 8474;
  const failedRequests = 86;
  const successRate = (successfulRequests / totalRequests) * 100;
  const avgLatency = 1.2; // seconds

  const getSuccessRateColor = () => {
    if (successRate >= 99) return "text-green-600";
    if (successRate >= 95) return "text-yellow-600";
    return "text-red-600";
  };

  const getLatencyColor = () => {
    if (avgLatency < 1) return "text-green-600";
    if (avgLatency < 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getLatencyIcon = () => {
    if (avgLatency < 1) return <Zap className="h-4 w-4 text-green-600" />;
    if (avgLatency < 2) return <Activity className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Requêtes API</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">{formatInteger(totalRequests)}</div>
        <p className="text-xs text-muted-foreground mb-3">
          Ce mois
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Taux de succès</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-semibold ${getSuccessRateColor()}`}>
                {formatPercentage(successRate)}
              </span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Latence moyenne</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-semibold ${getLatencyColor()}`}>
                {avgLatency}s
              </span>
              {getLatencyIcon()}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Échecs</span>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              {failedRequests}
            </Badge>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Performance optimale
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            +15% de requêtes vs mois dernier
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
