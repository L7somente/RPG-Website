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
          <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
          <XPBar />
          <Sidebar />
          <main id="main-content" className="app-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
