import Image from "next/image";
import Logo from "@/assets/logo.svg";

export default function Header() {
  return (
    <header className="shrink-0 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-center gap-3 py-3">
        <Image src={Logo} alt="Logo" width={32} height={32} />
        <h1 className="text-lg font-bold text-gray-800">Ponto Presencial</h1>
      </div>
    </header>
  );
}
