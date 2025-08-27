import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, Brain, CheckCircle, XCircle, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/ui/company-logo";

export function ProvidersStatusCard() {
  const cloudProviders = [
    { name: "AWS", status: "connected", cost: "$993.00", company: "aws" as const },
    { name: "Google Cloud", status: "connected", cost: "$734.80", company: "google-cloud" as const },
    { name: "Azure", status: "disconnected", cost: "$0.00", company: "azure" as const }
  ];

  const aiProviders = [
    { name: "OpenAI", status: "connected", cost: "$635.10", company: "openai" as const },
    { name: "Anthropic", status: "connected", cost: "$381.80", company: "anthropic" as const },
    { name: "Google AI", status: "connected", cost: "$202.00", company: "google-ai" as const }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "bg-green-100 text-green-800 border-green-200",
      disconnected: "bg-red-100 text-red-800 border-red-200"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const connectedCloudProviders = cloudProviders.filter(p => p.status === 'connected').length;
  const connectedAIProviders = aiProviders.filter(p => p.status === 'connected').length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="h-5 w-5" />
          <span>Statut des Fournisseurs</span>
        </CardTitle>
        <CardDescription>
          Vue d'ensemble de vos connexions cloud et IA
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-8">
        {/* Cloud Providers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-base">Cloud Providers</h4>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {connectedCloudProviders}/3 connectés
            </Badge>
          </div>
          <div className="space-y-3">
                            {cloudProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <CompanyLogo company={provider.company} size={28} />
                      <div>
                        <p className="font-medium text-base">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">{provider.cost}/mois</p>
                      </div>
                    </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(provider.status)}
                  <Badge variant="outline" className={getStatusBadge(provider.status)}>
                    {provider.status === "connected" ? "Connecté" : "Déconnecté"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Providers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-base">Fournisseurs IA</h4>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {connectedAIProviders}/3 connectés
            </Badge>
          </div>
          <div className="space-y-3">
            {aiProviders.map((provider) => (
              <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <CompanyLogo company={provider.company} size={28} />
                  <div>
                    <p className="font-medium text-base">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">{provider.cost}/mois</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(provider.status)}
                  <Badge variant="outline" className={getStatusBadge(provider.status)}>
                    Connecté
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Link href="/dashboard/cloud-providers" className="flex-1">
            <Button variant="outline" size="default" className="w-full">
              <Cloud className="mr-2 h-4 w-4" />
              Gérer Cloud
            </Button>
          </Link>
          <Link href="/dashboard/ai-providers" className="flex-1">
            <Button variant="outline" size="default" className="w-full">
              <Brain className="mr-2 h-4 w-4" />
              Gérer IA
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
