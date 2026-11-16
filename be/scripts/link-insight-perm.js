const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  const [roleLinks] = await conn.query("SELECT * FROM up_permissions_role_lnk WHERE permission_id IN (42, 43)");
  console.log('Permission role links for 42, 43:', roleLinks);

  // If not linked to role_id 2 (public), link them!
  for (const permId of [42, 43]) {
    const hasPub = roleLinks.some(r => r.permission_id === permId && r.role_id === 2);
    if (!hasPub) {
      await conn.query("INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, 2)", [permId]);
      console.log(`Linked permission ${permId} to Public role (2)`);
    }
  }

  await conn.end();
}

run().catch(console.error);
