const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  const [tables] = await connection.query("SHOW TABLES LIKE '%file%'");
  console.log('File tables:', tables);

  const [morphs] = await connection.query("SHOW TABLES LIKE '%morph%'");
  console.log('Morph tables:', morphs);

  await connection.end();
}

main().catch(console.error);
