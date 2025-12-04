import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ponto Presencial",
  description: "Sistema de registro de ponto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 h-screen w-full flex flex-col overflow-hidden`}
      >
        <ToastProvider>
          <Header />
          <main className="flex-1 min-h-0 h-full bg-zinc-50 overflow-y-auto flex flex-col items-center">
            {children}
          </main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
