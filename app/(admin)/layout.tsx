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
    <>
      <Header />
      <div className="h-screen flex items-center justify-center w-full px-4">
        {children}
      </div>
    </>
  );
}
