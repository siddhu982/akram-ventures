const mysql = require('mysql2/promise');
mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'root',database:'example1'}).then(async c => {
  const [tables] = await c.query("SHOW TABLES");
  const all = tables.map(t => Object.values(t)[0]);
  const story = all.filter(t => t.includes('story') || t.includes('blog'));
  console.log('story/blog tables:', story);

  const [mint] = await c.query("SELECT id, name, url FROM files WHERE name LIKE '%4044%' OR name LIKE '%mint%' OR name LIKE '%Mint%'");
  console.log('Mint logo candidates:');
  mint.forEach(r => console.log(' ', r.id, r.name, r.url));

  const [existing] = await c.query("SELECT id, document_id, short_des, description FROM stories WHERE published_at IS NOT NULL");
  console.log('\nExisting published stories:', existing.length);
  existing.forEach(r => console.log('  id:', r.id, 'shortDes:', r.short_des));

  await c.end();
}).catch(console.error);
