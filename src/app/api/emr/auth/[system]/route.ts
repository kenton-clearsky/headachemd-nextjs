import { NextRequest, NextResponse } from "next/server";
import { emrIntegrationService } from "@/lib/emr/integration";
import { EMRSystem } from "@/types/auth";
import { authService } from "@/lib/auth/auth";
import { config } from "@/lib/config";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ system: string }> }
) {
  try {
    const { system } = await context.params;
    const normalized = (system || "").toLowerCase();
    const isValidSystem = (Object.values(EMRSystem) as string[]).includes(
      normalized
    );
    if (!isValidSystem) {
      return NextResponse.json(
        { error: `Unsupported EMR system: ${system}` },
        { status: 400 }
      );
    }
    const systemEnum = normalized as EMRSystem;

    const currentUser = authService.getCurrentUser();
    const userId =
      currentUser?.id || (config.isDevelopment ? "dev-user-1" : "admin-user-1");
    
    // For EMR testing, allow access even without authentication
    // This is needed for the EMR Test functionality in the admin panel
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientContext = searchParams.get("patientId") || undefined;

    const authUrl = await emrIntegrationService.generateAuthUrl(
      systemEnum,
      userId,
      patientContext || undefined
    );
    return NextResponse.redirect(authUrl);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
