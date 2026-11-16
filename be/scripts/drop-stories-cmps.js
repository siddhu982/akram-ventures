const mysql = require('mysql2/promise');
mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'root',database:'example1'})
  .then(async conn => {
    await conn.query('DROP TABLE IF EXISTS stories_cmps');
    console.log('Dropped stories_cmps — Strapi will recreate it on next start.');
    await conn.end();
  }).catch(e => console.error(e.message));
