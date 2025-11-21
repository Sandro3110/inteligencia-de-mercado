import mysql from 'mysql2/promise';

async function findEmbalagens() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('\n🔍 BUSCANDO PESQUISA "EMBALAGENS 2025"...\n');
  
  // Buscar pesquisas com nome similar
  const [pesquisas] = await conn.execute(`
    SELECT * FROM pesquisas 
    WHERE nome LIKE '%embalagem%' OR nome LIKE '%Embalagem%'
    ORDER BY id
  `);
  
  console.log('📋 Pesquisas encontradas com "embalagem" no nome:');
  console.log(JSON.stringify(pesquisas, null, 2));
  
  // Buscar projetos com nome similar
  const [projects] = await conn.execute(`
    SELECT * FROM projects 
    WHERE nome LIKE '%embalagem%' OR nome LIKE '%Embalagem%'
    ORDER BY id
  `);
  
  console.log('\n🗂️ Projetos encontrados com "embalagem" no nome:');
  console.log(JSON.stringify(projects, null, 2));
  
  // Contar dados totais no banco
  const [counts] = await conn.execute(`
    SELECT 
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM pesquisas) as total_pesquisas,
      (SELECT COUNT(*) FROM mercados_unicos) as total_mercados,
      (SELECT COUNT(*) FROM clientes) as total_clientes,
      (SELECT COUNT(*) FROM concorrentes) as total_concorrentes,
      (SELECT COUNT(*) FROM leads) as total_leads,
      (SELECT COUNT(*) FROM produtos) as total_produtos
  `);
  
  console.log('\n📊 TOTAIS REAIS NO BANCO:');
  console.log(JSON.stringify(counts[0], null, 2));
  
  // Buscar dados sem pesquisaId (órfãos)
  const [orphans] = await conn.execute(`
    SELECT 
      (SELECT COUNT(*) FROM clientes WHERE pesquisaId IS NULL) as clientes_orfaos,
      (SELECT COUNT(*) FROM concorrentes WHERE pesquisaId IS NULL) as concorrentes_orfaos,
      (SELECT COUNT(*) FROM leads WHERE pesquisaId IS NULL) as leads_orfaos,
      (SELECT COUNT(*) FROM mercados_unicos WHERE pesquisaId IS NULL) as mercados_orfaos,
      (SELECT COUNT(*) FROM produtos WHERE pesquisaId IS NULL) as produtos_orfaos
  `);
  
  console.log('\n⚠️ DADOS ÓRFÃOS (sem pesquisaId):');
  console.log(JSON.stringify(orphans[0], null, 2));
  
  await conn.end();
}

findEmbalagens();
