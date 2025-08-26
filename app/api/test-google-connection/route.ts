import { NextRequest, NextResponse } from "next/server";
import { testGoogleCloudConnection } from "@/lib/google-cloud-api";

export async function POST(request: NextRequest) {
  try {
    const { projectId, serviceAccountKey } = await request.json();

    if (!projectId || !serviceAccountKey) {
      return NextResponse.json(
        { success: false, error: "Project ID and Service Account Key are required" },
        { status: 400 }
      );
    }

    // Parse the service account key JSON
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid Service Account Key JSON" },
        { status: 400 }
      );
    }

    // For now, we'll simulate a successful connection
    // In a real implementation, you would use the service account to make API calls
    const mockResult = {
      success: true,
      projects: [
        {
          projectId: projectId,
          name: "GreenOps AI Project",
          projectNumber: "123456789",
          lifecycleState: "ACTIVE",
        },
      ],
      billingAccounts: [
        {
          name: "billingAccounts/123456-789ABC-DEF456",
          open: true,
          displayName: "GreenOps AI Billing",
          masterBillingAccount: "",
        },
      ],
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error("Error testing Google Cloud connection:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
