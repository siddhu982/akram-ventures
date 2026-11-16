/**
 * Updates thesis and portfolio entries with new fields via content-manager API.
 * Also sets public permissions for new single types.
 * Usage: node scripts/update-entries.js
 */
const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'siddhusai.kovur@terralogic.com';
const ADMIN_PASSWORD = 'Siddhu9944';

async function main() {
  // Login
  const loginRes = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  if (!token) { console.error('Login failed:', loginData); process.exit(1); }
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log('Logged in.');

  // --- Update Thesis ---
  console.log('\nUpdating thesis...');
  const thesisRes = await fetch(`${STRAPI_URL}/api/theses?populate=*`);
  const thesisJson = await thesisRes.json();
  const thesis = thesisJson.data?.[0];
  if (thesis && !thesis.heroHeading) {
    // Use content-manager API with the numeric ID
    const updateRes = await fetch(
      `${STRAPI_URL}/content-manager/collection-types/api::thesis.thesis/${thesis.documentId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          heading: thesis.heading || 'thesis',
          slug: thesis.slug || 'thesis',
          heroHeading: 'Arkam Ventures is a thesis centric firm',
          heroSubheading: 'We have a long-term, often multi-decade, point of view on certain market trends, inflection points, and solutions that we believe are truly disruptive and have the potential to create large, scalable, and profitable new market leaders.',
          indiaQuote: 'We believe India is at a unique point in its history in terms of digital adoption, macro-economic, and geo-political winds of change.',
          themesIntroText: 'Arkam invests across two major themes. These are generational themes with massive market drivers, innovation proof points, and clear opportunities for digital disruptors to reshape large industries or create new ones.',
          themeCards: [
            { title: 'Middle India Digitization', description: 'Middle India Digitization is one of the largest global investment opportunities available today. There is a massive shift to digital transactions for essential categories that did not exist five years ago.' },
            { title: 'SaaS from India to the world', description: 'Combining world class product design, and cost effectiveness with savvy go-to-market approaches from India these SaaS companies are setting the stage for highly scalable and profitable growth.' },
          ],
          showcases: [
            { tag: 'Middle India Digitization', heading: "For the first time in India's history, digitization is democratizing access to essential products and services for hundreds of millions of Indians below the top of the pyramid.", description: 'Our companies have deep Middle India understanding reflected in their product design, low friction adoption, customer segmentation, trust building, and low cost acquisition and retention.', layoutDirection: 'image-right' },
            { tag: 'SaaS from India to the world', heading: 'Over the past decade, there are increasing proof points of India building winning SaaS solutions for the world.', description: 'Our companies combine world class product design, lower costs and savvy global go-to-market approaches that create deep moats and opportunities for market leadership.', layoutDirection: 'image-left' },
          ],
        }),
      }
    );
    const updateJson = await updateRes.json();
    if (updateRes.ok) {
      console.log('Thesis updated successfully. heroHeading:', updateJson.data?.heroHeading || updateJson.heroHeading);
    } else {
      console.log('Thesis update response status:', updateRes.status);
      console.log('Response:', JSON.stringify(updateJson).slice(0, 500));
    }
  } else if (thesis?.heroHeading) {
    console.log('Thesis already has heroHeading, skipping.');
  } else {
    console.log('No thesis entry found.');
  }

  // --- Update Portfolio ---
  console.log('\nUpdating portfolio...');
  const portRes = await fetch(`${STRAPI_URL}/api/portfolios?populate=*`);
  const portJson = await portRes.json();
  const portfolio = portJson.data?.[0];
  if (portfolio && !portfolio.heroHeading) {
    const updateRes = await fetch(
      `${STRAPI_URL}/content-manager/collection-types/api::portfolio.portfolio/${portfolio.documentId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          Heading: portfolio.Heading || 'portfolio',
          slug: portfolio.slug || 'portfolio',
          heroHeading: 'Investing in ideas that are transforming the world',
        }),
      }
    );
    const updateJson = await updateRes.json();
    if (updateRes.ok) {
      console.log('Portfolio updated successfully. heroHeading:', updateJson.data?.heroHeading || updateJson.heroHeading);
    } else {
      console.log('Portfolio update response status:', updateRes.status);
      console.log('Response:', JSON.stringify(updateJson).slice(0, 500));
    }
  } else if (portfolio?.heroHeading) {
    console.log('Portfolio already has heroHeading, skipping.');
  } else {
    console.log('No portfolio entry found.');
  }

  // --- Set public permissions ---
  console.log('\nSetting public permissions...');
  // In Strapi 5, users-permissions plugin roles are accessed via the admin API
  const upRolesRes = await fetch(`${STRAPI_URL}/admin/users-permissions/roles`, { headers });
  const upRolesJson = await upRolesRes.json();
  const publicRole = upRolesJson.roles?.find((r) => r.type === 'public');

  if (!publicRole) {
    console.log('Could not find public role. Response:', JSON.stringify(upRolesJson).slice(0, 300));
    console.log('You may need to set permissions manually in Strapi admin.');
    return;
  }

  console.log('Found public role, id:', publicRole.id);

  // Get full role details with permissions
  const roleRes = await fetch(`${STRAPI_URL}/admin/users-permissions/roles/${publicRole.id}`, { headers });
  const roleJson = await roleRes.json();
  const perms = roleJson.role?.permissions || {};

  // Enable find for new single types
  const targets = ['footer', 'about-section', 'pitch-page', 'team-page', 'stories-page'];
  for (const name of targets) {
    const key = `api::${name}`;
    if (perms[key]?.controllers?.[name]) {
      perms[key].controllers[name].find = { enabled: true };
      console.log(`  Enabled find for ${key}`);
    } else {
      console.log(`  Permission key ${key} not found in role. Available keys:`, Object.keys(perms).filter(k => k.startsWith('api::')).join(', '));
    }
  }

  // Update the role
  const updateRoleRes = await fetch(`${STRAPI_URL}/admin/users-permissions/roles/${publicRole.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ permissions: perms }),
  });
  const updateRoleJson = await updateRoleRes.json();
  console.log('Permissions update:', updateRoleRes.ok ? 'success' : JSON.stringify(updateRoleJson).slice(0, 300));

  console.log('\nDone!');
}

main().catch(console.error);
