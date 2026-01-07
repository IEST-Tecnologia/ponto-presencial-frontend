import { GetGroupRequests } from "@/lib/api/request";
import RequestsList from "./RequestsList";

export default async function Page() {
  const requests = await GetGroupRequests();

  return <RequestsList initialRequests={requests} />;
}
