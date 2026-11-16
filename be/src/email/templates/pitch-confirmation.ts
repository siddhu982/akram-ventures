import { baseLayout } from './base';
import { esc } from '../escape';

export function pitchConfirmationTemplate(data: {
  founderName: string;
  startupName?: string;
}): string {
  const name = esc(data.founderName);
  const startup = data.startupName ? ` for <strong>${esc(data.startupName)}</strong>` : '';
  const body = `
    <h2 style="color:#1E1A1A;margin:0 0 16px;">We've received your pitch!</h2>
    <p style="color:#444;line-height:1.6;">Hi <strong>${name}</strong>,</p>
    <p style="color:#444;line-height:1.6;">
      Welcome, and thank you for submitting your pitch${startup} to Arkam Ventures.
      We review every submission carefully and will reach out if there's a potential fit.
    </p>
    <div style="background:#FFF5E4;border-left:4px solid #EE6723;border-radius:4px;padding:20px 24px;margin:28px 0;">
      <p style="margin:0 0 8px;color:#1E1A1A;font-weight:600;">What happens next?</p>
      <ul style="margin:0;padding-left:20px;color:#444;font-size:14px;line-height:1.8;">
        <li>Our team reviews your pitch within 2–3 weeks</li>
        <li>If there's a fit, we'll schedule an introductory call</li>
        <li>All submissions are kept strictly confidential</li>
      </ul>
    </div>
    <p style="color:#888;font-size:13px;margin-top:32px;">
      In the meantime, explore our portfolio and thesis at
      <a href="https://arkamvc.com" style="color:#EE6723;font-weight:600;">arkamvc.com</a>
    </p>
    <p style="color:#888;font-size:13px;">— The Arkam Ventures Team</p>
  `;
  return baseLayout(body, `${name}, we received your pitch!`);
}
