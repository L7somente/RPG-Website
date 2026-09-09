"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Character = {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  user: { username: string };
};

export default function PlayerCharacterList() {
  const { t } = useLanguage();
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    fetch("/api/dm/characters")
      .then((r) => r.json())
      .then((d) => setCharacters(d.characters ?? []));
  }, []);

  return (
    <section className="rounded-lg bg-ink-panel text-parchment p-5 shadow-lg">
      <h2 className="font-display text-lg mb-3">{t("playerCharacters")}</h2>
      <p className="text-xs text-parchment/60 mb-3">{t("playerCharactersHint")}</p>
      <ul className="space-y-2">
        {characters.length === 0 && <li className="text-sm text-parchment/60">{t("noCharactersCreatedYet")}</li>}
        {characters.map((c) => (
          <li key={c.id}>
            <Link href={`/dm/characters/${c.id}`} className="flex justify-between items-center ledger-rule py-2 hover:text-brass">
              <span>
                <span className="font-medium">{c.name}</span>{" "}
                <span className="text-parchment/60 text-sm">
                  — {t("levelLabel")} {c.level} {c.race} {c.class}
                </span>
              </span>
              <span className="text-xs font-mono text-parchment/60">{c.user.username}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
