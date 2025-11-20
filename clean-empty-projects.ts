import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and, sql } from 'drizzle-orm';
import { 
  projects, 
  pesquisas, 
  mercadosUnicos,
  clientes,
  concorrentes,
  leads,
  produtos
} from './drizzle/schema';

const db = drizzle(process.env.DATABASE_URL!);

interface EmptyProject {
  id: number;
  nome: string;
  pesquisasCount: number;
  clientesCount: number;
  mercadosCount: number;
  concorrentesCount: number;
  leadsCount: number;
  produtosCount: number;
}

interface EmptyPesquisa {
  id: number;
  nome: string;
  projectId: number;
  projectNome: string;
  clientesCount: number;
  mercadosCount: number;
  concorrentesCount: number;
  leadsCount: number;
  produtosCount: number;
}

async function findEmptyProjects(): Promise<EmptyProject[]> {
  console.log('🔍 Buscando projetos vazios...');
  
  const allProjects = await db.select().from(projects);
  const emptyProjects: EmptyProject[] = [];
  
  for (const project of allProjects) {
    // Contar pesquisas do projeto
    const pesquisasResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pesquisas)
      .where(eq(pesquisas.projectId, project.id));
    const pesquisasCount = Number(pesquisasResult[0]?.count || 0);
    
    // Contar clientes do projeto
    const clientesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.projectId, project.id));
    const clientesCount = Number(clientesResult[0]?.count || 0);
    
    // Contar mercados do projeto
    const mercadosResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.projectId, project.id));
    const mercadosCount = Number(mercadosResult[0]?.count || 0);
    
    // Contar concorrentes do projeto
    const concorrentesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.projectId, project.id));
    const concorrentesCount = Number(concorrentesResult[0]?.count || 0);
    
    // Contar leads do projeto
    const leadsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.projectId, project.id));
    const leadsCount = Number(leadsResult[0]?.count || 0);
    
    // Contar produtos do projeto
    const produtosResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(produtos)
      .where(eq(produtos.projectId, project.id));
    const produtosCount = Number(produtosResult[0]?.count || 0);
    
    // Considerar vazio se não tem nenhum dado
    const isEmpty = pesquisasCount === 0 && 
                    clientesCount === 0 && 
                    mercadosCount === 0 && 
                    concorrentesCount === 0 && 
                    leadsCount === 0 && 
                    produtosCount === 0;
    
    if (isEmpty) {
      emptyProjects.push({
        id: project.id,
        nome: project.nome,
        pesquisasCount,
        clientesCount,
        mercadosCount,
        concorrentesCount,
        leadsCount,
        produtosCount
      });
    }
  }
  
  return emptyProjects;
}

async function findEmptyPesquisas(): Promise<EmptyPesquisa[]> {
  console.log('🔍 Buscando pesquisas vazias...');
  
  const allPesquisas = await db
    .select({
      pesquisa: pesquisas,
      project: projects
    })
    .from(pesquisas)
    .leftJoin(projects, eq(pesquisas.projectId, projects.id));
  
  const emptyPesquisas: EmptyPesquisa[] = [];
  
  for (const row of allPesquisas) {
    const pesquisa = row.pesquisa;
    const project = row.project;
    
    if (!project) continue;
    
    // Contar clientes da pesquisa
    const clientesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clientes)
      .where(eq(clientes.pesquisaId, pesquisa.id));
    const clientesCount = Number(clientesResult[0]?.count || 0);
    
    // Contar mercados da pesquisa
    const mercadosResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.pesquisaId, pesquisa.id));
    const mercadosCount = Number(mercadosResult[0]?.count || 0);
    
    // Contar concorrentes da pesquisa
    const concorrentesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.pesquisaId, pesquisa.id));
    const concorrentesCount = Number(concorrentesResult[0]?.count || 0);
    
    // Contar leads da pesquisa
    const leadsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leads)
      .where(eq(leads.pesquisaId, pesquisa.id));
    const leadsCount = Number(leadsResult[0]?.count || 0);
    
    // Contar produtos da pesquisa
    const produtosResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(produtos)
      .where(eq(produtos.pesquisaId, pesquisa.id));
    const produtosCount = Number(produtosResult[0]?.count || 0);
    
    // Considerar vazio se não tem nenhum dado
    const isEmpty = clientesCount === 0 && 
                    mercadosCount === 0 && 
                    concorrentesCount === 0 && 
                    leadsCount === 0 && 
                    produtosCount === 0;
    
    if (isEmpty) {
      emptyPesquisas.push({
        id: pesquisa.id,
        nome: pesquisa.nome,
        projectId: project.id,
        projectNome: project.nome,
        clientesCount,
        mercadosCount,
        concorrentesCount,
        leadsCount,
        produtosCount
      });
    }
  }
  
  return emptyPesquisas;
}

async function deleteEmptyRecords() {
  console.log('🧹 Iniciando Limpeza de Projetos e Pesquisas Vazios...');
  console.log('============================================================\n');
  
  // 1. Buscar pesquisas vazias
  const emptyPesquisas = await findEmptyPesquisas();
  
  console.log(`📊 Pesquisas vazias encontradas: ${emptyPesquisas.length}`);
  if (emptyPesquisas.length > 0) {
    console.log('\nDetalhes das pesquisas vazias:');
    for (const p of emptyPesquisas) {
      console.log(`  - ID ${p.id}: "${p.nome}" (Projeto: ${p.projectNome})`);
      console.log(`    Clientes: ${p.clientesCount}, Mercados: ${p.mercadosCount}, Concorrentes: ${p.concorrentesCount}, Leads: ${p.leadsCount}, Produtos: ${p.produtosCount}`);
    }
    
    // Deletar pesquisas vazias
    console.log('\n🗑️  Deletando pesquisas vazias...');
    for (const p of emptyPesquisas) {
      await db.delete(pesquisas).where(eq(pesquisas.id, p.id));
      console.log(`  ✅ Pesquisa "${p.nome}" (ID ${p.id}) deletada`);
    }
  } else {
    console.log('  ✅ Nenhuma pesquisa vazia encontrada');
  }
  
  console.log('\n------------------------------------------------------------\n');
  
  // 2. Buscar projetos vazios
  const emptyProjects = await findEmptyProjects();
  
  console.log(`📊 Projetos vazios encontrados: ${emptyProjects.length}`);
  if (emptyProjects.length > 0) {
    console.log('\nDetalhes dos projetos vazios:');
    for (const p of emptyProjects) {
      console.log(`  - ID ${p.id}: "${p.nome}"`);
      console.log(`    Pesquisas: ${p.pesquisasCount}, Clientes: ${p.clientesCount}, Mercados: ${p.mercadosCount}, Concorrentes: ${p.concorrentesCount}, Leads: ${p.leadsCount}, Produtos: ${p.produtosCount}`);
    }
    
    // Deletar projetos vazios
    console.log('\n🗑️  Deletando projetos vazios...');
    for (const p of emptyProjects) {
      await db.delete(projects).where(eq(projects.id, p.id));
      console.log(`  ✅ Projeto "${p.nome}" (ID ${p.id}) deletado`);
    }
  } else {
    console.log('  ✅ Nenhum projeto vazio encontrado');
  }
  
  console.log('\n============================================================');
  console.log('✅ Limpeza concluída!');
  console.log(`📊 Resumo: ${emptyPesquisas.length} pesquisas e ${emptyProjects.length} projetos deletados`);
}

// Executar
deleteEmptyRecords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro durante limpeza:', error);
    process.exit(1);
  });
