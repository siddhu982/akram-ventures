import type { Core } from '@strapi/strapi';
import { PITCH_FORM_DEFAULTS, PITCH_SECTOR_DEFAULTS } from './api/pitch-page/form-defaults';

async function seedSingleType(
  strapi: Core.Strapi,
  uid: string,
  data: Record<string, unknown>
) {
  try {
    const existing = await strapi.documents(uid as any).findFirst({});
    if (existing) return;
    await (strapi.documents(uid as any) as any).create({ data });
    strapi.log.info(`[Seed] Created ${uid}`);
  } catch {
    strapi.log.warn(`[Seed] Could not seed ${uid}`);
  }
}

async function seedCollectionIfEmpty(
  strapi: Core.Strapi,
  uid: string,
  data: Record<string, unknown>
) {
  try {
    const items = await strapi.documents(uid as any).findMany({ limit: 1 });
    if (items && items.length > 0) {
      // Update existing entry if new fields are empty
      const existing = items[0] as Record<string, unknown>;
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (existing[key] === null || existing[key] === undefined ||
            (Array.isArray(existing[key]) && (existing[key] as unknown[]).length === 0)) {
          updates[key] = value;
        }
      }
      if (Object.keys(updates).length > 0) {
        await (strapi.documents(uid as any) as any).update({
          documentId: (existing as any).documentId,
          data: updates,
        });
        strapi.log.info(`[Seed] Updated ${uid} with new fields`);
      }
      return;
    }
    await (strapi.documents(uid as any) as any).create({ data, status: 'published' });
    strapi.log.info(`[Seed] Created ${uid} entry`);
  } catch {
    strapi.log.warn(`[Seed] Could not seed ${uid}`);
  }
}

async function ensurePublicPermissions(strapi: Core.Strapi, actions: string[]) {
  try {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });
    if (!publicRole) return;

    for (const action of actions) {
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action, role: publicRole.id },
      });
      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action, role: publicRole.id },
        });
        strapi.log.info(`[Permissions] Granted public access: ${action}`);
      }
    }
  } catch {
    strapi.log.warn('[Permissions] Could not set public permissions');
  }
}

/**
 * Show every submitted field as a column in the admin list of Pitch Submissions.
 * Runs once (flagged in the core store), so later changes made in the admin UI are kept.
 */
async function configurePitchListView(strapi: Core.Strapi) {
  const uid = 'api::pitch-submission.pitch-submission';
  try {
    const flag = strapi.store({ type: 'plugin', name: 'arkam', key: 'pitch_list_view_v1' });
    if (await flag.get({})) return;

    const service = (strapi as any).plugin('content-manager').service('content-types');
    const contentType = strapi.contentType(uid as any);
    const config = await service.findConfiguration(contentType);

    const list = [
      'founderName',
      'email',
      'sector',
      'targetRoundSize',
      'websiteLink',
      'pitchDeck',
      'problemDescription',
      'teamDescription',
      'additionalInfo',
      'marketSize',
      'customerValueProp',
      'solution10x',
      'createdAt',
    ];

    await service.updateConfiguration(contentType, {
      settings: { ...config.settings, defaultSortBy: 'createdAt', defaultSortOrder: 'DESC', pageSize: 25 },
      metadatas: config.metadatas,
      layouts: { ...config.layouts, list },
    });
    await flag.set({ value: true });
    strapi.log.info('[Admin] Pitch Submission list view now shows all fields');
  } catch (err) {
    strapi.log.warn(`[Admin] Could not configure Pitch Submission list view: ${(err as Error).message}`);
  }
}

/**
 * The home hero used to be hardcoded in the frontend ("Investing in Limitless Founders") while the
 * Strapi heading was a placeholder ("Home"). Move that text into Strapi so it is editable; runs only
 * while the placeholder is still there.
 */
async function migrateHomepageHeading(strapi: Core.Strapi) {
  try {
    const page: any = await strapi.documents('api::homepage.homepage' as any).findFirst({});
    if (page && String(page.Heading).trim().toLowerCase() === 'home') {
      await (strapi.documents('api::homepage.homepage' as any) as any).update({
        documentId: page.documentId,
        data: { Heading: 'Investing in Limitless Founders' },
        status: 'published',
      });
      strapi.log.info('[Migrate] Homepage heading set to "Investing in Limitless Founders"');
    }
  } catch (err) {
    strapi.log.warn(`[Migrate] Could not update homepage heading: ${(err as Error).message}`);
  }
}

/**
 * Texts that used to be hardcoded in the frontend (pitch form labels, sector options, small UI labels)
 * now live in Strapi. Fill any that are still empty with the previous wording so nothing visibly changes;
 * values editors have already set are never overwritten.
 */
async function seedEditableTexts(strapi: Core.Strapi) {
  try {
    const pitch: any = await strapi.documents('api::pitch-page.pitch-page' as any).findFirst({ populate: ['sectorOptions'] } as any);
    if (pitch) {
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(PITCH_FORM_DEFAULTS)) {
        if (pitch[key] === null || pitch[key] === undefined || pitch[key] === '') data[key] = value;
      }
      if (!pitch.sectorOptions || pitch.sectorOptions.length === 0) {
        data.sectorOptions = PITCH_SECTOR_DEFAULTS.map((label) => ({ label }));
      }
      if (Object.keys(data).length > 0) {
        await (strapi.documents('api::pitch-page.pitch-page' as any) as any).update({ documentId: pitch.documentId, data });
        strapi.log.info(`[Seed] Pitch page: filled ${Object.keys(data).length} editable texts`);
      }
    }

    await seedCollectionIfEmpty(strapi, 'api::site-label.site-label', {
      viewAllStoriesLabel: 'View all stories',
      loadMoreLabel: 'Load more',
      foundersLabel: 'FOUNDERS',
      videoBylineSuffix: 'by Arkam Ventures',
      viewMoreLabel: 'View more',
    });
  } catch (err) {
    strapi.log.warn(`[Seed] Could not seed editable texts: ${(err as Error).message}`);
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configurePitchListView(strapi);
    await migrateHomepageHeading(strapi);
    await seedEditableTexts(strapi);

    // Footer
    await seedSingleType(strapi, 'api::footer.footer', {
      ctaHeading: 'Calling Limitless entrepreneurs',
      ctaButtonText: 'Pitch to us',
      ctaButtonUrl: '/pitch-to-us',
      email: 'arkamvc@gmail.com',
      addressLine1: 'Arkam Ventures, Indique Leela, 6th Floor, No.23,',
      addressLine2: 'HAL 2nd Stage, Old Airport Road, Bangalore 560008',
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'twitter', url: 'https://twitter.com' },
      ],
    });

    // About Section
    await seedSingleType(strapi, 'api::about-section.about-section', {
      heading: 'Arkam',
      description1: 'Sanskrit word meaning "all the way to the sun" or limitless expanse.',
      description2: 'Arkam partners with limitless founders innovating to build a new India.',
    });

    // Pitch Page
    await seedSingleType(strapi, 'api::pitch-page.pitch-page', {
      subtitle: 'Pitch to us',
      title: 'We are looking for limitless founders of tomorrow',
    });

    // Team Page
    await seedSingleType(strapi, 'api::team-page.team-page', {
      heading: 'Meet the Team',
    });

    // Stories Page
    await seedSingleType(strapi, 'api::stories-page.stories-page', {
      heading: 'Stories',
    });

    // Navigation
    await seedSingleType(strapi, 'api::navigation.navigation', {
      ctaText: 'Pitch to us',
      ctaUrl: '/pitch-to-us',
      menuItems: [
        { label: 'Portfolio', url: '/portfolio', displayOrder: 1 },
        { label: 'Thesis', url: '/thesis', displayOrder: 2 },
        { label: 'Team', url: '/team', displayOrder: 3 },
        { label: 'Stories', url: '/stories', displayOrder: 4 },
        { label: 'Insights', url: '/insights', displayOrder: 5 },
      ],
    });

    // Thesis (collection type — seed one entry with all static content)
    await seedCollectionIfEmpty(strapi, 'api::thesis.thesis', {
      heading: 'Thesis',
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
    });

    // Portfolio (collection type — seed hero heading if empty)
    await seedCollectionIfEmpty(strapi, 'api::portfolio.portfolio', {
      Heading: 'Portfolio',
      heroHeading: 'Investing in ideas that are transforming the world',
    });

    // Seed dummy stories
    try {
      const stories = await strapi.documents('api::story.story').findMany({ limit: 1 });
      if (!stories || stories.length === 0) {
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
          await (strapi.documents('api::story.story') as any).create({
            data: story,
            status: 'published',
          });
        }
        strapi.log.info(`[Seed] Created ${dummyStories.length} dummy stories`);
      }
    } catch {
      strapi.log.warn('[Seed] Could not seed stories');
    }

    // Seed dummy insights (each has a layout dynamic zone with card components)
    try {
      const insights = await strapi.documents('api::insight.insight').findMany({ limit: 1 });
      if (!insights || insights.length === 0) {
        const dummyInsights = [
          {
            title: 'Slingshot — The Rise of Middle India',
            layout: [
              {
                __component: 'insights.series-card',
                seriesTitle: 'The Rise of Middle India: A $500B Digital Opportunity',
                description:
                  "India's next 500 million internet users represent a massive opportunity for digital-first products and services. We explore the key sectors poised for disruption.",
                readMoreUrl: 'https://example.com/middle-india',
              },
              {
                __component: 'insights.series-card',
                seriesTitle: 'Digital Payments Revolution: Beyond UPI',
                description:
                  'UPI has transformed how Indians transact. We look at what comes next — from credit on UPI to cross-border payments and CBDC integration.',
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
                description:
                  'Indian SaaS companies are increasingly competing and winning against global incumbents. What gives them their edge in product, pricing, and go-to-market?',
                readMoreUrl: 'https://example.com/india-saas',
              },
              {
                __component: 'insights.series-card',
                seriesTitle: 'Building for Bharat: Product Design Lessons',
                description:
                  'Designing products for Middle India requires rethinking UX, trust signals, and onboarding. Lessons from our portfolio companies on winning vernacular users.',
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
                description:
                  'Our partners discuss the evolution of UPI, the rise of credit-on-UPI, and what the next phase of digital payments looks like for Bharat.',
                videoUrl: 'https://youtube.com/watch?v=example1',
              },
              {
                __component: 'insights.video-card',
                title: 'Founder Fireside: Scaling a SaaS Startup from India',
                seriesName: 'Founder Stories',
                publishedOn: '2025-08-10',
                description:
                  'A candid conversation with founders who built global SaaS businesses from India — the challenges, playbooks, and inflection points.',
                videoUrl: 'https://youtube.com/watch?v=example2',
              },
              {
                __component: 'insights.video-card',
                title: 'Climate Tech Meets Fintech',
                seriesName: 'Arkam Deep Dives',
                publishedOn: '2025-07-22',
                description:
                  'How financial products are being reimagined to drive sustainable outcomes at scale in developing markets.',
                videoUrl: 'https://youtube.com/watch?v=example3',
              },
            ],
          },
          {
            title: 'Recommended Books',
            layout: [
              {
                __component: 'insights.book-card',
                bookTitle: 'The Aadhaar Effect',
                bookSubtitle: 'Why the World\'s Largest Identity Project Matters',
                author: 'N.S. Ramnath & Charles Assisi',
                amazonUrl: 'https://amazon.in/dp/example1',
                reviews: [
                  {
                    reviewerName: 'Bala Srinivasa',
                    reviewerDesignation: 'Partner, Arkam Ventures',
                    reviewText:
                      'A must-read for anyone seeking to understand how digital public infrastructure is reshaping India\'s economy and creating new market opportunities.',
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
                    reviewText:
                      'Essential reading for founders navigating hyper-growth. The frameworks for scaling in uncertainty are directly applicable to the Indian startup ecosystem.',
                  },
                ],
              },
            ],
          },
        ];
        for (const insight of dummyInsights) {
          await (strapi.documents('api::insight.insight') as any).create({
            data: insight,
            status: 'published',
          });
        }
        strapi.log.info(`[Seed] Created ${dummyInsights.length} dummy insights`);
      }
    } catch {
      strapi.log.warn('[Seed] Could not seed insights');
    }

    // Auto-configure public API permissions for all content types
    await ensurePublicPermissions(strapi, [
      'api::navigation.navigation.find',
      'api::footer.footer.find',
      'api::about-section.about-section.find',
      'api::pitch-page.pitch-page.find',
      'api::site-label.site-label.find',
      'api::team-page.team-page.find',
      'api::stories-page.stories-page.find',
      'api::story.story.find',
      'api::story.story.findOne',
      'api::thesis.thesis.find',
      'api::thesis.thesis.findOne',
      'api::portfolio.portfolio.find',
      'api::portfolio.portfolio.findOne',
      'api::insight.insight.find',
      'api::insight.insight.findOne',
    ]);
  },
};
