import TimeRegister from "@/components/TimeRegister";
import { getUserInfo } from "@/lib/auth/session";
import { hasRecordToday } from "@/lib/api/timeRecords";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUserInfo();
  if (!user) redirect("/login");
  const displayName =
    user?.given_name || user?.name || user?.preferred_username || "Usuário";
  const alreadyRegistered = await hasRecordToday();

  return (
    <TimeRegister
      userName={displayName}
      alreadyRegistered={alreadyRegistered}
    />
  );
}
