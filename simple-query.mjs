import mysql from 'mysql2/promise';

async function query() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [projects] = await conn.execute('SELECT * FROM projects ORDER BY id');
  const [pesquisas] = await conn.execute('SELECT * FROM pesquisas ORDER BY projectId, id');
  
  console.log('\n=== PROJETOS ===');
  console.log(JSON.stringify(projects, null, 2));
  
  console.log('\n=== PESQUISAS ===');
  console.log(JSON.stringify(pesquisas, null, 2));
  
  await conn.end();
}

query();
