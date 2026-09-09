"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Character, SaveFn } from "./CharacterSheet";

function Field({
  label,
  defaultValue,
  onBlur,
  rows = 2,
}: {
  label: string;
  defaultValue: string;
  onBlur: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <h3 className="font-display text-sm mb-1">{label}</h3>
      <textarea
        defaultValue={defaultValue}
        onBlur={(e) => onBlur(e.target.value)}
        rows={rows}
        className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
      />
    </div>
  );
}

export default function CharacterSheetPersonality({ sheet, save }: { sheet: Character; save: SaveFn }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("personalityTraitsLabel")} defaultValue={sheet.personalityTraits} onBlur={(v) => save({ personalityTraits: v })} />
        <Field label={t("idealsLabel")} defaultValue={sheet.ideals} onBlur={(v) => save({ ideals: v })} />
        <Field label={t("bondsLabel")} defaultValue={sheet.bonds} onBlur={(v) => save({ bonds: v })} />
        <Field label={t("flawsLabel")} defaultValue={sheet.flaws} onBlur={(v) => save({ flaws: v })} />
      </div>

      <div>
        <h3 className="font-display text-sm mb-2">
          {t("ageLabel")} / {t("heightLabel")} / {t("weightLabel")} / {t("eyesLabel")} / {t("skinLabel")} / {t("hairLabel")}
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(
            [
              ["age", "ageLabel"],
              ["height", "heightLabel"],
              ["weight", "weightLabel"],
              ["eyes", "eyesLabel"],
              ["skin", "skinLabel"],
              ["hair", "hairLabel"],
            ] as const
          ).map(([field, labelKey]) => (
            <div key={field}>
              <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">{t(labelKey)}</label>
              <input
                defaultValue={sheet[field]}
                onBlur={(e) => save({ [field]: e.target.value } as Partial<Character>)}
                className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <Field label={t("appearanceLabel")} defaultValue={sheet.appearance} onBlur={(v) => save({ appearance: v })} rows={3} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label={t("alliesOrgsLabel")}
          defaultValue={sheet.alliesOrganizations}
          onBlur={(v) => save({ alliesOrganizations: v })}
          rows={3}
        />
        <div>
          <h3 className="font-display text-sm mb-1">{t("symbolLabel")}</h3>
          <input
            defaultValue={sheet.characterSymbol}
            onBlur={(e) => save({ characterSymbol: e.target.value })}
            placeholder={t("symbolLabel")}
            className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <Field label={t("backstoryLabel")} defaultValue={sheet.backstory} onBlur={(v) => save({ backstory: v })} rows={5} />
      <Field
        label={t("additionalFeaturesLabel")}
        defaultValue={sheet.additionalFeatures}
        onBlur={(v) => save({ additionalFeatures: v })}
        rows={3}
      />
      <Field label={t("treasureLabel")} defaultValue={sheet.treasure} onBlur={(v) => save({ treasure: v })} rows={3} />
    </div>
  );
}
