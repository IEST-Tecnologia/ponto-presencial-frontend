import { NextRequest, NextResponse } from "next/server";
import { KeycloakClient } from "@/lib/auth/keycloak";
import { TokenManager } from "@/lib/auth/tokens";
import { getKeycloakConfig } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  const keycloak = new KeycloakClient(getKeycloakConfig());
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get("returnUrl") || "/";

  if (!refreshToken) {
    const response = NextResponse.redirect(
      new URL("/api/auth/login", request.url)
    );
    TokenManager.clearTokens(response);
    return response;
  }

  try {
    const newTokens = await keycloak.refreshTokens(refreshToken);
    const response = NextResponse.redirect(new URL(returnUrl, request.url));

    TokenManager.setTokens(response, newTokens);
    return response;
  } catch (error) {
    console.error("refresh error: " + error);
    const response = NextResponse.redirect(
      new URL("/api/auth/login", request.url)
    );
    TokenManager.clearTokens(response);
    return response;
  }
}

export async function POST(request: NextRequest) {
  const keycloak = new KeycloakClient(getKeycloakConfig());
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { error: "No refresh token" },
      { status: 401 }
    );
    TokenManager.clearTokens(response);
    return response;
  }

  try {
    const newTokens = await keycloak.refreshTokens(refreshToken);
    const response = NextResponse.json({ success: true });

    TokenManager.setTokens(response, newTokens);

    return response;
  } catch (error) {
    console.error("refresh error: " + error);
    const response = NextResponse.json(
      { error: "Refresh failed" },
      { status: 401 }
    );
    TokenManager.clearTokens(response);
    return response;
  }
}
