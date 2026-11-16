/**
 * SMTP debug script — tests multiple ports and configs to find what works.
 * Run: node scripts/debug-smtp.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const user = process.env.SMTP_USERNAME;
const pass = process.env.SMTP_PASSWORD;

const configs = [
  { label: 'smtp.brevo.com : 587 (STARTTLS)', host: 'smtp.brevo.com',       port: 587, secure: false },
  { label: 'smtp.brevo.com : 465 (SSL)',      host: 'smtp.brevo.com',       port: 465, secure: true  },
  { label: 'smtp-relay.brevo.com : 587',      host: 'smtp-relay.brevo.com', port: 587, secure: false },
];

async function test(cfg) {
  const t = nodemailer.createTransport({
    host:   cfg.host,
    port:   cfg.port,
    secure: cfg.secure,
    auth:   { user, pass },
    connectionTimeout: 8000,
    greetingTimeout:   8000,
    socketTimeout:     8000,
  });
  try {
    await t.verify();
    return '✅ OK';
  } catch (e) {
    return `❌ ${e.message}`;
  }
}

async function main() {
  console.log('\n🔍 Brevo SMTP Debug');
  console.log('─'.repeat(60));
  console.log(`SMTP_USERNAME : ${user}`);
  console.log(`SMTP_HOST     : ${process.env.SMTP_HOST}`);
  console.log('─'.repeat(60));

  for (const cfg of configs) {
    process.stdout.write(`Testing ${cfg.label} ... `);
    console.log(await test(cfg));
  }
}

main();
