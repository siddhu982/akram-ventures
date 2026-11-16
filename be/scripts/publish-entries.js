/**
 * Publishes draft thesis and portfolio entries.
 * Usage: node scripts/publish-entries.js
 */
const STRAPI_URL = 'http://localhost:1337';

async function main() {
  const loginRes = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'siddhusai.kovur@terralogic.com',
      password: 'Siddhu9944',
    }),
  });
  const { data: loginData } = await loginRes.json();
  const token = loginData?.token;
  if (!token) { console.error('Login failed'); process.exit(1); }
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Publish thesis
  const thesisRes = await fetch(`${STRAPI_URL}/api/theses?status=draft`);
  const thesisJson = await thesisRes.json();
  const thesis = thesisJson.data?.[0];
  if (thesis) {
    console.log('Publishing thesis documentId:', thesis.documentId);
    const pubRes = await fetch(
      `${STRAPI_URL}/content-manager/collection-types/api::thesis.thesis/${thesis.documentId}/actions/publish`,
      { method: 'POST', headers }
    );
    console.log('Thesis publish:', pubRes.ok ? 'SUCCESS' : `FAILED (${pubRes.status})`);
    if (!pubRes.ok) console.log(await pubRes.text());
  }

  // Publish portfolio
  const portRes = await fetch(`${STRAPI_URL}/api/portfolios?status=draft`);
  const portJson = await portRes.json();
  const portfolio = portJson.data?.[0];
  if (portfolio) {
    console.log('Publishing portfolio documentId:', portfolio.documentId);
    const pubRes = await fetch(
      `${STRAPI_URL}/content-manager/collection-types/api::portfolio.portfolio/${portfolio.documentId}/actions/publish`,
      { method: 'POST', headers }
    );
    console.log('Portfolio publish:', pubRes.ok ? 'SUCCESS' : `FAILED (${pubRes.status})`);
    if (!pubRes.ok) console.log(await pubRes.text());
  }

  // Also publish any draft stories
  const storiesRes = await fetch(`${STRAPI_URL}/api/stories?status=draft`);
  const storiesJson = await storiesRes.json();
  if (storiesJson.data?.length > 0) {
    for (const story of storiesJson.data) {
      const pubRes = await fetch(
        `${STRAPI_URL}/content-manager/collection-types/api::story.story/${story.documentId}/actions/publish`,
        { method: 'POST', headers }
      );
      console.log(`Story "${story.shortDes?.slice(0, 40)}..." publish:`, pubRes.ok ? 'OK' : 'FAILED');
    }
  }

  // Also publish any draft insights
  const insightsRes = await fetch(`${STRAPI_URL}/api/insights?status=draft`);
  const insightsJson = await insightsRes.json();
  if (insightsJson.data?.length > 0) {
    for (const insight of insightsJson.data) {
      const pubRes = await fetch(
        `${STRAPI_URL}/content-manager/collection-types/api::insight.insight/${insight.documentId}/actions/publish`,
        { method: 'POST', headers }
      );
      console.log(`Insight "${insight.title?.slice(0, 40)}..." publish:`, pubRes.ok ? 'OK' : 'FAILED');
    }
  }

  console.log('\nDone! All entries published.');
}

main().catch(console.error);
