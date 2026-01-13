import { verifyUserPermission } from '@/lib/permission'
import { redirect } from 'next/navigation';
import { ReactNode } from 'react'

export default async function RequestLayout({ children } : { children: ReactNode }) {
  const permission = await verifyUserPermission("request");
  if(!permission) redirect('/solicitacoes')

  return (
    children
  )
}
