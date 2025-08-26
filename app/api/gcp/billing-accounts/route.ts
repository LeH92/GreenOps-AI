import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { listBillingAccounts, getOAuthClient } from "@/lib/google";

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

    // Lister les comptes de facturation
    const billingAccounts = await listBillingAccounts(oauth);

    return NextResponse.json({
      success: true,
      data: billingAccounts,
      count: billingAccounts.length,
    });

  } catch (error) {
    console.error("Error in billing-accounts API:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
