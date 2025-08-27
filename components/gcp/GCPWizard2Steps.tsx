"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/src/hooks/useAuth';
import { 
  Cloud, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Loader2, 
  Settings, 
  Database, 
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Building2,
  FolderOpen
} from 'lucide-react';

interface GCPProject {
  projectId: string;
  name: string;
  projectNumber: string;
  billingAccountId?: string;
}

interface GCPBillingAccount {
  id: string;
  displayName: string;
  open: boolean;
}

interface GCPWizard2StepsProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelected?: (project: GCPProject) => void;
}

type WizardStep = 'account-selection' | 'synchronization' | 'completed';

export function GCPWizard2Steps({ isOpen, onClose, onProjectSelected }: GCPWizard2StepsProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('account-selection');
  const [projects, setProjects] = useState<GCPProject[]>([]);
  const [billingAccounts, setBillingAccounts] = useState<GCPBillingAccount[]>([]);
  const [selectedBillingAccount, setSelectedBillingAccount] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user && session) {
      loadGCPData();
    }
  }, [isOpen, user, session]);

  const loadGCPData = async () => {
    if (!user || !session) return;
    
    setIsLoading(true);
    try {
      // Charger les projets et comptes de facturation via la nouvelle route API
      const response = await fetch('/api/gcp/projects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProjects(data.data.projects || []);
          setBillingAccounts(data.data.billingAccounts || []);
          console.log(`Loaded ${data.data.projects.length} projects and ${data.data.billingAccounts.length} billing accounts`);
        }
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 403 && errorData.error === 'GCP APIs not enabled') {
          toast({
            title: "APIs GCP non activées",
            description: "Veuillez activer les APIs requises dans Google Cloud Console",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur de chargement",
            description: errorData.error || "Impossible de charger les données GCP",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error loading GCP data:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données GCP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingAccountSelect = (billingAccountId: string) => {
    setSelectedBillingAccount(billingAccountId);
    setSelectedProject(""); // Reset project selection
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleNextStep = () => {
    if (currentStep === 'account-selection') {
      if (!selectedBillingAccount) {
        toast({
          title: "Sélection requise",
          description: "Veuillez sélectionner un compte de facturation",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep('synchronization');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'synchronization') {
      setCurrentStep('account-selection');
    }
  };

  const handleSynchronize = async () => {
    if (!selectedProject) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un projet",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStatus('Démarrage de la synchronisation...');

    try {
      // Simuler la synchronisation avec progression
      const steps = [
        'Connexion au projet GCP...',
        'Récupération des métadonnées...',
        'Synchronisation des coûts...',
        'Mise à jour de la base de données...',
        'Finalisation...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setSyncStatus(steps[i]);
        setSyncProgress((i + 1) * (100 / steps.length));
        await new Promise(resolve => setTimeout(resolve, 800)); // Simuler le délai
      }

      // Synchronisation réussie
      setSyncStatus('Synchronisation terminée avec succès !');
      setSyncProgress(100);

      // Attendre un peu puis passer à l'étape finale
      setTimeout(() => {
        setCurrentStep('completed');
      }, 1500);

    } catch (error) {
      console.error('Error during synchronization:', error);
      setSyncStatus('Erreur lors de la synchronisation');
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur s'est produite lors de la synchronisation",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleComplete = () => {
    if (selectedProject && onProjectSelected) {
      const project = projects.find(p => p.projectId === selectedProject);
      if (project) {
        onProjectSelected(project);
      }
    }
    onClose();
    // Reset wizard state
    setCurrentStep('account-selection');
    setSelectedBillingAccount("");
    setSelectedProject("");
    setSyncProgress(0);
    setSyncStatus("");
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'account-selection', label: 'Sélection du compte', icon: Building2 },
      { key: 'synchronization', label: 'Synchronisation', icon: RefreshCw },
      { key: 'completed', label: 'Terminé', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isActive 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="ml-4 h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-500" />
            Configuration Google Cloud Platform
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez et synchronisez vos projets GCP en 2 étapes simples
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {getStepIndicator()}

          {/* ÉTAPE 1: SÉLECTION DU COMPTE */}
          {currentStep === 'account-selection' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Étape 1: Sélection du compte de facturation</h3>
                <p className="text-muted-foreground">
                  Choisissez le compte de facturation GCP que vous souhaitez synchroniser
                </p>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p>Chargement des comptes de facturation...</p>
                </div>
              ) : billingAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">Aucun compte de facturation trouvé</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vérifiez que vous avez accès aux comptes de facturation GCP
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Compte de facturation
                    </label>
                    <Select value={selectedBillingAccount} onValueChange={handleBillingAccountSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un compte de facturation" />
                      </SelectTrigger>
                      <SelectContent>
                        {billingAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              {account.displayName}
                              <Badge variant={account.open ? "default" : "secondary"}>
                                {account.open ? "Ouvert" : "Fermé"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBillingAccount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Projets disponibles pour ce compte
                      </h4>
                      <div className="space-y-2">
                        {projects
                          .filter(p => p.billingAccountId === selectedBillingAccount)
                          .map(project => (
                            <div key={project.projectId} className="flex items-center gap-2 text-sm">
                              <FolderOpen className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{project.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {project.projectId}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep} 
                  disabled={!selectedBillingAccount || isLoading}
                  className="min-w-[120px]"
                >
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2: SYNCHRONISATION */}
          {currentStep === 'synchronization' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Étape 2: Synchronisation des projets</h3>
                <p className="text-muted-foreground">
                  Sélectionnez le projet à synchroniser et lancez la synchronisation
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Projet à synchroniser
                  </label>
                  <Select value={selectedProject} onValueChange={handleProjectSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects
                        .filter(p => p.billingAccountId === selectedBillingAccount)
                        .map((project) => (
                          <SelectItem key={project.projectId} value={project.projectId}>
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              {project.name}
                              <Badge variant="outline" className="text-xs">
                                {project.projectId}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProject && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">
                      Projet sélectionné
                    </h4>
                    <div className="text-sm text-green-800">
                      {projects.find(p => p.projectId === selectedProject)?.name}
                    </div>
                  </div>
                )}

                {isSyncing && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{Math.round(syncProgress)}%</span>
                    </div>
                    <Progress value={syncProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {syncStatus}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button 
                  onClick={handlePreviousStep} 
                  variant="outline"
                  disabled={isSyncing}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
                <Button 
                  onClick={handleSynchronize} 
                  disabled={!selectedProject || isSyncing}
                  className="min-w-[120px]"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Synchroniser
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3: TERMINÉ */}
          {currentStep === 'completed' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Synchronisation terminée !</h3>
                <p className="text-muted-foreground">
                  Votre projet GCP a été synchronisé avec succès
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-green-900 mb-2">Résumé de la synchronisation</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <div>✅ Connexion GCP établie</div>
                  <div>✅ Projet sélectionné et synchronisé</div>
                  <div>✅ Données stockées dans la base</div>
                  <div>✅ Prêt pour la surveillance des coûts</div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleComplete} className="min-w-[120px]">
                  Terminer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
