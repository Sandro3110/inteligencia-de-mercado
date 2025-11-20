const mysql = require('mysql2/promise');
require('dotenv/config');

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           TESTE COM 1 CLIENTE REAL (OpenAI + SerpAPI)         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Selecionar 1 cliente que ainda não foi enriquecido
    const [clientes] = await connection.query(`
      SELECT id, nome, cnpj, produtoPrincipal, siteOficial, cidade
      FROM clientes
      WHERE projectId = 1
      AND id NOT IN (SELECT DISTINCT clienteId FROM clientes_mercados)
      ORDER BY RAND()
      LIMIT 1
    `);
    
    if (clientes.length === 0) {
      console.log('❌ Nenhum cliente disponível para teste\n');
      await connection.end();
      return;
    }
    
    const cliente = clientes[0];
    
    console.log('📋 Cliente Selecionado:');
    console.log(`   Nome: ${cliente.nome}`);
    console.log(`   CNPJ: ${cliente.cnpj}`);
    console.log(`   Produto: ${cliente.produtoPrincipal || 'Não informado'}`);
    console.log(`   Site: ${cliente.siteOficial || 'Não informado'}`);
    console.log(`   Cidade: ${cliente.cidade || 'Não informado'}\n`);
    
    console.log('🚀 Iniciando enriquecimento real...\n');
    
    const startTime = Date.now();
    
    // Importar e executar enriquecimento
    const { enrichClienteReal } = await import('./server/enrichmentReal.ts');
    const result = await enrichClienteReal(cliente.id, 1);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                      RESULTADO DO TESTE                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    if (result.success) {
      console.log(`✅ Enriquecimento concluído com sucesso!`);
      console.log(`⏱️  Tempo: ${duration}s`);
      console.log(`\n📊 Registros Criados:`);
      console.log(`   - Mercados: ${result.mercadosCreated}`);
      console.log(`   - Produtos: ${result.produtosCreated}`);
      console.log(`   - Concorrentes: ${result.concorrentesCreated}`);
      console.log(`   - Leads: ${result.leadsCreated}`);
      
      // Buscar e exibir alguns dados criados
      console.log(`\n🔍 Amostra dos Dados Criados:\n`);
      
      // Mercados
      const [mercados] = await connection.query(`
        SELECT m.nome, m.categoria, m.segmentacao
        FROM mercados_unicos m
        JOIN clientes_mercados cm ON cm.mercadoId = m.id
        WHERE cm.clienteId = ?
        LIMIT 3
      `, [cliente.id]);
      
      console.log(`📍 Mercados:`);
      mercados.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.nome} (${m.categoria})`);
        if (m.segmentacao) console.log(`      Segmentação: ${m.segmentacao}`);
      });
      
      // Concorrentes
      const [concorrentes] = await connection.query(`
        SELECT c.nome, c.cnpj, c.siteOficial, c.qualidadeScore
        FROM concorrentes c
        JOIN clientes_mercados cm ON cm.mercadoId = c.mercadoId
        WHERE cm.clienteId = ?
        ORDER BY c.createdAt DESC
        LIMIT 5
      `, [cliente.id]);
      
      console.log(`\n🏢 Concorrentes (Top 5):`);
      concorrentes.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.nome}`);
        console.log(`      CNPJ: ${c.cnpj || 'Não encontrado'}`);
        console.log(`      Site: ${c.siteOficial || 'Não encontrado'}`);
        console.log(`      Quality Score: ${c.qualidadeScore}/100`);
      });
      
      // Leads
      const [leads] = await connection.query(`
        SELECT l.nome, l.cnpj, l.potencial, l.qualidadeScore
        FROM leads l
        JOIN clientes_mercados cm ON cm.mercadoId = l.mercadoId
        WHERE cm.clienteId = ?
        ORDER BY l.createdAt DESC
        LIMIT 5
      `, [cliente.id]);
      
      console.log(`\n💼 Leads (Top 5):`);
      leads.forEach((l, i) => {
        console.log(`   ${i + 1}. ${l.nome}`);
        console.log(`      CNPJ: ${l.cnpj || 'Não encontrado'}`);
        console.log(`      Potencial: ${l.potencial}`);
        console.log(`      Quality Score: ${l.qualidadeScore}/100`);
      });
      
      // Calcular quality score médio
      const avgConcorrentes = concorrentes.reduce((sum, c) => sum + c.qualidadeScore, 0) / concorrentes.length;
      const avgLeads = leads.reduce((sum, l) => sum + l.qualidadeScore, 0) / leads.length;
      
      console.log(`\n📈 Quality Score Médio:`);
      console.log(`   - Concorrentes: ${avgConcorrentes.toFixed(1)}/100`);
      console.log(`   - Leads: ${avgLeads.toFixed(1)}/100`);
      
    } else {
      console.log(`❌ Enriquecimento falhou!`);
      console.log(`⏱️  Tempo: ${duration}s`);
      console.log(`❌ Erro: ${result.error}`);
    }
    
    console.log('\n════════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
