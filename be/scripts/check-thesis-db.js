const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'example1'
  });

  const [headings] = await connection.query('SELECT * FROM components_thesis_bottom_slider_headings');
  console.log('components_thesis_bottom_slider_headings:', headings);

  const [sliderImgs] = await connection.query('SELECT * FROM components_thesis_slider_imgs');
  console.log('components_thesis_slider_imgs:', sliderImgs);

  const [lnk] = await connection.query('SELECT * FROM components_thesis_bottom_slider_headings_cmps');
  console.log('components_thesis_bottom_slider_headings_cmps:', lnk);

  // Also query files table for media URLs
  const [files] = await connection.query('SELECT id, name, url FROM files');
  console.log('Files in uploads:', files);

  await connection.end();
}

main().catch(console.error);
