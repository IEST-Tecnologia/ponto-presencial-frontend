"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface UserInfo {
  sub: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
}

function parseIdToken(idToken: string): UserInfo | null {
  try {
    const payload = idToken.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as UserInfo;
  } catch {
    return null;
  }
}

export async function requireAuth(returnUrl: string = "/") {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  return accessToken;
}

export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  return { accessToken };
}

export async function getUserInfo(): Promise<UserInfo | null> {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return null;
  }

  return parseIdToken(idToken);
}
