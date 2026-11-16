const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  const [rows] = await conn.query("SELECT * FROM up_permissions WHERE action LIKE '%insight%'");
  console.log('Insight permissions:', rows);

  const [tables] = await conn.query("SHOW TABLES LIKE '%insight%'");
  console.log('Insight tables:', tables);

  const [insights] = await conn.query("SELECT * FROM insights");
  console.log('Insight count:', insights.length);
  console.log('Insight rows:', insights);

  await conn.end();
}

run().catch(console.error);
