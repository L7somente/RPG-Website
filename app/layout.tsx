import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import XPBar from "@/components/XPBar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "The Ledger — Gerenciador da Campanha",
  description: "Fichas de personagem, missões e XP da party para a campanha.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-ink font-body text-parchment">
        <Providers>
          {/* Sticky on every page per requirement #3 */}
          <XPBar />
          <Sidebar />
          <main className="mx-auto max-w-5xl px-4 py-6 sm:pl-20 pb-20 sm:pb-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
