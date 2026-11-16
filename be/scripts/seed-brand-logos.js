'use strict';

/**
 * Upload and link the brand SVGs using Strapi's Upload and Document Service APIs.
 *
 * The script is idempotent: it reuses Media Library files identified by their
 * controlled file names, and only updates a document when its published logo is
 * not already the expected file.
 */

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const UIDS = {
  founderSlide: 'api::founder-slide.founder-slide',
  navigation: 'api::navigation.navigation',
  portfolioCompany: 'api::portfolio-company.portfolio-company',
  uploadFile: 'plugin::upload.file',
};

const LOGOS = [
  {
    fileName: 'nova-tech-logo.svg',
    mediaName: 'nova-tech-logo',
    alternativeText: 'NovaTech logo',
    companyName: 'NovaTech',
  },
  {
    fileName: 'green-grid-logo.svg',
    mediaName: 'green-grid-logo',
    alternativeText: 'GreenGrid logo',
    companyName: 'GreenGrid',
  },
  {
    fileName: 'fin-edge-logo.svg',
    mediaName: 'fin-edge-logo',
    alternativeText: 'FinEdge logo',
    companyName: 'FinEdge',
  },
  {
    fileName: 'venture-nest-logo.svg',
    mediaName: 'venture-nest-logo',
    alternativeText: 'VentureNest logo',
    navigation: true,
  },
];

function sourceFilePath(fileName) {
  return path.join(__dirname, '..', 'data', 'uploads', fileName);
}

function uniqueDocumentIds(entries) {
  return [...new Set(entries.map((entry) => entry.documentId).filter(Boolean))];
}

function mediaDocumentId(entry, fieldName) {
  const media = entry?.[fieldName];
  return Array.isArray(media) ? media[0]?.documentId : media?.documentId;
}

function requireAttributes(contentType, attributeNames) {
  const missing = attributeNames.filter((attributeName) => !contentType?.attributes?.[attributeName]);
  if (missing.length > 0) {
    throw new Error(`${contentType?.uid ?? 'Unknown type'} is missing: ${missing.join(', ')}`);
  }
}

function verifySchema() {
  requireAttributes(strapi.contentType(UIDS.portfolioCompany), ['companyName', 'companyLogo']);
  requireAttributes(strapi.contentType(UIDS.navigation), ['logo']);
  requireAttributes(strapi.contentType(UIDS.founderSlide), ['founderName', 'founderImg']);
}

async function findDocumentVersions(repository, filters, populate) {
  const options = { filters, ...(populate ? { populate } : {}) };
  const [draftEntries, publishedEntries] = await Promise.all([
    repository.findMany({ ...options, status: 'draft' }),
    repository.findMany({ ...options, status: 'published' }),
  ]);
  const documentIds = uniqueDocumentIds([...draftEntries, ...publishedEntries]);

  if (documentIds.length !== 1) {
    throw new Error(
      `Expected exactly one document for ${JSON.stringify(filters)}, found ${documentIds.length}.`
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

  if (!draft && !published) {
    throw new Error('Navigation does not exist. Run the sample content seed before the logo seed.');
  }
  if (draft && published && draft.documentId !== published.documentId) {
    throw new Error('Navigation has inconsistent draft and published document identifiers.');
  }

  return {
    documentId: draft?.documentId ?? published?.documentId,
    draft: draft ?? null,
    published: published ?? null,
  };
}

async function ensureDraftVersion(repository, versions) {
  if (versions.published && !versions.draft) {
    await repository.discardDraft({ documentId: versions.documentId });
  }
}

async function findOrUploadLogo(fileRepository, logo) {
  const existingFiles = await fileRepository.findMany({
    filters: { name: { $eq: logo.mediaName } },
  });

  if (existingFiles.length > 1) {
    throw new Error(
      `Found ${existingFiles.length} Media Library files named ${logo.mediaName}; refusing to choose one.`
    );
  }
  if (existingFiles.length === 1) {
    console.log(`Reusing Media Library file: ${logo.fileName}`);
    return existingFiles[0];
  }

  const filePath = sourceFilePath(logo.fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Logo source file is missing: ${filePath}`);
  }

  const uploaded = await strapi.plugin('upload').service('upload').upload({
    data: {
      fileInfo: {
        name: logo.mediaName,
        alternativeText: logo.alternativeText,
        caption: logo.alternativeText,
      },
    },
    files: {
      filepath: filePath,
      originalFileName: logo.fileName,
      size: fs.statSync(filePath).size,
      mimetype: mime.lookup(logo.fileName) || 'image/svg+xml',
    },
  });

  const [file] = uploaded;
  if (!file?.documentId) {
    throw new Error(`Upload did not return a Media Library document for ${logo.fileName}.`);
  }

  console.log(`Uploaded Media Library file: ${logo.fileName}`);
  return file;
}

async function linkPortfolioLogo(repository, logoFile, logo) {
  const versions = await findDocumentVersions(
    repository,
    { companyName: { $eq: logo.companyName } },
    ['companyLogo']
  );

  if (mediaDocumentId(versions.published, 'companyLogo') === logoFile.documentId) {
    console.log(`${logo.companyName} already uses ${logo.fileName}.`);
    return;
  }

  await ensureDraftVersion(repository, versions);
  await repository.update({
    documentId: versions.documentId,
    data: { companyLogo: logoFile.documentId },
    status: 'published',
  });
  console.log(`Linked ${logo.fileName} to Portfolio Company: ${logo.companyName}`);
}

async function linkNavigationLogo(repository, logoFile, logo) {
  const versions = await findSingleTypeVersions(repository, ['logo']);

  if (mediaDocumentId(versions.published, 'logo') === logoFile.documentId) {
    console.log(`Navigation already uses ${logo.fileName}.`);
    return;
  }

  await ensureDraftVersion(repository, versions);
  await repository.update({
    documentId: versions.documentId,
    data: { logo: logoFile.documentId },
    status: 'published',
  });
  console.log(`Linked ${logo.fileName} to Navigation.`);
}

async function verifyLinks(logoFiles) {
  const portfolioRepository = strapi.documents(UIDS.portfolioCompany);
  const navigationRepository = strapi.documents(UIDS.navigation);
  const founderRepository = strapi.documents(UIDS.founderSlide);

  for (const logo of LOGOS.filter((item) => item.companyName)) {
    const company = await portfolioRepository.findFirst({
      filters: { companyName: { $eq: logo.companyName } },
      status: 'published',
      populate: ['companyLogo'],
    });
    const logoFile = logoFiles.get(logo.fileName);
    if (!company || mediaDocumentId(company, 'companyLogo') !== logoFile.documentId) {
      throw new Error(`Verification failed for ${logo.companyName}'s companyLogo field.`);
    }
  }

  const navigation = await navigationRepository.findFirst({
    status: 'published',
    populate: ['logo'],
  });
  const ventureNestFile = logoFiles.get('venture-nest-logo.svg');
  if (!navigation || mediaDocumentId(navigation, 'logo') !== ventureNestFile.documentId) {
    throw new Error('Verification failed for Navigation.logo.');
  }

  // Read only: confirms the seed did not disturb the founder entries or their media.
  const founders = await founderRepository.findMany({
    status: 'published',
    populate: ['founderImg'],
  });
  if (founders.length !== 2 || founders.some((founder) => !founder.founderImg)) {
    throw new Error('Founder Slide verification failed; expected two published slides with images.');
  }

  console.log(
    'Verified all 4 Media Library files and their published relationships; both Founder Slide images remain present.'
  );
}

async function seedBrandLogos() {
  verifySchema();

  const fileRepository = strapi.documents(UIDS.uploadFile);
  const portfolioRepository = strapi.documents(UIDS.portfolioCompany);
  const navigationRepository = strapi.documents(UIDS.navigation);
  const logoFiles = new Map();

  for (const logo of LOGOS) {
    logoFiles.set(logo.fileName, await findOrUploadLogo(fileRepository, logo));
  }

  for (const logo of LOGOS.filter((item) => item.companyName)) {
    await linkPortfolioLogo(portfolioRepository, logoFiles.get(logo.fileName), logo);
  }

  const navigationLogo = LOGOS.find((logo) => logo.navigation);
  await linkNavigationLogo(
    navigationRepository,
    logoFiles.get(navigationLogo.fileName),
    navigationLogo
  );

  await verifyLinks(logoFiles);
}

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    await seedBrandLogos();
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error('Brand logo seed failed.');
  console.error(error);
  process.exit(1);
});
