const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genDocId() {
  return crypto.randomBytes(12).toString('hex');
}

function genHash() {
  return crypto.randomBytes(5).toString('hex');
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Advisors in screenshot order (top-left → bottom-right)
const ADVISORS = [
  { name: 'Pravan Malhotra',       srcFile: 'Pavan.jpg' },
  { name: 'Vikas Choudhury',       srcFile: 'Rectangle 4133.jpg' },
  { name: 'Ravi Venkatesan',       srcFile: 'Rectangle 4134.jpg' },
  { name: 'Jeremy Lim',            srcFile: 'Rectangle 4135.jpg' },
  { name: 'Anand Chandrasekharan', srcFile: 'Rectangle 4136.jpg' },
  { name: 'Hari TN',               srcFile: 'Rectangle 4137.jpg' },
  { name: 'Arun Balakrishnan',     srcFile: 'Rectangle 4138.jpg' },
  { name: 'Ameen Haque',           srcFile: 'Rectangle 4139.jpg' },
];

const UPLOADS_DIR  = path.resolve(__dirname, '../public/uploads');
const PROFILES2_DIR = 'C:/Users/saisi/Downloads/teams/profiles2';
const LOGOS_DIR     = 'C:/Users/saisi/Downloads/teams/logosSvg';

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: 'root', database: 'example1'
  });
  console.log('Connected to MySQL.');
  const now = new Date();

  // ─── 1. Upload LinkedIn & Twitter SVG logos ───────────────────────────────
  const liHash = genHash();
  const twHash = genHash();
  const liFileName = `Linkedin_${liHash}.svg`;
  const twFileName = `Twitter_${twHash}.svg`;

  fs.copyFileSync(path.join(LOGOS_DIR, 'Linkedin.svg'), path.join(UPLOADS_DIR, liFileName));
  fs.copyFileSync(path.join(LOGOS_DIR, 'Twitter.svg'),  path.join(UPLOADS_DIR, twFileName));
  console.log(`Copied ${liFileName} and ${twFileName} to uploads.`);

  const [liFileRes] = await connection.query(
    `INSERT INTO files (document_id, name, width, height, hash, ext, mime, size, url, provider, created_at, updated_at, published_at, created_by_id, updated_by_id)
     VALUES (?, 'Linkedin.svg', 44, 44, ?, '.svg', 'image/svg+xml', 1.09, ?, 'local', ?, ?, ?, 1, 1)`,
    [genDocId(), `Linkedin_${liHash}`, `/uploads/${liFileName}`, now, now, now]
  );
  const liFileId = liFileRes.insertId;

  const [twFileRes] = await connection.query(
    `INSERT INTO files (document_id, name, width, height, hash, ext, mime, size, url, provider, created_at, updated_at, published_at, created_by_id, updated_by_id)
     VALUES (?, 'Twitter.svg', 44, 44, ?, '.svg', 'image/svg+xml', 1.21, ?, 'local', ?, ?, ?, 1, 1)`,
    [genDocId(), `Twitter_${twHash}`, `/uploads/${twFileName}`, now, now, now]
  );
  const twFileId = twFileRes.insertId;
  console.log(`Inserted SVG files → LinkedIn id:${liFileId}, Twitter id:${twFileId}`);

  // ─── 2. Link SVG logos to existing Board member social media components ────
  // Any social-media component not yet having a SocialMediaImages entry gets one now.
  const [liComps] = await connection.query(
    `SELECT c.id FROM components_teams_social_medias c
     JOIN teams_cmps tc ON tc.cmp_id = c.id AND tc.component_type = 'teams.social-media'
     WHERE LOWER(c.text) = 'linkedin'`
  );
  const [twComps] = await connection.query(
    `SELECT c.id FROM components_teams_social_medias c
     JOIN teams_cmps tc ON tc.cmp_id = c.id AND tc.component_type = 'teams.social-media'
     WHERE LOWER(c.text) = 'twitter'`
  );

  let liLinked = 0, twLinked = 0;
  for (const comp of liComps) {
    const [existing] = await connection.query(
      `SELECT id FROM files_related_mph WHERE related_id = ? AND related_type = 'teams.social-media' AND field = 'SocialMediaImages'`,
      [comp.id]
    );
    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO files_related_mph (file_id, related_id, related_type, field, \`order\`) VALUES (?, ?, 'teams.social-media', 'SocialMediaImages', 1)`,
        [liFileId, comp.id]
      );
      liLinked++;
    }
  }
  for (const comp of twComps) {
    const [existing] = await connection.query(
      `SELECT id FROM files_related_mph WHERE related_id = ? AND related_type = 'teams.social-media' AND field = 'SocialMediaImages'`,
      [comp.id]
    );
    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO files_related_mph (file_id, related_id, related_type, field, \`order\`) VALUES (?, ?, 'teams.social-media', 'SocialMediaImages', 1)`,
        [twFileId, comp.id]
      );
      twLinked++;
    }
  }
  console.log(`Linked LinkedIn logo to ${liLinked} existing components, Twitter to ${twLinked}.`);

  // ─── 3. Insert Advisor team members ──────────────────────────────────────
  for (const advisor of ADVISORS) {
    const srcPath = path.join(PROFILES2_DIR, advisor.srcFile);
    const fileStats = fs.statSync(srcPath);
    const fileSize = Math.round(fileStats.size / 1024 * 100) / 100;

    const nameSlug  = advisor.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const imgHash   = genHash();
    const destName  = `${nameSlug}_${imgHash}.jpg`;

    fs.copyFileSync(srcPath, path.join(UPLOADS_DIR, destName));

    // Insert profile picture file record
    const [profFileRes] = await connection.query(
      `INSERT INTO files (document_id, name, width, height, hash, ext, mime, size, url, provider, created_at, updated_at, published_at, created_by_id, updated_by_id)
       VALUES (?, ?, 330, 330, ?, '.jpg', 'image/jpeg', ?, ?, 'local', ?, ?, ?, 1, 1)`,
      [genDocId(), `${advisor.name}.jpg`, `${nameSlug}_${imgHash}`, fileSize, `/uploads/${destName}`, now, now, now]
    );
    const profileFileId = profFileRes.insertId;

    const teamDocId = genDocId();
    const slug = slugify(advisor.name);

    // Draft row (published_at = NULL — shown in Strapi Admin)
    const [draftRes] = await connection.query(
      `INSERT INTO teams (document_id, name, slug, designation, member_type, created_at, updated_at, published_at, created_by_id, updated_by_id)
       VALUES (?, ?, ?, '', 'Advisor', ?, ?, NULL, 1, 1)`,
      [teamDocId, advisor.name, slug, now, now]
    );
    const draftId = draftRes.insertId;

    // Published row (published_at = timestamp — returned by public API)
    const [pubRes] = await connection.query(
      `INSERT INTO teams (document_id, name, slug, designation, member_type, created_at, updated_at, published_at, created_by_id, updated_by_id)
       VALUES (?, ?, ?, '', 'Advisor', ?, ?, ?, 1, 1)`,
      [teamDocId, advisor.name, slug, now, now, now]
    );
    const pubId = pubRes.insertId;

    // Link profile picture to both rows
    for (const rowId of [draftId, pubId]) {
      await connection.query(
        `INSERT INTO files_related_mph (file_id, related_id, related_type, field, \`order\`) VALUES (?, ?, 'api::team.team', 'profilePicture', 1)`,
        [profileFileId, rowId]
      );
    }

    // Insert social media components and link logos for draft and published
    for (const rowId of [draftId, pubId]) {
      const [liCompRes] = await connection.query(
        `INSERT INTO components_teams_social_medias (text, profile_uri) VALUES ('LinkedIn', 'https://www.linkedin.com')`
      );
      const liCompId = liCompRes.insertId;

      const [twCompRes] = await connection.query(
        `INSERT INTO components_teams_social_medias (text, profile_uri) VALUES ('Twitter', 'https://twitter.com')`
      );
      const twCompId = twCompRes.insertId;

      await connection.query(
        `INSERT INTO teams_cmps (entity_id, cmp_id, component_type, field, \`order\`) VALUES (?, ?, 'teams.social-media', 'SocialMediaRepeater', 1)`,
        [rowId, liCompId]
      );
      await connection.query(
        `INSERT INTO teams_cmps (entity_id, cmp_id, component_type, field, \`order\`) VALUES (?, ?, 'teams.social-media', 'SocialMediaRepeater', 2)`,
        [rowId, twCompId]
      );

      // Link SVG logos to the new social media components
      await connection.query(
        `INSERT INTO files_related_mph (file_id, related_id, related_type, field, \`order\`) VALUES (?, ?, 'teams.social-media', 'SocialMediaImages', 1)`,
        [liFileId, liCompId]
      );
      await connection.query(
        `INSERT INTO files_related_mph (file_id, related_id, related_type, field, \`order\`) VALUES (?, ?, 'teams.social-media', 'SocialMediaImages', 1)`,
        [twFileId, twCompId]
      );
    }

    console.log(`Published advisor: ${advisor.name} [docId:${teamDocId} draft:${draftId} pub:${pubId}]`);
  }

  // ─── Verification ─────────────────────────────────────────────────────────
  const [advisorRows] = await connection.query(
    `SELECT name FROM teams WHERE member_type = 'Advisor' AND published_at IS NOT NULL ORDER BY name`
  );
  const [boardRows] = await connection.query(
    `SELECT name FROM teams WHERE member_type = 'Board' AND published_at IS NOT NULL ORDER BY name`
  );
  console.log(`\nPublished Advisors (${advisorRows.length}):`);
  advisorRows.forEach(r => console.log(`  - ${r.name}`));
  console.log(`\nPublished Board members (${boardRows.length}):`);
  boardRows.forEach(r => console.log(`  - ${r.name}`));

  await connection.end();
  console.log('\nDone!');
}

main().catch(console.error);
