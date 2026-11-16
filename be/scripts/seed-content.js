'use strict';

/**
 * Seed the investment-site sample content.
 *
 * This script uses Strapi's Document Service API rather than writing to MySQL
 * directly. It is safe to run repeatedly: portfolio companies are matched by
 * their stable sample company name, and the two existing founder documents are
 * only read so they can be linked from the Homepage.
 */

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const UIDS = {
  founderSlide: 'api::founder-slide.founder-slide',
  homepage: 'api::homepage.homepage',
  navigation: 'api::navigation.navigation',
  portfolioCompany: 'api::portfolio-company.portfolio-company',
};

const PORTFOLIO_COMPANIES = [
  {
    companyName: 'NovaTech',
    websiteUrl: 'https://novatech.example',
    displayOrder: 1,
    isActive: true,
  },
  {
    companyName: 'GreenGrid',
    websiteUrl: 'https://greengrid.example',
    displayOrder: 2,
    isActive: true,
  },
  {
    companyName: 'FinEdge',
    websiteUrl: 'https://finedge.example',
    displayOrder: 3,
    isActive: true,
  },
];

const HOMEPAGE_CONTENT = {
  heroTitle: 'Backing the builders shaping what’s next.',
  heroSubtitle:
    'We partner with ambitious founders building enduring companies across technology, sustainability, and financial innovation.',
  // The schema intentionally uses this exact capitalisation.
  heroHighLight: 'Enduring partnerships. Transformative outcomes.',
  ctaText: 'Explore Our Portfolio',
  ctaUrl: '/portfolio',
};

const NAVIGATION_CONTENT = {
  ctaText: 'Partner With Us',
  ctaUrl: '/contact',
  menuItems: [
    { label: 'Home', url: '/', displayOrder: 1 },
    { label: 'About', url: '/about', displayOrder: 2 },
    { label: 'Founders', url: '/founders', displayOrder: 3 },
    { label: 'Portfolio', url: '/portfolio', displayOrder: 4 },
    { label: 'Contact', url: '/contact', displayOrder: 5 },
  ],
};

function uniqueDocumentIds(documentIds) {
  return [...new Set(documentIds.filter((documentId) => typeof documentId === 'string'))];
}

function relatedDocumentIds(entry, fieldName) {
  const relatedEntries = entry?.[fieldName];
  const entries = Array.isArray(relatedEntries)
    ? relatedEntries
    : relatedEntries
      ? [relatedEntries]
      : [];

  return uniqueDocumentIds(entries.map((entry) => entry.documentId));
}

function matchesFields(entry, expectedFields) {
  return Boolean(
    entry &&
      Object.entries(expectedFields).every(([fieldName, expectedValue]) => {
        return entry[fieldName] === expectedValue;
      })
  );
}

function missingDocumentIds(expectedIds, actualIds) {
  return expectedIds.filter((documentId) => !actualIds.includes(documentId));
}

function menuItemsMatch(entry) {
  if (!entry || entry.ctaText !== NAVIGATION_CONTENT.ctaText || entry.ctaUrl !== NAVIGATION_CONTENT.ctaUrl) {
    return false;
  }

  const toComparableItem = (item) => `${item.displayOrder}:${item.label}:${item.url}`;
  const actualItems = (entry.menuItems ?? []).map(toComparableItem).sort();
  const expectedItems = NAVIGATION_CONTENT.menuItems.map(toComparableItem).sort();

  return JSON.stringify(actualItems) === JSON.stringify(expectedItems);
}

function requireAttributes(contentType, attributeNames) {
  const missingAttributes = attributeNames.filter(
    (attributeName) => !contentType?.attributes?.[attributeName]
  );

  if (missingAttributes.length > 0) {
    throw new Error(
      `The ${contentType?.uid ?? 'unknown'} schema is missing: ${missingAttributes.join(', ')}`
    );
  }
}

function verifySchema() {
  const homepage = strapi.contentType(UIDS.homepage);
  const portfolioCompany = strapi.contentType(UIDS.portfolioCompany);
  const navigation = strapi.contentType(UIDS.navigation);
  const founderSlide = strapi.contentType(UIDS.founderSlide);
  const menuItem = strapi.components['navigation.menu-items'];

  requireAttributes(homepage, [
    'heroTitle',
    'heroSubtitle',
    'heroHighLight',
    'ctaText',
    'ctaUrl',
    'founder_slides',
    'portfolio_companies',
  ]);
  requireAttributes(portfolioCompany, [
    'companyName',
    'companyLogo',
    'websiteUrl',
    'displayOrder',
    'isActive',
  ]);
  requireAttributes(navigation, ['logo', 'menuItems', 'ctaText', 'ctaUrl']);
  requireAttributes(founderSlide, [
    'founderName',
    'founderImg',
    'displayOrder',
    'isActive',
  ]);
  requireAttributes(menuItem, ['label', 'url', 'displayOrder']);

  const founderRelation = homepage.attributes.founder_slides;
  const portfolioRelation = homepage.attributes.portfolio_companies;

  if (
    founderRelation.type !== 'relation' ||
    founderRelation.relation !== 'oneToMany' ||
    founderRelation.target !== UIDS.founderSlide
  ) {
    throw new Error('Homepage founder_slides does not match the expected Founder Slide relation.');
  }

  if (
    portfolioRelation.type !== 'relation' ||
    portfolioRelation.relation !== 'oneToMany' ||
    portfolioRelation.target !== UIDS.portfolioCompany
  ) {
    throw new Error(
      'Homepage portfolio_companies does not match the expected Portfolio Company relation.'
    );
  }

  if (navigation.attributes.menuItems.component !== 'navigation.menu-items') {
    throw new Error('Navigation menuItems does not use the navigation.menu-items component.');
  }
}

/**
 * Load the draft and published versions for one document.
 * A duplicate match is unsafe to update, so the script stops before changing it.
 */
async function findDocumentVersions(repository, filters, populate) {
  const options = populate ? { filters, populate } : { filters };
  const [draftEntries, publishedEntries] = await Promise.all([
    repository.findMany({ ...options, status: 'draft' }),
    repository.findMany({ ...options, status: 'published' }),
  ]);

  const documentIds = uniqueDocumentIds([
    ...draftEntries.map((entry) => entry.documentId),
    ...publishedEntries.map((entry) => entry.documentId),
  ]);

  if (documentIds.length > 1) {
    throw new Error(
      `Expected one document for ${JSON.stringify(filters)}, but found ${documentIds.length}. ` +
        'Resolve the duplicate entries before running this seed.'
    );
  }

  const documentId = documentIds[0];
  return {
    documentId,
    draft: draftEntries.find((entry) => entry.documentId === documentId) ?? null,
    published: publishedEntries.find((entry) => entry.documentId === documentId) ?? null,
  };
}

async function findSingleTypeVersions(repository, populate) {
  const options = populate ? { populate } : {};
  const [draft, published] = await Promise.all([
    repository.findFirst({ ...options, status: 'draft' }),
    repository.findFirst({ ...options, status: 'published' }),
  ]);

  if (draft && published && draft.documentId !== published.documentId) {
    throw new Error('The single type has inconsistent draft and published document identifiers.');
  }

  return {
    documentId: draft?.documentId ?? published?.documentId,
    draft: draft ?? null,
    published: published ?? null,
  };
}

/**
 * A published-only document can exist after a migration. Create its draft from
 * the published version first so omitted fields (notably media) are preserved.
 */
async function ensureDraftVersion(repository, versions) {
  if (versions.documentId && !versions.draft && versions.published) {
    await repository.discardDraft({ documentId: versions.documentId });
  }
}

async function upsertPublishedPortfolioCompany(repository, company) {
  const filters = { companyName: { $eq: company.companyName } };
  const versions = await findDocumentVersions(repository, filters);

  if (versions.documentId) {
    if (matchesFields(versions.published, company)) {
      console.log(`Portfolio Company already published: ${company.companyName}`);
      return versions.documentId;
    }

    await ensureDraftVersion(repository, versions);
    await repository.update({
      documentId: versions.documentId,
      data: company,
      status: 'published',
    });
    console.log(`Updated and published Portfolio Company: ${company.companyName}`);
    return versions.documentId;
  }

  const created = await repository.create({ data: company, status: 'published' });
  console.log(`Created and published Portfolio Company: ${company.companyName}`);
  return created.documentId;
}

async function getPublishedFounderSlides(repository) {
  const founders = await repository.findMany({
    status: 'published',
    sort: ['displayOrder:asc', 'createdAt:asc'],
  });

  if (founders.length !== 2) {
    throw new Error(
      `Expected exactly two published Founder Slide entries, but found ${founders.length}. ` +
        'No content was seeded.'
    );
  }

  return founders;
}

async function upsertHomepage(repository, founderDocumentIds, portfolioDocumentIds) {
  const versions = await findSingleTypeVersions(repository, [
    'founder_slides',
    'portfolio_companies',
  ]);

  // Keep relationships that were already manually configured on the Homepage.
  const existingFounderIds = uniqueDocumentIds([
    ...relatedDocumentIds(versions.draft, 'founder_slides'),
    ...relatedDocumentIds(versions.published, 'founder_slides'),
  ]);
  const existingPortfolioIds = uniqueDocumentIds([
    ...relatedDocumentIds(versions.draft, 'portfolio_companies'),
    ...relatedDocumentIds(versions.published, 'portfolio_companies'),
  ]);
  const missingFounderIds = missingDocumentIds(founderDocumentIds, existingFounderIds);
  const missingPortfolioIds = missingDocumentIds(portfolioDocumentIds, existingPortfolioIds);

  if (
    versions.documentId &&
    matchesFields(versions.published, HOMEPAGE_CONTENT) &&
    missingFounderIds.length === 0 &&
    missingPortfolioIds.length === 0
  ) {
    console.log('Homepage already published with the requested content and relationships.');
    return versions.documentId;
  }

  const data = { ...HOMEPAGE_CONTENT };

  if (versions.documentId) {
    // Only add relationships that are absent. Re-sending an unchanged ordered
    // one-to-many relation makes older MySQL servers run an unsupported window
    // function, and would be unnecessary even on newer servers.
    if (missingFounderIds.length > 0) {
      data.founder_slides = { connect: missingFounderIds };
    }
    if (missingPortfolioIds.length > 0) {
      data.portfolio_companies = { connect: missingPortfolioIds };
    }
  } else {
    data.founder_slides = { set: founderDocumentIds };
    data.portfolio_companies = { set: portfolioDocumentIds };
  }

  if (versions.documentId) {
    await ensureDraftVersion(repository, versions);
    await repository.update({ documentId: versions.documentId, data, status: 'published' });
    console.log('Updated and published Homepage.');
    return versions.documentId;
  }

  const created = await repository.create({ data, status: 'published' });
  console.log('Created and published Homepage.');
  return created.documentId;
}

async function upsertNavigation(repository) {
  const versions = await findSingleTypeVersions(repository, ['menuItems']);

  // Do not send a logo attribute: an existing navigation logo is preserved and
  // a new Navigation remains empty until a suitable brand asset is uploaded.
  if (versions.documentId) {
    if (menuItemsMatch(versions.published)) {
      console.log('Navigation already published with the requested menu items.');
      return versions.documentId;
    }

    await ensureDraftVersion(repository, versions);
    await repository.update({
      documentId: versions.documentId,
      data: NAVIGATION_CONTENT,
      status: 'published',
    });
    console.log('Updated and published Navigation.');
    return versions.documentId;
  }

  const created = await repository.create({ data: NAVIGATION_CONTENT, status: 'published' });
  console.log('Created and published Navigation.');
  return created.documentId;
}

function assertContains(actualIds, expectedIds, subject) {
  const missingIds = expectedIds.filter((documentId) => !actualIds.includes(documentId));
  if (missingIds.length > 0) {
    throw new Error(`${subject} is missing ${missingIds.length} expected relationship(s).`);
  }
}

async function verifySeed({ founderDocumentIds, portfolioDocumentIds, homepageDocumentId }) {
  const portfolioRepository = strapi.documents(UIDS.portfolioCompany);
  const homepageRepository = strapi.documents(UIDS.homepage);
  const navigationRepository = strapi.documents(UIDS.navigation);

  const publishedPortfolioCompanies = await Promise.all(
    portfolioDocumentIds.map((documentId) =>
      portfolioRepository.findOne({ documentId, status: 'published' })
    )
  );
  if (publishedPortfolioCompanies.some((company) => !company)) {
    throw new Error('One or more seeded Portfolio Company entries were not published.');
  }

  const homepage = await homepageRepository.findOne({
    documentId: homepageDocumentId,
    status: 'published',
    populate: ['founder_slides', 'portfolio_companies'],
  });
  if (!homepage) {
    throw new Error('Homepage was not published.');
  }

  assertContains(
    relatedDocumentIds(homepage, 'founder_slides'),
    founderDocumentIds,
    'Homepage founder_slides'
  );
  assertContains(
    relatedDocumentIds(homepage, 'portfolio_companies'),
    portfolioDocumentIds,
    'Homepage portfolio_companies'
  );

  const navigation = await navigationRepository.findFirst({
    status: 'published',
    populate: ['menuItems'],
  });
  if (!navigation) {
    throw new Error('Navigation was not published.');
  }

  const expectedMenuItems = NAVIGATION_CONTENT.menuItems.map(
    (item) => `${item.displayOrder}:${item.label}:${item.url}`
  );
  const actualMenuItems = (navigation.menuItems ?? [])
    .map((item) => `${item.displayOrder}:${item.label}:${item.url}`)
    .sort();

  if (JSON.stringify(actualMenuItems) !== JSON.stringify([...expectedMenuItems].sort())) {
    throw new Error('Navigation menuItems verification failed.');
  }

  console.log(
    `Verified ${publishedPortfolioCompanies.length} published portfolio companies, ` +
      `${founderDocumentIds.length} founder links, ${portfolioDocumentIds.length} portfolio links, ` +
      `and ${actualMenuItems.length} navigation items.`
  );
}

async function seedContent() {
  verifySchema();
  console.log('Schema check passed.');

  const founderRepository = strapi.documents(UIDS.founderSlide);
  const portfolioRepository = strapi.documents(UIDS.portfolioCompany);
  const homepageRepository = strapi.documents(UIDS.homepage);
  const navigationRepository = strapi.documents(UIDS.navigation);

  // Read only: existing Founder Slide content and founderImg media are never updated.
  const founders = await getPublishedFounderSlides(founderRepository);
  const founderDocumentIds = founders.map((founder) => founder.documentId);
  console.log(
    `Found the two published Founder Slides: ${founders
      .map((founder) => founder.founderName)
      .join(', ')}`
  );

  const portfolioDocumentIds = [];
  for (const company of PORTFOLIO_COMPANIES) {
    portfolioDocumentIds.push(await upsertPublishedPortfolioCompany(portfolioRepository, company));
  }

  const homepageDocumentId = await upsertHomepage(
    homepageRepository,
    founderDocumentIds,
    portfolioDocumentIds
  );
  await upsertNavigation(navigationRepository);

  await verifySeed({ founderDocumentIds, portfolioDocumentIds, homepageDocumentId });
  console.log(
    'No suitable local logo assets were found, so this seed does not set portfolio company logos or the navigation logo. Existing media is preserved.'
  );
}

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    await seedContent();
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error('Sample content seed failed.');
  console.error(error);
  process.exit(1);
});
