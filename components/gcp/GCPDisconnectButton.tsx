"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/src/hooks/useAuth';
import { XCircle, Loader2 } from 'lucide-react';
import { GCPDisconnectDialog } from './GCPDisconnectDialog';

interface GCPDisconnectButtonProps {
  onDisconnected: () => void;
  className?: string;
}

export function GCPDisconnectButton({ onDisconnected, className }: GCPDisconnectButtonProps) {
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const handleDisconnectClick = () => {
    if (!user || !session) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDisconnectDialogOpen(true);
  };

  const handleDisconnected = () => {
    // Appeler le callback pour mettre à jour l'état de la page
    onDisconnected();
    
    // Fermer le dialog
    setIsDisconnectDialogOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={`text-red-600 border-red-200 hover:bg-red-50 ${className}`}
        onClick={handleDisconnectClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="mr-2 h-4 w-4" />
        )}
        Déconnexion
      </Button>

      {/* Dialog de confirmation */}
      <GCPDisconnectDialog
        isOpen={isDisconnectDialogOpen}
        onClose={() => setIsDisconnectDialogOpen(false)}
        onDisconnected={handleDisconnected}
        connectionInfo={{
          projectsCount: 1, // À récupérer depuis l'API si nécessaire
          billingDataCount: 0,
          lastSync: 'Il y a 1h'
        }}
      />
    </>
  );
}

