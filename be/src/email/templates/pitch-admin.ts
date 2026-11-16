import { baseLayout } from './base';
import { esc, safeUrl } from '../escape';

export function pitchAdminTemplate(data: {
  founderName: string;
  email: string;
  startupName?: string;
  problemDescription?: string;
  teamDescription?: string;
  targetRoundSize?: string;
  additionalInfo?: string;
  websiteLink?: string;
  linkedinLinks?: string[];
  sector?: string;
  marketSize?: string;
  customerValueProp?: string;
  solution10x?: string;
  /** Name of the PDF attached to this email */
  attachmentName?: string;
  /** Set when the deck was too large to attach — link to download it instead */
  pitchDeckUrl?: string;
  submittedAt?: string;
}): string {
  // Every field is a table row: label on the left, answer on the right ("—" when left empty)
  const row = (label: string, valueHtml: string) => `
      <tr>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#1E1A1A;background:#f9f9f9;width:34%;border:1px solid #e6e6e6;vertical-align:top;">${label}</td>
        <td style="padding:12px 16px;font-size:13px;color:#444;border:1px solid #e6e6e6;vertical-align:top;line-height:1.55;">${valueHtml || '<span style="color:#aaa;">—</span>'}</td>
      </tr>
    `;

  // Long free-text answers keep their line breaks
  const textRow = (label: string, text?: string) =>
    row(label, text ? `<div style="white-space:pre-wrap;word-break:break-word;">${esc(text)}</div>` : '');

  const section = (title: string) => `
      <tr>
        <td colspan="2" style="padding:10px 16px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#EE6723;background:#fdf0e9;border:1px solid #e6e6e6;">${title}</td>
      </tr>
    `;

  const linkedinHtml = data.linkedinLinks?.length
    ? data.linkedinLinks
        .map((l) => `<a href="${safeUrl(l)}" style="color:#EE6723;display:block;margin-bottom:4px;">${esc(l)}</a>`)
        .join('')
    : '';

  const roundLabels: Record<string, string> = {
    'pre-seed': 'Pre-Seed',
    'seed': 'Seed',
    'series-a': 'Series A',
    'series-b': 'Series B',
    'series-c-plus': 'Series C+',
  };

  const deckRow = data.attachmentName
    ? row('Pitch Deck', `📎 Attached to this email: <strong>${esc(data.attachmentName)}</strong>`)
    : data.pitchDeckUrl
      ? row('Pitch Deck', `Too large to attach — <a href="${safeUrl(data.pitchDeckUrl)}" style="color:#EE6723;">download the pitch deck</a>`)
      : '';

  const body = `
    <h2 style="color:#1E1A1A;margin:0 0 8px;">New Pitch Submission</h2>
    <p style="color:#888;font-size:13px;margin:0 0 24px;">A founder just pitched to Arkam Ventures via the website.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e6e6e6;margin-bottom:24px;">
      ${section('Solution and why you — WHAT is your idea?')}
      ${row('Name', esc(data.founderName))}
      ${row('Email', `<a href="mailto:${esc(data.email)}" style="color:#EE6723;">${esc(data.email)}</a>`)}
      ${textRow('Please describe the problem you are solving?', data.problemDescription)}
      ${textRow('Why are you the team to beat?', data.teamDescription)}
      ${row('What is the target round size?', esc(roundLabels[data.targetRoundSize || ''] || data.targetRoundSize))}
      ${textRow('Additional Info', data.additionalInfo)}
      ${deckRow || row('Pitch Deck', '')}
      ${row('Website link', data.websiteLink ? `<a href="${safeUrl(data.websiteLink)}" style="color:#EE6723;">${esc(data.websiteLink)}</a>` : '')}
      ${row('LinkedIn profile links of Co-founders', linkedinHtml)}

      ${section('Market and audience — WHO is your solution for?')}
      ${row('Which of these sectors best define the business you are in?', esc(data.sector))}
      ${textRow('How big is the market for this and what are current friction points?', data.marketSize)}
      ${textRow('Who is your customer and what is the value proposition?', data.customerValueProp)}
      ${textRow('Why is your solution 10x better?', data.solution10x)}

      ${row('Submitted', esc(data.submittedAt))}
    </table>

    <div style="margin-top:28px;">
      <a href="mailto:${esc(data.email)}" style="display:inline-block;padding:12px 24px;background:#EE6723;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        Reply to ${esc(data.founderName)} →
      </a>
    </div>
  `;
  return baseLayout(body, `New pitch from ${esc(data.founderName)}`);
}
