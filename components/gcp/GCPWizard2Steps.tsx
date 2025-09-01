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
  FolderOpen,
  X
} from 'lucide-react';

interface GCPProject {
  projectId: string;
  name: string;
  projectNumber: string;
  billingAccountName?: string; // Format: billingAccounts/123456-789012-345678
}

interface GCPBillingAccount {
  name: string; // Format: billingAccounts/123456-789012-345678
  displayName: string;
  open: boolean;
}

// Helper function to extract billing account ID from full name
const getBillingAccountId = (name: string): string => {
  return name.split('/').pop() || name;
};

// Helper function to get unique display name for billing accounts
const getUniqueBillingAccountName = (account: GCPBillingAccount, allAccounts: GCPBillingAccount[]): string => {
  const duplicates = allAccounts.filter(acc => acc.displayName === account.displayName);
  if (duplicates.length > 1) {
    const accountId = getBillingAccountId(account.name);
    return `${account.displayName} (${accountId.slice(-6)})`;
  }
  return account.displayName;
};

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
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user && session) {
      // Charger directement depuis l'API (pas de snapshot)
      console.log('🔎 Wizard opened: loading data directly from API', { user: user.email, hasSession: !!session });
      loadGCPDataDirect();
    } else if (isOpen) {
      console.log('🔎 Wizard opened but missing auth:', { hasUser: !!user, hasSession: !!session });
    }
  }, [isOpen, user, session]); // Include user and session in dependencies

  // Gérer la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleForceClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, currentStep]);







  // Charge directement depuis l'API GCP (pas de snapshot)
  const loadGCPDataDirect = async () => {
    if (!user || !session) {
      console.log('❌ No user or session available for GCP data loading');
      return;
    }
    
    console.log('🔄 Loading GCP data DIRECTLY from API for user:', user.email);
    setIsLoading(true);
    
    try {
      // Appel direct à l'API live qui récupère les données fraîches depuis Google Cloud
      console.log('📡 Calling /api/gcp/fetch-live for fresh data...');
      
      // Timeout de 15 secondes pour éviter les blocages
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/gcp/fetch-live', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 Direct API response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Direct API Response:', data);
        
        if (data.success && data.data) {
          const projects = data.data.projects || [];
          const rawBillingAccounts = data.data.billingAccounts || [];
          
          // Transformer les données pour correspondre au format attendu par le wizard
          const transformedBillingAccounts = rawBillingAccounts.map((account: any) => ({
            name: account.name || '',
            displayName: account.displayName || '',
            open: account.open || false
          }));
          
          setProjects(projects);
          setBillingAccounts(transformedBillingAccounts);
          console.log(`✅ Direct load: ${projects.length} projects and ${rawBillingAccounts.length} billing accounts`);
          console.log('✅ Transformed billing accounts:', transformedBillingAccounts);

          if (transformedBillingAccounts.length === 0) {
            toast({
              title: "Aucun compte de facturation",
              description: "Aucun compte de facturation GCP trouvé. Vérifiez vos permissions.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Données chargées",
              description: `${transformedBillingAccounts.length} comptes de facturation et ${projects.length} projets trouvés`,
            });
          }
        } else {
          console.error('❌ Invalid API response structure:', data);
          toast({
            title: "Erreur de données",
            description: "Structure de réponse invalide de l'API",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Direct API Error:', response.status, errorData);
        
        if (response.status === 403 && errorData.error === 'GCP APIs not enabled') {
          toast({
            title: "APIs GCP non activées",
            description: "Veuillez activer les APIs requises dans Google Cloud Console",
            variant: "destructive",
          });
        } else if (response.status === 401) {
          toast({
            title: "Authentification requise",
            description: "Veuillez vous reconnecter à Google Cloud",
            variant: "destructive",
          });
        } else if (response.status === 404) {
          toast({
            title: "Connexion GCP introuvable",
            description: "Aucune connexion GCP active trouvée. Reconnectez-vous.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur de chargement",
            description: errorData.error || `Erreur ${response.status}: ${response.statusText}`,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Direct API Error:', error);
      
      if (error.name === 'AbortError') {
        toast({
          title: "Timeout de chargement",
          description: "Le chargement a pris trop de temps (15s). Vérifiez votre connexion.",
          variant: "destructive",
        });
      } else {
      toast({
          title: "Erreur réseau",
          description: `Impossible de contacter l'API: ${error.message}`,
        variant: "destructive",
      });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingAccountSelect = (billingAccountId: string) => {
    setSelectedBillingAccount(billingAccountId);
    setSelectedProjects([]); // Reset project selection
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAllProjects = () => {
    const availableProjects = projects
      .filter(p => p.billingAccountName === selectedBillingAccount)
      .map(p => p.projectId);
    
    setSelectedProjects(prev => 
      prev.length === availableProjects.length 
        ? [] 
        : availableProjects
    );
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
    if (selectedProjects.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un projet",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStatus('Préparation de la synchronisation...');

    try {
      // 1) Pas besoin de charger les métadonnées, on a déjà les données

      // 2) Déclencher la synchronisation complète FinOps/GreenOps avec BigQuery
      setSyncStatus('Initialisation de la synchronisation FinOps/GreenOps complète...');
      const response = await fetch('/api/gcp/sync-finops-complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedProjects,
          billingAccountId: selectedBillingAccount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Synchronization failed');
      }

      const result = await response.json();

      const steps = [
        'Authentification et validation des tokens...',
        `Récupération des projets sélectionnés (${selectedProjects.length})...`,
        'Détection des exports BigQuery disponibles...',
        'Collecte des données de facturation réelles...',
        'Analyse des coûts par projet et service...',
        'Récupération de l\'empreinte carbone...',
        'Collecte des budgets et seuils d\'alerte...',
        'Génération des recommandations FinOps...',
        'Calcul des KPIs et métriques...',
        'Sauvegarde optimisée en Supabase...',
        'Finalisation et audit...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setSyncStatus(steps[i]);
        setSyncProgress(Math.round(((i + 1) / steps.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setSyncStatus(`Synchronisation terminée ! ${result.results?.projectsProcessed || selectedProjects.length} projets traités`);
      setSyncProgress(100);

      toast({
        title: "Synchronisation réussie",
        description: `${result.results?.projectsProcessed || selectedProjects.length} projet(s) synchronisé(s)`
      });

      setTimeout(() => setCurrentStep('completed'), 1200);
    } catch (error: any) {
      console.error('Error during synchronization:', error);
      setSyncStatus('Erreur lors de la synchronisation');
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Une erreur s'est produite lors de la synchronisation",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleComplete = () => {
    if (selectedProjects.length > 0 && onProjectSelected) {
      // Pour la compatibilité, on passe le premier projet sélectionné
      const project = projects.find(p => p.projectId === selectedProjects[0]);
      if (project) {
        onProjectSelected(project);
      }
    }
    onClose();
    // Reset wizard state
    setCurrentStep('account-selection');
    setSelectedBillingAccount("");
    setSelectedProjects([]);
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Si on clique sur le backdrop (pas sur la card)
    if (e.target === e.currentTarget) {
      handleForceClose();
    }
  };

  const handleForceClose = async () => {
    // Si en cours de synchronisation, empêcher la fermeture
    if (isSyncing) {
      toast({
        title: "Synchronisation en cours",
        description: "Veuillez attendre la fin de la synchronisation avant de fermer.",
        variant: "destructive",
      });
      return;
    }

    // Si des projets sont sélectionnés ou qu'on est à l'étape de sync, demander confirmation
    if ((selectedProjects.length > 0 || currentStep === 'synchronization') && currentStep !== 'completed') {
      const confirmed = window.confirm(
        "Êtes-vous sûr de vouloir fermer le wizard ?\n\nCela déconnectera votre compte GCP et vous devrez recommencer le processus de connexion."
      );
      
      if (!confirmed) {
        return;
      }
    }

    // Si le wizard n'est pas terminé, déconnecter GCP
    if (currentStep !== 'completed') {
      console.log('⚠️ Wizard fermé avant completion - déconnexion GCP');
      
      try {
        // Appeler l'API de déconnexion
        const response = await fetch('/api/gcp/disconnect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast({
            title: "Connexion GCP fermée",
            description: "Le wizard a été fermé. Reconnectez-vous pour continuer.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error disconnecting GCP:', error);
        toast({
          title: "Erreur de déconnexion",
          description: "Impossible de déconnecter proprement. Veuillez vérifier votre connexion.",
          variant: "destructive",
        });
      }
    }

    // Fermer le wizard et reset l'état
    onClose();
    setCurrentStep('account-selection');
    setSelectedBillingAccount("");
    setSelectedProjects([]);
    setSyncProgress(0);
    setSyncStatus("");
    setIsSyncing(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-500" />
            Configuration Google Cloud Platform
          </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
            Connectez et synchronisez vos projets GCP en 2 étapes simples
          </p>
              <p className="text-xs text-muted-foreground mt-1 opacity-70">
                Appuyez sur Échap ou cliquez en dehors pour fermer
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleForceClose}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              disabled={isSyncing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                  <p className="font-medium">Chargement des comptes de facturation...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Récupération des données depuis Google Cloud Platform
                  </p>

                </div>
              ) : billingAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Aucun compte de facturation trouvé</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vérifiez que vous avez accès aux comptes de facturation GCP et que les APIs requises sont activées dans Google Cloud Console.
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
                          <SelectItem key={account.name} value={account.name}>
                            <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{getUniqueBillingAccountName(account, billingAccounts)}</span>
                                  <span className="text-xs text-muted-foreground">ID: {getBillingAccountId(account.name)}</span>
                                </div>
                              </div>
                              <Badge 
                                variant={account.open ? "default" : "destructive"} 
                                className={`ml-2 ${account.open ? "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500" : "bg-red-500 text-white hover:bg-red-600 border-red-500"}`}
                              >
                                {account.open ? "Ouvert" : "Fermé"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBillingAccount && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          Projets disponibles ({projects.filter(p => p.billingAccountName === selectedBillingAccount).length})
                      </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllProjects}
                          className="text-xs"
                        >
                          {selectedProjects.length === projects.filter(p => p.billingAccountName === selectedBillingAccount).length 
                            ? "Désélectionner tout" 
                            : "Sélectionner tout"
                          }
                        </Button>
                      </div>
                      
                      {selectedProjects.length > 0 && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-sm text-emerald-800 font-medium">
                            {selectedProjects.length} projet{selectedProjects.length > 1 ? 's' : ''} sélectionné{selectedProjects.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}

                      <div className="grid gap-3">
                        {projects
                          .filter(p => p.billingAccountName === selectedBillingAccount)
                          .map(project => {
                            const isSelected = selectedProjects.includes(project.projectId);
                            return (
                              <div 
                                key={project.projectId} 
                                className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  isSelected 
                                    ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100' 
                                    : 'border-border bg-card hover:bg-accent/50'
                                }`}
                                onClick={() => handleProjectToggle(project.projectId)}
                              >
                                <div className="flex items-start justify-between p-4">
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${
                                      isSelected 
                                        ? 'bg-emerald-100 text-emerald-600' 
                                        : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                                    }`}>
                                      {isSelected ? (
                                        <CheckCircle className="h-5 w-5" />
                                      ) : (
                                        <FolderOpen className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <h5 className={`font-semibold ${
                                        isSelected 
                                          ? 'text-emerald-900' 
                                          : 'text-card-foreground group-hover:text-accent-foreground'
                                      }`}>
                                        {project.name}
                                      </h5>
                                      <p className={`text-sm ${
                                        isSelected ? 'text-emerald-700' : 'text-muted-foreground'
                                      }`}>
                                        ID: {project.projectId}
                                      </p>
                                      {project.projectNumber && (
                                        <p className={`text-xs ${
                                          isSelected ? 'text-emerald-600' : 'text-muted-foreground'
                                        }`}>
                                          Numéro: {project.projectNumber}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={isSelected ? "default" : "outline"} 
                                    className={`text-xs font-mono ${
                                      isSelected ? 'bg-emerald-500 text-white' : ''
                                    }`}
                                  >
                                    {isSelected ? 'Sélectionné' : 'GCP'}
                              </Badge>
                            </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep} 
                  disabled={!selectedBillingAccount || selectedProjects.length === 0 || isLoading}
                  className="min-w-[120px]"
                >
                  Suivant ({selectedProjects.length} projet{selectedProjects.length !== 1 ? 's' : ''})
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
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
                  <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Projets sélectionnés pour synchronisation
                  </h4>
                  <div className="grid gap-3">
                    {selectedProjects.map(projectId => {
                      const project = projects.find(p => p.projectId === projectId);
                      if (!project) return null;
                      
                      return (
                        <div key={projectId} className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-emerald-200">
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                              <FolderOpen className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-emerald-900">{project.name}</p>
                            <p className="text-sm text-emerald-700">ID: {project.projectId}</p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800">
                            Prêt
                              </Badge>
                            </div>
                      );
                    })}
                  </div>
                </div>

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
                  disabled={selectedProjects.length === 0 || isSyncing}
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
                      Synchroniser ({selectedProjects.length})
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

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 text-left">
                <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Résumé de la synchronisation
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>{selectedProjects.length} projet{selectedProjects.length > 1 ? 's' : ''} synchronisé{selectedProjects.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Données de facturation récupérées</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Empreinte carbone calculée</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Anomalies détectées</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Recommandations générées</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Prêt pour analyses FinOps</span>
                    </div>
                  </div>
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
