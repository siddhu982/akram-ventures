import { baseLayout, interpolate } from './base';

const BODY = `
<h1 style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#1E1A1A;font-family:Arial,Helvetica,sans-serif;">
  {{title}}
</h1>
<p style="margin:0 0 8px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  Hi <strong>{{username}}</strong>,
</p>
<p style="margin:0 0 32px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  {{message}}
</p>

<!-- Optional CTA button (only rendered when ctaText and ctaUrl are provided) -->
{{ctaBlock}}

<p style="margin:0;font-size:13px;color:#888888;font-family:Arial,Helvetica,sans-serif;">
  — The Arkam Ventures Team
</p>
`;

export function notificationTemplate(data: {
  username: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const ctaBlock =
    data.ctaText && data.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
          <tr>
            <td style="border-radius:8px;background-color:#EE6723;">
              <a href="${data.ctaUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;border-radius:8px;">
                ${data.ctaText} →
              </a>
            </td>
          </tr>
        </table>`
      : '';

  const html = BODY.replace('{{ctaBlock}}', ctaBlock);
  return baseLayout(
    interpolate(html, {
      username: data.username,
      title: data.title,
      message: data.message,
    }),
    data.title
  );
}
