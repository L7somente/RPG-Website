type Entry = { id: string; level: number };
export function constrainedLevel(current: { level: number; classes: unknown }, patch: { level?: number; classes?: Entry[] }, worldLevel: number) {
  const entries = patch.classes ?? (Array.isArray(current.classes) ? current.classes as Entry[] : []);
  const total = entries.length ? entries.reduce((sum, entry) => sum + entry.level, 0) : patch.level ?? current.level;
  if (patch.level !== undefined && entries.length && patch.level !== total) return null;
  if (!Number.isInteger(total) || total < 1 || total > Math.min(20, worldLevel)) return null;
  return total;
}
