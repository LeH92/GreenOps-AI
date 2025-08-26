import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { bigQueryCostsWithGoogleApis, getOAuthClient } from "@/lib/google";

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session utilisateur
    const session = await getServerSession();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token available" },
        { status: 401 }
      );
    }

    // Récupérer le paramètre path depuis l'URL
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: "Missing required parameter: path (format: projectId.dataset)" },
        { status: 400 }
      );
    }

    // Valider le format du path
    const pathParts = path.split('.');
    if (pathParts.length !== 2) {
      return NextResponse.json(
        { error: "Invalid path format. Expected: projectId.dataset" },
        { status: 400 }
      );
    }

    // Créer le client OAuth avec les tokens de la session
    const oauth = getOAuthClient(
      session.accessToken,
      session.refreshToken
    );

    // Récupérer les coûts depuis BigQuery
    const costs = await bigQueryCostsWithGoogleApis(oauth, path);

    return NextResponse.json({
      success: true,
      data: costs,
      count: costs.length,
      path: path,
      period: "30 derniers jours",
    });

  } catch (error) {
    console.error("Error in costs API:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
