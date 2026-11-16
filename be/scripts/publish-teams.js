const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genDocId() {
  return crypto.randomBytes(12).toString('hex');
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  const jsonPath = fs.existsSync(path.resolve(__dirname, '../../scratch/prepared_team.json'))
    ? path.resolve(__dirname, '../../scratch/prepared_team.json')
    : path.resolve('scratch/prepared_team.json');

  const teamData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  console.log('Connected to MySQL database.');

  // 1. Clear existing teams, their files, and components
  const [existingTeams] = await connection.query('SELECT id FROM teams');
  if (existingTeams.length > 0) {
    await connection.query(`DELETE FROM files_related_mph WHERE related_type = 'api::team.team'`);
    await connection.query(`DELETE FROM teams_cmps WHERE component_type = 'teams.social-media'`);
    await connection.query(`DELETE FROM teams`);
    console.log(`Cleaned up previous team rows.`);
  }

  // Also clean up any team profile pictures from files table if matching team names
  for (const m of teamData) {
    await connection.query(`DELETE FROM files WHERE name = ?`, [m.file_name]);
  }

  const now = new Date();

  // 2. Insert each member with BOTH Draft and Published records (Strapi 5 Document Service format)
  for (const m of teamData) {
    // A. Insert file into files table
    const fileDocId = genDocId();
    const [fileResult] = await connection.query(
      `INSERT INTO files (document_id, name, width, height, hash, ext, mime, size, url, provider, created_at, updated_at, published_at, created_by_id, updated_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', ?, ?, ?, 1, 1)`,
      [
        fileDocId,
        m.file_name,
        m.width,
        m.height,
        m.file_hash,
        '.jpg',
        m.mime,
        m.size,
        m.url,
        now,
        now,
        now
      ]
    );
    const fileId = fileResult.insertId;

    const teamDocId = genDocId();
    const slug = slugify(m.name);

    // B1. Insert DRAFT row (published_at = NULL) - This is what Strapi Content Manager displays and edits!
    const [draftResult] = await connection.query(
      `INSERT INTO teams (document_id, name, slug, designation, member_type, created_at, updated_at, published_at, created_by_id, updated_by_id)
       VALUES (?, ?, ?, ?, 'Board', ?, ?, NULL, 1, 1)`,
      [
        teamDocId,
        m.name,
        slug,
        m.designation,
        now,
        now
      ]
    );
    const draftId = draftResult.insertId;

    // B2. Insert PUBLISHED row (published_at = timestamp) - This is what the public frontend API returns!
    const [pubResult] = await connection.query(
      `INSERT INTO teams (document_id, name, slug, designation, member_type, created_at, updated_at, published_at, created_by_id, updated_by_id)
       VALUES (?, ?, ?, ?, 'Board', ?, ?, ?, 1, 1)`,
      [
        teamDocId,
        m.name,
        slug,
        m.designation,
        now,
        now,
        now
      ]
    );
    const pubId = pubResult.insertId;

    // C. Link file in files_related_mph to BOTH Draft and Published records
    await connection.query(
      `INSERT INTO files_related_mph (file_id, related_id, related_type, field, \`order\`)
       VALUES (?, ?, 'api::team.team', 'profilePicture', 1)`,
      [fileId, draftId]
    );
    await connection.query(
      `INSERT INTO files_related_mph (file_id, related_id, related_type, field, \`order\`)
       VALUES (?, ?, 'api::team.team', 'profilePicture', 1)`,
      [fileId, pubId]
    );

    // D1. Insert Social Media Repeater for Draft
    const [draftLiRes] = await connection.query(
      `INSERT INTO components_teams_social_medias (text, profile_uri) VALUES (?, ?)`,
      ['LinkedIn', 'https://www.linkedin.com']
    );
    const draftLiId = draftLiRes.insertId;

    const [draftTwRes] = await connection.query(
      `INSERT INTO components_teams_social_medias (text, profile_uri) VALUES (?, ?)`,
      ['Twitter', 'https://twitter.com']
    );
    const draftTwId = draftTwRes.insertId;

    await connection.query(
      `INSERT INTO teams_cmps (entity_id, cmp_id, component_type, field, \`order\`)
       VALUES (?, ?, 'teams.social-media', 'SocialMediaRepeater', 1)`,
      [draftId, draftLiId]
    );
    await connection.query(
      `INSERT INTO teams_cmps (entity_id, cmp_id, component_type, field, \`order\`)
       VALUES (?, ?, 'teams.social-media', 'SocialMediaRepeater', 2)`,
      [draftId, draftTwId]
    );

    // D2. Insert Social Media Repeater for Published
    const [pubLiRes] = await connection.query(
      `INSERT INTO components_teams_social_medias (text, profile_uri) VALUES (?, ?)`,
      ['LinkedIn', 'https://www.linkedin.com']
    );
    const pubLiId = pubLiRes.insertId;

    const [pubTwRes] = await connection.query(
      `INSERT INTO components_teams_social_medias (text, profile_uri) VALUES (?, ?)`,
      ['Twitter', 'https://twitter.com']
    );
    const pubTwId = pubTwRes.insertId;

    await connection.query(
      `INSERT INTO teams_cmps (entity_id, cmp_id, component_type, field, \`order\`)
       VALUES (?, ?, 'teams.social-media', 'SocialMediaRepeater', 1)`,
      [pubId, pubLiId]
    );
    await connection.query(
      `INSERT INTO teams_cmps (entity_id, cmp_id, component_type, field, \`order\`)
       VALUES (?, ?, 'teams.social-media', 'SocialMediaRepeater', 2)`,
      [pubId, pubTwId]
    );

    console.log(`Synced team document: ${m.name} (${m.designation}) [docId: ${teamDocId}, draftId: ${draftId}, pubId: ${pubId}]`);
  }

  // 3. Ensure Public and Authenticated permissions for api::team.team.find and findOne
  const actions = ['api::team.team.find', 'api::team.team.findOne'];
  for (const action of actions) {
    let [permRows] = await connection.query(`SELECT id FROM up_permissions WHERE action = ?`, [action]);
    let permId;
    if (permRows.length === 0) {
      const pDocId = genDocId();
      const [pIns] = await connection.query(
        `INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?)`,
        [pDocId, action, now, now, now]
      );
      permId = pIns.insertId;
      console.log(`Created permission: ${action} [id: ${permId}]`);
    } else {
      permId = permRows[0].id;
    }

    // Link to role 2 (Public)
    const [pubLink] = await connection.query(
      `SELECT * FROM up_permissions_role_lnk WHERE permission_id = ? AND role_id = 2`,
      [permId]
    );
    if (pubLink.length === 0) {
      await connection.query(
        `INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, 2)`,
        [permId]
      );
      console.log(`Granted ${action} to Public role.`);
    }

    // Link to role 1 (Authenticated)
    const [authLink] = await connection.query(
      `SELECT * FROM up_permissions_role_lnk WHERE permission_id = ? AND role_id = 1`,
      [permId]
    );
    if (authLink.length === 0) {
      await connection.query(
        `INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, 1)`,
        [permId]
      );
      console.log(`Granted ${action} to Authenticated role.`);
    }
  }

  // Verification query
  const [draftRows] = await connection.query(`SELECT id, document_id, name, designation, member_type, published_at FROM teams WHERE published_at IS NULL`);
  const [pubRows] = await connection.query(`SELECT id, document_id, name, designation, member_type, published_at FROM teams WHERE published_at IS NOT NULL`);
  console.log(`\nVerified Draft entries (for Strapi Content Manager UI): ${draftRows.length}`);
  console.log(`Verified Published entries (for Frontend API): ${pubRows.length}`);

  await connection.end();
  console.log('\nAll done successfully!');
}

main().catch(console.error);
