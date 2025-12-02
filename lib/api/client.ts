"use server";

import { cookies } from "next/headers";
import { getUserInfo } from "@/lib/auth/session";

// ============================================================================
// Constants
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// Utilities
// ============================================================================

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const userInfo = await getUserInfo();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (userInfo?.sub) {
    headers["X-User-ID"] = userInfo.sub;
  }

  return headers;
}

async function handleApiError(
  response: Response,
  operation: string
): Promise<never> {
  let errorMessage = response.statusText;

  try {
    const errorData = await response.json();
    console.error("API Error:", errorData);

    // Extract error message from {"error": string} structure
    if (errorData && typeof errorData.error === "string") {
      errorMessage = errorData.error;
    } else {
      errorMessage = JSON.stringify(errorData);
    }
  } catch {
    // If response is not JSON, use statusText
  }

  throw new Error(`${operation}: ${errorMessage}`);
}

// ============================================================================
// API Client
// ============================================================================

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit,
  operation: string
): Promise<T> {
  if (!API_URL) {
    throw new Error("Backend URL not configured");
  }

  const url = `${API_URL}${endpoint}`;
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
    cache: "no-store",
  });

  if (!response.ok) {
    await handleApiError(response, operation);
  }

  return response.json();
}
