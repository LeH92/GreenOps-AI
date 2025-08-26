import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/company-logo";

export function LogosShowcase() {
  const companies = [
    { name: "Amazon Web Services", company: "aws" as const, description: "Leader du cloud computing" },
    { name: "Google Cloud Platform", company: "google-cloud" as const, description: "Plateforme cloud de Google" },
    { name: "Microsoft Azure", company: "azure" as const, description: "Cloud enterprise de Microsoft" },
    { name: "OpenAI", company: "openai" as const, description: "Pionnier de l'IA générative" },
    { name: "Anthropic", company: "anthropic" as const, description: "Claude et Constitutional AI" },
    { name: "Google AI", company: "google-ai" as const, description: "Gemini et modèles avancés" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logos des Entreprises</CardTitle>
        <CardDescription>
          Tous les logos SVG officiels des fournisseurs cloud et IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div key={company.company} className="p-4 border rounded-lg text-center space-y-3">
              <div className="flex justify-center">
                <CompanyLogo company={company.company} size={48} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{company.name}</h4>
                <p className="text-xs text-muted-foreground">{company.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
