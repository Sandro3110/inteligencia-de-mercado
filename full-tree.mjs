import mysql from 'mysql2/promise';

async function showFullTree() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Buscar TODOS os projetos
  const [projects] = await conn.execute('SELECT * FROM projects ORDER BY id');
  
  console.log('\n📊 ESTRUTURA COMPLETA REAL DO BANCO DE DADOS\n');
  console.log('='.repeat(100));
  
  for (const project of projects) {
    console.log(`\n🗂️  PROJETO: ${project.nome} (ID: ${project.id})`);
    console.log(`   Status: ${project.status}`);
    console.log(`   Descrição: ${project.descricao || 'N/A'}`);
    console.log(`   Cor: ${project.cor || 'N/A'}`);
    
    // Buscar pesquisas do projeto
    const [pesquisas] = await conn.execute(
      'SELECT * FROM pesquisas WHERE projectId = ? ORDER BY id',
      [project.id]
    );
    
    if (pesquisas.length === 0) {
      console.log('   └─ ⚠️  Nenhuma pesquisa encontrada');
    } else {
      console.log(`   └─ 📋 ${pesquisas.length} Pesquisa(s):\n`);
      
      for (let i = 0; i < pesquisas.length; i++) {
        const pesquisa = pesquisas[i];
        const isLast = i === pesquisas.length - 1;
        const prefix = isLast ? '      └─' : '      ├─';
        
        // Contar dados da pesquisa
        const [stats] = await conn.execute(`
          SELECT 
            (SELECT COUNT(*) FROM mercados_unicos WHERE pesquisaId = ?) as mercados,
            (SELECT COUNT(*) FROM clientes WHERE pesquisaId = ?) as clientes,
            (SELECT COUNT(*) FROM concorrentes WHERE pesquisaId = ?) as concorrentes,
            (SELECT COUNT(*) FROM leads WHERE pesquisaId = ?) as leads,
            (SELECT COUNT(*) FROM produtos WHERE pesquisaId = ?) as produtos
        `, [pesquisa.id, pesquisa.id, pesquisa.id, pesquisa.id, pesquisa.id]);
        
        console.log(`${prefix} ${pesquisa.nome} (ID: ${pesquisa.id})`);
        console.log(`${isLast ? '         ' : '      │  '}Status: ${pesquisa.status}`);
        console.log(`${isLast ? '         ' : '      │  '}Total Clientes Alvo: ${pesquisa.totalClientes || 0}`);
        console.log(`${isLast ? '         ' : '      │  '}Clientes Enriquecidos: ${pesquisa.clientesEnriquecidos || 0}`);
        console.log(`${isLast ? '         ' : '      │  '}📊 Conteúdo:`);
        console.log(`${isLast ? '         ' : '      │  '}   • Mercados Únicos: ${stats[0].mercados}`);
        console.log(`${isLast ? '         ' : '      │  '}   • Clientes: ${stats[0].clientes}`);
        console.log(`${isLast ? '         ' : '      │  '}   • Concorrentes: ${stats[0].concorrentes}`);
        console.log(`${isLast ? '         ' : '      │  '}   • Leads: ${stats[0].leads}`);
        console.log(`${isLast ? '         ' : '      │  '}   • Produtos: ${stats[0].produtos}`);
        
        if (!isLast) console.log('      │');
      }
    }
    
    console.log('\n' + '-'.repeat(100));
  }
  
  await conn.end();
}

showFullTree();
