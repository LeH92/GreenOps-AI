"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleCloudData } from "@/hooks/useGoogleCloudData";
import { CompanyLogo } from "@/components/ui/company-logo";
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Cloud,
  DollarSign,
  FolderOpen
} from "lucide-react";

export function GoogleCloudStatus() {
  const {
    billingAccounts,
    billingAccountsLoading,
    billingAccountsError,
    fetchBillingAccounts,
    projects,
    projectsLoading,
    projectsError,
    fetchProjects,
  } = useGoogleCloudData();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté à Google Cloud
    if (billingAccounts.length > 0 || projects.length > 0) {
      setIsConnected(true);
    }
  }, [billingAccounts, projects]);

  const handleRefresh = () => {
    fetchBillingAccounts();
    fetchProjects();
  };

  if (billingAccountsLoading || projectsLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CompanyLogo company="google-cloud" size={24} />
            <CardTitle>Google Cloud Platform</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Vérification de la connexion...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (billingAccountsError || projectsError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CompanyLogo company="google-cloud" size={24} />
            <CardTitle>Google Cloud Platform</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur de connexion à Google Cloud. Veuillez vous reconnecter.
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CompanyLogo company="google-cloud" size={24} />
            <CardTitle>Google Cloud Platform</CardTitle>
          </div>
          <CardDescription>
            Connectez-vous à votre compte Google Cloud pour surveiller vos coûts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Aucune connexion Google Cloud détectée
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Vérifier la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CompanyLogo company="google-cloud" size={24} />
            <CardTitle>Google Cloud Platform</CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Connecté
            </Badge>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
        <CardDescription>
          Votre compte Google Cloud est connecté et accessible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Comptes de facturation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">Comptes de facturation</span>
              <Badge variant="secondary">{billingAccounts.length}</Badge>
            </div>
            {billingAccounts.length > 0 && (
              <div className="space-y-1">
                {billingAccounts.slice(0, 2).map((account) => (
                  <div key={account.name} className="text-sm text-muted-foreground">
                    {account.displayName}
                  </div>
                ))}
                {billingAccounts.length > 2 && (
                  <div className="text-sm text-muted-foreground">
                    +{billingAccounts.length - 2} autres
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Projets */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Projets</span>
              <Badge variant="secondary">{projects.length}</Badge>
            </div>
            {projects.length > 0 && (
              <div className="space-y-1">
                {projects.slice(0, 2).map((project) => (
                  <div key={project.projectId} className="text-sm text-muted-foreground">
                    {project.name}
                  </div>
                ))}
                {projects.length > 2 && (
                  <div className="text-sm text-muted-foreground">
                    +{projects.length - 2} autres
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dernière synchronisation</span>
            <span className="font-medium">À l'instant</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
