const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  const [cols] = await connection.query("DESCRIBE teams");
  console.log('Columns in teams table:');
  for (const c of cols) {
    console.log(` - ${c.Field}: ${c.Type} (${c.Null})`);
  }

  const [cmpCols] = await connection.query("DESCRIBE components_teams_social_medias");
  console.log('Columns in components_teams_social_medias:');
  for (const c of cmpCols) {
    console.log(` - ${c.Field}: ${c.Type}`);
  }

  const [cmpsLnkCols] = await connection.query("DESCRIBE teams_cmps");
  console.log('Columns in teams_cmps:');
  for (const c of cmpsLnkCols) {
    console.log(` - ${c.Field}: ${c.Type}`);
  }

  const [fileCols] = await connection.query("DESCRIBE files");
  console.log('Columns in files:');
  for (const c of fileCols) {
    console.log(` - ${c.Field}: ${c.Type}`);
  }

  const [fileLnkCols] = await connection.query("SHOW TABLES LIKE '%files_%lnk%'");
  console.log('Files link tables:', fileLnkCols);

  await connection.end();
}

main().catch(console.error);
