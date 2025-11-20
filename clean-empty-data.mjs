import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('\n🔍 ANÁLISE DO BANCO DE DADOS\n');
  
  // 1. Projetos sem pesquisas
  const [projectsWithoutPesquisas] = await connection.execute(`
    SELECT 
      p.id, p.nome, p.status,
      COUNT(ps.id) as pesquisas_count
    FROM projects p
    LEFT JOIN pesquisas ps ON ps.projectId = p.id
    GROUP BY p.id, p.nome, p.status
    HAVING pesquisas_count = 0
  `);
  
  console.log('📊 PROJETOS SEM PESQUISAS:');
  console.log(`Total: ${projectsWithoutPesquisas.length}`);
  projectsWithoutPesquisas.forEach(p => {
    console.log(`  - ID ${p.id}: ${p.nome} (${p.status})`);
  });
  
  // 2. Pesquisas sem dados
  const [pesquisasWithoutData] = await connection.execute(`
    SELECT 
      p.id, p.nome, p.projectId, p.status,
      (SELECT COUNT(*) FROM clientes WHERE pesquisaId = p.id) as clientes,
      (SELECT COUNT(*) FROM concorrentes WHERE pesquisaId = p.id) as concorrentes,
      (SELECT COUNT(*) FROM mercados_unicos WHERE pesquisaId = p.id) as mercados,
      (SELECT COUNT(*) FROM leads WHERE pesquisaId = p.id) as leads
    FROM pesquisas p
    HAVING clientes = 0 AND concorrentes = 0 AND mercados = 0 AND leads = 0
  `);
  
  console.log('\n📊 PESQUISAS SEM DADOS:');
  console.log(`Total: ${pesquisasWithoutData.length}`);
  pesquisasWithoutData.forEach(p => {
    console.log(`  - ID ${p.id}: ${p.nome} (Projeto ${p.projectId}, Status: ${p.status})`);
  });
  
  // 3. Estatísticas gerais
  const [stats] = await connection.execute(`
    SELECT 
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
      (SELECT COUNT(*) FROM projects WHERE status = 'hibernated') as hibernated_projects,
      (SELECT COUNT(*) FROM pesquisas) as total_pesquisas,
      (SELECT COUNT(*) FROM pesquisas WHERE status = 'concluida') as completed_pesquisas,
      (SELECT COUNT(*) FROM clientes) as total_clientes,
      (SELECT COUNT(*) FROM concorrentes) as total_concorrentes,
      (SELECT COUNT(*) FROM mercados_unicos) as total_mercados,
      (SELECT COUNT(*) FROM leads) as total_leads,
      (SELECT COUNT(*) FROM produtos) as total_produtos
  `);
  
  const s = stats[0];
  console.log('\n📊 ESTATÍSTICAS GERAIS:');
  console.log(`  Projetos: ${s.total_projects} (${s.active_projects} ativos, ${s.hibernated_projects} hibernados)`);
  console.log(`  Pesquisas: ${s.total_pesquisas} (${s.completed_pesquisas} concluídas)`);
  console.log(`  Clientes: ${s.total_clientes}`);
  console.log(`  Concorrentes: ${s.total_concorrentes}`);
  console.log(`  Mercados: ${s.total_mercados}`);
  console.log(`  Leads: ${s.total_leads}`);
  console.log(`  Produtos: ${s.total_produtos}`);
  
  // 4. Confirmar limpeza
  console.log('\n🧹 LIMPEZA AUTOMÁTICA\n');
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    rl.question('Deseja deletar projetos e pesquisas vazios? (s/n): ', resolve);
  });
  rl.close();
  
  if (answer.toLowerCase() !== 's') {
    console.log('\n❌ Limpeza cancelada pelo usuário\n');
    await connection.end();
    process.exit(0);
  }
  
  // Deletar pesquisas vazias
  if (pesquisasWithoutData.length > 0) {
    const ids = pesquisasWithoutData.map(p => p.id).join(',');
    const [result1] = await connection.execute(`DELETE FROM pesquisas WHERE id IN (${ids})`);
    console.log(`✅ ${result1.affectedRows} pesquisas vazias deletadas`);
  }
  
  // Deletar projetos vazios
  if (projectsWithoutPesquisas.length > 0) {
    const ids = projectsWithoutPesquisas.map(p => p.id).join(',');
    const [result2] = await connection.execute(`DELETE FROM projects WHERE id IN (${ids})`);
    console.log(`✅ ${result2.affectedRows} projetos vazios deletados`);
  }
  
  console.log('\n✅ Limpeza concluída!\n');
  
  await connection.end();
  process.exit(0);
}

main().catch(console.error);
