import { verifyUserPermission } from "@/lib/permission";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function RequestLayout({
  children,
}: {
  children: ReactNode;
}) {
  const requestPermission = await verifyUserPermission("request");
  const dpPermission = await verifyUserPermission("dp");
  const permission = requestPermission || dpPermission;
  if (!permission) redirect("/solicitacoes");

  return children;
}
