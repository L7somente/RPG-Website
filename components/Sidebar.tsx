"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, Settings, LogOut } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import LanguageToggle from "./LanguageToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: authSession } = useSession();
  const { t } = useLanguage();

  if (!authSession) return null; // nothing to navigate to before login
  const isHome = pathname === "/";

  const items = [
    { href: "/", icon: Home, label: t("home"), active: isHome },
    { href: "/account", icon: Settings, label: t("accountSettings"), active: pathname === "/account" },
  ];

  return (
    <>
      {/* Desktop: fixed left column */}
      <aside className="hidden sm:flex flex-col items-center gap-6 fixed left-0 top-0 h-full w-16 bg-ink-panel border-r border-brass/20 pt-20 z-40">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`flex flex-col items-center gap-1 ${item.active ? "text-brass-bright" : "text-parchment/60 hover:text-brass-bright"}`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-mono">{item.label.split(" ")[0]}</span>
          </Link>
        ))}

        <div className="mt-auto mb-6 flex flex-col items-center gap-6">
          <LanguageToggle compact />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={t("logout")}
            className="flex flex-col items-center gap-1 text-parchment/60 hover:text-crimson-bright"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-mono">{t("logout").split(" ")[0]}</span>
          </button>
        </div>
      </aside>

      {/* Mobile: fixed bottom bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-14 bg-ink-panel border-t border-brass/20 flex items-center justify-around z-40">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.active ? "text-brass-bright" : "text-parchment/60"}
          >
            <item.icon size={20} />
          </Link>
        ))}
        <LanguageToggle compact />
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-parchment/60">
          <LogOut size={20} />
        </button>
      </nav>
    </>
  );
}
