import { TimeRecord } from "@/models/timeRecord";
import { apiFetch } from "./client";
import { getTodayDateString } from "@/utils/date";

// ============================================================================
// Types
// ============================================================================

interface TimeRecordDTO {
  id: string;
  date: string;
  latitude: number;
  longitude: number;
  user_id: string;
  request_id: string;
  created_at: string;
}

interface ValidResponse {
  valid: boolean;
  officeId: string;
}

interface PaginatedResponse<T> {
  data: T[] | null;
  page: number;
  pageSize: number;
  total: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// ============================================================================
// Utilities
// ============================================================================

function dtoToTimeRecord(dto: TimeRecordDTO): TimeRecord {
  return {
    ...dto,
    coordinates: {
      lat: dto.latitude,
      lng: dto.longitude,
    },
    date: new Date(dto.date),
    createdAt: new Date(dto.created_at),
    userID: dto.user_id,
    requestID: dto.request_id,
  };
}

// ============================================================================
// Public API
// ============================================================================

export async function validateLocation(
  lat: number,
  long: number,
  accuracy: number,
): Promise<ValidResponse | null> {
  const payload = {
    latitude: lat,
    longitude: long,
    accuracy: accuracy,
  };
  const response = await apiFetch<ValidResponse>(
    "/timerecords/validate-location",
    { method: "POST", body: JSON.stringify(payload) },
    "Failed to validate location"
  );

  if (!response.valid) {
    return null;
  }

  return response;
}

export async function fetchAllTimeRecords(): Promise<TimeRecord[]> {
  const response = await apiFetch<PaginatedResponse<TimeRecordDTO>>(
    "/timerecords",
    { method: "GET" },
    "Failed to fetch records"
  );

  if (!response.data?.length) {
    return [];
  }

  return response.data.map(dtoToTimeRecord);
}

export async function createTimeRecord(
  coordinates: Coordinates
): Promise<TimeRecord> {
  const payload = {
    coordinates,
    date: new Date().toISOString(),
  };

  const data = await apiFetch<TimeRecordDTO>(
    "/timerecords",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Failed to create record"
  );

  return dtoToTimeRecord(data);
}

export async function hasRecordToday(): Promise<boolean> {
  const todayStr = getTodayDateString();

  const response = await apiFetch<PaginatedResponse<TimeRecordDTO>>(
    `/timerecords?startDate=${todayStr}&endDate=${todayStr}`,
    { method: "GET" },
    "Failed to check today's records"
  );

  return (response.data?.length ?? 0) > 0;
}
