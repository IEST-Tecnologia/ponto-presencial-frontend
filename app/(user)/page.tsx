import TimeRegister from "@/components/TimeRegister";
import { getUserInfo } from "@/lib/auth/session";
import { hasRecordToday } from "@/lib/api/timeRecords";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/components/Loading";

async function TimeRegisterWrapper() {
  const user = await getUserInfo();
  if (!user) redirect("/login");
  const displayName =
    user?.given_name ||
    user?.name ||
    user?.preferred_username ||
    "Usuário teste";
  const alreadyRegistered = await hasRecordToday();

  return (
    <TimeRegister
      userName={displayName}
      alreadyRegistered={alreadyRegistered}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <TimeRegisterWrapper />
    </Suspense>
  );
}
