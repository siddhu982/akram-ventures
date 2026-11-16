/** Escape user-supplied text before putting it in an HTML email. */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only allow http(s)/mailto links inside href attributes. */
export function safeUrl(value: unknown): string {
  const v = String(value ?? '').trim();
  return /^(https?:\/\/|mailto:)/i.test(v) ? esc(v) : '#';
}
