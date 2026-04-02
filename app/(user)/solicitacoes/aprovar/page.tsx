import { GetDepartments, GetGroupRequests } from "@/lib/api/request";
import RequestsList from "./RequestsList";

export interface Params {
  name?: string;
  startDate?: string;
  endDate?: string;
  departments?: string;
  status?: string;
  page?: string;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { name, startDate, endDate, departments, status, page } = await searchParams;

  const params: Params = {
    name,
    startDate,
    endDate,
    departments,
    status,
    page,
  };

  const { data: availableDepartments } = await GetDepartments();

  const selectedDepartments =
    departments && departments !== "all"
      ? departments.split(",").filter(Boolean)
      : [];

  const { data, count, page: currentPage, pageSize, statusCounts } = await GetGroupRequests({
    ...(name && { name }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(selectedDepartments.length && { departments: selectedDepartments }),
    ...(status && { status }),
    ...(page && { page }),
  });

  return (
    <RequestsList
      initialRequests={data}
      count={count}
      page={currentPage}
      pageSize={pageSize}
      statusCounts={statusCounts}
      availableDepartments={availableDepartments ?? []}
      params={params}
    />
  );
}
