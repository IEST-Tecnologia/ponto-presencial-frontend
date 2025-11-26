import { KeycloakClient } from "@/lib/auth/keycloak";
import { TokenManager } from "@/lib/auth/tokens";
import { NextRequest, NextResponse } from "next/server";
import { getKeycloakConfig } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  const keycloak = new KeycloakClient(getKeycloakConfig());
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    // Exchange code for tokens
    const tokens = await keycloak.exchangeCodeForTokens(code);

    // Parse return URL from state
    let returnUrl = "/";
    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        returnUrl = stateData.returnUrl || "/";
      } catch {
        // Invalid state, use default
      }
    }

    // Create response with redirect
    const response = NextResponse.redirect(new URL(returnUrl, request.url));

    // Set tokens in cookies
    TokenManager.setTokens(response, tokens);

    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
