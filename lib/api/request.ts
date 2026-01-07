"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "./client";

interface CreateRequest {
  reason: string;
  requestDate: string;
}

export interface Request {
  id: string;
  status: "pending" | "rejected" | "approved";
  approver: string;
  reason: string;
  request_date: string;
  user_id: string;
  created_at: Date;
  approved_at: Date;
}

export async function CreateRequest(
  reason: string,
  requestDate: string
): Promise<Request | null> {
  const payload = {
    reason: reason,
    request_date: requestDate,
  };

  const response = await apiFetch<Request | null>(
    "/requests",
    { method: "POST", body: JSON.stringify(payload) },
    "Failed to create a Request"
  );

  if (!response) {
    return null;
  }

  revalidatePath("/solicitacoes");
  return response;
}

export async function GetUserRequests(): Promise<Request[]> {
  const response = await apiFetch<Request[]>(
    "/requests/user",
    { method: "GET" },
    "Failed to get requests"
  );

  if (!response) {
    return [];
  }

  revalidatePath("/solicitacoes");
  return response;
}
