import { verifyUserPermission } from "@/lib/permission";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function RequestLayout({
  children,
}: {
  children: ReactNode;
}) {
  const dpPermission = await verifyUserPermission("dp");
  if (!dpPermission) redirect("/solicitacoes");

  return children;
}
