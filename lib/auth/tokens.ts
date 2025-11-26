// lib/auth/tokens.ts
import { NextResponse } from "next/server";

export interface TokenSet {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

export class TokenManager {
  static setTokens(response: NextResponse, tokens: TokenSet) {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    response.cookies.set("access_token", tokens.access_token, {
      ...COOKIE_OPTIONS,
      expires: expiresAt,
    });

    response.cookies.set("id_token", tokens.id_token, {
      ...COOKIE_OPTIONS,
      expires: expiresAt,
    });

    // Refresh token com expiração maior (ex: 30 dias)
    response.cookies.set("refresh_token", tokens.refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  static clearTokens(response: NextResponse) {
    const expiredDate = new Date(0);

    response.cookies.set("access_token", "", {
      ...COOKIE_OPTIONS,
      expires: expiredDate,
    });

    response.cookies.set("id_token", "", {
      ...COOKIE_OPTIONS,
      expires: expiredDate,
    });

    response.cookies.set("refresh_token", "", {
      ...COOKIE_OPTIONS,
      expires: expiredDate,
    });
  }
}
