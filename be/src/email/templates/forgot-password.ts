import { baseLayout, interpolate } from './base';

const BODY = `
<h1 style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#1E1A1A;font-family:Arial,Helvetica,sans-serif;">
  Reset your password
</h1>
<p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
  Hi <strong>{{username}}</strong>, we received a request to reset your password. Use the OTP below.
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
<p style="margin:0 0 24px 0;font-size:13px;color:#cc0000;font-family:Arial,Helvetica,sans-serif;">
  ⚠ If you did not request a password reset, secure your account immediately.
</p>
<p style="margin:0;font-size:13px;color:#888888;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
  Never share this OTP with anyone, including Arkam Ventures support.
</p>
`;

export function forgotPasswordTemplate(data: { username: string; otp: string; expiryTime: string }): string {
  return baseLayout(interpolate(BODY, data), `Your Arkam Ventures password reset OTP`);
}
