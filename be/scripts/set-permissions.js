/**
 * Sets public find permissions for new single types.
 * Usage: node scripts/set-permissions.js
 */
const STRAPI_URL = 'http://localhost:1337';

async function main() {
  // Login to admin
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

  // In Strapi 5, the admin panel's users-permissions routes are under /content-manager or admin API
  // Try: GET /admin/content-api/permissions to see all available permissions
  let permRes = await fetch(`${STRAPI_URL}/admin/content-api/permissions`, { headers });
  if (permRes.ok) {
    const permData = await permRes.json();
    console.log('Available API permissions:', JSON.stringify(Object.keys(permData.data || permData)).slice(0, 500));
  }

  // Get users-permissions plugin roles via admin internal API
  // Strapi 5 uses: /admin/users-permissions (plugin namespace under admin)
  const endpoints = [
    '/content-manager/users-permissions/roles',
    '/admin/content-api/roles',
  ];

  let roles = null;
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${STRAPI_URL}${ep}`, { headers });
      if (res.ok) {
        const data = await res.json();
        roles = data.data || data.roles || data;
        console.log(`Found roles at ${ep}:`, Array.isArray(roles) ? roles.map(r => `${r.name}(${r.type})`).join(', ') : 'check format');
        break;
      }
    } catch {}
  }

  if (!roles) {
    // Direct database approach - use Strapi's internal API for users-permissions
    console.log('Trying alternative approach via users-permissions plugin...');

    // The users-permissions plugin in Strapi 5 exposes its settings under admin
    const settingsRes = await fetch(`${STRAPI_URL}/admin/users-permissions/roles`, { headers });
    if (!settingsRes.ok) {
      console.log('Status:', settingsRes.status, 'Content-Type:', settingsRes.headers.get('content-type'));
      // If it returns HTML, the route doesn't exist in the admin API
      const text = await settingsRes.text();
      if (text.startsWith('<!DOCTYPE')) {
        console.log('Got HTML page - endpoint not available.');
      } else {
        console.log('Response:', text.slice(0, 300));
      }
    }
  }

  // Alternative: use the Strapi transfer token or API token approach
  // Let's try creating a full-access API token and using it
  console.log('\nCreating temporary API token for permission setup...');
  const tokenRes = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'temp-seed-token-' + Date.now(),
      description: 'Temporary token for seeding permissions',
      type: 'full-access',
      lifespan: 604800000, // 7 days
    }),
  });

  if (tokenRes.ok) {
    const tokenData = await tokenRes.json();
    const apiToken = tokenData.data?.accessKey;
    console.log('API token created.');

    if (apiToken) {
      const apiHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` };

      // Try fetching roles with API token
      const rolesRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, { headers: apiHeaders });
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        roles = rolesData.roles;
        console.log('Found roles via API token:', roles?.map(r => `${r.name}(id:${r.id})`).join(', '));

        const publicRole = roles?.find(r => r.type === 'public');
        if (publicRole) {
          // Get full role detail
          const roleRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, { headers: apiHeaders });
          const roleData = await roleRes.json();
          const perms = roleData.role?.permissions || {};

          console.log('\nAPI permission keys:', Object.keys(perms).filter(k => k.startsWith('api::')).join(', '));

          // Enable find for our new types
          const targets = ['footer', 'about-section', 'pitch-page', 'team-page', 'stories-page'];
          for (const name of targets) {
            const key = `api::${name}`;
            if (perms[key]?.controllers) {
              for (const ctrl of Object.keys(perms[key].controllers)) {
                if (perms[key].controllers[ctrl].find !== undefined) {
                  perms[key].controllers[ctrl].find.enabled = true;
                  console.log(`  Enabled find for ${key}.${ctrl}`);
                }
              }
            } else {
              console.log(`  ${key} not in permissions, available: ${Object.keys(perms).filter(k=>k.includes(name)).join(',') || 'none matching'}`);
            }
          }

          // Update role
          const updateRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
            method: 'PUT',
            headers: apiHeaders,
            body: JSON.stringify({ permissions: perms }),
          });
          console.log('\nPermissions update status:', updateRes.status, updateRes.ok ? 'SUCCESS' : 'FAILED');
          if (!updateRes.ok) {
            console.log('Response:', (await updateRes.text()).slice(0, 300));
          }
        }
      } else {
        console.log('API token roles fetch failed:', rolesRes.status);
      }

      // Clean up: delete the temp token
      if (tokenData.data?.id) {
        await fetch(`${STRAPI_URL}/admin/api-tokens/${tokenData.data.id}`, { method: 'DELETE', headers });
        console.log('Temp API token deleted.');
      }
    }
  } else {
    console.log('Could not create API token:', tokenRes.status);
    const text = await tokenRes.text();
    console.log(text.slice(0, 300));
  }

  console.log('\nDone!');
}

main().catch(console.error);
