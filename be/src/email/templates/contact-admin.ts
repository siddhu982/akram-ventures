import { baseLayout } from './base';

export function contactAdminTemplate(data: {
  username: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#1E1A1A;background:#f9f9f9;width:30%;border-bottom:1px solid #eee;">${label}</td>
      <td style="padding:10px 14px;font-size:13px;color:#444;border-bottom:1px solid #eee;">${value}</td>
    </tr>
  `;

  const body = `
    <h2 style="color:#1E1A1A;margin:0 0 8px;">New Contact Form Submission</h2>
    <p style="color:#888;font-size:13px;margin:0 0 24px;">Someone just submitted the contact form on your website.</p>

    <table width="100%" style="border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
      ${row('Name', data.username)}
      ${row('Email', `<a href="mailto:${data.email}" style="color:#EE6723;">${data.email}</a>`)}
      ${row('Company', data.company)}
      ${row('Phone', data.phone)}
      <tr>
        <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#1E1A1A;background:#f9f9f9;vertical-align:top;">Message</td>
        <td style="padding:10px 14px;font-size:13px;color:#444;white-space:pre-wrap;">${data.message}</td>
      </tr>
    </table>

    <div style="margin-top:24px;">
      <a href="mailto:${data.email}" style="display:inline-block;padding:12px 24px;background:#EE6723;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        Reply to ${data.username} →
      </a>
    </div>
  `;
  return baseLayout(body, `New message from ${data.username} (${data.email})`);
}
