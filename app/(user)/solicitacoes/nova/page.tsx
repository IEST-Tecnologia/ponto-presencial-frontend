import { fetchAllTimeRecords } from "@/lib/api/timeRecords";
import Form from "./Form";

export default async function NewRequestPage() {
  const records = await fetchAllTimeRecords();
  return <Form records={records} />;
}
