import { GetDepartments, GetGroupRequests } from "@/lib/api/request";
import RequestsList from "./RequestsList";

export interface Params {
  name?: string;
  startDate?: string;
  endDate?: string;
  departments?: string;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { name, startDate, endDate, departments } = await searchParams;

  const params: Params = {
    name,
    startDate,
    endDate,
    departments,
  };

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
      params={params}
    />
  );
}
