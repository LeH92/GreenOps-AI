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
  DollarSign
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

interface ProjectSelectionWidgetProps {
  onProjectSelected?: (project: GCPProject) => void;
  onClose?: () => void;
  className?: string;
}

export function ProjectSelectionWidget({ onProjectSelected, onClose, className }: ProjectSelectionWidgetProps) {
  const [projects, setProjects] = useState<GCPProject[]>([]);
  const [billingAccounts, setBillingAccounts] = useState<GCPBillingAccount[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && session) {
      loadGCPData();
    }
  }, [user, session]);

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

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleConnect = async () => {
    if (!selectedProject) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un projet",
        variant: "destructive",
      });
      return;
    }

    const project = projects.find(p => p.projectId === selectedProject);
    if (!project) return;

    setIsConnecting(true);
    try {
      // Ici vous pouvez ajouter la logique pour connecter le projet spécifique
      toast({
        title: "Projet connecté",
        description: `Le projet "${project.name}" a été connecté avec succès`,
      });
      
      onProjectSelected?.(project);
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de connecter le projet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = () => {
    loadGCPData();
  };

  if (!user || !session) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Connexion Google Cloud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connectez-vous d'abord à GreenOps AI pour accéder à vos projets GCP.
          </p>
          <Button onClick={() => window.location.href = '/login'} className="w-full">
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Chargement des projets...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Récupération des projets GCP...</span>
          </div>
          <Progress value={33} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Aucun projet trouvé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Aucun projet Google Cloud n'a été trouvé pour votre compte.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Sélectionner un projet GCP
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choisissez le projet Google Cloud à synchroniser
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Indicateur de progression */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connecté à Google Cloud</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Projets récupérés</span>
          </div>
        </div>

        {/* Sélection du projet */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Projet Google Cloud</label>
          <Select value={selectedProject} onValueChange={handleProjectSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un projet" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.projectId} value={project.projectId}>
                  <div className="flex items-center gap-2">
                    <span>{project.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {project.projectId}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Informations du projet sélectionné */}
        {selectedProject && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Projet sélectionné :</span>
              <Badge variant="secondary">
                {projects.find(p => p.projectId === selectedProject)?.name}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {selectedProject}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span>{projects.length} projets</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span>{billingAccounts.length} comptes de facturation</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleConnect} 
            disabled={!selectedProject || isConnecting}
            className="flex-1"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Synchroniser le projet
              </>
            )}
          </Button>
          <Button onClick={onClose} variant="outline">
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
