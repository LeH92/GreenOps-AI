"use client";

import { useState, useEffect } from "react";
import { useGoogleAuth } from "./useGoogleAuth";
import { BillingAccount, Project, ServiceCost } from "@/lib/google";

interface UseGoogleCloudDataReturn {
  // Billing Accounts
  billingAccounts: BillingAccount[];
  billingAccountsLoading: boolean;
  billingAccountsError: string | null;
  fetchBillingAccounts: () => Promise<void>;

  // Projects
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  fetchProjects: () => Promise<void>;

  // Costs
  costs: ServiceCost[];
  costsLoading: boolean;
  costsError: string | null;
  fetchCosts: (path: string) => Promise<void>;
}

export function useGoogleCloudData(): UseGoogleCloudDataReturn {
  const { accessToken, error: authError, isLoading: authLoading } = useGoogleAuth();
  
  // Billing Accounts state
  const [billingAccounts, setBillingAccounts] = useState<BillingAccount[]>([]);
  const [billingAccountsLoading, setBillingAccountsLoading] = useState(false);
  const [billingAccountsError, setBillingAccountsError] = useState<string | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Costs state
  const [costs, setCosts] = useState<ServiceCost[]>([]);
  const [costsLoading, setCostsLoading] = useState(false);
  const [costsError, setCostsError] = useState<string | null>(null);

  // Fetch billing accounts
  const fetchBillingAccounts = async () => {
    if (!accessToken) {
      setBillingAccountsError("No access token available");
      return;
    }

    setBillingAccountsLoading(true);
    setBillingAccountsError(null);

    try {
      const response = await fetch("/api/gcp/billing-accounts");
      const data = await response.json();

      if (data.success) {
        setBillingAccounts(data.data);
      } else {
        setBillingAccountsError(data.error || "Failed to fetch billing accounts");
      }
    } catch (error) {
      setBillingAccountsError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setBillingAccountsLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    if (!accessToken) {
      setProjectsError("No access token available");
      return;
    }

    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const response = await fetch("/api/gcp/projects");
      const data = await response.json();

      if (data.success) {
        setProjects(data.data);
      } else {
        setProjectsError(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      setProjectsError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch costs
  const fetchCosts = async (path: string) => {
    if (!accessToken) {
      setCostsError("No access token available");
      return;
    }

    if (!path) {
      setCostsError("Path parameter is required");
      return;
    }

    setCostsLoading(true);
    setCostsError(null);

    try {
      const response = await fetch(`/api/gcp/costs?path=${encodeURIComponent(path)}`);
      const data = await response.json();

      if (data.success) {
        setCosts(data.data);
      } else {
        setCostsError(data.error || "Failed to fetch costs");
      }
    } catch (error) {
      setCostsError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setCostsLoading(false);
    }
  };

  // Auto-fetch billing accounts and projects when authenticated
  useEffect(() => {
    if (accessToken && !authLoading) {
      fetchBillingAccounts();
      fetchProjects();
    }
  }, [accessToken, authLoading]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setBillingAccountsError(authError);
      setProjectsError(authError);
      setCostsError(authError);
    }
  }, [authError]);

  return {
    // Billing Accounts
    billingAccounts,
    billingAccountsLoading,
    billingAccountsError,
    fetchBillingAccounts,

    // Projects
    projects,
    projectsLoading,
    projectsError,
    fetchProjects,

    // Costs
    costs,
    costsLoading,
    costsError,
    fetchCosts,
  };
}
