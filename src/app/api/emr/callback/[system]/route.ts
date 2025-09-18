import { NextRequest, NextResponse } from "next/server";
import { emrIntegrationService } from "@/lib/emr/integration";
import { EMRSystem } from "@/types/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ system: string }> }
) {
  try {
    const { system } = await context.params;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

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

    // Exchange authorization code for tokens and persist session inside the service
    await emrIntegrationService.exchangeCodeForToken(systemEnum, code, state);

    // Redirect to a post-auth page (could be a settings page or dashboard)
    const redirectUrl = new URL("/admin?emr=connected", request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const message = (error as Error).message || "Token exchange failed";
    // Redirect with error; could also render a small error page
    const errorUrl = new URL(`/admin?emr=error&message=${encodeURIComponent(message)}`, request.url);
    return NextResponse.redirect(errorUrl);
  }
}
