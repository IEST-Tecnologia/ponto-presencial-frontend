import { GetGroupRequests } from "@/lib/api/request";
import RequestsList from "./RequestsList";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; startDate?: string; endDate?: string }>;
}) {
  const { name, startDate, endDate } = await searchParams;

  const requests = await GetGroupRequests({
    ...(name && { name }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  return <RequestsList initialRequests={requests} />;
}
