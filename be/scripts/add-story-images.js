/**
 * Downloads royalty-free images and uploads them to Strapi stories.
 * Uses the admin upload endpoint (no API token needed).
 *
 * Usage: node scripts/add-story-images.js
 */
const fs = require('fs');
const path = require('path');
const STRAPI_URL = 'http://localhost:1337';

const UNSPLASH_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=560&fit=crop', filename: 'grocery-supply-chain.jpg' },
  { url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=560&fit=crop', filename: 'fintech-lending.jpg' },
  { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&h=560&fit=crop', filename: 'investing-stocks.jpg' },
  { url: 'https://images.unsplash.com/photo-1450101499163-c8848e968ab7?w=900&h=560&fit=crop', filename: 'contract-management.jpg' },
  { url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&h=560&fit=crop', filename: 'digital-savings.jpg' },
  { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=560&fit=crop', filename: 'digital-identity.jpg' },
];

async function downloadImage(url, filepath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
  console.log(`  Downloaded ${path.basename(filepath)} (${(buffer.length / 1024).toFixed(0)}KB)`);
}

async function main() {
  // Login
  const loginRes = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'siddhusai.kovur@terralogic.com',
      password: 'Siddhu9944',
    }),
  });
  const { data: loginData } = await loginRes.json();
  const token = loginData?.token;
  if (!token) { console.error('Login failed'); process.exit(1); }
  console.log('Logged in.\n');

  // List stories
  const storiesRes = await fetch(
    `${STRAPI_URL}/content-manager/collection-types/api::story.story?page=1&pageSize=50&sort=createdAt:ASC&populate=blogImg`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const stories = (await storiesRes.json()).results || [];
  console.log(`Found ${stories.length} stories.`);

  const tmpDir = path.join(__dirname, '.tmp-images');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  let count = 0;
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    if (story.blogImg?.id) {
      console.log(`  ${i + 1}. Has image — skip`);
      continue;
    }

    const img = UNSPLASH_IMAGES[count % UNSPLASH_IMAGES.length];
    const fname = `story-${i + 1}.jpg`;
    const filepath = path.join(tmpDir, fname);

    console.log(`  ${i + 1}. "${(story.shortDes || '').slice(0, 45)}..."`);

    // Download
    try { await downloadImage(img.url, filepath); }
    catch (e) { console.error(`  Download error: ${e.message}`); continue; }

    // Upload via admin upload endpoint
    const fileBuffer = fs.readFileSync(filepath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    const form = new FormData();
    form.append('files', blob, fname);

    let uploadedId;
    try {
      const upRes = await fetch(`${STRAPI_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!upRes.ok) {
        console.error(`  Upload ${upRes.status}: ${(await upRes.text()).slice(0, 150)}`);
        continue;
      }
      const upData = await upRes.json();
      uploadedId = upData[0]?.id;
      console.log(`  Uploaded → id:${uploadedId}`);
    } catch (e) { console.error(`  Upload error: ${e.message}`); continue; }

    // Link to story
    try {
      const updRes = await fetch(
        `${STRAPI_URL}/content-manager/collection-types/api::story.story/${story.documentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ blogImg: uploadedId }),
        }
      );
      if (!updRes.ok) { console.error(`  Link failed: ${updRes.status}`); continue; }
      console.log(`  Linked.`);

      // Publish
      await fetch(
        `${STRAPI_URL}/content-manager/collection-types/api::story.story/${story.documentId}/actions/publish`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      console.log(`  Published.\n`);
      count++;
    } catch (e) { console.error(`  Error: ${e.message}`); }
  }

  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  console.log(`Done! Added images to ${count} stories.`);
}

main().catch(console.error);
