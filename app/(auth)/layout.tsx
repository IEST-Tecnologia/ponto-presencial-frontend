import { ReactNode } from "react";
import Image from "next/image";
import Logo from "@/assets/logo.svg";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Layout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect("/");
  return (
    <div className="h-screen w-full overflow-y-auto px-4 lg:px-0 flex flex-col justify-center">
      <Image
        className="mx-auto my-10"
        width={50}
        height={20}
        src={Logo}
        alt="logo"
        priority={true}
      />
      <div className="max-w-[480px] mx-auto mb-20 bg-white  px-4  py-6 flex flex-col items-center lg:w-1/2 lg:px-10">
        {children}
      </div>
    </div>
  );
}
