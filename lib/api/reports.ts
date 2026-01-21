"use server";

import { cookies } from "next/headers";
import { getUserInfo } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export async function downloadAttendanceReport(
  startDate: string,
  endDate: string,
  company: string,
  users?: string[]
): Promise<{
  success: boolean;
  data?: Blob;
  error?: string;
  filename?: string;
}> {
  if (!API_URL) {
    return { success: false, error: "Backend URL not configured" };
  }

  try {
    const url = `${API_URL}/reports/attendance`;
    const headers = await getAuthHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      cache: "no-store",
      body: JSON.stringify({
        startDate,
        endDate,
        company,
        ...(users && users.length > 0 && { users }),
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData.error === "string") {
          errorMessage = errorData.error;
        }
      } catch {
        // If response is not JSON, use statusText
      }
      return { success: false, error: errorMessage };
    }

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "relatorio-presenca.xlsx";

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=(.+)/);
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }

    const blob = await response.blob();
    return { success: true, data: blob, filename };
  } catch (error) {
    console.error("Failed to download attendance report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
