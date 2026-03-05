import { GetDepartments, GetGroupRequests } from "@/lib/api/request";
import RequestsList from "./RequestsList";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    startDate?: string;
    endDate?: string;
    departments?: string;
  }>;
}) {
  const { name, startDate, endDate, departments } = await searchParams;

  const { data: availableDepartments } = await GetDepartments();

  const selectedDepartments =
    departments && departments !== "all"
      ? departments.split(",").filter(Boolean)
      : [];

  const requests = await GetGroupRequests({
    ...(name && { name }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(selectedDepartments.length && { departments: selectedDepartments }),
  });

  return (
    <RequestsList
      initialRequests={requests}
      availableDepartments={availableDepartments ?? []}
    />
  );
}
