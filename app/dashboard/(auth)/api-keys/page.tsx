import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Key, Plus, Settings, Eye, EyeOff, Copy, Trash2, Calendar } from "lucide-react";

export default function ApiKeysPage() {
  const apiKeys = [
    {
      id: "ak_1234567890",
      name: "OpenAI Production",
      provider: "OpenAI",
      status: "active",
      lastUsed: "Il y a 2h",
      created: "15 Nov 2024",
      usage: "2,340 requêtes",
      masked: "sk-...abc123"
    },
    {
      id: "ak_0987654321", 
      name: "Anthropic Claude",
      provider: "Anthropic",
      status: "active",
      lastUsed: "Il y a 1h",
      created: "10 Nov 2024",
      usage: "1,890 requêtes",
      masked: "sk-ant-...def456"
    },
    {
      id: "ak_1122334455",
      name: "Google AI - Dev",
      provider: "Google",
      status: "inactive",
      lastUsed: "Il y a 5 jours",
      created: "5 Nov 2024",
      usage: "450 requêtes",
      masked: "AIza...ghi789"
    },
    {
      id: "ak_5566778899",
      name: "AWS Bedrock",
      provider: "AWS",
      status: "active",
      lastUsed: "Il y a 6h",
      created: "1 Nov 2024",
      usage: "680 requêtes", 
      masked: "AKIA...jkl012"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      expired: "bg-red-100 text-red-800 border-red-200"
    };
    
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getProviderColor = (provider: string) => {
    const colors = {
      OpenAI: "text-green-600",
      Anthropic: "text-blue-600",
      Google: "text-yellow-600",
      AWS: "text-orange-600"
    };
    
    return colors[provider as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clés API</h1>
          <p className="text-muted-foreground">
            Gérez vos clés d'authentification pour les services IA et cloud
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une clé API
        </Button>
      </div>

      {/* Statistiques des clés API */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clés</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Clés configurées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <Key className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-muted-foreground">
              En cours d'utilisation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Total</CardTitle>
            <Key className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.36K</div>
            <p className="text-xs text-muted-foreground">
              Requêtes ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiration</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-xs text-muted-foreground">
              Clés expirant bientôt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clés API */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Clés API configurées</h3>
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className={`h-5 w-5 ${getProviderColor(apiKey.provider)}`} />
                  <div>
                    <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{apiKey.provider}</span>
                      <span>•</span>
                      <span>ID: {apiKey.id}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant="outline"
                  className={getStatusBadge(apiKey.status)}
                >
                  {apiKey.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Clé masquée */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <EyeOff className="h-4 w-4 text-gray-500" />
                  <code className="text-sm font-mono">{apiKey.masked}</code>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Créée le:</span>
                  <p className="font-medium">{apiKey.created}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Dernière utilisation:</span>
                  <p className="font-medium">{apiKey.lastUsed}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Usage ce mois:</span>
                  <p className="font-medium">{apiKey.usage}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Statut:</span>
                  <p className={`font-medium ${apiKey.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {apiKey.status === 'active' ? 'Fonctionnelle' : 'Inactive'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2 border-t">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurer
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir l'usage
                </Button>
                <Button variant="outline" size="sm">
                  Tester la connexion
                </Button>
                <Button variant="destructive" size="sm" className="ml-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guide de configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Guide de configuration</CardTitle>
          <CardDescription>
            Comment configurer vos clés API pour chaque fournisseur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-600 mb-2">OpenAI</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Obtenez votre clé sur platform.openai.com
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Format: sk-...</li>
                <li>• Permissions: API access</li>
                <li>• Limite: Selon votre plan</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">Anthropic</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Console Anthropic pour Claude
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Format: sk-ant-...</li>
                <li>• Modèles: Claude-3, Claude-2</li>
                <li>• Rate limits: Variables</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-yellow-600 mb-2">Google AI</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Google AI Studio ou Cloud Console
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Format: AIza...</li>
                <li>• Modèles: Gemini Pro, PaLM</li>
                <li>• Quotas: Par projet</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-orange-600 mb-2">AWS Bedrock</h4>
              <p className="text-sm text-muted-foreground mb-2">
                AWS Console - Service Bedrock
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Format: AKIA...</li>
                <li>• Région: us-east-1</li>
                <li>• IAM: Permissions Bedrock</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
