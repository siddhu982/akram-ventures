import { baseLayout, interpolate } from './base';

const BODY = `
<h1 style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#1E1A1A;font-family:Arial,Helvetica,sans-serif;">
  Password changed successfully ✅
</h1>
<p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  Hi <strong>{{username}}</strong>, your Arkam Ventures account password was just changed.
</p>
<p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  If this was you, no further action is needed.
</p>

<!-- Warning box -->
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;width:100%;">
  <tr>
    <td style="background-color:#fff3cd;border-left:4px solid #EE6723;border-radius:4px;padding:16px 20px;">
      <p style="margin:0;font-size:14px;color:#856404;font-family:Arial,Helvetica,sans-serif;">
        ⚠ <strong>Not you?</strong> Contact us immediately at
        <a href="mailto:arkamvc@gmail.com" style="color:#EE6723;">arkamvc@gmail.com</a>
      </p>
    </td>
  </tr>
</table>

<p style="margin:0;font-size:13px;color:#888888;font-family:Arial,Helvetica,sans-serif;">
  For security, we recommend using a unique password you don't use elsewhere.
</p>
`;

export function passwordResetConfirmationTemplate(data: { username: string }): string {
  return baseLayout(interpolate(BODY, data), `Your Arkam Ventures password has been changed`);
}
