import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Info, CheckCircle, Clock, DollarSign, Leaf } from "lucide-react";

export function AlertsCard() {
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Budget AWS approche de la limite",
      description: "AWS a utilisé 85% de son budget mensuel",
      time: "Il y a 2h",
      action: "Voir détails",
      icon: DollarSign
    },
    {
      id: 2,
      type: "info",
      title: "Nouvelle optimisation disponible",
      description: "Économies potentielles de $89/mois détectées",
      time: "Il y a 4h",
      action: "Appliquer",
      icon: Leaf
    },
    {
      id: 3,
      type: "success",
      title: "Synchronisation Azure réussie",
      description: "Azure a été connecté avec succès",
      time: "Il y a 6h",
      action: "Configurer",
      icon: CheckCircle
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertBadge = (type: string) => {
    const variants = {
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
      success: "bg-green-100 text-green-800 border-green-200",
      info: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return variants[type as keyof typeof variants] || variants.info;
  };

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case "warning":
        return "Attention";
      case "error":
        return "Erreur";
      case "success":
        return "Succès";
      default:
        return "Info";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Alertes Récentes</span>
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            3
          </Badge>
        </CardTitle>
        <CardDescription>
          Notifications importantes de vos services
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 mt-1">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium">{alert.title}</h4>
                <Badge variant="outline" className={`text-xs ${getAlertBadge(alert.type)}`}>
                  {getAlertTypeText(alert.type)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {alert.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{alert.time}</span>
                </div>
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full">
            Voir toutes les alertes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
