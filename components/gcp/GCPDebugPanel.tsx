"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/src/hooks/useAuth';
import { 
  Bug, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Database,
  Cloud,
  Key,
  Settings
} from 'lucide-react';

interface DebugResult {
  success: boolean;
  message: string;
  timestamp: string;
  data: any;
  recommendations: string[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    status: string;
  };
}

export function GCPDebugPanel() {
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTest, setLastTest] = useState<string>('');
  const { user, session } = useAuth();
  const { toast } = useToast();

  const runDebugTest = async () => {
    if (!user || !session?.access_token) {
      toast({
        title: "Authentification requise",
        description: "Connectez Google Cloud pour tester",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setLastTest(new Date().toLocaleTimeString());

    try {
      console.log('🧪 Démarrage du debug complet GCP...');
      
      const response = await fetch('/api/gcp/debug-complete', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: DebugResult = await response.json();
      setDebugResult(result);
      
      console.log('🎉 Debug complet terminé:', result);
      
      toast({
        title: "Debug terminé",
        description: `${result.summary.status} - ${result.summary.totalIssues} problème(s) détecté(s)`,
        variant: result.summary.totalIssues === 0 ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('❌ Erreur debug:', error);
      
      toast({
        title: "Erreur debug",
        description: error.message,
        variant: "destructive"
      });
      
      setDebugResult({
        success: false,
        message: 'Debug failed',
        timestamp: new Date().toISOString(),
        data: { error: error.message },
        recommendations: ['❌ Erreur lors du debug'],
        summary: { totalIssues: 1, criticalIssues: 1, status: '❌ ERREUR' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status.includes('❌')) return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'bg-green-100 text-green-800';
    if (status.includes('❌')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Debug Panel GCP OAuth
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Dernier test: {lastTest || 'Jamais'}</span>
          <span>Status: {debugResult?.summary.status || 'Non testé'}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bouton de test */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={runDebugTest} 
            disabled={isLoading || !user}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Bug className="w-4 h-4" />
            )}
            {isLoading ? 'Debug en cours...' : 'Lancer Debug Complet'}
          </Button>
          
          {!user && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Connecter Google Cloud
            </Badge>
          )}
        </div>

        {/* Barre de progression */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Diagnostic en cours...</span>
              <span>Vérification complète</span>
            </div>
            <Progress value={100} className="animate-pulse" />
          </div>
        )}

        {/* Résultats du debug */}
        {debugResult && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Base de données</span>
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {debugResult.data.database?.connection?.exists ? '✅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {debugResult.data.database?.connection?.exists ? 'Connexion trouvée' : 'Aucune connexion'}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span className="font-medium">Tokens OAuth</span>
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {debugResult.data.database?.connection?.hasTokens ? '✅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {debugResult.data.database?.connection?.hasTokens ? 'Tokens présents' : 'Tokens manquants'}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span className="font-medium">APIs GCP</span>
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {debugResult.data.gcp?.apis?.cloudResourceManager?.status?.includes('✅') ? '✅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {debugResult.data.gcp?.apis?.cloudResourceManager?.status?.includes('✅') ? 'APIs actives' : 'APIs inactives'}
                </div>
              </Card>
            </div>

            {/* Variables d'environnement */}
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Variables d'environnement
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(debugResult.data.environment || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {getStatusIcon(value as string)}
                    <span className="font-mono">{key}:</span>
                    <Badge className={getStatusColor(value as string)}>
                      {value}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommandations */}
            <Card className="p-4">
              <h3 className="font-medium mb-3">Recommandations</h3>
              <div className="space-y-2">
                {debugResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded border">
                    {rec.includes('❌') ? (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Détails techniques */}
            <details className="group">
              <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
                Détails techniques (cliquez pour développer)
              </summary>
              <div className="mt-2 p-4 bg-muted rounded text-xs font-mono overflow-auto max-h-96">
                <pre>{JSON.stringify(debugResult.data, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
