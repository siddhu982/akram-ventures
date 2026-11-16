const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  const [tokens] = await connection.query('SELECT * FROM strapi_api_tokens');
  console.log('API Tokens:', tokens);

  const [permissions] = await connection.query("SELECT * FROM up_permissions WHERE action LIKE '%team%'");
  console.log('Team permissions:', permissions);

  const [roles] = await connection.query('SELECT * FROM up_roles');
  console.log('Roles:', roles);

  await connection.end();
}

main().catch(console.error);
