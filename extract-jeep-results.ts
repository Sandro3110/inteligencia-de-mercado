import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { projects, clientes, mercadosUnicos, concorrentes, leads } from './drizzle/schema';

async function extractJeepResults() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Buscar projeto mais recente da Jeep
  const projectList = await db.select().from(projects);
  const project = projectList.filter(p => p.nome?.includes('Jeep')).pop();
  
  if (!project) {
    console.log('Projeto não encontrado');
    return;
  }
  
  const projectId = project.id;
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('=== PROJETO ===');
  console.log(`ID: ${project.id}`);
  console.log(`Nome: ${project.nome}`);
  console.log(`Descrição: ${project.descricao || 'N/A'}`);
  
  // Buscar clientes
  const clientesData = await db.select().from(clientes)
    .where(eq(clientes.projectId, projectId));
  
  console.log('\n=== CLIENTES ===');
  clientesData.forEach((c, i) => {
    console.log(`\n${i+1}. ${c.nome}`);
    console.log(`   CNPJ: ${c.cnpj || 'N/A'}`);
    console.log(`   Site: ${c.site || 'N/A'}`);
    console.log(`   Produto: ${c.produto || 'N/A'}`);
    console.log(`   Porte: ${c.porte || 'N/A'}`);
    console.log(`   Score: ${c.qualidadeScore || 0}/100`);
  });
  
  // Buscar mercados
  const mercadosData = await db.select().from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, projectId));
  
  console.log('\n=== MERCADOS ===');
  mercadosData.forEach((m, i) => {
    console.log(`\n${i+1}. ${m.nome}`);
    console.log(`   Categoria: ${m.categoria || 'N/A'}`);
    console.log(`   Segmentação: ${m.segmentacao || 'N/A'}`);
  });
  
  // Buscar concorrentes
  const concorrentesData = await db.select().from(concorrentes)
    .where(eq(concorrentes.projectId, projectId));
  
  console.log('\n=== CONCORRENTES ===');
  concorrentesData.forEach((c, i) => {
    console.log(`\n${i+1}. ${c.nome}`);
    console.log(`   CNPJ: ${c.cnpj || 'N/A'}`);
    console.log(`   Site: ${c.site || 'N/A'}`);
    console.log(`   Produto: ${c.produto || 'N/A'}`);
    console.log(`   Score: ${c.qualidadeScore || 0}/100`);
    console.log(`   Classificação: ${c.qualidadeClassificacao || 'N/A'}`);
  });
  
  // Buscar leads
  const leadsData = await db.select().from(leads)
    .where(eq(leads.projectId, projectId));
  
  console.log('\n=== LEADS ===');
  leadsData.forEach((l, i) => {
    console.log(`\n${i+1}. ${l.nome}`);
    console.log(`   CNPJ: ${l.cnpj || 'N/A'}`);
    console.log(`   Email: ${l.email || 'N/A'}`);
    console.log(`   Telefone: ${l.telefone || 'N/A'}`);
    console.log(`   Site: ${l.site || 'N/A'}`);
    console.log(`   Tipo: ${l.tipo || 'N/A'}`);
    console.log(`   Região: ${l.regiao || 'N/A'}`);
    console.log(`   Setor: ${l.setor || 'N/A'}`);
    console.log(`   Score: ${l.qualidadeScore || 0}/100`);
    console.log(`   Classificação: ${l.qualidadeClassificacao || 'N/A'}`);
  });
  
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('=== RESUMO ===');
  console.log(`Total de clientes: ${clientesData.length}`);
  console.log(`Total de mercados: ${mercadosData.length}`);
  console.log(`Total de concorrentes: ${concorrentesData.length}`);
  console.log(`Total de leads: ${leadsData.length}`);
  console.log('══════════════════════════════════════════════════════════\n');
}

extractJeepResults().catch(console.error);
