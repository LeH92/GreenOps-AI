"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface GoogleAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  isLoading: boolean;
}

export function useGoogleAuth(): GoogleAuthTokens {
  const { data: session, status } = useSession();
  const [tokens, setTokens] = useState<GoogleAuthTokens>({
    accessToken: null,
    refreshToken: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (status === "loading") {
      setTokens(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (status === "unauthenticated") {
      setTokens({
        accessToken: null,
        refreshToken: null,
        error: "Not authenticated",
        isLoading: false,
      });
      return;
    }

    if (session) {
      setTokens({
        accessToken: session.accessToken || null,
        refreshToken: session.refreshToken || null,
        error: session.error || null,
        isLoading: false,
      });
    }
  }, [session, status]);

  return tokens;
}

// Hook pour faire des appels API Google Cloud avec le token d'accès
export function useGoogleCloudAPI() {
  const { accessToken, error, isLoading } = useGoogleAuth();

  const callGoogleAPI = async (endpoint: string, options: RequestInit = {}) => {
    if (!accessToken) {
      throw new Error("No access token available");
    }

    if (error) {
      throw new Error(`Authentication error: ${error}`);
    }

    const response = await fetch(`https://www.googleapis.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  return {
    callGoogleAPI,
    accessToken,
    error,
    isLoading,
  };
}
