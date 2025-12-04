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

interface AttendanceResponse {
  date: string;
  hasAttendance: boolean;
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

/**
 * Fetches user IP from multiple external services for reliability
 * Tries services in order and returns the first successful result
 */
async function getUserIp(): Promise<string | null> {
  const IP_SERVICES = [
    { url: "https://api.ipify.org?format=json", field: "ip" },
    { url: "https://api.my-ip.io/v2/ip.json", field: "ip" },
    { url: "https://ipapi.co/json/", field: "ip" },
  ];

  for (const service of IP_SERVICES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const response = await fetch(service.url, {
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const ip = data[service.field];
        if (ip) {
          console.log(`IP fetched from ${service.url}:`, ip);
          return ip;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch IP from ${service.url}:`, error);
      continue; // Try next service
    }
  }

  console.error("All IP services failed");
  return null;
}

// ============================================================================
// Public API
// ============================================================================

export async function validateLocation(
  lat: number,
  long: number,
  accuracy: number
): Promise<ValidResponse | null> {
  // Fetch user IP from external services
  const ip = await getUserIp();

  const payload = {
    latitude: lat,
    longitude: long,
    accuracy: accuracy,
    ip: ip || undefined, // Include IP if available, otherwise omit
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
  coordinates: Coordinates,
  officeId: string
): Promise<TimeRecord> {
  const ip = await getUserIp();

  const payload = {
    coordinates,
    officeId,
    date: new Date().toISOString(),
    ip: ip || undefined,
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

  const response = await apiFetch<AttendanceResponse>(
    `/timerecords/check-attendance?date=${todayStr}`,
    { method: "GET" },
    "Failed to check today's records"
  );

  if (!response) {
    return false;
  }

  return response.hasAttendance;
}
