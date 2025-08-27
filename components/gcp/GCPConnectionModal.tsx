"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectSelectionWidget } from "./ProjectSelectionWidget";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/src/hooks/useAuth';

interface GCPConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelected?: (project: any) => void;
}

export function GCPConnectionModal({ isOpen, onClose, onProjectSelected }: GCPConnectionModalProps) {
  const [currentStep, setCurrentStep] = useState<'connecting' | 'selecting' | 'completed'>('connecting');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user && session) {
      // Vérifier le statut de connexion GCP
      checkGCPConnection();
    }
  }, [isOpen, user, session]);

  const checkGCPConnection = async () => {
    if (!user || !session) return;

    try {
      // Vérifier d'abord le statut de connexion
      const statusResponse = await fetch('/api/gcp/connection-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.connection_status === 'connected') {
          setConnectionStatus('connected');
          setCurrentStep('selecting');
        } else {
          setConnectionStatus('error');
          toast({
            title: "Connexion requise",
            description: "Veuillez d'abord vous connecter à Google Cloud",
            variant: "destructive",
          });
          onClose();
        }
      } else {
        setConnectionStatus('error');
        onClose();
      }
    } catch (error) {
      console.error('Error checking GCP connection:', error);
      setConnectionStatus('error');
      onClose();
    }
  };

  const handleProjectSelected = (project: any) => {
    setCurrentStep('completed');
    toast({
      title: "Projet synchronisé",
      description: `Le projet "${project.name}" a été synchronisé avec succès`,
    });
    
    onProjectSelected?.(project);
    
    // Fermer le modal après un délai
    setTimeout(() => {
      onClose();
      setCurrentStep('connecting');
      setConnectionStatus('connecting');
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    setCurrentStep('connecting');
    setConnectionStatus('connecting');
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'connecting', label: 'Connexion GCP', completed: connectionStatus === 'connected' },
      { key: 'selecting', label: 'Sélection projet', completed: currentStep === 'selecting' || currentStep === 'completed' },
      { key: 'completed', label: 'Synchronisation', completed: currentStep === 'completed' }
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step.completed ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                step.completed ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Connexion Google Cloud</span>
          </DialogTitle>
        </DialogHeader>

        {getStepIndicator()}

        {currentStep === 'connecting' && connectionStatus === 'connecting' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Connexion à Google Cloud...</p>
            <p className="text-muted-foreground">Vérification de l'authentification OAuth</p>
          </div>
        )}

        {currentStep === 'selecting' && connectionStatus === 'connected' && (
          <ProjectSelectionWidget
            onProjectSelected={handleProjectSelected}
            onClose={handleClose}
            className="border-0 shadow-none"
          />
        )}

        {currentStep === 'completed' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-green-600">Projet synchronisé avec succès !</p>
            <p className="text-muted-foreground">Redirection en cours...</p>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-red-600">Erreur de connexion</p>
            <p className="text-muted-foreground">Impossible de se connecter à Google Cloud</p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
