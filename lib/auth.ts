"use server";
import { currentUser, User } from "@/models/user";

import { cookies } from "next/headers";
import { KeycloakClient } from "./auth/keycloak";
import { getKeycloakConfig } from "./auth/config";

/**
 * Verifies and extracts the current user from the ID token.
 * This function performs cryptographic verification of the JWT signature
 * using Keycloak's public keys (JWKS).
 *
 * @returns The current user object or null if token is invalid/expired
 */
export async function getCurrentUser() {
  const id_token = (await cookies()).get("id_token")?.value;
  if (!id_token) return null;

  try {
    // Initialize Keycloak client for JWT verification
    const config = getKeycloakConfig();
    const keycloak = new KeycloakClient(config);

    // Verify the JWT signature and extract payload
    const decoded = await keycloak.verifyToken(id_token);

    if (!decoded || !decoded.sub) return null;

    // Ensure department is always an array
    let department: string[] = [];
    if (decoded.department) {
      department = Array.isArray(decoded.department)
        ? decoded.department
        : [decoded.department];
    }

    const user: currentUser = {
      id: decoded.sub as string,
      department: department,
      email: decoded.email as string,
      display_name: decoded.name as string,
      birthdate: decoded.birthdate as string,
      image_url: decoded.picture as string,
    };

    return user;
  } catch (error) {
    // JWT verification failed - token is invalid, expired, or tampered
    console.error("Failed to verify ID token:", error);
    return null;
  }
}

/**
 * Verifies the access token without extracting user data.
 * Useful for middleware and API route protection.
 *
 * @returns true if token is valid, false otherwise
 */
export async function verifyAccessToken(): Promise<boolean> {
  const access_token = (await cookies()).get("access_token")?.value;
  if (!access_token) return false;

  try {
    const config = getKeycloakConfig();
    const keycloak = new KeycloakClient(config);
    await keycloak.verifyToken(access_token);
    return true;
  } catch (error) {
    console.error("Access token verification failed:", error);
    return false;
  }
}
