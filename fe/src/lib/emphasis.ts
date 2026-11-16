// Splits CMS text around a phrase that the design styles differently, so editors keep plain-text fields.
export function splitEmphasis(
  text: string | undefined | null,
  phrase: string
): { before: string; match: string; after: string } | null {
  if (!text) return null;
  const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return null;
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + phrase.length),
    after: text.slice(idx + phrase.length),
  };
}
