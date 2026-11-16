'use server';

export async function checkBackend(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const res = await fetch(`${url}/_health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
