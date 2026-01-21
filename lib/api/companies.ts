'use server'

import { apiFetch } from "./client";

export interface ResponseCompanie {
  data: string[] | null;
}

export interface User {
  id: string;
  name: string;
}

export interface ResponseUsers {
  data: User[] | null;
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

export async function GetUsersByCompany(company: string): Promise<ResponseUsers> {
  const response = await apiFetch<ResponseUsers>(
    `/users/company/${encodeURIComponent(company)}`,
    { method: "GET" },
    "Failed to get users by company"
  );

  if (!response) {
    return { data: null };
  }

  return response;
}
