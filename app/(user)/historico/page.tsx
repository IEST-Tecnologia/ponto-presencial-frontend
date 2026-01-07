import { fetchAllTimeRecords } from "@/lib/api/timeRecords";
import Calendar from "@/components/Calendar";

export default async function RecordsPage() {
  const records = await fetchAllTimeRecords();

  return (
    <div className="w-full max-w-md space-y-4 px-4">
      <h2 className="text-xl font-bold text-center text-gray-800">
        Registros de Ponto
      </h2>
      <Calendar records={records} />
    </div>
  );
}
