/**
 * One-time script to:
 * 1. Login to Strapi admin
 * 2. Seed new fields on existing thesis/portfolio entries
 * 3. Create single-type entries (footer, about-section, pitch-page, team-page, stories-page)
 * 4. Set public permissions for new content types
 * 5. Seed dummy stories and insights
 *
 * Usage: node scripts/seed-and-permissions.js
 */

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'siddhusai.kovur@terralogic.com';
const ADMIN_PASSWORD = 'Siddhu9944';

async function main() {
  // 1. Login
  console.log('[1/6] Logging in...');
  const loginRes = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const loginData = await loginRes.json();
  if (!loginData.data?.token) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.data.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('  Logged in successfully.');

  // 2. Seed single types
  console.log('[2/6] Seeding single types...');

  const singleTypes = [
    {
      uid: 'api::footer.footer',
      endpoint: '/content-manager/single-types/api::footer.footer',
      data: {
        ctaHeading: 'Calling Limitless entrepreneurs',
        ctaButtonText: 'Pitch to us',
        ctaButtonUrl: '/contact',
        email: 'arkamvc@gmail.com',
        addressLine1: 'Arkam Ventures, Indique Leela, 6th Floor, No.23,',
        addressLine2: 'HAL 2nd Stage, Old Airport Road, Bangalore 560008',
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
          { platform: 'twitter', url: 'https://twitter.com' },
        ],
      },
    },
    {
      uid: 'api::about-section.about-section',
      endpoint: '/content-manager/single-types/api::about-section.about-section',
      data: {
        heading: 'Arkam',
        description1: 'Sanskrit word meaning "all the way to the sun" or limitless expanse.',
        description2: 'Arkam partners with limitless founders innovating to build a new India.',
      },
    },
    {
      uid: 'api::pitch-page.pitch-page',
      endpoint: '/content-manager/single-types/api::pitch-page.pitch-page',
      data: {
        subtitle: 'Pitch to us',
        title: 'We are looking for limitless founders of tomorrow',
      },
    },
    {
      uid: 'api::team-page.team-page',
      endpoint: '/content-manager/single-types/api::team-page.team-page',
      data: { heading: 'Meet the Team' },
    },
    {
      uid: 'api::stories-page.stories-page',
      endpoint: '/content-manager/single-types/api::stories-page.stories-page',
      data: { heading: 'Stories' },
    },
  ];

  for (const st of singleTypes) {
    try {
      // Try to get existing
      const getRes = await fetch(`${STRAPI_URL}${st.endpoint}`, { headers });
      const getData = await getRes.json();

      if (getData.data && getData.data.id) {
        console.log(`  ${st.uid}: already exists, skipping.`);
      } else {
        // Create via PUT
        const putRes = await fetch(`${STRAPI_URL}${st.endpoint}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(st.data),
        });
        const putData = await putRes.json();
        if (putData.data) {
          console.log(`  ${st.uid}: created.`);
        } else {
          console.log(`  ${st.uid}: PUT response:`, JSON.stringify(putData).slice(0, 200));
        }
      }
    } catch (err) {
      console.warn(`  ${st.uid}: error -`, err.message);
    }
  }

  // 3. Update thesis entry with new fields
  console.log('[3/6] Updating thesis entry...');
  try {
    const thesisRes = await fetch(`${STRAPI_URL}/api/theses?populate=*`, { headers });
    const thesisData = await thesisRes.json();
    if (thesisData.data && thesisData.data.length > 0) {
      const thesis = thesisData.data[0];
      if (!thesis.heroHeading) {
        const updateRes = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/api::thesis.thesis/${thesis.documentId}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              heroHeading: 'Arkam Ventures is a thesis centric firm',
              heroSubheading:
                'We have a long-term, often multi-decade, point of view on certain market trends, inflection points, and solutions that we believe are truly disruptive and have the potential to create large, scalable, and profitable new market leaders.',
              indiaQuote:
                'We believe India is at a unique point in its history in terms of digital adoption, macro-economic, and geo-political winds of change.',
              themesIntroText:
                'Arkam invests across two major themes. These are generational themes with massive market drivers, innovation proof points, and clear opportunities for digital disruptors to reshape large industries or create new ones.',
              themeCards: [
                {
                  title: 'Middle India Digitization',
                  description:
                    'Middle India Digitization is one of the largest global investment opportunities available today. There is a massive shift to digital transactions for essential categories that did not exist five years ago.',
                },
                {
                  title: 'SaaS from India to the world',
                  description:
                    'Combining world class product design, and cost effectiveness with savvy go-to-market approaches from India these SaaS companies are setting the stage for highly scalable and profitable growth.',
                },
              ],
              showcases: [
                {
                  tag: 'Middle India Digitization',
                  heading:
                    "For the first time in India's history, digitization is democratizing access to essential products and services for hundreds of millions of Indians below the top of the pyramid.",
                  description:
                    'Our companies have deep Middle India understanding reflected in their product design, low friction adoption, customer segmentation, trust building, and low cost acquisition and retention.',
                  layoutDirection: 'image-right',
                },
                {
                  tag: 'SaaS from India to the world',
                  heading:
                    'Over the past decade, there are increasing proof points of India building winning SaaS solutions for the world.',
                  description:
                    'Our companies combine world class product design, lower costs and savvy global go-to-market approaches that create deep moats and opportunities for market leadership.',
                  layoutDirection: 'image-left',
                },
              ],
            }),
          }
        );
        const updateData = await updateRes.json();
        console.log('  Thesis updated:', updateData.data ? 'success' : JSON.stringify(updateData).slice(0, 200));
      } else {
        console.log('  Thesis already has heroHeading, skipping.');
      }
    }
  } catch (err) {
    console.warn('  Thesis update error:', err.message);
  }

  // 4. Update portfolio entry with new fields
  console.log('[4/6] Updating portfolio entry...');
  try {
    const portRes = await fetch(`${STRAPI_URL}/api/portfolios?populate=*`, { headers });
    const portData = await portRes.json();
    if (portData.data && portData.data.length > 0) {
      const portfolio = portData.data[0];
      if (!portfolio.heroHeading) {
        const updateRes = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/api::portfolio.portfolio/${portfolio.documentId}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              heroHeading: 'Investing in ideas that are transforming the world',
            }),
          }
        );
        const updateData = await updateRes.json();
        console.log('  Portfolio updated:', updateData.data ? 'success' : JSON.stringify(updateData).slice(0, 200));
      } else {
        console.log('  Portfolio already has heroHeading, skipping.');
      }
    }
  } catch (err) {
    console.warn('  Portfolio update error:', err.message);
  }

  // 5. Set public permissions for new content types
  console.log('[5/6] Setting public permissions...');
  try {
    // Get the public role
    const rolesRes = await fetch(`${STRAPI_URL}/admin/roles`, { headers });
    const rolesData = await rolesRes.json();

    // Get users-permissions roles
    const upRolesRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, { headers });
    const upRolesData = await upRolesRes.json();
    const publicRole = upRolesData.roles?.find((r) => r.type === 'public');

    if (publicRole) {
      // Get current permissions for the public role
      const roleDetailRes = await fetch(
        `${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`,
        { headers }
      );
      const roleDetail = await roleDetailRes.json();
      const permissions = roleDetail.role?.permissions || {};

      // Enable find for new content types
      const newTypes = [
        'api::footer',
        'api::about-section',
        'api::pitch-page',
        'api::team-page',
        'api::stories-page',
      ];

      for (const typeName of newTypes) {
        const shortName = typeName.split('::')[1];
        if (permissions[typeName]) {
          const controllers = permissions[typeName].controllers || {};
          for (const controllerName in controllers) {
            if (controllers[controllerName].find) {
              controllers[controllerName].find.enabled = true;
            }
          }
        }
      }

      // Update the role with new permissions
      const updateRes = await fetch(
        `${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            ...roleDetail.role,
            permissions,
          }),
        }
      );
      const updateData = await updateRes.json();
      console.log('  Public permissions updated:', updateData.ok !== false ? 'success' : 'check manually');
    } else {
      console.log('  Public role not found, set permissions manually in admin panel.');
    }
  } catch (err) {
    console.warn('  Permissions error:', err.message);
  }

  // 6. Seed dummy stories if empty
  console.log('[6/6] Seeding dummy stories and insights...');
  try {
    const storiesRes = await fetch(`${STRAPI_URL}/api/stories`, { headers });
    const storiesData = await storiesRes.json();

    if (!storiesData.data || storiesData.data.length === 0) {
      const dummyStories = [
        {
          shortDes: 'How Jumbotail is revolutionizing grocery supply chains in India',
          description: 'Jumbotail has built a B2B marketplace connecting small kirana stores with manufacturers, cutting out middlemen and reducing costs for millions of retailers across India.',
          by: 'By Mint',
          readMore: 'https://example.com/jumbotail-story',
        },
        {
          shortDes: 'KreditBee crosses 10 million users on its lending platform',
          description: 'The fintech startup has scaled rapidly by offering instant personal loans to middle-income India, with AI-driven credit scoring enabling fast approvals.',
          by: 'By Economic Times',
          readMore: 'https://example.com/kreditbee-story',
        },
        {
          shortDes: 'Smallcase brings thematic investing to retail investors',
          description: 'By packaging stocks and ETFs into easy-to-understand themes, Smallcase has democratized portfolio investing for a new generation of Indian investors.',
          by: 'By YourStory',
          readMore: 'https://example.com/smallcase-story',
        },
        {
          shortDes: 'SpotDraft raises Series A to automate contract management globally',
          description: 'The India-born SaaS company is helping legal and business teams worldwide streamline contract workflows with AI-powered automation.',
          by: 'By TechCrunch',
          readMore: 'https://example.com/spotdraft-story',
        },
        {
          shortDes: 'Jar app helps millions save in digital gold with spare change',
          description: 'With its innovative round-up savings feature, Jar has become one of the fastest-growing fintech apps in India, helping users build wealth one small transaction at a time.',
          by: 'By Inc42',
          readMore: 'https://example.com/jar-story',
        },
        {
          shortDes: 'Signzy transforms digital onboarding for banks across 30 countries',
          description: 'The AI-powered RegTech startup has processed over 50 million identity verifications, enabling paperless onboarding for financial institutions globally.',
          by: 'By Forbes India',
          readMore: 'https://example.com/signzy-story',
        },
      ];

      for (const story of dummyStories) {
        const res = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/api::story.story`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(story),
          }
        );
        const data = await res.json();
        // Publish it
        if (data.data?.documentId) {
          await fetch(
            `${STRAPI_URL}/content-manager/collection-types/api::story.story/${data.data.documentId}/actions/publish`,
            { method: 'POST', headers }
          );
        }
      }
      console.log(`  Created ${dummyStories.length} dummy stories.`);
    } else {
      console.log(`  Stories already exist (${storiesData.data.length}), skipping.`);
    }
  } catch (err) {
    console.warn('  Stories seed error:', err.message);
  }

  // Seed insights
  try {
    const insightsRes = await fetch(`${STRAPI_URL}/api/insights`, { headers });
    const insightsData = await insightsRes.json();

    if (!insightsData.data || insightsData.data.length === 0) {
      const dummyInsights = [
        {
          title: 'Slingshot — The Rise of Middle India',
          layout: [
            {
              __component: 'insights.series-card',
              seriesTitle: 'The Rise of Middle India: A $500B Digital Opportunity',
              description: "India's next 500 million internet users represent a massive opportunity for digital-first products and services.",
              readMoreUrl: 'https://example.com/middle-india',
            },
            {
              __component: 'insights.series-card',
              seriesTitle: 'Digital Payments Revolution: Beyond UPI',
              description: 'UPI has transformed how Indians transact. We look at what comes next.',
              readMoreUrl: 'https://example.com/digital-payments',
            },
          ],
        },
        {
          title: 'Future View — SaaS from India',
          layout: [
            {
              __component: 'insights.series-card',
              seriesTitle: 'Why India-Built SaaS Is Winning Globally',
              description: 'Indian SaaS companies are increasingly competing and winning against global incumbents.',
              readMoreUrl: 'https://example.com/india-saas',
            },
            {
              __component: 'insights.series-card',
              seriesTitle: 'Building for Bharat: Product Design Lessons',
              description: 'Designing products for Middle India requires rethinking UX, trust signals, and onboarding.',
              readMoreUrl: 'https://example.com/building-bharat',
            },
          ],
        },
        {
          title: 'Video Insights',
          layout: [
            {
              __component: 'insights.video-card',
              title: 'The Future of Digital Payments in India',
              seriesName: 'Arkam Deep Dives',
              publishedOn: '2025-09-15',
              description: 'Our partners discuss the evolution of UPI and the next phase of digital payments.',
              videoUrl: 'https://youtube.com/watch?v=example1',
            },
            {
              __component: 'insights.video-card',
              title: 'Founder Fireside: Scaling a SaaS Startup from India',
              seriesName: 'Founder Stories',
              publishedOn: '2025-08-10',
              description: 'A candid conversation with founders who built global SaaS businesses from India.',
              videoUrl: 'https://youtube.com/watch?v=example2',
            },
          ],
        },
        {
          title: 'Recommended Books',
          layout: [
            {
              __component: 'insights.book-card',
              bookTitle: 'The Aadhaar Effect',
              bookSubtitle: "Why the World's Largest Identity Project Matters",
              author: 'N.S. Ramnath & Charles Assisi',
              amazonUrl: 'https://amazon.in/dp/example1',
              reviews: [
                {
                  reviewerName: 'Bala Srinivasa',
                  reviewerDesignation: 'Partner, Arkam Ventures',
                  reviewText: "A must-read for understanding how digital public infrastructure is reshaping India's economy.",
                },
              ],
            },
            {
              __component: 'insights.book-card',
              bookTitle: 'Blitzscaling',
              bookSubtitle: 'The Lightning-Fast Path to Building Massively Valuable Companies',
              author: 'Reid Hoffman & Chris Yeh',
              amazonUrl: 'https://amazon.in/dp/example2',
              reviews: [
                {
                  reviewerName: 'Rahul Chandra',
                  reviewerDesignation: 'Co-Founder, Arkam Ventures',
                  reviewText: 'Essential reading for founders navigating hyper-growth in the Indian startup ecosystem.',
                },
              ],
            },
          ],
        },
      ];

      for (const insight of dummyInsights) {
        const res = await fetch(
          `${STRAPI_URL}/content-manager/collection-types/api::insight.insight`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(insight),
          }
        );
        const data = await res.json();
        if (data.data?.documentId) {
          await fetch(
            `${STRAPI_URL}/content-manager/collection-types/api::insight.insight/${data.data.documentId}/actions/publish`,
            { method: 'POST', headers }
          );
        }
      }
      console.log(`  Created ${dummyInsights.length} dummy insights.`);
    } else {
      console.log(`  Insights already exist (${insightsData.data.length}), skipping.`);
    }
  } catch (err) {
    console.warn('  Insights seed error:', err.message);
  }

  console.log('\nDone! Restart your Strapi server and Next.js frontend to see the changes.');
}

main().catch(console.error);
