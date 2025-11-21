import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const db = drizzle(process.env.DATABASE_URL);

async function getProjectsTree() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Buscar todos os projetos
    const [projects] = await connection.execute(
      'SELECT id, nome, descricao, status, cor, createdAt FROM projects ORDER BY id'
    );
    
    console.log('\n📊 ESTRUTURA COMPLETA DE PROJETOS E PESQUISAS\n');
    console.log('='.repeat(80));
    
    for (const project of projects) {
      console.log(`\n🗂️  PROJETO: ${project.nome} (ID: ${project.id})`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Descrição: ${project.descricao || 'N/A'}`);
      console.log(`   Cor: ${project.cor || 'N/A'}`);
      console.log(`   Criado em: ${project.createdAt}`);
      
      // Buscar pesquisas do projeto
      const [pesquisas] = await connection.execute(
        'SELECT id, nome, descricao, totalClientes, status, createdAt FROM pesquisas WHERE projectId = ? ORDER BY id',
        [project.id]
      );
      
      if (pesquisas.length === 0) {
        console.log('   └─ ⚠️  Nenhuma pesquisa encontrada');
      } else {
        console.log(`   └─ 📋 ${pesquisas.length} Pesquisa(s):`);
        
        for (let i = 0; i < pesquisas.length; i++) {
          const pesquisa = pesquisas[i];
          const isLast = i === pesquisas.length - 1;
          const prefix = isLast ? '      └─' : '      ├─';
          
          console.log(`${prefix} ${pesquisa.nome} (ID: ${pesquisa.id})`);
          console.log(`${isLast ? '         ' : '      │  '}Status: ${pesquisa.status}`);
          console.log(`${isLast ? '         ' : '      │  '}Total Clientes: ${pesquisa.totalClientes || 0}`);
          
          // Buscar estatísticas da pesquisa
          const [mercados] = await connection.execute(
            'SELECT COUNT(*) as count FROM mercados_unicos WHERE pesquisaId = ?',
            [pesquisa.id]
          );
          
          const [clientes] = await connection.execute(
            'SELECT COUNT(*) as count FROM clientes WHERE pesquisaId = ?',
            [pesquisa.id]
          );
          
          const [concorrentes] = await connection.execute(
            'SELECT COUNT(*) as count FROM concorrentes WHERE pesquisaId = ?',
            [pesquisa.id]
          );
          
          const [leads] = await connection.execute(
            'SELECT COUNT(*) as count FROM leads WHERE pesquisaId = ?',
            [pesquisa.id]
          );
          
          const [produtos] = await connection.execute(
            'SELECT COUNT(*) as count FROM produtos WHERE pesquisaId = ?',
            [pesquisa.id]
          );
          
          console.log(`${isLast ? '         ' : '      │  '}📊 Conteúdo:`);
          console.log(`${isLast ? '         ' : '      │  '}   • Mercados: ${mercados[0].count}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Clientes: ${clientes[0].count}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Concorrentes: ${concorrentes[0].count}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Leads: ${leads[0].count}`);
          console.log(`${isLast ? '         ' : '      │  '}   • Produtos: ${produtos[0].count}`);
          
          if (!isLast) console.log('      │');
        }
      }
      
      console.log('\n' + '-'.repeat(80));
    }
    
    // Resumo geral
    const [totalMercados] = await connection.execute('SELECT COUNT(*) as count FROM mercados_unicos');
    const [totalClientes] = await connection.execute('SELECT COUNT(*) as count FROM clientes');
    const [totalConcorrentes] = await connection.execute('SELECT COUNT(*) as count FROM concorrentes');
    const [totalLeads] = await connection.execute('SELECT COUNT(*) as count FROM leads');
    const [totalProdutos] = await connection.execute('SELECT COUNT(*) as count FROM produtos');
    const [totalPesquisas] = await connection.execute('SELECT COUNT(*) as count FROM pesquisas');
    
    console.log('\n📈 RESUMO GERAL DO BANCO DE DADOS\n');
    console.log(`Total de Projetos: ${projects.length}`);
    console.log(`Total de Pesquisas: ${totalPesquisas[0].count}`);
    console.log(`Total de Mercados: ${totalMercados[0].count}`);
    console.log(`Total de Clientes: ${totalClientes[0].count}`);
    console.log(`Total de Concorrentes: ${totalConcorrentes[0].count}`);
    console.log(`Total de Leads: ${totalLeads[0].count}`);
    console.log(`Total de Produtos: ${totalProdutos[0].count}`);
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
  } finally {
    await connection.end();
  }
}

getProjectsTree();
