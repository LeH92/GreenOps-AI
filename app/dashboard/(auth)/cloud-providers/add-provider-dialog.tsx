"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Cloud, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Copy, 
  Download, 
  ExternalLink,
  Loader2,
  Key,
  FileText,
  Settings,
  Shield,
  Zap
} from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

interface Provider {
  id: string;
  name: string;
  shortName: string;
  company: "aws" | "google-cloud" | "azure" | "digitalocean" | "linode" | "vultr";
  description: string;
  setupComplexity: "Facile" | "Moyenne" | "Difficile";
  estimatedTime: string;
  features: string[];
  pricing: string;
  status: "available" | "coming-soon" | "beta";
  setupSteps: SetupStep[];
}

interface SetupStep {
  id: number;
  title: string;
  description: string;
  instructions: string[];
  codeSnippet?: string;
  link?: string;
  isCompleted: boolean;
}

const providers: Provider[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    shortName: "AWS",
    company: "aws",
    description: "Leader du cloud computing avec plus de 200 services",
    setupComplexity: "Moyenne",
    estimatedTime: "10-15 min",
    features: ["EC2", "S3", "Lambda", "RDS", "CloudWatch"],
    pricing: "Pay-as-you-go",
    status: "available",
    setupSteps: [
      {
        id: 1,
        title: "Créer un compte AWS",
        description: "Créez un compte AWS si vous n'en avez pas",
        instructions: [
          "Allez sur aws.amazon.com",
          "Cliquez sur 'Créer un compte AWS'",
          "Remplissez vos informations personnelles",
          "Ajoutez une méthode de paiement"
        ],
        link: "https://aws.amazon.com/",
        isCompleted: false
      },
      {
        id: 2,
        title: "Créer un utilisateur IAM",
        description: "Créez un utilisateur IAM avec les permissions nécessaires",
        instructions: [
          "Connectez-vous à la console AWS",
          "Allez dans IAM > Utilisateurs",
          "Cliquez sur 'Ajouter un utilisateur'",
          "Nommez l'utilisateur 'greenops-ai'",
          "Attachez la politique 'BillingFullAccess'"
        ],
        link: "https://console.aws.amazon.com/iam/",
        isCompleted: false
      },
      {
        id: 3,
        title: "Générer les clés d'accès",
        description: "Générez les clés d'accès API",
        instructions: [
          "Sélectionnez l'utilisateur créé",
          "Allez dans l'onglet 'Clés de sécurité'",
          "Cliquez sur 'Créer une clé d'accès'",
          "Copiez l'ID de clé d'accès et la clé secrète"
        ],
        isCompleted: false
      },
      {
        id: 4,
        title: "Configurer les permissions",
        description: "Ajoutez les permissions nécessaires pour la surveillance",
        instructions: [
          "Attachez la politique 'CloudWatchFullAccess'",
          "Attachez la politique 'CostExplorerFullAccess'",
          "Attachez la politique 'BillingFullAccess'"
        ],
        isCompleted: false
      }
    ]
  },
  {
    id: "google-cloud",
    name: "Google Cloud Platform",
    shortName: "GCP",
    company: "google-cloud",
    description: "Plateforme cloud de Google avec IA intégrée",
    setupComplexity: "Facile",
    estimatedTime: "5-10 min",
    features: ["Compute Engine", "Cloud Storage", "Cloud Functions", "BigQuery"],
    pricing: "Pay-as-you-go",
    status: "available",
    setupSteps: [
      {
        id: 1,
        title: "Créer un projet GCP",
        description: "Créez un nouveau projet dans Google Cloud Console",
        instructions: [
          "Allez sur console.cloud.google.com",
          "Cliquez sur 'Sélectionner un projet'",
          "Cliquez sur 'Nouveau projet'",
          "Nommez le projet 'greenops-ai'"
        ],
        link: "https://console.cloud.google.com/",
        isCompleted: false
      },
      {
        id: 2,
        title: "Activer l'API Billing",
        description: "Activez l'API de facturation pour accéder aux données de coûts",
        instructions: [
          "Allez dans 'APIs & Services' > 'Library'",
          "Recherchez 'Cloud Billing API'",
          "Cliquez sur 'Activer'"
        ],
        isCompleted: false
      },
      {
        id: 3,
        title: "Créer un compte de service",
        description: "Créez un compte de service avec les permissions nécessaires",
        instructions: [
          "Allez dans 'IAM & Admin' > 'Comptes de service'",
          "Cliquez sur 'Créer un compte de service'",
          "Nommez-le 'greenops-ai-monitor'",
          "Ajoutez les rôles : 'Billing Account Viewer', 'Project Viewer'"
        ],
        isCompleted: false
      },
      {
        id: 4,
        title: "Télécharger la clé JSON",
        description: "Téléchargez la clé JSON du compte de service",
        instructions: [
          "Cliquez sur le compte de service créé",
          "Allez dans l'onglet 'Clés'",
          "Cliquez sur 'Ajouter une clé' > 'Créer une nouvelle clé'",
          "Sélectionnez 'JSON' et téléchargez le fichier"
        ],
        isCompleted: false
      }
    ]
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    shortName: "Azure",
    company: "azure",
    description: "Plateforme cloud enterprise de Microsoft",
    setupComplexity: "Difficile",
    estimatedTime: "15-20 min",
    features: ["Virtual Machines", "Blob Storage", "Functions", "SQL Database"],
    pricing: "Pay-as-you-go",
    status: "available",
    setupSteps: [
      {
        id: 1,
        title: "Créer un compte Azure",
        description: "Créez un compte Azure avec un abonnement",
        instructions: [
          "Allez sur azure.microsoft.com",
          "Cliquez sur 'Commencer gratuitement'",
          "Connectez-vous avec votre compte Microsoft",
          "Ajoutez une méthode de paiement"
        ],
        link: "https://azure.microsoft.com/",
        isCompleted: false
      },
      {
        id: 2,
        title: "Créer une application Azure AD",
        description: "Créez une application dans Azure Active Directory",
        instructions: [
          "Allez dans 'Azure Active Directory'",
          "Cliquez sur 'Inscriptions d'applications'",
          "Cliquez sur 'Nouvelle inscription'",
          "Nommez l'application 'GreenOps AI'"
        ],
        isCompleted: false
      },
      {
        id: 3,
        title: "Générer un secret client",
        description: "Générez un secret pour l'authentification",
        instructions: [
          "Allez dans 'Certificats et secrets'",
          "Cliquez sur 'Nouveau secret client'",
          "Ajoutez une description et choisissez une expiration",
          "Copiez la valeur du secret"
        ],
        isCompleted: false
      },
      {
        id: 4,
        title: "Attribuer les permissions",
        description: "Attribuez les rôles nécessaires à l'application",
        instructions: [
          "Allez dans 'Autorisations API'",
          "Cliquez sur 'Ajouter une autorisation'",
          "Sélectionnez 'Microsoft Graph'",
          "Ajoutez les permissions : 'Directory.Read.All', 'User.Read'"
        ],
        isCompleted: false
      }
    ]
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    shortName: "DO",
    company: "aws", // Utilise le même logo pour l'instant
    description: "Plateforme cloud simple pour développeurs",
    setupComplexity: "Facile",
    estimatedTime: "5-8 min",
    features: ["Droplets", "Spaces", "Functions", "Databases"],
    pricing: "Pay-as-you-go",
    status: "available",
    setupSteps: [
      {
        id: 1,
        title: "Créer un compte DigitalOcean",
        description: "Créez un compte sur DigitalOcean",
        instructions: [
          "Allez sur digitalocean.com",
          "Cliquez sur 'S'inscrire'",
          "Remplissez vos informations",
          "Ajoutez une méthode de paiement"
        ],
        link: "https://digitalocean.com/",
        isCompleted: false
      },
      {
        id: 2,
        title: "Générer un token API",
        description: "Générez un token d'accès API",
        instructions: [
          "Allez dans 'API' > 'Tokens/Keys'",
          "Cliquez sur 'Générer un nouveau token'",
          "Nommez-le 'GreenOps AI'",
          "Copiez le token généré"
        ],
        isCompleted: false
      }
    ]
  }
];

export function AddProviderDialog() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [credentials, setCredentials] = useState({
    accessKey: "",
    secretKey: "",
    region: "",
    projectId: "",
    serviceAccountKey: ""
  });

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setCurrentStep(1);
    setConnectionStatus("idle");
    setCredentials({
      accessKey: "",
      secretKey: "",
      region: "",
      projectId: "",
      serviceAccountKey: ""
    });
  };

  const handleStepComplete = (stepId: number) => {
    if (selectedProvider) {
      const updatedSteps = selectedProvider.setupSteps.map(step => 
        step.id === stepId ? { ...step, isCompleted: true } : step
      );
      setSelectedProvider({ ...selectedProvider, setupSteps: updatedSteps });
    }
  };

  const handleConnect = async () => {
    if (!selectedProvider) return;
    
    setIsConnecting(true);
    setConnectionStatus("connecting");

    // Simulation de la connexion
    setTimeout(() => {
      setIsConnecting(false);
      setConnectionStatus("success");
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un fournisseur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un fournisseur cloud</DialogTitle>
          <DialogDescription>
            Connectez votre compte cloud pour surveiller les coûts et optimiser vos ressources
          </DialogDescription>
        </DialogHeader>

        {!selectedProvider ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {providers.map((provider) => (
                <Card 
                  key={provider.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProviderSelect(provider)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CompanyLogo company={provider.company} size={32} />
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <CardDescription>{provider.description}</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={provider.status === "available" ? "default" : "secondary"}
                        className={provider.status === "coming-soon" ? "bg-yellow-100 text-yellow-800" : ""}
                      >
                        {provider.status === "available" ? "Disponible" : 
                         provider.status === "coming-soon" ? "Bientôt" : "Beta"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Complexité:</span>
                        <span className="font-medium">{provider.setupComplexity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Temps estimé:</span>
                        <span className="font-medium">{provider.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tarification:</span>
                        <span className="font-medium">{provider.pricing}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Services inclus:</p>
                        <div className="flex flex-wrap gap-1">
                          {provider.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header du provider sélectionné */}
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
              <CompanyLogo company={selectedProvider.company} size={40} />
              <div>
                <h3 className="text-xl font-semibold">{selectedProvider.name}</h3>
                <p className="text-muted-foreground">{selectedProvider.description}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedProvider(null)}
              >
                Changer
              </Button>
            </div>

            {/* Workflow de configuration */}
            <Tabs value={currentStep.toString()} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                {selectedProvider.setupSteps.map((step) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id.toString()}
                    onClick={() => setCurrentStep(step.id)}
                    className="flex items-center space-x-2"
                  >
                    {step.isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="hidden sm:inline">Étape {step.id}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {selectedProvider.setupSteps.map((step) => (
                <TabsContent key={step.id} value={step.id.toString()} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>

                    <div className="space-y-3">
                      {step.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="text-sm">{instruction}</p>
                        </div>
                      ))}
                    </div>

                    {step.link && (
                      <Button variant="outline" asChild>
                        <a href={step.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ouvrir {selectedProvider.shortName} Console
                        </a>
                      </Button>
                    )}

                    {step.codeSnippet && (
                      <div className="space-y-2">
                        <Label>Code de configuration</Label>
                        <div className="relative">
                          <Textarea 
                            value={step.codeSnippet} 
                            readOnly 
                            className="font-mono text-sm"
                            rows={4}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(step.codeSnippet!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => handleStepComplete(step.id)}
                        disabled={step.isCompleted}
                      >
                        {step.isCompleted ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Terminé
                          </>
                        ) : (
                          "Marquer comme terminé"
                        )}
                      </Button>

                      {step.id < selectedProvider.setupSteps.length && (
                        <Button onClick={() => setCurrentStep(step.id + 1)}>
                          Suivant
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Formulaire de connexion */}
            {currentStep === selectedProvider.setupSteps.length && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="text-lg font-semibold">Configuration finale</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedProvider.id === "aws" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="accessKey">Access Key ID</Label>
                        <Input
                          id="accessKey"
                          value={credentials.accessKey}
                          onChange={(e) => setCredentials({...credentials, accessKey: e.target.value})}
                          placeholder="AKIA..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secretKey">Secret Access Key</Label>
                        <Input
                          id="secretKey"
                          type="password"
                          value={credentials.secretKey}
                          onChange={(e) => setCredentials({...credentials, secretKey: e.target.value})}
                          placeholder="Votre clé secrète"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Région</Label>
                        <Input
                          id="region"
                          value={credentials.region}
                          onChange={(e) => setCredentials({...credentials, region: e.target.value})}
                          placeholder="us-east-1"
                        />
                      </div>
                    </>
                  )}

                  {selectedProvider.id === "google-cloud" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="projectId">Project ID</Label>
                        <Input
                          id="projectId"
                          value={credentials.projectId}
                          onChange={(e) => setCredentials({...credentials, projectId: e.target.value})}
                          placeholder="votre-project-id"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceAccountKey">Service Account Key (JSON)</Label>
                        <Textarea
                          id="serviceAccountKey"
                          value={credentials.serviceAccountKey}
                          onChange={(e) => setCredentials({...credentials, serviceAccountKey: e.target.value})}
                          placeholder="Collez le contenu JSON de votre clé de compte de service"
                          rows={6}
                        />
                      </div>
                    </>
                  )}

                  {selectedProvider.id === "azure" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tenantId">Tenant ID</Label>
                        <Input
                          id="tenantId"
                          value={credentials.accessKey}
                          onChange={(e) => setCredentials({...credentials, accessKey: e.target.value})}
                          placeholder="00000000-0000-0000-0000-000000000000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input
                          id="clientId"
                          value={credentials.secretKey}
                          onChange={(e) => setCredentials({...credentials, secretKey: e.target.value})}
                          placeholder="00000000-0000-0000-0000-000000000000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          value={credentials.region}
                          onChange={(e) => setCredentials({...credentials, region: e.target.value})}
                          placeholder="Votre secret client"
                        />
                      </div>
                    </>
                  )}
                </div>

                {connectionStatus === "error" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Erreur de connexion. Vérifiez vos identifiants et réessayez.
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connexion réussie ! {selectedProvider.name} est maintenant connecté.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleConnect}
                    disabled={isConnecting || connectionStatus === "success"}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : connectionStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Connecté
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Connecter {selectedProvider.shortName}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
