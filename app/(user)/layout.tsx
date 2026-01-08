import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  return (
    <>
      <Header />
      <main className="flex-1 min-h-0 bg-zinc-50 overflow-y-auto flex flex-col items-center">
        <div className="flex flex-col w-full bg-zinc-50 min-h-full items-center py-4 px-4 relative">
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
