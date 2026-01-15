import { apiFetch } from "./client";

export interface ResponseCompanie {
  data: string[] | null;
}

export async function GetValidCompanies(): Promise<ResponseCompanie> {
  const response = await apiFetch<ResponseCompanie>(
    "/options/companies",
    { method: "GET" },
    "Failed to get companies"
  );

  if (!response) {
    return { data: null };
  }

  return response;
}
