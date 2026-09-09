import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookOpen, CalendarDays, ScrollText, ArrowUpRight, ArrowRight } from "lucide-react";
import NoticeBoard from "@/components/NoticeBoard";
import SessionSchedule from "@/components/SessionSchedule";
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const cards = [
    { href: "/characters", icon: BookOpen, title: "Personagens", text: "Fichas, habilidades e inventário.", number: "01" },
    { href: "/sessions", icon: CalendarDays, title: "Sessões", text: "Sua mesa, do início ao último dado.", number: "02" },
    { href: "/dashboard", icon: ScrollText, title: "Mural", text: "Missões e histórias da campanha.", number: "03" },
  ];
  return <div className="home-layout">
    <header className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow"><span /> O ponto de encontro da sua campanha</p>
        <h1>O próximo capítulo<br /><em>começa com vocês.</em></h1>
        <p className="hero-description">Prepare a ficha. Reúna a mesa. Continue a história.</p>
        <Link className="primary-action" href={session ? "/sessions" : "/login"}>{session ? "Acompanhar sessões" : "Entrar com Discord"}<ArrowRight size={17} /></Link>
      </div>
      <div className="hero-sigil" aria-hidden="true">
        <div className="sigil-orbit-system">
          <div className="sigil-orbit" /><div className="sigil-orbit inner" />
          <span className="sigil-star one">✦</span><span className="sigil-star two">✦</span>
        </div>
        <svg viewBox="0 0 200 220" fill="none"><path d="M100 12 185 60v100l-85 48-85-48V60Z" /><path d="m100 12-48 70 48 89 48-89ZM15 60l37 22-37 78 85 11 85-11-37-78 37-22M100 171v37M52 82h96" /><text x="100" y="127" textAnchor="middle">20</text></svg>
      </div>
    </header>
    <div className="quick-links">{cards.map(card => <Link key={card.href} href={card.href} className="quick-card">
      <div className="quick-card-top"><card.icon size={21} strokeWidth={1.5} /><span>{card.number}</span></div>
      <div className="quick-card-title"><h2>{card.title}</h2><ArrowUpRight size={17} /></div><p>{card.text}</p>
    </Link>)}</div>
    <div className="home-activity"><SessionSchedule /><NoticeBoard /></div>
    <footer className="site-footer"><span>THE LEDGER</span><span>Uma mesa. Muitas histórias.</span></footer>
  </div>;
}
