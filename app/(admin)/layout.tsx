import Header from "@/components/Header";
import { verifyUserPermission } from "@/lib/permission";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminPermission = await verifyUserPermission("admin");
  if (!adminPermission) redirect("/");
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <main className="flex-1 min-h-0 bg-zinc-50 overflow-y-auto flex flex-col items-center">
        <div className="flex flex-col w-full max-w-md items-center py-6 px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
