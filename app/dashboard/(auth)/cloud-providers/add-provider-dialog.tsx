"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompanyLogo } from "@/components/ui/company-logo";
import { 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Loader2, 
  Zap,
  Search,
  ArrowRight
} from "lucide-react";
import { signIn } from "next-auth/react";

interface SetupStep {
  id: number;
  title: string;
  description: string;
  instructions: string[];
  link?: string;
  isCompleted: boolean;
}

interface Provider {
  id: string;
  name: string;
  shortName: string;
  company: "aws" | "google-cloud" | "azure";
  description: string;
  setupComplexity: string;
  estimatedTime: string;
  features: string[];
  pricing: string;
  status: "available" | "coming-soon" | "beta";
  setupSteps: SetupStep[];
}

const providers: Provider[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    shortName: "AWS",
    company: "aws",
    description: "Leader du cloud computing avec des services évolutifs et fiables",
    setupComplexity: "Moyenne",
    estimatedTime: "10-15 min",
    features: ["EC2", "S3", "Lambda", "RDS"],
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
    description: "IA intégrée & Big Data avec des outils avancés d'analyse",
    setupComplexity: "Facile",
    estimatedTime: "5-10 min",
    features: ["Compute Engine", "Cloud Storage", "BigQuery"],
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
        description: "Téléchargez la clé de compte de service au format JSON",
        instructions: [
          "Sélectionnez le compte de service créé",
          "Allez dans l'onglet 'Clés'",
          "Cliquez sur 'Ajouter une clé' > 'Créer une nouvelle clé'",
          "Choisissez 'JSON' et téléchargez le fichier"
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
    description: "Enterprise & Hybrid Cloud avec intégration Microsoft",
    setupComplexity: "Difficile",
    estimatedTime: "15-20 min",
    features: ["Virtual Machines", "Blob Storage", "Functions"],
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
        title: "Créer un principal de service",
        description: "Créez un principal de service pour l'authentification",
        instructions: [
          "Ouvrez Azure CLI ou PowerShell",
          "Connectez-vous avec 'az login'",
          "Créez le principal avec 'az ad sp create-for-rbac'",
          "Notez l'ID d'application et le secret"
        ],
        isCompleted: false
      },
      {
        id: 3,
        title: "Attribuer les rôles",
        description: "Attribuez les rôles nécessaires au principal de service",
        instructions: [
          "Allez dans 'Azure Active Directory' > 'Applications d'entreprise'",
          "Sélectionnez votre principal de service",
          "Allez dans 'Rôles et administrateurs'",
          "Ajoutez 'Lecteur de facturation' et 'Lecteur de coûts'"
        ],
        isCompleted: false
      },
      {
        id: 4,
        title: "Configurer l'accès aux ressources",
        description: "Configurez l'accès aux ressources Azure",
        instructions: [
          "Allez dans 'Gestion des coûts + facturation'",
          "Sélectionnez votre abonnement",
          "Allez dans 'Contrôle d'accès (IAM)'",
          "Ajoutez le principal de service avec les rôles appropriés"
        ],
        isCompleted: false
      }
    ]
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    shortName: "DO",
    company: "aws", // Utilise le logo AWS comme placeholder
    description: "Simple & Développeurs avec des droplets et Kubernetes",
    setupComplexity: "Facile",
    estimatedTime: "5-8 min",
    features: ["Droplets", "Kubernetes", "Spaces"],
    pricing: "Pay-as-you-go",
    status: "available",
    setupSteps: [
      {
        id: 1,
        title: "Créer un compte DigitalOcean",
        description: "Créez un compte DigitalOcean",
        instructions: [
          "Allez sur digitalocean.com",
          "Cliquez sur 'Sign Up'",
          "Remplissez vos informations",
          "Ajoutez une méthode de paiement"
        ],
        link: "https://digitalocean.com/",
        isCompleted: false
      },
      {
        id: 2,
        title: "Générer un token API",
        description: "Générez un token API pour l'authentification",
        instructions: [
          "Allez dans 'API' > 'Tokens/Keys'",
          "Cliquez sur 'Generate New Token'",
          "Nommez-le 'greenops-ai'",
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
  const [searchTerm, setSearchTerm] = useState("");

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setCurrentStep(1);
    setConnectionStatus("idle");
  };

  const handleStepComplete = (stepId: number) => {
    if (selectedProvider) {
      const updatedSteps = selectedProvider.setupSteps.map(step =>
        step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
      );
      setSelectedProvider({ ...selectedProvider, setupSteps: updatedSteps });
    }
  };

  const handleConnect = async () => {
    if (!selectedProvider) return;
    setIsConnecting(true);
    setConnectionStatus("connecting");

    try {
      // Simulation de la connexion pour les autres providers
      setTimeout(() => {
        setIsConnecting(false);
        setConnectionStatus("success");
      }, 2000);
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus("error");
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Facile": return "bg-green-100 text-green-800 border-green-200";
      case "Moyenne": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Difficile": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un fournisseur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[99vw] w-[1800px] max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Intégrations Cloud</DialogTitle>
          <DialogDescription>
            Connectez vos fournisseurs cloud pour surveiller les coûts et optimiser vos ressources
          </DialogDescription>
        </DialogHeader>
        {/* Navigation Bar */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-12 py-6">
            <div className="flex items-center space-x-8">
              <h2 className="text-xl font-semibold">GreenOps AI</h2>
              <nav className="flex items-center space-x-6 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Vue d'ensemble</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Fournisseurs</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Intégrations</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">Documentation</Button>
              <Button size="sm">Commencer</Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-12 py-6 border-b">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 px-12">
          {!selectedProvider ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-semibold mb-4">
                  Intégrations Cloud
                </h3>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                  Connectez vos fournisseurs cloud pour surveiller les coûts et optimiser vos ressources
                </p>
              </div>

              {/* Integration Cards Grid */}
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {filteredProviders.map((provider) => (
                  <Card 
                    key={provider.id} 
                    className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 cursor-pointer group min-h-[280px] flex flex-col"
                    onClick={() => handleProviderSelect(provider)}
                  >
                    <CardHeader className="pb-6 flex-shrink-0">
                      {/* Integration Icons */}
                      <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <CompanyLogo company={provider.company} size={24} />
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <div className="w-5 h-5 bg-white rounded"></div>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl font-semibold text-center">
                        {provider.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <CardDescription className="text-sm text-center leading-relaxed">
                          {provider.description}
                        </CardDescription>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {provider.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs px-2 py-1">
                              {feature}
                            </Badge>
                          ))}
                          {provider.features.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              +{provider.features.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors h-10"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (provider.id === "google-cloud") {
                            signIn('google', { callbackUrl: '/dashboard/cloud-providers' });
                          } else {
                            handleProviderSelect(provider);
                          }
                        }}
                      >
                        ESSAYER
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Provider Header */}
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <CompanyLogo company={selectedProvider.company} size={40} />
                <div className="flex-1">
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

              {/* Setup Workflow */}
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
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                          <span className="text-xs">{step.id}</span>
                        </div>
                      )}
                      <span className="hidden sm:inline">Étape {step.id}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {selectedProvider.setupSteps.map((step) => (
                  <TabsContent key={step.id} value={step.id.toString()} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">{step.title}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStepComplete(step.id)}
                        >
                          {step.isCompleted ? "Marquer comme incomplet" : "Marquer comme terminé"}
                        </Button>
                      </div>
                      
                      <p className="text-muted-foreground">{step.description}</p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Instructions :</h5>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {step.instructions.map((instruction, index) => (
                            <li key={index} className="text-muted-foreground">{instruction}</li>
                          ))}
                        </ol>
                      </div>

                      {step.link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={step.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ouvrir le lien
                          </a>
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Connection Form */}
              {currentStep === selectedProvider.setupSteps.length && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="text-lg font-semibold">Configuration finale</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedProvider.id === "aws" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Access Key ID</label>
                          <Input placeholder="AKIA..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Secret Access Key</label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                      </>
                    )}
                    {selectedProvider.id === "azure" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tenant ID</label>
                          <Input placeholder="00000000-0000-0000-0000-000000000000" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Client ID</label>
                          <Input placeholder="00000000-0000-0000-0000-000000000000" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Client Secret</label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Subscription ID</label>
                          <Input placeholder="00000000-0000-0000-0000-000000000000" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Connection Status */}
                  {connectionStatus === "connecting" && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Connexion en cours...
                      </AlertDescription>
                    </Alert>
                  )}

                  {connectionStatus === "success" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription>
                        Connexion réussie ! Votre fournisseur est maintenant configuré.
                      </AlertDescription>
                    </Alert>
                  )}

                  {connectionStatus === "error" && (
                    <Alert>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription>
                        Erreur de connexion. Vérifiez vos informations et réessayez.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="flex-1"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        "Se connecter"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
