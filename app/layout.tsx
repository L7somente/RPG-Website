import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import AppChrome from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "The Ledger — Gerenciador da Campanha",
  description: "Fichas de personagem, missões e XP da party para a campanha.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-ink font-body text-parchment">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
