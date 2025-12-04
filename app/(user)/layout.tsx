import BottomNav from "@/components/BottomNav";
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
    <div className="flex flex-col w-full bg-zinc-50 h-full">{children}</div>
  );
}
