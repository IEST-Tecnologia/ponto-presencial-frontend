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
  approver: string | null;
  reason: string;
  request_date: string;
  user_id: string;
  user?: string;
  created_at: Date;
  approved_at: Date;
}

export interface CreateRequestResponse {
  data: Request | null;
  success: boolean;
  errorMessage: string;
}

export async function CreateRequest(
  reason: string,
  requestDate: string
): Promise<CreateRequestResponse> {
  const payload = {
    reason: reason,
    request_date: requestDate,
  };

  try {
    const response = await apiFetch<CreateRequestResponse>(
      "/requests",
      { method: "POST", body: JSON.stringify(payload) },
      "Failed to create a Request"
    );

    if (!response) {
      return {
        data: null,
        success: false,
        errorMessage: "Erro ao criar essa solicitação",
      };
    }

    revalidatePath("/solicitacoes");
    return response;
  } catch (error) {
    // Tenta extrair o objeto JSON da mensagem de erro
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Procura por JSON na mensagem de erro
      const jsonMatch = errorMessage.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const errorObj = JSON.parse(jsonMatch[0]);
          return errorObj as CreateRequestResponse;
        } catch {
          // Se não conseguir fazer parse, retorna erro padrão
        }
      }
    }

    return {
      data: null,
      success: false,
      errorMessage: "Erro ao criar essa solicitação",
    };
  }
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

export async function GetGroupRequests(): Promise<Request[]> {
  const response = await apiFetch<Request[]>(
    "/requests/list/group",
    { method: "GET" },
    "Failed to get requests"
  );

  if (!response) {
    return [];
  }

  return response;
}

export async function GetRequestById(id: string): Promise<Request | null> {
  const response = await apiFetch<Request>(
    `/requests/${id}`,
    { method: "GET" },
    "Failed to get requests"
  );

  if (!response) {
    return null;
  }

  return response;
}

export async function UpdateRequestStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<Request | null> {
  const payload = {
    status: status,
  };

  const response = await apiFetch<Request>(
    `/requests/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    "Failed to update request status"
  );

  if (!response) {
    return null;
  }

  revalidatePath(`/solicitacoes/aprovar/${id}`);
  revalidatePath("/solicitacoes/aprovar");
  return response;
}
