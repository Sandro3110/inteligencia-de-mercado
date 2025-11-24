import postgres from 'postgres';

const urls = [
  'postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000!@#$%@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres',
  'postgresql://postgres.ecnzlynmuerbmqingyfl:Ss311000%21%40%23%24%25@db.ecnzlynmuerbmqingyfl.supabase.co:5432/postgres'
];

for (const [index, url] of urls.entries()) {
  console.log(`\nTestando URL ${index + 1}...`);
  try {
    const sql = postgres(url, { max: 1 });
    const result = await sql`SELECT current_database(), version()`;
    console.log('✅ Conexão bem-sucedida!');
    console.log('Database:', result[0].current_database);
    console.log('Version:', result[0].version.substring(0, 50) + '...');
    await sql.end();
  } catch (error) {
    console.log('❌ Erro na conexão:', error.message);
  }
}
