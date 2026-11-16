import { baseLayout, interpolate } from './base';

const BODY = `
<h1 style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#1E1A1A;font-family:Arial,Helvetica,sans-serif;">
  Verify your email
</h1>
<p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  Hi <strong>{{username}}</strong>, use the OTP below to verify your email address.
</p>

<!-- OTP box -->
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;width:100%;">
  <tr>
    <td align="center" style="background-color:#FFF5E4;border:2px dashed #EE6723;border-radius:10px;padding:24px;">
      <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#EE6723;font-family:'Courier New',monospace;">
        {{otp}}
      </span>
    </td>
  </tr>
</table>

<p style="margin:0 0 8px 0;font-size:14px;color:#888888;font-family:Arial,Helvetica,sans-serif;">
  ⏱ This OTP expires in <strong>{{expiryTime}}</strong>.
</p>
<p style="margin:0;font-size:13px;color:#888888;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
  If you did not request this, please ignore this email.
</p>
`;

export function verifyOtpTemplate(data: { username: string; otp: string; expiryTime: string }): string {
  return baseLayout(interpolate(BODY, data), `Your Arkam Ventures verification OTP`);
}
