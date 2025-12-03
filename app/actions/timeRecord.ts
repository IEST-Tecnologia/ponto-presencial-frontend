"use server";

import { createTimeRecord } from "@/lib/api/timeRecords";
import { revalidatePath } from "next/cache";

export async function registerTimeRecord(coordinates: {
  lat: number;
  lng: number;
}, officeId: string) {
  const record = await createTimeRecord(coordinates, officeId);
  revalidatePath("/");
  revalidatePath("/records");
  return record;
}
