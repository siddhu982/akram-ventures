/**
 * Email test script — uses Brevo HTTP API (no SMTP, no IP whitelist needed).
 *
 * Usage:
 *   node scripts/test-email.js                   → sends all 5 templates
 *   node scripts/test-email.js welcome            → sends only welcome
 *   SEND_TO=other@gmail.com node scripts/test-email.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const SEND_TO  = process.env.SEND_TO  || process.env.SMTP_DEFAULT_FROM;
const API_KEY  = process.env.BREVO_API_KEY;
const FROM     = process.env.SMTP_DEFAULT_FROM || 'noreply@arkamvc.com';
const FILTER   = process.argv[2] || 'all';

if (!API_KEY || API_KEY === 'your_brevo_api_key_here') {
  console.error('\n❌  BREVO_API_KEY is not set in .env');
  console.error('   Get it from: https://app.brevo.com → Settings → SMTP & API → API Keys\n');
  process.exit(1);
}

function base(body) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:32px 16px;">
<table width="600" style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#1E1A1A;padding:24px 40px;text-align:center;">
    <span style="font-size:22px;font-weight:700;color:#fff;">Arkam <span style="color:#EE6723;">Ventures</span></span>
  </td></tr>
  <tr><td style="padding:40px;">${body}</td></tr>
  <tr><td style="padding:16px 40px;text-align:center;font-size:12px;color:#888;border-top:1px solid #eee;">
    arkamvc.com &nbsp;|&nbsp; Bangalore 560008
  </td></tr>
</table></body></html>`;
}

const TESTS = [
  {
    name:    'welcome',
    subject: '[TEST] Welcome to Arkam Ventures',
    html: base(`
      <h2 style="color:#1E1A1A;">Welcome to Arkam Ventures 🎉</h2>
      <p>Hi <strong>TestUser</strong>, your account has been created.</p>
      <a href="https://arkamvc.com" style="display:inline-block;padding:12px 28px;background:#EE6723;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Go to your account →</a>
    `),
  },
  {
    name:    'verify-otp',
    subject: '[TEST] Verify your Arkam Ventures email',
    html: base(`
      <h2 style="color:#1E1A1A;">Verify your email</h2>
      <p>Hi <strong>TestUser</strong>, use this OTP:</p>
      <div style="background:#FFF5E4;border:2px dashed #EE6723;border-radius:10px;padding:24px;text-align:center;">
        <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#EE6723;font-family:monospace;">482910</span>
      </div>
      <p style="color:#888;font-size:13px;">⏱ Expires in <strong>10 minutes</strong>.</p>
    `),
  },
  {
    name:    'forgot-password',
    subject: '[TEST] Your Arkam Ventures password reset OTP',
    html: base(`
      <h2 style="color:#1E1A1A;">Reset your password</h2>
      <p>Hi <strong>TestUser</strong>, your reset OTP:</p>
      <div style="background:#FFF5E4;border:2px dashed #EE6723;border-radius:10px;padding:24px;text-align:center;">
        <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#EE6723;font-family:monospace;">739204</span>
      </div>
      <p style="color:#cc0000;font-size:13px;">⚠ Not you? Secure your account immediately.</p>
    `),
  },
  {
    name:    'password-reset-confirmation',
    subject: '[TEST] Your Arkam Ventures password has been changed',
    html: base(`
      <h2 style="color:#1E1A1A;">Password changed ✅</h2>
      <p>Hi <strong>TestUser</strong>, your password was just changed.</p>
      <div style="background:#fff3cd;border-left:4px solid #EE6723;padding:14px 18px;border-radius:4px;">
        <p style="margin:0;color:#856404;font-size:14px;">⚠ Not you? Contact <a href="mailto:arkamvc@gmail.com" style="color:#EE6723;">arkamvc@gmail.com</a></p>
      </div>
    `),
  },
  {
    name:    'notification',
    subject: '[TEST] A notification from Arkam Ventures',
    html: base(`
      <h2 style="color:#1E1A1A;">Your portfolio review is ready</h2>
      <p>Hi <strong>TestUser</strong>, we completed the review of your application.</p>
      <a href="https://arkamvc.com" style="display:inline-block;padding:12px 28px;background:#EE6723;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">View details →</a>
    `),
  },
];

async function sendOne(test) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender:      { email: FROM, name: 'Arkam Ventures' },
      to:          [{ email: SEND_TO }],
      subject:     test.subject,
      htmlContent: test.html,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return `❌  ${res.status} — ${err.message || JSON.stringify(err)}`;
  }
  const json = await res.json();
  return `✅  messageId: ${json.messageId}`;
}

async function main() {
  console.log('\n📧 Arkam Ventures — Email Test (Brevo API)');
  console.log('─'.repeat(55));
  console.log(`API Key  : ${API_KEY.substring(0, 12)}...`);
  console.log(`From     : ${FROM}`);
  console.log(`Send to  : ${SEND_TO}`);
  console.log(`Filter   : ${FILTER}`);
  console.log('─'.repeat(55));

  const toSend = FILTER === 'all' ? TESTS : TESTS.filter(t => t.name === FILTER);

  if (!toSend.length) {
    console.error(`❌ Unknown template "${FILTER}". Options: ${TESTS.map(t => t.name).join(', ')}`);
    process.exit(1);
  }

  for (const test of toSend) {
    process.stdout.write(`Sending [${test.name}]... `);
    console.log(await sendOne(test));
  }

  console.log('\nDone. Check your inbox at:', SEND_TO);
}

main().catch(e => {
  console.error('Fatal:', e.message);
  if (e.cause) console.error('Cause:', e.cause?.message || e.cause);
  process.exit(1);
});
