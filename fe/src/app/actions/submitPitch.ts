'use server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export type PitchResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const FIELDS = [
  'founderName',
  'email',
  'problemDescription',
  'teamDescription',
  'targetRoundSize',
  'additionalInfo',
  'websiteLink',
  'sector',
  'marketSize',
  'customerValueProp',
  'solution10x',
  'companyUrl', // hidden spam trap
] as const;

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export async function submitPitch(formData: FormData): Promise<PitchResult> {
  try {
    const out = new FormData();
    for (const key of FIELDS) {
      const v = formData.get(key);
      if (typeof v === 'string') out.append(key, v.trim());
    }

    const linkedinLinks: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('linkedin_') && typeof value === 'string' && value.trim()) {
        linkedinLinks.push(value.trim());
      }
    }
    out.append('linkedinLinks', JSON.stringify(linkedinLinks));

    // The PDF goes straight to the backend, which validates it, stores it and attaches it to the admin email
    const deck = formData.get('pitchDeck');
    if (deck instanceof File && deck.size > 0) {
      if (deck.size > MAX_PDF_BYTES) {
        return { success: false, error: 'Please correct the highlighted fields', fieldErrors: { pitchDeck: 'The file is larger than 5 MB' } };
      }
      out.append('pitchDeck', deck, deck.name);
    }

    const res = await fetch(`${STRAPI_URL}/api/pitch-submissions`, {
      method: 'POST',
      body: out,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      const details = json?.error?.details?.errors as Record<string, string> | undefined;
      if (res.status === 400 && details && typeof details === 'object') {
        return { success: false, error: 'Please correct the highlighted fields', fieldErrors: details };
      }
      if (res.status === 429) {
        return { success: false, error: 'Too many submissions. Please try again in a few minutes.' };
      }
      console.error('[submitPitch] Strapi error:', res.status, json?.error?.message);
      return { success: false, error: json?.error?.message || 'Failed to submit. Please try again.' };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isNetworkError =
      msg.includes('ECONNREFUSED') ||
      msg.includes('fetch failed') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('network') ||
      msg.includes('NetworkError');
    if (isNetworkError) {
      return {
        success: false,
        error: 'Cannot reach the server right now. Please make sure the backend is running and try again.',
      };
    }
    console.error('[submitPitch] unexpected error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
