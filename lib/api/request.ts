"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "./client";

interface CreateRequest {
  reason: string;
  requestDate: string;
}

export interface Departments {
  data: string[];
}

export interface Request {
  id: string;
  status: "pending" | "rejected" | "approved";
  approver: string | null;
  reason: string;
  request_date: string;
  user_id: string;
  user?: string;
  company?: string;
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
  requestDate: string,
): Promise<CreateRequestResponse> {
  const payload = {
    reason: reason,
    request_date: requestDate,
  };

  try {
    const response = await apiFetch<CreateRequestResponse>(
      "/requests",
      { method: "POST", body: JSON.stringify(payload) },
      "Failed to create a Request",
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
    "Failed to get requests",
  );

  if (!response) {
    return [];
  }

  revalidatePath("/solicitacoes");
  return response;
}

interface FilterProps {
  name?: string;
  startDate?: string;
  endDate?: string;
  departments?: string[];
  status?: string;
  page?: string;
}

export interface StatusCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface PaginatedRequests {
  data: Request[];
  count: number;
  page: number;
  pageSize: number;
  statusCounts: StatusCounts;
}

export async function GetGroupRequests(
  filters?: FilterProps,
): Promise<PaginatedRequests> {
  const params = new URLSearchParams();
  params.set("pageSize", "5");

  if (filters?.name) params.set("name", filters.name);
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.departments?.length)
    params.set("departments", filters.departments.join(","));
  if (filters?.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters?.page) params.set("page", filters.page);

  const url = `/requests/list/group?${params.toString()}`;

  const response = await apiFetch<PaginatedRequests>(
    url,
    { method: "GET" },
    "Failed to get requests",
  );

  if (!response) {
    return { data: [], count: 0, page: 1, pageSize: 5, statusCounts: { all: 0, pending: 0, approved: 0, rejected: 0 } };
  }

  return response;
}

export async function GetRequestById(id: string): Promise<Request | null> {
  const response = await apiFetch<Request>(
    `/requests/${id}`,
    { method: "GET" },
    "Failed to get requests",
  );

  if (!response) {
    return null;
  }

  return response;
}

export async function UpdateRequestStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<Request | null> {
  const payload = {
    status: status,
  };

  const response = await apiFetch<Request>(
    `/requests/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    "Failed to update request status",
  );

  if (!response) {
    return null;
  }

  revalidatePath(`/solicitacoes/aprovar/${id}`);
  revalidatePath("/solicitacoes/aprovar");
  return response;
}

export async function GetDepartments(): Promise<Departments> {
  const response = await apiFetch<Departments>(
    "/options/groups",
    { method: "GET" },
    "Failed to get deartments",
  );

  if (!response) {
    return {
      data: [],
    };
  }

  return response;
}
