import { baseLayout } from './base';

export function contactConfirmationTemplate(data: { username: string }): string {
  const body = `
    <h2 style="color:#1E1A1A;margin:0 0 16px;">Thank you for reaching out!</h2>
    <p style="color:#444;line-height:1.6;">Hi <strong>${data.username}</strong>,</p>
    <p style="color:#444;line-height:1.6;">
      We've received your message and our team will get back to you within
      <strong>1–2 business days</strong>.
    </p>
    <div style="background:#FFF5E4;border-left:4px solid #EE6723;border-radius:4px;padding:16px 20px;margin:28px 0;">
      <p style="margin:0;color:#1E1A1A;font-size:14px;">
        In the meantime, explore our portfolio and insights at
        <a href="https://arkamvc.com" style="color:#EE6723;font-weight:600;">arkamvc.com</a>
      </p>
    </div>
    <p style="color:#888;font-size:13px;">— The Arkam Ventures Team</p>
  `;
  return baseLayout(body, `We received your message, ${data.username}.`);
}
