"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleCloudData } from "@/hooks/useGoogleCloudData";
import { 
  Cloud, 
  DollarSign, 
  FolderOpen, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from "lucide-react";

export default function GCPTestPage() {
  const {
    billingAccounts,
    billingAccountsLoading,
    billingAccountsError,
    fetchBillingAccounts,
    projects,
    projectsLoading,
    projectsError,
    fetchProjects,
    costs,
    costsLoading,
    costsError,
    fetchCosts,
  } = useGoogleCloudData();

  const [costPath, setCostPath] = useState("");

  const handleFetchCosts = () => {
    if (costPath) {
      fetchCosts(costPath);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Google Cloud APIs</h1>
        <p className="text-muted-foreground">
          Test des APIs Google Cloud avec authentification OAuth
        </p>
      </div>

      {/* Billing Accounts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Comptes de Facturation
              </CardTitle>
              <CardDescription>
                Liste des comptes de facturation Google Cloud
              </CardDescription>
            </div>
            <Button 
              onClick={fetchBillingAccounts} 
              disabled={billingAccountsLoading}
              variant="outline"
              size="sm"
            >
              {billingAccountsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {billingAccountsError && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{billingAccountsError}</AlertDescription>
            </Alert>
          )}

          {billingAccountsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement des comptes de facturation...</span>
            </div>
          ) : billingAccounts.length > 0 ? (
            <div className="space-y-2">
              {billingAccounts.map((account) => (
                <div key={account.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{account.displayName}</div>
                    <div className="text-sm text-muted-foreground">{account.name}</div>
                  </div>
                  <Badge variant={account.open ? "default" : "secondary"}>
                    {account.open ? "Ouvert" : "Fermé"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun compte de facturation trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projets
              </CardTitle>
              <CardDescription>
                Liste des projets Google Cloud
              </CardDescription>
            </div>
            <Button 
              onClick={fetchProjects} 
              disabled={projectsLoading}
              variant="outline"
              size="sm"
            >
              {projectsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projectsError && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{projectsError}</AlertDescription>
            </Alert>
          )}

          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement des projets...</span>
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.projectId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">{project.projectId}</div>
                  </div>
                  <Badge variant={project.lifecycleState === "ACTIVE" ? "default" : "secondary"}>
                    {project.lifecycleState}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun projet trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Costs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Coûts BigQuery
          </CardTitle>
          <CardDescription>
            Récupération des coûts depuis BigQuery (format: projectId.dataset)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="costPath">Chemin BigQuery</Label>
                <Input
                  id="costPath"
                  placeholder="ex: my-project.billing_dataset"
                  value={costPath}
                  onChange={(e) => setCostPath(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleFetchCosts} 
                  disabled={costsLoading || !costPath}
                >
                  {costsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DollarSign className="h-4 w-4" />
                  )}
                  Récupérer
                </Button>
              </div>
            </div>

            {costsError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{costsError}</AlertDescription>
              </Alert>
            )}

            {costsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Récupération des coûts...</span>
              </div>
            ) : costs.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Coûts des 30 derniers jours par service
                </div>
                {costs.map((cost, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{cost.service}</div>
                      <div className="text-sm text-muted-foreground">{cost.period}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {cost.total_cost.toFixed(2)} {cost.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : costPath && !costsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun coût trouvé pour ce chemin
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Statut des APIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {billingAccountsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : billingAccountsError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span>Billing Accounts: {billingAccounts.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {projectsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : projectsError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span>Projects: {projects.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {costsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : costsError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : costs.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4" />
              )}
              <span>Costs: {costs.length} services</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
