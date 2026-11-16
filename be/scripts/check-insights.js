const mysql = require('mysql2/promise');
mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'root',database:'example1'})
  .then(async conn => {
    const [tables] = await conn.query("SHOW TABLES LIKE '%insight%'");
    console.log('Insight tables:', tables.map(t => Object.values(t)[0]));

    const [compTables] = await conn.query("SHOW TABLES LIKE '%components_insights%'");
    console.log('Component tables:', compTables.map(t => Object.values(t)[0]));

    if (tables.length > 0) {
      const [cols] = await conn.query('DESCRIBE insights');
      console.log('insights columns:', cols.map(c => c.Field));
    }
    await conn.end();
  }).catch(e => console.error(e.message));
