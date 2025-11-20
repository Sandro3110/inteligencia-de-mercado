import { getDb } from './server/db';

async function analyzeDatabase() {
  const db = await getDb();
  if (!db) {
    console.error('❌ Não foi possível conectar ao banco');
    return;
  }

  console.log('\n🔍 ANÁLISE DO BANCO DE DADOS\n');

  // 1. Projetos sem pesquisas
  const projectsWithoutPesquisas = await db.execute(`
    SELECT p.id, p.nome, p.status,
      (SELECT COUNT(*) FROM pesquisas WHERE projectId = p.id) as pesquisas_count
    FROM projects p
    HAVING pesquisas_count = 0
  `);
  
  console.log('📊 PROJETOS SEM PESQUISAS:');
  console.log(`Total: ${projectsWithoutPesquisas.length}`);
  projectsWithoutPesquisas.forEach((p: any) => {
    console.log(`  - ID ${p.id}: ${p.nome} (${p.status})`);
  });

  // 2. Pesquisas sem dados
  const pesquisasWithoutData = await db.execute(`
    SELECT 
      p.id, p.nome, p.projectId, p.status,
      (SELECT COUNT(*) FROM clientes WHERE pesquisaId = p.id) as clientes_count,
      (SELECT COUNT(*) FROM concorrentes WHERE pesquisaId = p.id) as concorrentes_count,
      (SELECT COUNT(*) FROM mercados_unicos WHERE pesquisaId = p.id) as mercados_count,
      (SELECT COUNT(*) FROM leads WHERE pesquisaId = p.id) as leads_count
    FROM pesquisas p
    HAVING clientes_count = 0 AND concorrentes_count = 0 AND mercados_count = 0 AND leads_count = 0
  `);

  console.log('\n📊 PESQUISAS SEM DADOS:');
  console.log(`Total: ${pesquisasWithoutData.length}`);
  pesquisasWithoutData.forEach((p: any) => {
    console.log(`  - ID ${p.id}: ${p.nome} (Projeto ${p.projectId}, Status: ${p.status})`);
  });

  // 3. Estatísticas gerais
  const stats = await db.execute(`
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

  console.log('\n📊 ESTATÍSTICAS GERAIS:');
  const s = stats[0] as any;
  console.log(`  Projetos: ${s.total_projects} (${s.active_projects} ativos, ${s.hibernated_projects} hibernados)`);
  console.log(`  Pesquisas: ${s.total_pesquisas} (${s.completed_pesquisas} concluídas)`);
  console.log(`  Clientes: ${s.total_clientes}`);
  console.log(`  Concorrentes: ${s.total_concorrentes}`);
  console.log(`  Mercados: ${s.total_mercados}`);
  console.log(`  Leads: ${s.total_leads}`);
  console.log(`  Produtos: ${s.total_produtos}`);

  console.log('\n✅ Análise concluída!\n');
  process.exit(0);
}

analyzeDatabase().catch(console.error);
