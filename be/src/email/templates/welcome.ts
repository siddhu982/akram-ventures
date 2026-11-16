import { baseLayout, interpolate } from './base';

const BODY = `
<h1 style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#1E1A1A;font-family:Arial,Helvetica,sans-serif;">
  Welcome to Arkam Ventures 🎉
</h1>
<p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  Hi <strong>{{username}}</strong>,
</p>
<p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  Your account has been created successfully. We're excited to have you with us.
</p>

<!-- CTA button -->
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
  <tr>
    <td style="border-radius:8px;background-color:#EE6723;">
      <a href="{{loginUrl}}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;border-radius:8px;">
        Go to your account →
      </a>
    </td>
  </tr>
</table>

<p style="margin:0;font-size:13px;color:#888888;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
  If you did not create this account, you can safely ignore this email.
</p>
`;

export function welcomeTemplate(data: { username: string; loginUrl: string }): string {
  const html = baseLayout(interpolate(BODY, data), `Welcome to Arkam Ventures, ${data.username}!`);
  return html;
}
