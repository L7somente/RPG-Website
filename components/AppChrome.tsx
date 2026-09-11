"use client";
import { usePathname } from "next/navigation";
import XPBar from "@/components/XPBar";
import Sidebar from "@/components/Sidebar";
export default function AppChrome({ children }: { children: React.ReactNode }) {
  const compact = usePathname() === "/owlbear";
  if (compact) return <main id="main-content" className="p-4">{children}</main>;
  return <><a href="#main-content" className="skip-link">Pular para o conteúdo</a><XPBar /><Sidebar /><main id="main-content" className="app-content">{children}</main></>;
}
