// Utilitaires pour les appels API Google Cloud

export interface GoogleCloudProject {
  projectId: string;
  name: string;
  projectNumber: string;
  lifecycleState: string;
}

export interface GoogleCloudBillingAccount {
  name: string;
  open: boolean;
  displayName: string;
  masterBillingAccount: string;
}

export interface GoogleCloudCostData {
  cost: number;
  currency: string;
  date: string;
  service: string;
}

// Fonction pour récupérer les projets Google Cloud
export async function getGoogleCloudProjects(accessToken: string): Promise<GoogleCloudProject[]> {
  const response = await fetch("https://cloudresourcemanager.googleapis.com/v1/projects", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  const data = await response.json();
  return data.projects || [];
}

// Fonction pour récupérer les comptes de facturation
export async function getGoogleCloudBillingAccounts(accessToken: string): Promise<GoogleCloudBillingAccount[]> {
  const response = await fetch("https://cloudbilling.googleapis.com/v1/billingAccounts", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch billing accounts: ${response.statusText}`);
  }

  const data = await response.json();
  return data.billingAccounts || [];
}

// Fonction pour récupérer les données de coûts
export async function getGoogleCloudCosts(
  accessToken: string,
  billingAccount: string,
  startDate: string,
  endDate: string
): Promise<GoogleCloudCostData[]> {
  const response = await fetch(
    `https://billingbudgets.googleapis.com/v1/billingAccounts/${billingAccount}/budgets`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch costs: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Simulation de données de coûts pour l'exemple
  return [
    {
      cost: 1250.50,
      currency: "USD",
      date: startDate,
      service: "Compute Engine",
    },
    {
      cost: 450.25,
      currency: "USD",
      date: startDate,
      service: "Cloud Storage",
    },
    {
      cost: 200.75,
      currency: "USD",
      date: startDate,
      service: "BigQuery",
    },
  ];
}

// Fonction pour tester la connexion Google Cloud
export async function testGoogleCloudConnection(accessToken: string): Promise<{
  success: boolean;
  projects?: GoogleCloudProject[];
  billingAccounts?: GoogleCloudBillingAccount[];
  error?: string;
}> {
  try {
    const [projects, billingAccounts] = await Promise.all([
      getGoogleCloudProjects(accessToken),
      getGoogleCloudBillingAccounts(accessToken),
    ]);

    return {
      success: true,
      projects,
      billingAccounts,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
