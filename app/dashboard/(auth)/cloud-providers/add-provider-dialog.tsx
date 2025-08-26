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
  Zap,
  Clock,
  Star,
  TrendingUp
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
  popularity: number;
  bestFor: string;
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
    description: "Leader du cloud computing",
    setupComplexity: "Moyenne",
    estimatedTime: "10-15 min",
    features: ["EC2", "S3", "Lambda", "RDS"],
    pricing: "Pay-as-you-go",
    status: "available",
    popularity: 95,
    bestFor: "Entreprises & Scale",
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
    description: "IA intégrée & Big Data",
    setupComplexity: "Facile",
    estimatedTime: "5-10 min",
    features: ["Compute Engine", "Cloud Storage", "BigQuery"],
    pricing: "Pay-as-you-go",
    status: "available",
    popularity: 88,
    bestFor: "IA & Analytics",
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
    description: "Enterprise & Hybrid Cloud",
    setupComplexity: "Difficile",
    estimatedTime: "15-20 min",
    features: ["Virtual Machines", "Blob Storage", "Functions"],
    pricing: "Pay-as-you-go",
    status: "available",
    popularity: 82,
    bestFor: "Enterprise",
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
    description: "Simple & Développeurs",
    setupComplexity: "Facile",
    estimatedTime: "5-8 min",
    features: ["Droplets", "Spaces", "Functions"],
    pricing: "Pay-as-you-go",
    status: "available",
    popularity: 75,
    bestFor: "Développeurs",
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

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Facile": return "bg-green-100 text-green-800 border-green-200";
      case "Moyenne": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Difficile": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un fournisseur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un fournisseur cloud</DialogTitle>
          <DialogDescription>
            Connectez votre compte cloud pour surveiller les coûts et optimiser vos ressources
          </DialogDescription>
        </DialogHeader>

        {!selectedProvider ? (
          <div className="space-y-6">
            {/* Filtres et recherche */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <TrendingUp className="mr-2 h-3 w-3" />
                  Tous les fournisseurs
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {providers.length} fournisseurs disponibles
                </span>
              </div>
            </div>

            {/* Grille des fournisseurs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {providers.map((provider) => (
                <Card 
                  key={provider.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/20 group"
                  onClick={() => handleProviderSelect(provider)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <CompanyLogo company={provider.company} size={48} />
                          {provider.popularity > 90 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                              <Star className="h-3 w-3 text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {provider.name}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {provider.description}
                          </CardDescription>
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

                  <CardContent className="space-y-4">
                    {/* Métriques principales */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium">{provider.estimatedTime}</div>
                        <div className="text-xs text-muted-foreground">Temps estimé</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium">{provider.popularity}%</div>
                        <div className="text-xs text-muted-foreground">Popularité</div>
                      </div>
                    </div>

                    {/* Complexité */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Complexité:</span>
                      <Badge variant="outline" className={getComplexityColor(provider.setupComplexity)}>
                        {provider.setupComplexity}
                      </Badge>
                    </div>

                    {/* Idéal pour */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Idéal pour:</span>
                      <span className="text-sm font-medium text-primary">{provider.bestFor}</span>
                    </div>

                    {/* Services clés */}
                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">Services clés:</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {provider.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{provider.features.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <Button className="w-full mt-4" variant="outline">
                      <Cloud className="mr-2 h-4 w-4" />
                      Configurer {provider.shortName}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Footer informatif */}
            <div className="text-center py-6 border-t">
              <p className="text-sm text-muted-foreground">
                Tous les fournisseurs sont testés et approuvés pour une intégration sécurisée
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header du provider sélectionné */}
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-muted/50 to-muted rounded-xl">
              <CompanyLogo company={selectedProvider.company} size={56} />
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{selectedProvider.name}</h3>
                <p className="text-muted-foreground text-lg">{selectedProvider.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className={getComplexityColor(selectedProvider.setupComplexity)}>
                    {selectedProvider.setupComplexity}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedProvider.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span>{selectedProvider.popularity}%</span>
                  </div>
                </div>
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
            <Tabs value={currentStep.toString()} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                {selectedProvider.setupSteps.map((step) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id.toString()}
                    onClick={() => setCurrentStep(step.id)}
                    className="flex flex-col items-center space-y-2 h-auto py-4 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="relative">
                      {step.isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                          <span className="text-sm font-medium">{step.id}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-center leading-tight">{step.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {selectedProvider.setupSteps.map((step) => (
                <TabsContent key={step.id} value={step.id.toString()} className="space-y-6">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h4 className="text-2xl font-bold">{step.title}</h4>
                      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{step.description}</p>
                    </div>

                    <div className="grid gap-4 max-w-3xl mx-auto">
                      {step.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="text-base leading-relaxed">{instruction}</p>
                        </div>
                      ))}
                    </div>

                    {step.link && (
                      <div className="text-center">
                        <Button variant="outline" size="lg" asChild>
                          <a href={step.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-5 w-5" />
                            Ouvrir {selectedProvider.shortName} Console
                          </a>
                        </Button>
                      </div>
                    )}

                    {step.codeSnippet && (
                      <div className="space-y-3 max-w-2xl mx-auto">
                        <Label className="text-base font-semibold">Code de configuration</Label>
                        <div className="relative">
                          <Textarea 
                            value={step.codeSnippet} 
                            readOnly 
                            className="font-mono text-sm bg-muted/50"
                            rows={4}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-3 right-3"
                            onClick={() => copyToClipboard(step.codeSnippet!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between max-w-2xl mx-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleStepComplete(step.id)}
                        disabled={step.isCompleted}
                        className="min-w-[140px]"
                      >
                        {step.isCompleted ? (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Terminé
                          </>
                        ) : (
                          "Marquer comme terminé"
                        )}
                      </Button>

                      {step.id < selectedProvider.setupSteps.length && (
                        <Button size="lg" onClick={() => setCurrentStep(step.id + 1)}>
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
              <div className="space-y-6 p-6 border rounded-xl bg-muted/20">
                <div className="text-center space-y-2">
                  <h4 className="text-2xl font-bold">Configuration finale</h4>
                  <p className="text-muted-foreground">Entrez vos identifiants pour finaliser la connexion</p>
                </div>
                
                <div className="grid gap-6 max-w-2xl mx-auto">
                  {selectedProvider.id === "aws" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="accessKey" className="text-base font-medium">Access Key ID</Label>
                        <Input
                          id="accessKey"
                          value={credentials.accessKey}
                          onChange={(e) => setCredentials({...credentials, accessKey: e.target.value})}
                          placeholder="AKIA..."
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secretKey" className="text-base font-medium">Secret Access Key</Label>
                        <Input
                          id="secretKey"
                          type="password"
                          value={credentials.secretKey}
                          onChange={(e) => setCredentials({...credentials, secretKey: e.target.value})}
                          placeholder="Votre clé secrète"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-base font-medium">Région</Label>
                        <Input
                          id="region"
                          value={credentials.region}
                          onChange={(e) => setCredentials({...credentials, region: e.target.value})}
                          placeholder="us-east-1"
                          className="h-12 text-base"
                        />
                      </div>
                    </>
                  )}

                  {selectedProvider.id === "google-cloud" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="projectId" className="text-base font-medium">Project ID</Label>
                        <Input
                          id="projectId"
                          value={credentials.projectId}
                          onChange={(e) => setCredentials({...credentials, projectId: e.target.value})}
                          placeholder="votre-project-id"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceAccountKey" className="text-base font-medium">Service Account Key (JSON)</Label>
                        <Textarea
                          id="serviceAccountKey"
                          value={credentials.serviceAccountKey}
                          onChange={(e) => setCredentials({...credentials, serviceAccountKey: e.target.value})}
                          placeholder="Collez le contenu JSON de votre clé de compte de service"
                          rows={6}
                          className="text-sm"
                        />
                      </div>
                    </>
                  )}

                  {selectedProvider.id === "azure" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tenantId" className="text-base font-medium">Tenant ID</Label>
                        <Input
                          id="tenantId"
                          value={credentials.accessKey}
                          onChange={(e) => setCredentials({...credentials, accessKey: e.target.value})}
                          placeholder="00000000-0000-0000-0000-000000000000"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientId" className="text-base font-medium">Client ID</Label>
                        <Input
                          id="clientId"
                          value={credentials.secretKey}
                          onChange={(e) => setCredentials({...credentials, secretKey: e.target.value})}
                          placeholder="00000000-0000-0000-0000-000000000000"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientSecret" className="text-base font-medium">Client Secret</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          value={credentials.region}
                          onChange={(e) => setCredentials({...credentials, region: e.target.value})}
                          placeholder="Votre secret client"
                          className="h-12 text-base"
                        />
                      </div>
                    </>
                  )}
                </div>

                {connectionStatus === "error" && (
                  <Alert className="max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Erreur de connexion. Vérifiez vos identifiants et réessayez.
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus === "success" && (
                  <Alert className="max-w-2xl mx-auto border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Connexion réussie ! {selectedProvider.name} est maintenant connecté.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center space-x-4">
                  <Button variant="outline" size="lg" onClick={() => setSelectedProvider(null)}>
                    Annuler
                  </Button>
                  <Button 
                    size="lg"
                    onClick={handleConnect}
                    disabled={isConnecting || connectionStatus === "success"}
                    className="min-w-[180px]"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connexion...
                      </>
                    ) : connectionStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Connecté
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
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
