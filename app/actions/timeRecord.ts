"use server";

import { createTimeRecord } from "@/lib/api/timeRecords";
import { revalidatePath } from "next/cache";

export async function registerTimeRecord(coordinates: {
  lat: number;
  lng: number;
}) {
  const record = await createTimeRecord(coordinates);
  revalidatePath("/");
  revalidatePath("/records");
  return record;
}
