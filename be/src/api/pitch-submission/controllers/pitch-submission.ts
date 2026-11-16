import fs from 'fs';
import { factories } from '@strapi/strapi';
import { sendEmail, EmailAttachment } from '../../../email/service';

const UID = 'api::pitch-submission.pitch-submission';

// ── Limits ───────────────────────────────────────────────────────────────────
const MAX_PDF_BYTES = 5 * 1024 * 1024;           // matches the form ("Max file size 5MB")
const MAX_ATTACH_BYTES = 4 * 1024 * 1024;        // Brevo's attachment limit; bigger decks are emailed as a link
const MAX_TEXT = 5000;
const MAX_SHORT = 200;
const MAX_LINKEDIN = 10;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 }; // per IP

// Fields that must be filled in. Edit this list to change what the form requires.
const REQUIRED_TEXT: Array<[string, string]> = [
  ['founderName', 'Please enter your name'],
  ['email', 'Please enter your email'],
  ['problemDescription', 'Please describe the problem you are solving'],
  ['teamDescription', 'Please tell us why you are the team to beat'],
  ['targetRoundSize', 'Please enter the target round size'],
  ['sector', 'Please select a sector'],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

/** Remove control characters, trim, collapse absurd whitespace runs. */
function clean(value: unknown, max: number): string {
  if (value === undefined || value === null) return '';
  // eslint-disable-next-line no-control-regex
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max + 1);
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** A real LinkedIn address: host is linkedin.com (or a subdomain such as www.), nothing else. */
function isLinkedInUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    if (u.username || u.password) return false; // blocks https://linkedin.com@evil.com
    const host = u.hostname.toLowerCase();
    const ok = host === 'linkedin.com' || host.endsWith('.linkedin.com');
    return ok && u.pathname.length > 1; // must point at a profile/page, not just the home page
  } catch {
    return false;
  }
}

function parseLinks(raw: unknown): string[] {
  let list: unknown = raw;
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw);
    } catch {
      list = raw.split(/[\n,]/);
    }
  }
  return (Array.isArray(list) ? list : [])
    .map((l) => String(l ?? '').trim())
    .filter(Boolean)
    // "linkedin.com/in/jane" is accepted: add https:// when no scheme was given
    .map((l) => (/^[a-z][a-z0-9+.-]*:/i.test(l) ? l : `https://${l}`));
}

function firstFile(files: any, key: string): any | undefined {
  const f = files?.[key];
  return Array.isArray(f) ? f[0] : f;
}

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const body: any = ctx.request.body || {};
    // Accept both multipart/form-data (fields at the top level) and JSON ({ data: {...} })
    let raw: any = body;
    if (body.data) {
      if (typeof body.data === 'string') {
        try { raw = JSON.parse(body.data); } catch { raw = body; }
      } else if (typeof body.data === 'object') {
        raw = body.data;
      }
    }
    const file = firstFile((ctx.request as any).files, 'pitchDeck') || firstFile((ctx.request as any).files, 'files.pitchDeck');

    // Hidden spam trap: real users never fill this in
    if (clean(raw.companyUrl, 50)) {
      return ctx.send({ data: { ok: true } });
    }

    if (rateLimited(ctx.request.ip)) {
      return ctx.tooManyRequests('Too many submissions. Please try again in a few minutes.');
    }

    // ── Validate ────────────────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    const values: Record<string, string> = {
      founderName: clean(raw.founderName, 100),
      email: clean(raw.email, 254).toLowerCase(),
      startupName: clean(raw.startupName, MAX_SHORT),
      problemDescription: clean(raw.problemDescription, MAX_TEXT),
      teamDescription: clean(raw.teamDescription, MAX_TEXT),
      targetRoundSize: clean(raw.targetRoundSize, MAX_SHORT),
      additionalInfo: clean(raw.additionalInfo, MAX_TEXT),
      websiteLink: clean(raw.websiteLink, 500),
      sector: clean(raw.sector, MAX_SHORT),
      marketSize: clean(raw.marketSize, MAX_TEXT),
      customerValueProp: clean(raw.customerValueProp, MAX_TEXT),
      solution10x: clean(raw.solution10x, MAX_TEXT),
    };

    for (const [key, message] of REQUIRED_TEXT) {
      if (!values[key]) errors[key] = message;
    }

    if (values.founderName && values.founderName.length < 2) errors.founderName = 'Please enter your full name';
    if (values.email && !EMAIL_RE.test(values.email)) errors.email = 'Please enter a valid email address';

    const limits: Record<string, number> = {
      founderName: 100, email: 254, startupName: MAX_SHORT, targetRoundSize: MAX_SHORT, sector: MAX_SHORT,
      websiteLink: 500, problemDescription: MAX_TEXT, teamDescription: MAX_TEXT, additionalInfo: MAX_TEXT,
      marketSize: MAX_TEXT, customerValueProp: MAX_TEXT, solution10x: MAX_TEXT,
    };
    for (const [key, max] of Object.entries(limits)) {
      if (values[key].length > max && !errors[key]) errors[key] = `Please keep this under ${max} characters`;
    }

    if (values.websiteLink && !isHttpUrl(values.websiteLink)) {
      errors.websiteLink = 'Please enter a valid link starting with http:// or https://';
    }

    const linkedinLinks = parseLinks(raw.linkedinLinks);
    // At least one LinkedIn link is required, and every link must be a real linkedin.com address
    if (linkedinLinks.length === 0) {
      errors.linkedinLinks = 'Please add at least one LinkedIn profile link';
    } else if (linkedinLinks.length > MAX_LINKEDIN) {
      errors.linkedinLinks = `You can add up to ${MAX_LINKEDIN} links`;
    } else if (linkedinLinks.some((l) => !isLinkedInUrl(l) || l.length > 300)) {
      errors.linkedinLinks = 'Please enter a valid LinkedIn profile URL';
    }

    // Pitch deck: required, PDF only, max 5 MB
    let deckBuffer: Buffer | undefined;
    let deckName = 'pitch-deck.pdf';
    if (!file || !file.size) {
      errors.pitchDeck = 'Please upload your pitch deck (PDF)';
    } else {
      const original = String(file.originalFilename || file.name || 'pitch-deck.pdf');
      if (file.size > MAX_PDF_BYTES) {
        errors.pitchDeck = 'The file is larger than 5 MB';
      } else if (!/\.pdf$/i.test(original) || (file.mimetype && file.mimetype !== 'application/pdf')) {
        errors.pitchDeck = 'Only PDF files are accepted';
      } else {
        const path = file.filepath || file.path;
        deckBuffer = await fs.promises.readFile(path);
        if (deckBuffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
          errors.pitchDeck = 'This file does not look like a valid PDF';
        }
        deckName = original.replace(/[^\w.\- ()]/g, '_').slice(0, 120);
      }
    }

    if (Object.keys(errors).length) {
      return ctx.badRequest('Please correct the highlighted fields', { errors });
    }

    // ── Store: upload the deck, then create the entry ──────────────────────
    let uploadedId: number | undefined;
    try {
      const uploaded = await strapi
        .plugin('upload')
        .service('upload')
        .upload({ data: { fileInfo: { name: deckName } }, files: file });
      uploadedId = uploaded?.[0]?.id;
    } catch (err) {
      strapi.log.error('[pitch] deck upload failed:', err);
      return ctx.internalServerError('We could not save your pitch deck. Please try again.');
    }

    let entry: any;
    try {
      entry = await strapi.documents(UID).create({
        data: {
          ...values,
          startupName: values.startupName || undefined,
          additionalInfo: values.additionalInfo || undefined,
          websiteLink: values.websiteLink || undefined,
          marketSize: values.marketSize || undefined,
          customerValueProp: values.customerValueProp || undefined,
          solution10x: values.solution10x || undefined,
          linkedinLinks,
          pitchDeck: uploadedId,
        } as any,
      });
    } catch (err) {
      strapi.log.error('[pitch] could not save submission:', err);
      if (uploadedId) {
        await strapi.plugin('upload').service('upload').remove({ id: uploadedId }).catch(() => undefined);
      }
      return ctx.internalServerError('We could not save your pitch. Please try again.');
    }

    // ── Emails (the submission is already saved; a mail failure must not lose it) ──
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_DEFAULT_FROM;
    const canAttach = !!deckBuffer && deckBuffer.length <= MAX_ATTACH_BYTES;
    const attachments: EmailAttachment[] = canAttach && deckBuffer ? [{ name: deckName, content: deckBuffer }] : [];

    // Sent in the background: the founder gets their answer as soon as the pitch is saved,
    // instead of waiting for two mail round-trips (a mail failure is logged, never lost silently).
    void (async () => {
      try {
        const deckUrl = uploadedId && !canAttach
          ? `${process.env.STRAPI_URL || 'http://localhost:1337'}${(await strapi.db.query('plugin::upload.file').findOne({ where: { id: uploadedId } }))?.url || ''}`
          : undefined;

        const jobs: Array<Promise<void>> = [
          sendEmail(strapi, 'pitch-confirmation', values.email, {
            founderName: values.founderName,
            startupName: values.startupName,
          }),
        ];
        if (adminEmail) {
          jobs.push(
            sendEmail(
              strapi,
              'pitch-admin',
              adminEmail,
              {
                ...values,
                linkedinLinks,
                attachmentName: canAttach ? deckName : undefined,
                pitchDeckUrl: deckUrl,
                submittedAt: new Date().toUTCString(),
              },
              `New pitch from ${values.founderName}${values.sector ? ` — ${values.sector}` : ''}`,
              { replyTo: values.email, attachments }
            )
          );
        } else {
          strapi.log.warn('[pitch] ADMIN_EMAIL is not set — admin notification skipped');
        }

        const results = await Promise.allSettled(jobs);
        results.forEach((r, i) => {
          if (r.status === 'rejected') {
            strapi.log.error(`[pitch] ${i === 0 ? 'confirmation' : 'admin'} email failed:`, r.reason);
          }
        });
      } catch (err) {
        strapi.log.error('[pitch] email step failed:', err);
      }
    })();

    return ctx.send({ data: { id: entry.documentId } });
  },
}));
