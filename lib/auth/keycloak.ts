// lib/auth/keycloak.ts
import { jwtVerify, importJWK } from "jose";
import { TokenSet } from "./tokens";

export interface KeycloakConfig {
  realm: string;
  clientId: string;
  clientSecret: string;
  serverUrl: string;
  redirectUri: string;
}

export class KeycloakClient {
  private config: KeycloakConfig;
  private jwksCache: Map<string, any> = new Map();
  private jwksCacheExpiry: number = 0;

  constructor(config: KeycloakConfig) {
    this.config = config;
  }

  // Fetch JWKS (JSON Web Key Set) from Keycloak
  private async fetchJWKS(): Promise<any> {
    const now = Date.now();

    // Cache JWKS for 1 hour
    if (this.jwksCacheExpiry > now && this.jwksCache.size > 0) {
      return Array.from(this.jwksCache.values());
    }

    const response = await fetch(
      `${this.config.serverUrl}/realms/${this.config.realm}/protocol/openid-connect/certs`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch JWKS: " + response.statusText);
    }

    const jwks = await response.json();

    // Cache the keys
    this.jwksCache.clear();
    for (const key of jwks.keys) {
      this.jwksCache.set(key.kid, key);
    }

    // Set cache expiry to 1 hour from now
    this.jwksCacheExpiry = now + 60 * 60 * 1000;

    return jwks.keys;
  }

  // Verify JWT token signature
  async verifyToken(token: string): Promise<any> {
    try {
      // Fetch JWKS
      await this.fetchJWKS();

      // Decode header to get kid (key ID)
      const [headerB64] = token.split(".");
      const header = JSON.parse(Buffer.from(headerB64, "base64").toString());
      const kid = header.kid;

      if (!kid) {
        throw new Error("Token header missing kid");
      }

      // Get the public key from cache
      const jwk = this.jwksCache.get(kid);
      if (!jwk) {
        throw new Error(`Public key not found for kid: ${kid}`);
      }

      // Import the JWK
      const publicKey = await importJWK(jwk, jwk.alg);

      // Verify the token
      const { payload } = await jwtVerify(token, publicKey, {
        issuer: `${this.config.serverUrl}/realms/${this.config.realm}`,
        audience: this.config.clientId,
      });

      return payload;
    } catch (error) {
      console.error("JWT verification failed:", error);
      throw error;
    }
  }

  // Gera URL de login
  getLoginUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: "openid profile email",
      ...(state && { state }),
    });

    return `${this.config.serverUrl}/realms/${this.config.realm}/protocol/openid-connect/auth?${params}`;
  }

  // Troca código por tokens
  async exchangeCodeForTokens(code: string): Promise<TokenSet> {
    const response = await fetch(
      `${this.config.serverUrl}/realms/${this.config.realm}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "Failed to exchange code for tokens: " + response.statusText
      );
    }

    return response.json();
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<TokenSet> {
    const response = await fetch(
      `${this.config.serverUrl}/realms/${this.config.realm}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to refresh tokens: " + response.statusText);
    }

    return response.json();
  }

  // Logout
  async logout(idToken: string): Promise<void> {
    await fetch(
      `${this.config.serverUrl}/realms/${this.config.realm}/protocol/openid-connect/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          id_token_hint: idToken,
        }),
      }
    );
  }
}
