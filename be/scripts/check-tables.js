const mysql = require('mysql2/promise');
mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'root',database:'example1'})
  .then(async conn => {
    const [stories] = await conn.query("SELECT id, short_des, published_at FROM stories");
    console.log('Stories:', stories.length);
    stories.forEach(s => console.log(` [${s.id}] short_des="${s.short_des}" published=${!!s.published_at}`));

    const [cmps] = await conn.query("SELECT * FROM stories_cmps");
    console.log('\nstories_cmps rows:', cmps.length, JSON.stringify(cmps));

    const [groups] = await conn.query("SELECT * FROM components_story_blog_card_groups");
    console.log('\nblog_card_groups:', groups.length);

    const [cards] = await conn.query("SELECT id, about_card FROM components_story_blog_cards");
    console.log('\nblog_cards:', cards.length);
    cards.forEach(c => console.log(` [${c.id}] ${c.about_card ? c.about_card.substring(0,50) : 'null'}`));

    await conn.end();
  }).catch(e => console.error(e.message));
