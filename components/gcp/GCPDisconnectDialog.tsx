"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/src/hooks/useAuth';
import { 
  AlertTriangle, 
  XCircle, 
  Archive, 
  Shield, 
  Database,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface GCPDisconnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnected: () => void;
  connectionInfo?: {
    projectsCount: number;
    billingDataCount: number;
    lastSync: string;
  };
}

export function GCPDisconnectDialog({ 
  isOpen, 
  onClose, 
  onDisconnected, 
  connectionInfo 
}: GCPDisconnectDialogProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectionStep, setDisconnectionStep] = useState('');
  const { user, session } = useAuth();
  const { toast } = useToast();

  const handleConfirmDisconnect = async () => {
    if (!user || !session) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité.",
        variant: "destructive",
      });
      return;
    }

    setIsDisconnecting(true);
    
    try {
      // Étapes de déconnexion avec feedback visuel
      const steps = [
        'Révocation des tokens Google...',
        'Archivage des projets...',
        'Sauvegarde des données de facturation...',
        'Archivage des recommandations...',
        'Finalisation de la déconnexion...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setDisconnectionStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      const response = await fetch('/api/gcp/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        setDisconnectionStep('Déconnexion terminée avec succès !');
        
        // Toast détaillé avec le résumé
        toast({
          title: "Google Cloud déconnecté",
          description: `${result.summary?.projectsArchived || 0} projets archivés, ${result.summary?.billingDataArchived || 0} enregistrements sauvegardés`,
        });

        console.log('✅ GCP disconnection completed:', result.summary);
        
        // Attendre un peu puis fermer et notifier
        setTimeout(() => {
          onDisconnected();
          onClose();
          setIsDisconnecting(false);
          setDisconnectionStep('');
        }, 1500);

      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la déconnexion');
      }
    } catch (error: any) {
      console.error('❌ Error disconnecting:', error);
      
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Impossible de déconnecter le compte",
        variant: "destructive",
      });
      
      setIsDisconnecting(false);
      setDisconnectionStep('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm border border-border/50 bg-background/80 backdrop-blur-md shadow-xl">
        <DialogHeader className="text-center pb-3">
          <div className="mx-auto w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Déconnecter Google Cloud
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-xs">
            Cette action va déconnecter votre compte et archiver les données associées.
          </DialogDescription>
        </DialogHeader>

        {!isDisconnecting ? (
          <div className="space-y-4">
            {/* Résumé des données qui seront archivées */}
            <div className="rounded-lg border border-border/50 bg-muted/30 backdrop-blur-sm p-3">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2 text-sm">
                <div className="p-1 rounded bg-muted text-muted-foreground">
                  <Database className="h-3.5 w-3.5" />
                </div>
                Données archivées
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-0.5">
                  <div className="text-base font-semibold text-foreground">
                    {connectionInfo?.projectsCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Projets
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-base font-semibold text-foreground">
                    {connectionInfo?.billingDataCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Billing
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    {connectionInfo?.lastSync || 'Jamais'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sync
                  </div>
                </div>
              </div>
            </div>

            {/* Actions qui seront effectuées */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2 text-sm">
                <div className="p-1 rounded bg-muted text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                Actions
              </h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/30">
                  <div className="p-0.5 rounded bg-muted text-destructive">
                    <XCircle className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-foreground">Révocation tokens Google</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/30">
                  <div className="p-0.5 rounded bg-muted text-muted-foreground">
                    <Archive className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-foreground">Archivage projets</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/30">
                  <div className="p-0.5 rounded bg-muted text-muted-foreground">
                    <Archive className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-foreground">Sauvegarde billing</span>
                </div>
              </div>
            </div>

            {/* Note importante */}
            <div className="rounded border border-border/50 bg-muted/20 backdrop-blur-sm p-2.5">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-muted text-muted-foreground flex-shrink-0">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground mb-0.5 text-xs">Données conservées</h5>
                  <p className="text-xs text-muted-foreground leading-tight">
                    Restauration possible sous <strong>30 jours</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {/* Progression de la déconnexion */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                </div>
              </div>
              <h4 className="text-base font-medium text-foreground mb-1">Déconnexion en cours...</h4>
              <p className="text-xs text-muted-foreground">
                {disconnectionStep}
              </p>
            </div>

            {/* Barre de progression sobre */}
            <div className="space-y-1">
              <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-muted-foreground rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Archivage...</span>
                <span>75%</span>
              </div>
            </div>
          </div>
        )}

        {!isDisconnecting && (
          <DialogFooter className="flex gap-2 pt-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isDisconnecting}
              className="flex-1 h-9 text-sm"
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDisconnect}
              disabled={isDisconnecting}
              className="flex-1 h-9 text-sm"
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Confirmer
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
