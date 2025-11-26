import { NextRequest, NextResponse } from "next/server";
import { KeycloakClient, KeycloakConfig } from "@/lib/auth/keycloak";
import { TokenManager } from "@/lib/auth/tokens";
import { getKeycloakConfig } from "@/lib/auth/config";

export async function POST(request: NextRequest) {
  const keycloak = new KeycloakClient(getKeycloakConfig());
  const idToken = request.cookies.get("id_token")?.value;

  // Limpa cookies localmente primeiro
  const response = NextResponse.json({ success: true });
  TokenManager.clearTokens(response);

  // Tenta fazer logout no Keycloak (best effort)
  if (idToken) {
    try {
      await keycloak.logout(idToken);
    } catch (error) {
      console.error("Keycloak logout error:", error);
      // Continue anyway - local cookies are already cleared
      // Client will still be logged out locally even if Keycloak logout fails
    }
  }

  return response;
}
