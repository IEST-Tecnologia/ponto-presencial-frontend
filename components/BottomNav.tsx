"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ClockIcon from "@/assets/icons/clock.svg";
import ClipboardIcon from "@/assets/icons/clipboard.svg";

export default function BottomNav() {
  const pathname = usePathname();
  const isRegister = pathname === "/";
  const isRecords = pathname === "/records";

  return (
    <nav className="shrink-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around relative">
        {/* Animated indicator */}
        <div
          className="absolute top-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
          style={{
            width: "50%",
            left: isRegister ? "0%" : "50%",
          }}
        />
        <Link
          href="/"
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all duration-300 ${
            isRegister
              ? "text-primary scale-105"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Image
            src={ClockIcon}
            alt="Registrar"
            className={`transition-transform duration-300 ${
              isRegister ? "scale-110" : ""
            }`}
            width={24}
            height={24}
          />
          <span className="text-xs font-medium">Registrar</span>
        </Link>
        <Link
          href="/records"
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all duration-300 ${
            isRecords
              ? "text-primary scale-105"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Image
            src={ClipboardIcon}
            alt="Histórico"
            className={`transition-transform duration-300 ${
              isRecords ? "scale-110" : ""
            }`}
            width={24}
            height={24}
          />
          <span className="text-xs font-medium">Histórico</span>
        </Link>
      </div>
    </nav>
  );
}
