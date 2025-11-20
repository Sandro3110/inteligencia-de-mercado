import mysql from 'mysql2/promise';

async function analyzeGround() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== ANÁLISE DO PROJETO GROUND ===\n');

  try {
    // 1. Buscar projeto Ground
    const [projects] = await connection.execute(
      `SELECT id, nome, descricao, status, createdAt, lastActivityAt 
       FROM projects 
       WHERE nome LIKE '%Ground%' OR nome LIKE '%ground%'`
    );

    if (projects.length === 0) {
      console.log('❌ Projeto Ground não encontrado!');
      await connection.end();
      process.exit(1);
    }

    const project = projects[0];
    
    console.log('📊 INFORMAÇÕES DO PROJETO:');
    console.log(`ID: ${project.id}`);
    console.log(`Nome: ${project.nome}`);
    console.log(`Descrição: ${project.descricao || 'N/A'}`);
    console.log(`Status: ${project.status}`);
    console.log(`Criado em: ${project.createdAt}`);
    console.log(`Última atividade: ${project.lastActivityAt}`);
    console.log('');

    // 2. Buscar pesquisas
    const [pesquisas] = await connection.execute(
      `SELECT id, nome, descricao, totalClientes, status, createdAt
       FROM pesquisas
       WHERE projectId = ?`,
      [project.id]
    );
    
    console.log(`📋 PESQUISAS DO PROJETO: ${pesquisas.length}`);
    pesquisas.forEach(p => {
      console.log(`  - ID ${p.id}: ${p.nome} (${p.totalClientes} clientes) - Status: ${p.status}`);
    });
    console.log('');

    // 3. Contar clientes
    const [clientesCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM clientes WHERE projectId = ?`,
      [project.id]
    );
    
    console.log(`👥 CLIENTES: ${clientesCount[0].total}`);

    // 4. Amostra de clientes
    const [clientesSample] = await connection.execute(
      `SELECT id, empresa, cnpj, produto, qualidadeScore, validationStatus
       FROM clientes 
       WHERE projectId = ?
       LIMIT 10`,
      [project.id]
    );
    
    console.log('\n📝 AMOSTRA DE CLIENTES (primeiros 10):');
    clientesSample.forEach(c => {
      console.log(`  - ${c.empresa} (CNPJ: ${c.cnpj || 'N/A'}) | Produto: ${c.produto || 'N/A'} | Score: ${c.qualidadeScore || 0} | Status: ${c.validationStatus}`);
    });
    console.log('');

    // 5. Contar mercados
    const [mercadosCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM mercados_unicos WHERE projectId = ?`,
      [project.id]
    );
    
    console.log(`🎯 MERCADOS IDENTIFICADOS: ${mercadosCount[0].total}`);

    // 6. Amostra de mercados
    const [mercadosSample] = await connection.execute(
      `SELECT id, nome, segmentacao, categoria
       FROM mercados_unicos 
       WHERE projectId = ?
       LIMIT 10`,
      [project.id]
    );
    
    console.log('\n🎯 AMOSTRA DE MERCADOS (primeiros 10):');
    mercadosSample.forEach(m => {
      console.log(`  - ${m.nome} (${m.segmentacao}) | Categoria: ${m.categoria || 'N/A'}`);
    });
    console.log('');

    // 7. Contar concorrentes, leads e produtos
    const [concorrentesCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM concorrentes WHERE projectId = ?`,
      [project.id]
    );
    const [leadsCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM leads WHERE projectId = ?`,
      [project.id]
    );
    const [produtosCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM produtos WHERE projectId = ?`,
      [project.id]
    );
    
    console.log(`🏢 CONCORRENTES: ${concorrentesCount[0].total}`);
    console.log(`📞 LEADS: ${leadsCount[0].total}`);
    console.log(`📦 PRODUTOS: ${produtosCount[0].total}`);
    console.log('');

    // 8. Estatísticas de qualidade
    const [qualityStats] = await connection.execute(
      `SELECT 
        AVG(qualidadeScore) as avgScore,
        MIN(qualidadeScore) as minScore,
        MAX(qualidadeScore) as maxScore,
        COUNT(CASE WHEN qualidadeScore >= 80 THEN 1 END) as excelente,
        COUNT(CASE WHEN qualidadeScore >= 60 AND qualidadeScore < 80 THEN 1 END) as bom,
        COUNT(CASE WHEN qualidadeScore >= 40 AND qualidadeScore < 60 THEN 1 END) as regular,
        COUNT(CASE WHEN qualidadeScore < 40 THEN 1 END) as ruim
       FROM clientes
       WHERE projectId = ?`,
      [project.id]
    );

    const stats = qualityStats[0];
    console.log('📊 ESTATÍSTICAS DE QUALIDADE DOS CLIENTES:');
    console.log(`  Score Médio: ${stats.avgScore?.toFixed(2) || 0}`);
    console.log(`  Score Mínimo: ${stats.minScore || 0}`);
    console.log(`  Score Máximo: ${stats.maxScore || 0}`);
    console.log(`  Excelente (80-100): ${stats.excelente}`);
    console.log(`  Bom (60-79): ${stats.bom}`);
    console.log(`  Regular (40-59): ${stats.regular}`);
    console.log(`  Ruim (0-39): ${stats.ruim}`);
    console.log('');

    // 9. Jobs de enriquecimento
    const [jobs] = await connection.execute(
      `SELECT id, pesquisaId, totalClients, processedClients, status, createdAt, completedAt
       FROM enrichment_jobs
       WHERE pesquisaId IN (SELECT id FROM pesquisas WHERE projectId = ?)
       ORDER BY createdAt DESC
       LIMIT 5`,
      [project.id]
    );
    
    console.log(`⚙️ JOBS DE ENRIQUECIMENTO: ${jobs.length}`);
    jobs.forEach(j => {
      console.log(`  - Job #${j.id}: ${j.processedClients}/${j.totalClients} clientes | Status: ${j.status}`);
      console.log(`    Criado: ${j.createdAt} | Concluído: ${j.completedAt || 'Em andamento'}`);
    });
    console.log('');

    // 10. Análise de retorno
    const clientesTotal = clientesCount[0].total;
    const concorrentesPorCliente = clientesTotal > 0 ? concorrentesCount[0].total / clientesTotal : 0;
    const leadsPorCliente = clientesTotal > 0 ? leadsCount[0].total / clientesTotal : 0;
    const produtosPorCliente = clientesTotal > 0 ? produtosCount[0].total / clientesTotal : 0;

    console.log('📈 ANÁLISE DE RETORNO:');
    console.log(`  Concorrentes por Cliente: ${concorrentesPorCliente.toFixed(2)}`);
    console.log(`  Leads por Cliente: ${leadsPorCliente.toFixed(2)}`);
    console.log(`  Produtos por Cliente: ${produtosPorCliente.toFixed(2)}`);
    console.log('');

    console.log('=== FIM DA ANÁLISE ===');
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await connection.end();
  }
}

analyzeGround().catch(console.error);
