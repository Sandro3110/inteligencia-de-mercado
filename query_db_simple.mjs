import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/intelmarket';

async function queryDatabase() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔌 Conectando ao banco...\n');
    
    const projects = await sql`SELECT id, nome, status, ativo FROM projects ORDER BY id`;
    console.log('📊 PROJETOS (' + projects.length + '):');
    projects.forEach(p => console.log(`  [${p.id}] ${p.nome} (status: ${p.status}, ativo: ${p.ativo})`));
    
    const pesquisas = await sql`SELECT id, nome, "projectId", status FROM pesquisas ORDER BY "projectId", id`;
    console.log('\n🔍 PESQUISAS (' + pesquisas.length + '):');
    pesquisas.forEach(p => console.log(`  [${p.id}] ${p.nome} (projeto: ${p.projectId}, status: ${p.status})`));
    
    const clientes = await sql`SELECT "projectId", COUNT(*)::int as count FROM clientes GROUP BY "projectId" ORDER BY "projectId"`;
    console.log('\n👥 CLIENTES POR PROJETO:');
    clientes.forEach(c => console.log(`  Projeto ${c.projectId}: ${c.count} clientes`));
    
    const concorrentes = await sql`SELECT "projectId", COUNT(*)::int as count FROM concorrentes GROUP BY "projectId" ORDER BY "projectId"`;
    console.log('\n📊 CONCORRENTES POR PROJETO:');
    concorrentes.forEach(c => console.log(`  Projeto ${c.projectId}: ${c.count} concorrentes`));
    
    const leads = await sql`SELECT "projectId", COUNT(*)::int as count FROM leads GROUP BY "projectId" ORDER BY "projectId"`;
    console.log('\n🎯 LEADS POR PROJETO:');
    leads.forEach(l => console.log(`  Projeto ${l.projectId}: ${l.count} leads`));
    
    const mercados = await sql`SELECT "projectId", COUNT(*)::int as count FROM "mercadosUnicos" GROUP BY "projectId" ORDER BY "projectId"`;
    console.log('\n🌍 MERCADOS POR PROJETO:');
    mercados.forEach(m => console.log(`  Projeto ${m.projectId}: ${m.count} mercados`));
    
    console.log('\n✅ Consulta concluída!');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sql.end();
  }
}

queryDatabase();
