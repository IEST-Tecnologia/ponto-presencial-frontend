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
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    return decoded as UserInfo;
  } catch (error) {
    console.log('failed parse', error)
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
