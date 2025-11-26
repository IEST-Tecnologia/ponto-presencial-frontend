// lib/auth/config.ts
import { KeycloakConfig } from "./keycloak";

// Configuração server-side segura (não exposta ao client)
export function getKeycloakConfig(): KeycloakConfig {
  return {
    realm: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_REALM!,
    clientId: process.env.AUTH_KEYCLOAK_ID!,
    clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
    serverUrl: process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_URL!,
    redirectUri: process.env.AUTH_KEYCLOAK_REDIRECT_URI!,
  };
}
