import { KeycloakClient } from "@/lib/auth/keycloak";
import { NextRequest, NextResponse } from "next/server";
import { getKeycloakConfig } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  const keycloak = new KeycloakClient(getKeycloakConfig());
  const { searchParams } = new URL(request.url);

  const returnUrl = searchParams.get("returnUrl") || "/";

  // Salva returnUrl em um cookie temporário ou state
  const state = btoa(JSON.stringify({ returnUrl }));
  const loginUrl = keycloak.getLoginUrl(state);

  return NextResponse.redirect(loginUrl);
}
