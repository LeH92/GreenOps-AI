import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { listProjects, getOAuthClient } from "@/lib/google";

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

    // Créer le client OAuth avec les tokens de la session
    const oauth = getOAuthClient(
      session.accessToken,
      session.refreshToken
    );

    // Lister les projets
    const projects = await listProjects(oauth);

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    });

  } catch (error) {
    console.error("Error in projects API:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
