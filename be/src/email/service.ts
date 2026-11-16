/**
 * Arkam Ventures — Reusable Email Service
 *
 * Sends via Brevo HTTP API (no IP whitelist required, free plan).
 * Falls back to Strapi's built-in email plugin if BREVO_API_KEY is not set.
 *
 * Usage:
 *   import { sendEmail } from '../email/service';
 *   await sendEmail(strapi, 'welcome', 'user@example.com', { username: 'Alice', loginUrl: 'https://...' });
 */

import { welcomeTemplate } from './templates/welcome';
import { verifyOtpTemplate } from './templates/verify-otp';
import { forgotPasswordTemplate } from './templates/forgot-password';
import { passwordResetConfirmationTemplate } from './templates/password-reset-confirmation';
import { notificationTemplate } from './templates/notification';
import { contactConfirmationTemplate } from './templates/contact-confirmation';
import { contactAdminTemplate } from './templates/contact-admin';
import { pitchConfirmationTemplate } from './templates/pitch-confirmation';
import { pitchAdminTemplate } from './templates/pitch-admin';

export type TemplateName =
  | 'welcome'
  | 'verify-otp'
  | 'forgot-password'
  | 'password-reset-confirmation'
  | 'notification'
  | 'contact-confirmation'
  | 'contact-admin'
  | 'pitch-confirmation'
  | 'pitch-admin';

const SUBJECTS: Record<TemplateName, string> = {
  'welcome':                     'Welcome to Arkam Ventures!',
  'verify-otp':                  'Verify your Arkam Ventures email',
  'forgot-password':             'Your Arkam Ventures password reset OTP',
  'password-reset-confirmation': 'Your Arkam Ventures password has been changed',
  'notification':                'A message from Arkam Ventures',
  'contact-confirmation':        'Thank you for reaching out to Arkam Ventures',
  'contact-admin':               'New contact form submission',
  'pitch-confirmation':          'We received your pitch — Arkam Ventures',
  'pitch-admin':                 'New pitch submission',
};

function buildHtml(template: TemplateName, data: Record<string, unknown>): string {
  switch (template) {
    case 'welcome':
      return welcomeTemplate(data as { username: string; loginUrl: string });
    case 'verify-otp':
      return verifyOtpTemplate(data as { username: string; otp: string; expiryTime: string });
    case 'forgot-password':
      return forgotPasswordTemplate(data as { username: string; otp: string; expiryTime: string });
    case 'password-reset-confirmation':
      return passwordResetConfirmationTemplate(data as { username: string });
    case 'notification':
      return notificationTemplate(data as {
        username: string;
        title: string;
        message: string;
        ctaText?: string;
        ctaUrl?: string;
      });
    case 'contact-confirmation':
      return contactConfirmationTemplate(data as { username: string });
    case 'contact-admin':
      return contactAdminTemplate(data as {
        username: string;
        email: string;
        company: string;
        phone: string;
        message: string;
      });
    case 'pitch-confirmation':
      return pitchConfirmationTemplate(data as { founderName: string; startupName?: string });
    case 'pitch-admin':
      return pitchAdminTemplate(data as unknown as Parameters<typeof pitchAdminTemplate>[0]);
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

export interface EmailAttachment {
  /** File name shown in the mail client, e.g. "pitch-deck.pdf" */
  name: string;
  content: Buffer;
}

export interface EmailOptions {
  /** Replies go here (e.g. the founder's address on the admin notification) */
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/** Send via Brevo HTTP API — no IP whitelist, works on free plan */
async function sendViaBrevoApi(
  to: string,
  subject: string,
  html: string,
  options: EmailOptions = {}
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set in .env');

  const from = process.env.SMTP_DEFAULT_FROM || 'noreply@arkamvc.com';

  const payload: Record<string, unknown> = {
    sender:     { email: from, name: 'Arkam Ventures' },
    to:         [{ email: to }],
    subject,
    htmlContent: html,
    textContent: `${subject}\n\nPlease view this email in an HTML-capable client.`,
  };
  if (options.replyTo) payload.replyTo = { email: options.replyTo };
  if (options.attachments?.length) {
    payload.attachment = options.attachments.map((a) => ({
      name: a.name,
      content: a.content.toString('base64'),
    }));
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Brevo API error ${response.status}: ${JSON.stringify(err)}`);
  }
}

/**
 * Send a branded email using a named template.
 *
 * @param strapi   - The Strapi instance (passed from controller/service context)
 * @param template - Template name (e.g. 'welcome', 'verify-otp')
 * @param to       - Recipient email address
 * @param data     - Dynamic variables to inject into the template
 * @param subject  - Optional subject override (defaults to template subject)
 */
export async function sendEmail(
  strapi: any,
  template: TemplateName,
  to: string,
  data: Record<string, unknown>,
  subject?: string,
  options: EmailOptions = {}
): Promise<void> {
  const html           = buildHtml(template, data);
  const resolvedSubject = subject ?? SUBJECTS[template];

  const viaSmtp = () =>
    // Strapi's built-in email plugin (Brevo SMTP relay — not subject to the API's authorised-IP list)
    strapi.plugins['email'].services.email.send({
      to,
      subject: resolvedSubject,
      html,
      text: `${resolvedSubject}\n\nPlease view this email in an HTML-capable client.`,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      ...(options.attachments?.length
        ? { attachments: options.attachments.map((a) => ({ filename: a.name, content: a.content })) }
        : {}),
    });

  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevoApi(to, resolvedSubject, html, options);
      return;
    } catch (apiErr) {
      // e.g. 401 "unrecognised IP address" when this server's IP is not authorised in Brevo
      strapi.log.warn(`[email] Brevo API failed (${(apiErr as Error).message.slice(0, 160)}) — retrying via SMTP`);
      try {
        await viaSmtp();
        return;
      } catch (smtpErr) {
        throw new Error(
          `Brevo API: ${(apiErr as Error).message} | SMTP: ${(smtpErr as Error).message}`
        );
      }
    }
  }

  await viaSmtp();
}
