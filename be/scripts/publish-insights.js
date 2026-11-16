/**
 * Publishes the Insights page content: one Insight entry per card, each holding a single
 * dynamic-zone component (insights.book-card / insights.series-card / insights.video-card).
 * Uploads images from C:\Users\saisi\Downloads\insights. Removes the old dummy seed entries.
 *
 * Usage: node scripts/publish-insights.js   (Strapi must be running on :1337)
 */
const fs = require('fs');
const path = require('path');
const STRAPI_URL = 'http://localhost:1337';
const SRC = 'C:/Users/saisi/Downloads/insights';
const CT = 'api::insight.insight';

const DUMMY_TITLES = [
  'Slingshot — The Rise of Middle India',
  'Future View — SaaS from India',
  'Video Insights',
  'Recommended Books',
];

const IMG = {
  winning: 'bookCovers/image 627.jpg',
  moonshot: 'bookCovers/image 629.jpg',
  amrish: 'thumbNails/Rectangle 6720.jpg',
  pramod: 'thumbNails/Screenshot 2022-11-18 at 4.41 1.jpg',
  arun: 'thumbNails/Screenshot 2022-11-18 at 4.43 1.jpg',
};

const FV = 'Future View';
const VIDEOS = [
  {
    title: 'India Fintech with Amrish Rau, CEO, Pine Labs',
    publishedOn: '2021-04-13',
    description: 'Few people have had a better ringside view on the evolution of Indian Fintech than Amrish Rau.',
    img: 'amrish',
  },
  {
    title: 'India InsureTech Market, Business Models and Opportunities with Arun Balakrishnan, Founder, Xceedance',
    publishedOn: '2021-02-16',
    description: 'In this edition of FutureView we have a conversation with Arun Balakrishnan,',
    img: 'arun',
  },
  {
    title: 'Innovation for a Billion Users with Pramod Verma, Chief Architect, Aadhaar',
    publishedOn: '2021-04-13',
    description: 'In this edition of Future View we speak with the architect of the Aadhar platform',
    img: 'pramod',
  },
];

// The Figma page shows this 3-video set repeated in 3 rows -> 9 video cards.
const ENTRIES = [
  {
    title: 'Winning Middle India',
    img: 'winning',
    layout: [
      {
        __component: 'insights.book-card',
        bookTitle: 'Winning Middle India',
        bookSubtitle: "The Story Of India's New-Age Entrepreneurs",
        author: 'Bala Srinivasa',
        amazonUrl: 'https://www.amazon.in',
        reviews: [
          {
            reviewerName: 'Nandan Nilekani',
            reviewerDesignation: 'Non-executive chairman - Infosys, Former chairman - UIDAI',
            reviewText:
              "The book is a compelling story of how India is finding unique ways to address its myriad challenges. India's strategy to create a range of Digital Public Goods, helped shape its distinctive and inclusive approach to the Internet era.",
          },
        ],
      },
    ],
  },
  {
    title: 'The Moonshot Game',
    img: 'moonshot',
    layout: [
      {
        __component: 'insights.book-card',
        bookTitle: 'The Moonshot Game',
        bookSubtitle: 'Adventures of an Indian Venture Capitalist',
        author: 'Rahul Chandra',
        amazonUrl: 'https://www.amazon.in',
        reviews: [
          {
            reviewerName: 'Deep Kalra',
            reviewerDesignation: 'Co-Founder and CEO, MakeMyTrip',
            reviewText:
              "A rare insider's view of a VC's throught process captured over a decade of investing - what they look for.",
          },
        ],
      },
    ],
  },
  {
    title: 'Slingshot',
    layout: [
      {
        __component: 'insights.series-card',
        seriesTitle: 'Slingshot',
        description: 'An interview series on Product Management for Middle India.',
      },
    ],
  },
  {
    title: 'Future View',
    layout: [
      {
        __component: 'insights.series-card',
        seriesTitle: 'Future View',
        description: 'Conversations with industry experts on trends and technologies changing the world',
      },
    ],
  },
  ...[1, 2, 3].flatMap((row) =>
    VIDEOS.map((v) => ({
      title: v.title,
      img: v.img,
      layout: [
        {
          __component: 'insights.video-card',
          title: v.title,
          seriesName: FV,
          publishedOn: v.publishedOn,
          description: v.description,
        },
      ],
    }))
  ),
];

async function main() {
  const loginRes = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'siddhusai.kovur@terralogic.com', password: 'Siddhu9944' }),
  });
  const token = (await loginRes.json()).data?.token;
  if (!token) { console.error('Login failed'); process.exit(1); }
  const auth = { Authorization: `Bearer ${token}` };
  const json = { ...auth, 'Content-Type': 'application/json' };
  const cm = `${STRAPI_URL}/content-manager/collection-types/${CT}`;

  // Remove the old dummy seed entries (and any previous run of this script)
  const existing = (await (await fetch(`${cm}?page=1&pageSize=100`, { headers: auth })).json()).results || [];
  for (const e of existing) {
    await fetch(`${cm}/${e.documentId}`, { method: 'DELETE', headers: auth });
  }
  console.log(`Removed ${existing.length} existing insight entries.`);

  // Upload each image once
  const uploaded = {};
  for (const [key, rel] of Object.entries(IMG)) {
    const file = path.join(SRC, rel);
    const form = new FormData();
    form.append('files', new Blob([fs.readFileSync(file)], { type: 'image/jpeg' }), path.basename(file));
    const r = await fetch(`${STRAPI_URL}/upload`, { method: 'POST', headers: auth, body: form });
    if (!r.ok) { console.error(`Upload failed ${key}: ${r.status} ${(await r.text()).slice(0, 150)}`); process.exit(1); }
    uploaded[key] = (await r.json())[0].id;
    console.log(`Uploaded ${key} -> ${uploaded[key]}`);
  }

  let n = 0;
  for (const entry of ENTRIES) {
    const layout = entry.layout.map((c) => {
      if (!entry.img) return c;
      const field = c.__component === 'insights.book-card' ? 'bookCover' : 'thumbnail';
      return { ...c, [field]: uploaded[entry.img] };
    });
    const res = await fetch(cm, { method: 'POST', headers: json, body: JSON.stringify({ title: entry.title, layout }) });
    if (!res.ok) { console.error(`Create failed (${entry.title}): ${res.status} ${(await res.text()).slice(0, 300)}`); continue; }
    const doc = (await res.json()).data;
    const pub = await fetch(`${cm}/${doc.documentId}/actions/publish`, { method: 'POST', headers: json, body: '{}' });
    console.log(`${pub.ok ? 'Published' : 'PUBLISH FAILED ' + pub.status}: ${entry.title}`);
    if (pub.ok) n++;
  }
  console.log(`Done. ${n}/${ENTRIES.length} entries published.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
