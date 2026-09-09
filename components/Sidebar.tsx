"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Hexagon, Home, Settings, LogOut, CalendarDays, ScrollText, BookOpen, Shield } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const items = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/characters", icon: BookOpen, label: "Fichas" },
    { href: "/sessions", icon: CalendarDays, label: "Sessões" },
    { href: "/dashboard", icon: ScrollText, label: "Mural" },
  ];
  const active = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);
  return <>
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="brand" aria-label="The Ledger — início"><span className="brand-mark"><Hexagon size={25} strokeWidth={1.2} /><span>L</span></span><span>THE LEDGER</span></Link>
        <nav className="desktop-nav" aria-label="Navegação principal">{items.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={active(item.href) ? "nav-link is-active" : "nav-link"}>{item.label}</Link>)}</nav>
        <div className="nav-tools">
          {(role === "DM" || role === "ADMIN") && <Link className="icon-button" href={role === "ADMIN" ? "/admin" : "/dm"} title="Painel do mestre" aria-label="Painel do mestre"><Shield size={18} /></Link>}
          <LanguageToggle compact />
          {session ? <><Link className="icon-button" href="/account" title="Minha conta" aria-label="Minha conta"><Settings size={18} /></Link><button className="icon-button" onClick={() => signOut({ callbackUrl: "/" })} title="Sair" aria-label="Sair"><LogOut size={17} /></button></> : <Link className="nav-login" href="/login">Entrar</Link>}
        </div>
      </div>
    </header>
    <nav className="mobile-nav" aria-label="Navegação móvel">{items.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={active(item.href) ? "is-active" : ""}><item.icon size={19} /><span>{item.label}</span></Link>)}</nav>
  </>;
}
