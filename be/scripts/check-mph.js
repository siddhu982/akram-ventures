const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  const [cols] = await connection.query("DESCRIBE files_related_mph");
  console.log('Columns in files_related_mph:', cols);

  const [rows] = await connection.query("SELECT * FROM files_related_mph LIMIT 10");
  console.log('Sample files_related_mph rows:', rows);

  await connection.end();
}

main().catch(console.error);
