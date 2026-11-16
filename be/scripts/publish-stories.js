const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genDocId() { return crypto.randomBytes(12).toString('hex'); }
function genHash()  { return crypto.randomBytes(5).toString('hex'); }
function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80); }

const UPLOADS_DIR = path.resolve(__dirname, '../public/uploads');
const STORIES_IMG = 'C:/Users/saisi/Downloads/stories';

// Story 0: featured (KreditBee)
const FEATURED = {
  shortDes:    'KreditBee raises $80 million in Series D round',
  description: "Fintech startup KreditBee, on Friday announced that it has raised $80 million as part of its ongoing Series D round from existing investors Azim Premji's Premji Invest, Motilal Oswal Alternates, TPG-backed NewQuest Capital Partners, and Mirae Asset Ventures. The round also saw participation from MUFG Bank.",
  by:          null,
  readMore:    null,
  blogImgSrc:  'Rectangle 4045.jpg',
  mintLogoFileId: 50,
};

// Stories 1-10: separate blog post entries
const POSTS = [
  { shortDes: 'Venture Capital in 2022: A turning point & a silver lining',                    by: 'by Rahul Chandra, Times of India',   description: 'It is a well-known fact that like all industries, the VC industry also goes through cycles.',                                                                        imgSrc: 'Rectangle 6719.jpg',                   readMore: 'https://arkamvc.com/stories/venture-capital-2022' },
  { shortDes: 'Cash-rich family offices of small towns are buying into the India startup story', by: 'by Katya Naidu, Business Insider',   description: "The Indian startup story has not just gone global, it's going deep into the hinterlands too.",                                                                      imgSrc: 'image 623.jpg',                        readMore: 'https://arkamvc.com/stories/family-offices-startup' },
  { shortDes: "India Is In A Major Market Creation Mode",                                        by: 'by Malvika Maloo, VCCircle',         description: 'Arkam Ventures closed its first early-stage technology fund at $106 million in April.',                                                                          imgSrc: 'image 624.jpg',                        readMore: 'https://arkamvc.com/stories/india-major-market-creation' },
  { shortDes: 'Funding for Indian startups dips by 40% from Q1 CY22',                           by: 'by CNBCTV18',                        description: 'Is the funding winter here to stay, we will see startups opting for more debt investments?',                                                                       imgSrc: 'Screenshot 2022-12-07 at 10.57 1.jpg', readMore: 'https://arkamvc.com/stories/funding-dips-40-percent' },
  { shortDes: 'Arkam Ventures appoints Vishnuhari Pareek as Head of Finance',                    by: 'by ETCFO',                           description: 'Pareek was leading Finance for the Used Car business at CarDekha in his last role. Prior to that he was at Bharti AXA.',                                              imgSrc: 'image 623-1.jpg',                      readMore: 'https://arkamvc.com/stories/arkam-appoints-vishnuhari-pareek' },
  { shortDes: 'Startup news and updates: daily roundup November 29 2022',                        by: 'by Apurva P, YourStory',             description: 'Moving partners with Park+ to set up 2,000 battery-swapping stations.',                                                                                            imgSrc: 'image 624-1.jpg',                      readMore: 'https://arkamvc.com/stories/startup-roundup-nov-2022' },
  { shortDes: "Tiger Global Leads Jar's $22.6 Mn Funding Round Valuation Jumps To $300 Mn",     by: 'by Jaspreet Kaur, Inc42',            description: 'Investment tech startup Jar has secured $22.6 Mn in its Series B funding round at a post-money valuation of $300 Mn.',                                             imgSrc: 'Rectangle 6719-1.jpg',                 readMore: 'https://arkamvc.com/stories/tiger-global-jar-funding' },
  { shortDes: 'Fintech Jai Kisan raises $50 million in Series B',                                by: 'by Joseph Rai, Mint',                description: 'Rural Fintech startup Jai Kisan on Friday said it has raised $50 million in a mix of debt and equity.',                                                                imgSrc: 'image 623-2.jpg',                      readMore: 'https://arkamvc.com/stories/jai-kisan-50m-series-b' },
  { shortDes: 'Signzy raises $26M from Gaja Capital and returning investors',                    by: 'by Payal Ganguly, YourStory',        description: 'The company will utilise the capital to expand its no-code platform for workflow digitalisation to global financial institutions.',                                   imgSrc: 'image 624-2.jpg',                      readMore: 'https://arkamvc.com/stories/signzy-26m-gaja-capital' },
  { shortDes: 'We bet on startups catering to the middle of the pyramid: Arkam co-founders',     by: 'by Namit Gupta, Business Standard',  description: 'In a Q&A, Bala Srinivasa and Rahul Chandra explain why it is essential for any company today to service the mass market.',                                         imgSrc: 'Rectangle 6719-2.jpg',                 readMore: 'https://arkamvc.com/stories/arkam-cofounders-middle-pyramid' },
];

async function uploadImg(conn, srcFile, label, now) {
  const srcPath = path.join(STORIES_IMG, srcFile);
  const stats = fs.statSync(srcPath);
  const sizekb = Math.round(stats.size / 1024 * 100) / 100;
  const safeName = label.replace(/[^a-zA-Z0-9_]/g, '_');
  const hash = genHash();
  const ext = path.extname(srcFile).toLowerCase();
  const destName = `${safeName}_${hash}${ext}`;
  fs.copyFileSync(srcPath, path.join(UPLOADS_DIR, destName));
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  const [res] = await conn.query(
    `INSERT INTO files (document_id, name, width, height, hash, ext, mime, size, url, provider, created_at, updated_at, published_at, created_by_id, updated_by_id)
     VALUES (?, ?, 800, 500, ?, ?, ?, ?, ?, 'local', ?, ?, ?, 1, 1)`,
    [genDocId(), srcFile, `${safeName}_${hash}`, ext, mime, sizekb, `/uploads/${destName}`, now, now, now]
  );
  return res.insertId;
}

async function insertStory(conn, docId, data, now, published) {
  const [res] = await conn.query(
    `INSERT INTO stories (document_id, short_des, slug, description, \`by\`, read_more, created_at, updated_at, published_at, created_by_id, updated_by_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
    [docId, data.shortDes, slugify(data.shortDes), data.description, data.by || null, data.readMore || null, now, now, published ? now : null]
  );
  return res.insertId;
}

async function main() {
  const conn = await mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'root',database:'example1'});
  console.log('Connected.');
  const now = new Date();

  // ─── 0. Add by / read_more columns if missing ───────────────────────────────
  const [byCols] = await conn.query("SHOW COLUMNS FROM stories LIKE 'by'");
  if (byCols.length === 0) {
    await conn.query("ALTER TABLE stories ADD COLUMN `by` varchar(255) DEFAULT NULL");
    console.log('Added `by` column.');
  }
  const [rmCols] = await conn.query("SHOW COLUMNS FROM stories LIKE 'read_more'");
  if (rmCols.length === 0) {
    await conn.query("ALTER TABLE stories ADD COLUMN read_more varchar(255) DEFAULT NULL");
    console.log('Added read_more column.');
  }

  // ─── 1. Clear all existing stories + related data ───────────────────────────
  await conn.query("DELETE FROM files_related_mph WHERE related_type IN ('api::story.story','story.blog-card')");
  await conn.query("DELETE FROM components_story_blog_card_groups_cmps");
  await conn.query("DELETE FROM components_story_blog_cards");
  await conn.query("DELETE FROM components_story_blog_card_groups");
  await conn.query("DELETE FROM stories_cmps");
  await conn.query("DELETE FROM stories");
  console.log('Cleared existing stories.');

  // ─── 2. Featured story (KreditBee) ──────────────────────────────────────────
  const featDocId = genDocId();
  const blogImgId = await uploadImg(conn, FEATURED.blogImgSrc, 'kreditbee_banner', now);
  const featDraftId = await insertStory(conn, featDocId, FEATURED, now, false);
  const featPubId   = await insertStory(conn, featDocId, FEATURED, now, true);
  for (const rowId of [featDraftId, featPubId]) {
    await conn.query("INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?,?,'api::story.story','blogImg',1)", [blogImgId, rowId]);
    await conn.query("INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?,?,'api::story.story','brandLogo',1)", [FEATURED.mintLogoFileId, rowId]);
  }
  console.log(`[0] Featured: "${FEATURED.shortDes}" draft:${featDraftId} pub:${featPubId}`);

  // ─── 3. 10 blog post entries ─────────────────────────────────────────────────
  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const docId = genDocId();
    const imgId = await uploadImg(conn, post.imgSrc, `story_post_${i + 1}`, now);
    const draftId = await insertStory(conn, docId, post, now, false);
    const pubId   = await insertStory(conn, docId, post, now, true);
    for (const rowId of [draftId, pubId]) {
      await conn.query("INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?,?,'api::story.story','blogImg',1)", [imgId, rowId]);
    }
    console.log(`[${i + 1}] "${post.shortDes.substring(0, 55)}..." draft:${draftId} pub:${pubId}`);
  }

  // ─── Verification ────────────────────────────────────────────────────────────
  const [published] = await conn.query("SELECT id, short_des FROM stories WHERE published_at IS NOT NULL ORDER BY id");
  console.log(`\nPublished story entries: ${published.length}`);
  published.forEach(s => console.log(`  [${s.id}] ${s.short_des}`));

  await conn.end();
  console.log('\nDone!');
}

main().catch(console.error);
