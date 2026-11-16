const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  // Check tables
  const [tables] = await connection.query("SHOW TABLES LIKE '%team%'");
  console.log('Team tables:', tables);

  // If teams table exists, query it
  try {
    const [teams] = await connection.query('SELECT * FROM teams');
    console.log('Existing teams count:', teams.length);
    console.log('Existing teams:', teams);
  } catch (err) {
    console.log('Error querying teams:', err.message);
  }

  // Also check upload files
  try {
    const [files] = await connection.query("SELECT id, name, url FROM files WHERE name LIKE '%team%' OR name LIKE '%bala%' OR name LIKE '%rahul%' LIMIT 20");
    console.log('Team files in DB:', files);
  } catch (err) {
    console.log('Error querying files:', err.message);
  }

  await connection.end();
}

main().catch(console.error);
