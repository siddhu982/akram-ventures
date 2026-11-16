/**
 * Populates + publishes the Thesis page (single "thesis" entry) from C:\Users\saisi\Downloads\thesis.
 * Uploads every asset to the Strapi media library, then updates the existing entry (no duplicates)
 * and publishes it.
 *
 * Usage: node scripts/publish-thesis.js   (Strapi must be running on :1337)
 */
const fs = require('fs');
const path = require('path');
const U = 'http://localhost:1337';
const CT = 'api::thesis.thesis';
const SRC = 'C:/Users/saisi/Downloads/thesis';
const IMGS = `${SRC}/imagesRequred`;
const LOGOS = `${SRC}/LOGOS`;
const LOCAL_ICONS = path.join(__dirname, '../../fe/public/images/thesis');

const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

const FILES = {
  stats: [`${IMGS}/change the same image for travel related data.png`, 'Digital adoption stats'],
  portraits: [`${IMGS}/image 642.jpg`, 'Portraits of Indians'],
  payments: [`${IMGS}/image 636.jpg`, 'Digital payment on phones'],
  laptop: [`${IMGS}/image 637.jpg`, 'SaaS on a laptop'],
  iconMiddle: [`${LOCAL_ICONS}/Digitalization.svg`, 'Middle India Digitization icon'],
  iconSaas: [`${LOCAL_ICONS}/SaaS.svg`, 'SaaS from India icon'],
  fintech: [`${IMGS}/Fintech.jpg`, 'Financial Services'],
  agri: [`${IMGS}/Food & Agri.jpg`, 'Food & Agri'],
  health: [`${IMGS}/Healthcare.jpg`, 'Healthcare'],
  logistics: [`${IMGS}/Logistics.jpg`, 'Logistics'],
  saas: [`${IMGS}/SaaS.jpg`, 'SaaS'],
  robot: [`${IMGS}/image 638.jpg`, 'AI & Deep Tech'],
  bulb: [`${IMGS}/Rectangle 6743.jpg`, 'Innovation'],
  jumbotail: [`${LOGOS}/Jumbotail.svg`, 'Jumbotail'],
  jar: [`${LOGOS}/image 613.svg`, 'Jar'],
  kreditbee: [`${LOGOS}/image 630.svg`, 'KreditBee'],
  smartstaff: [`${LOGOS}/image 611.svg`, 'smartstaff'],
  smallcase: [`${LOGOS}/Fill-1.svg`, 'smallcase'],
  spotdraft: [`${LOGOS}/SpotDraft.svg`, 'SpotDraft'],
  signzy: [`${LOGOS}/Signzy.svg`, 'Signzy'],
  cusmat: [`${LOGOS}/Cusmat.svg`, 'Cusmat'],
  customerglu: [`${LOGOS}/CustomerGlue.svg`, 'CustomerGlu'],
};

async function main() {
  const lr = await fetch(`${U}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'siddhusai.kovur@terralogic.com', password: 'Siddhu9944' }),
  });
  const token = (await lr.json()).data?.token;
  if (!token) throw new Error('Login failed');
  const auth = { Authorization: `Bearer ${token}` };
  const json = { ...auth, 'Content-Type': 'application/json' };

  // 1. Upload every asset once
  const id = {};
  for (const [key, [file, alt]] of Object.entries(FILES)) {
    const form = new FormData();
    const name = path.basename(file);
    form.append('files', new Blob([fs.readFileSync(file)], { type: MIME[path.extname(file).toLowerCase()] }), name);
    form.append('fileInfo', JSON.stringify({ alternativeText: alt, name: `thesis-${key}${path.extname(file)}` }));
    const r = await fetch(`${U}/upload`, { method: 'POST', headers: auth, body: form });
    if (!r.ok) throw new Error(`Upload ${key} failed: ${r.status} ${(await r.text()).slice(0, 200)}`);
    id[key] = (await r.json())[0].id;
    console.log(`uploaded ${key} -> ${id[key]}`);
  }

  const logo = (key) => ({ img1: id[key], imgTxt: FILES[key][1] });

  // 2. Update the existing entry
  const cm = `${U}/content-manager/collection-types/${CT}`;
  const list = (await (await fetch(`${cm}?pageSize=50`, { headers: auth })).json()).results || [];
  if (list.length < 1) throw new Error('No thesis entry found');
  const docId = list[0].documentId;

  const data = {
    heading: 'thesis',
    heroHeading: 'Arkam Ventures is a thesis centric firm',
    heroSubheading:
      'We have a long-term, often multi-decade, point of view on certain market trends, inflection points, and solutions that we believe are truly disruptive and have the potential to create large, scalable, and profitable new market leaders.',
    statsImage: id.stats,
    indiaQuote:
      'We believe India is at a unique point in its history in terms of digital adoption, macro-economic, and geo-political winds of change.',
    portraitsImage: id.portraits,
    themesIntroText:
      'Arkam invests across two major themes. These are generational themes with massive market drivers, innovation proof points, and clear opportunities for digital disruptors to reshape large industries or create new ones.',
    themeCards: [
      {
        icon: id.iconMiddle,
        title: 'Middle India Digitization',
        description:
          'Middle India Digitization is one of the largest global investment opportunities available today. There is a massive shift to digital transactions for essential categories that did not exist five years ago.',
      },
      {
        icon: id.iconSaas,
        title: 'SaaS from India to the world',
        description:
          'Combining world class product design, and cost effectiveness with savvy go-to-market approaches from India these SaaS companies are setting the stage for highly scalable and profitable growth.',
      },
    ],
    showcases: [
      {
        tag: 'Middle India Digitization',
        tagIcon: id.iconMiddle,
        heading:
          "For the first time in India's history, digitization is democratizing access to essential products and services for hundreds of millions of Indians below the top of the pyramid.",
        description:
          'Our companies have deep Middle India understanding reflected in their product design, low friction adoption, customer segmentation, trust building, and low cost acquisition and retention.',
        featureImage: id.payments,
        layoutDirection: 'image-right',
        logos: ['jumbotail', 'jar', 'kreditbee', 'smartstaff', 'smallcase'].map(logo),
      },
      {
        tag: 'SaaS from India to the world',
        tagIcon: id.iconSaas,
        heading: 'Over the past decade, there are increasing proof points of India building winning SaaS solutions for the world.',
        description:
          'Our companies combine world class product design, lower costs and savvy global go-to-market approaches that create deep moats and opportunities for market leadership.',
        featureImage: id.laptop,
        layoutDirection: 'image-left',
        logos: ['spotdraft', 'signzy', 'cusmat', 'customerglu'].map(logo),
      },
    ],
    bottomSlider: [
      {
        __component: 'thesis.bottom-slider-heading',
        title: 'Our focus areas',
        sliderImg1: ['fintech', 'agri', 'health', 'logistics', 'saas', 'robot', 'bulb'].map((k) => ({
          img1: id[k],
          imgTxt: FILES[k][1],
        })),
      },
    ],
  };

  const up = await fetch(`${cm}/${docId}`, { method: 'PUT', headers: json, body: JSON.stringify(data) });
  if (!up.ok) throw new Error(`Update failed: ${up.status} ${(await up.text()).slice(0, 500)}`);
  console.log('entry updated');

  const pub = await fetch(`${cm}/${docId}/actions/publish`, { method: 'POST', headers: json, body: '{}' });
  if (!pub.ok) throw new Error(`Publish failed: ${pub.status} ${(await pub.text()).slice(0, 500)}`);
  console.log('entry published');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
