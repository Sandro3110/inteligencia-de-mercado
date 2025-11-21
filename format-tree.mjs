import mysql from 'mysql2/promise';

async function formatProjectsTree() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const [rows] = await connection.execute(`
      SELECT 
        p.id as project_id,
        p.nome as project_nome,
        p.descricao as project_descricao,
        p.status as project_status,
        p.cor as project_cor,
        p.createdAt as project_created,
        ps.id as pesquisa_id,
        ps.nome as pesquisa_nome,
        ps.descricao as pesquisa_descricao,
        ps.totalClientes as pesquisa_total_clientes,
        ps.status as pesquisa_status,
        ps.createdAt as pesquisa_created,
        (SELECT COUNT(*) FROM mercados_unicos WHERE pesquisaId = ps.id) as total_mercados,
        (SELECT COUNT(*) FROM clientes WHERE pesquisaId = ps.id) as total_clientes,
        (SELECT COUNT(*) FROM concorrentes WHERE pesquisaId = ps.id) as total_concorrentes,
        (SELECT COUNT(*) FROM leads WHERE pesquisaId = ps.id) as total_leads,
        (SELECT COUNT(*) FROM produtos WHERE pesquisaId = ps.id) as total_produtos
      FROM projects p
      LEFT JOIN pesquisas ps ON p.id = ps.projectId
      ORDER BY p.id, ps.id
    `);
    
    // Agrupar por projeto
    const projectsMap = new Map();
    
    for (const row of rows) {
      if (!projectsMap.has(row.project_id)) {
        projectsMap.set(row.project_id, {
          id: row.project_id,
          nome: row.project_nome,
          descricao: row.project_descricao,
          status: row.project_status,
          cor: row.project_cor,
          createdAt: row.project_created,
          pesquisas: []
        });
      }
      
      if (row.pesquisa_id) {
        projectsMap.get(row.project_id).pesquisas.push({
          id: row.pesquisa_id,
          nome: row.pesquisa_nome,
          descricao: row.pesquisa_descricao,
          totalClientes: row.pesquisa_total_clientes,
          status: row.pesquisa_status,
          createdAt: row.pesquisa_created,
          stats: {
            mercados: Number(row.total_mercados),
            clientes: Number(row.total_clientes),
            concorrentes: Number(row.total_concorrentes),
            leads: Number(row.total_leads),
            produtos: Number(row.total_produtos)
          }
        });
      }
    }
    
    // Exibir árvore formatada
    console.log('\n📊 ESTRUTURA COMPLETA DE PROJETOS E PESQUISAS\n');
    console.log('='.repeat(80));
    
    let totalProjetos = 0;
    let totalPesquisas = 0;
    let totalMercados = 0;
    let totalClientes = 0;
    let totalConcorrentes = 0;
    let totalLeads = 0;
    let totalProdutos = 0;
    
    for (const [projectId, project] of projectsMap) {
      totalProjetos++;
      
      console.log(`\n🗂️  PROJETO: ${project.nome} (ID: ${project.id})`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Descrição: ${project.descricao || 'N/A'}`);
      console.log(`   Cor: ${project.cor || 'N/A'}`);
      console.log(`   Criado em: ${new Date(project.createdAt).toLocaleString('pt-BR')}`);
      
      if (project.pesquisas.length === 0) {
        console.log('   └─ ⚠️  Nenhuma pesquisa encontrada');
      } else {
        console.log(`   └─ 📋 ${project.pesquisas.length} Pesquisa(s):`);
        
        for (let i = 0; i < project.pesquisas.length; i++) {
          const pesquisa = project.pesquisas[i];
          const isLast = i === project.pesquisas.length - 1;
          const prefix = isLast ? '      └─' : '      ├─';
          
          totalPesquisas++;
          totalMercados += pesquisa.stats.mercados;
          totalClientes += pesquisa.stats.clientes;
          totalConcorrentes += pesquisa.stats.concorrentes;
          totalLeads += pesquisa.stats.leads;
          totalProdutos += pesquisa.stats.produtos;
          
          console.log(`${prefix} ${pesquisa.nome} (ID: ${pesquisa.id})`);
          console.log(`${isLast ? '         ' : '      │  '}Status: ${pesquisa.status}`);
          console.log(`${isLast ? '         ' : '      │  '}Total Clientes Alvo: ${pesquisa.totalClientes || 0}`);
          console.log(`${isLast ? '         ' : '      │  '}Criado em: ${new Date(pesquisa.createdAt).toLocaleString('pt-BR')}`);
          console.log(`${isLast ? '         ' : '      │  '}📊 Conteúdo:`);
          console.log(`${isLast ? '         ' : '      │  '}   • Mercados Únicos: ${pesquisa.stats.mercados}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Clientes: ${pesquisa.stats.clientes}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Concorrentes: ${pesquisa.stats.concorrentes}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Leads: ${pesquisa.stats.leads}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Produtos: ${pesquisa.stats.produtos}`);
          
          if (!isLast) console.log('      │');
        }
      }
      
      console.log('\n' + '-'.repeat(80));
    }
    
    // Resumo geral
    console.log('\n📈 RESUMO GERAL DO BANCO DE DADOS\n');
    console.log(`Total de Projetos: ${totalProjetos}`);
    console.log(`Total de Pesquisas: ${totalPesquisas}`);
    console.log(`Total de Mercados Únicos: ${totalMercados}`);
    console.log(`Total de Clientes: ${totalClientes}`);
    console.log(`Total de Concorrentes: ${totalConcorrentes}`);
    console.log(`Total de Leads: ${totalLeads}`);
    console.log(`Total de Produtos: ${totalProdutos}`);
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
  } finally {
    await connection.end();
  }
}

formatProjectsTree();
