// Script simplificado para testar enriquecimento de 20 clientes
const mysql = require('mysql2/promise');
require('dotenv/config');

// Simular função enrichClienteCompleto (versão simplificada para teste)
async function enrichClienteCompleto(clienteId, projectId, connection) {
  // Buscar dados do cliente
  const [clienteRows] = await connection.query(
    'SELECT * FROM clientes WHERE id = ? AND projectId = ?',
    [clienteId, projectId]
  );
  
  if (clienteRows.length === 0) {
    throw new Error(`Cliente ${clienteId} não encontrado`);
  }
  
  const cliente = clienteRows[0];
  
  // Simular enriquecimento (aqui você chamaria a API Gemini real)
  // Por enquanto, vamos apenas criar registros de teste
  
  const mercados = [
    { nome: `Mercado Teste ${clienteId}-1`, categoria: 'B2B' },
    { nome: `Mercado Teste ${clienteId}-2`, categoria: 'B2C' }
  ];
  
  const produtos = [
    { nome: `Produto ${clienteId}-1`, descricao: 'Descrição teste' },
    { nome: `Produto ${clienteId}-2`, descricao: 'Descrição teste' }
  ];
  
  const concorrentes = Array.from({ length: 10 }, (_, i) => ({
    nome: `Concorrente ${clienteId}-${i+1}`,
    cnpj: `${Math.floor(Math.random() * 100000000000000)}`,
    qualidadeScore: Math.floor(Math.random() * 40) + 60
  }));
  
  const leads = Array.from({ length: 5 }, (_, i) => ({
    nome: `Lead ${clienteId}-${i+1}`,
    cnpj: `${Math.floor(Math.random() * 100000000000000)}`,
    qualidadeScore: Math.floor(Math.random() * 40) + 60
  }));
  
  // Inserir no banco (simplificado)
  for (const merc of mercados) {
    const mercHash = require('crypto').createHash('md5').update(merc.nome).digest('hex');
    
    await connection.query(`
      INSERT INTO mercados_unicos (mercadoHash, nome, categoria, segmentacao, projectId)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE nome = VALUES(nome)
    `, [mercHash, merc.nome, merc.categoria, 'Teste', projectId]);
    
    const [mercResult] = await connection.query(
      'SELECT id FROM mercados_unicos WHERE mercadoHash = ?',
      [mercHash]
    );
    const mercadoId = mercResult[0].id;
    
    // Associar cliente ao mercado
    await connection.query(`
      INSERT IGNORE INTO clientes_mercados (clienteId, mercadoId)
      VALUES (?, ?)
    `, [clienteId, mercadoId]);
    
    // Inserir produtos
    for (const prod of produtos) {
      await connection.query(`
        INSERT INTO produtos (nome, descricao, clienteId, mercadoId, projectId)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE descricao = VALUES(descricao)
      `, [prod.nome, prod.descricao, clienteId, mercadoId, projectId]);
    }
  }
  
  // Pegar primeiro mercadoId para associar concorrentes e leads
  const [firstMerc] = await connection.query(
    'SELECT id FROM mercados_unicos WHERE projectId = ? LIMIT 1',
    [projectId]
  );
  const mercadoIdForCompetitors = firstMerc[0]?.id || 1;
  
  // Inserir concorrentes
  for (const conc of concorrentes) {
    const concHash = require('crypto').createHash('md5').update(conc.nome + conc.cnpj).digest('hex');
    
    await connection.query(`
      INSERT INTO concorrentes (concorrenteHash, mercadoId, nome, cnpj, qualidadeScore, projectId)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE nome = VALUES(nome)
    `, [concHash, mercadoIdForCompetitors, conc.nome, conc.cnpj, conc.qualidadeScore, projectId]);
  }
  
  // Inserir leads
  for (const lead of leads) {
    const leadHash = require('crypto').createHash('md5').update(lead.nome + lead.cnpj).digest('hex');
    
    await connection.query(`
      INSERT INTO leads (leadHash, mercadoId, nome, cnpj, qualidadeScore, projectId)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE nome = VALUES(nome)
    `, [leadHash, mercadoIdForCompetitors, lead.nome, lead.cnpj, lead.qualidadeScore, projectId]);
  }
  
  return {
    mercados,
    produtos,
    concorrentes,
    leads
  };
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         TESTE DE ENRIQUECIMENTO - 20 CLIENTES ALEATÓRIOS      ║');
  console.log('║                    (TESTE DIRETO NO BANCO)                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  // Buscar 20 clientes aleatórios
  const [clientes] = await connection.query(`
    SELECT id, nome, cnpj, siteOficial, produtoPrincipal
    FROM clientes
    WHERE projectId = 1
    AND id NOT IN (
      SELECT DISTINCT clienteId FROM clientes_mercados
    )
    ORDER BY RAND()
    LIMIT 20
  `);
  
  console.log(`📊 Selecionados ${clientes.length} clientes aleatórios para teste\n`);
  
  if (clientes.length === 0) {
    console.log('⚠️  Nenhum cliente disponível para teste.');
    await connection.end();
    return;
  }
  
  const startTime = Date.now();
  const results = {
    success: 0,
    errors: 0,
    errorDetails: [],
    clientes: [],
    mercados: new Set(),
    produtos: 0,
    concorrentes: 0,
    leads: 0
  };
  
  for (let i = 0; i < clientes.length; i++) {
    const cliente = clientes[i];
    console.log(`\n[${i + 1}/${clientes.length}] Processando: ${cliente.nome}`);
    console.log(`   CNPJ: ${cliente.cnpj || 'N/A'}`);
    
    try {
      const result = await enrichClienteCompleto(cliente.id, 1, connection);
      
      results.success++;
      results.clientes.push({
        id: cliente.id,
        nome: cliente.nome,
        mercados: result.mercados.length,
        produtos: result.produtos.length,
        concorrentes: result.concorrentes.length,
        leads: result.leads.length
      });
      
      result.mercados.forEach(m => results.mercados.add(m.nome));
      results.produtos += result.produtos.length;
      results.concorrentes += result.concorrentes.length;
      results.leads += result.leads.length;
      
      console.log(`   ✅ Sucesso!`);
      console.log(`      └─ ${result.mercados.length} mercados, ${result.produtos.length} produtos, ${result.concorrentes.length} concorrentes, ${result.leads.length} leads`);
      
    } catch (error) {
      results.errors++;
      results.errorDetails.push({
        cliente: cliente.nome,
        error: error.message
      });
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    RESULTADO DO TESTE                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`⏱️  Tempo Total: ${duration}s`);
  console.log(`⏱️  Tempo Médio por Cliente: ${(duration / clientes.length).toFixed(1)}s\n`);
  
  console.log(`✅ Sucesso: ${results.success}/${clientes.length} (${((results.success / clientes.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Erros: ${results.errors}/${clientes.length}\n`);
  
  if (results.errors > 0) {
    console.log(`🔍 Detalhes dos Erros:`);
    results.errorDetails.forEach((e, idx) => {
      console.log(`   ${idx + 1}. ${e.cliente}: ${e.error}`);
    });
    console.log('');
  }
  
  console.log(`📊 Estatísticas Geradas:`);
  console.log(`   ├─ Mercados Únicos: ${results.mercados.size}`);
  console.log(`   ├─ Produtos: ${results.produtos}`);
  console.log(`   ├─ Concorrentes: ${results.concorrentes}`);
  console.log(`   └─ Leads: ${results.leads}\n`);
  
  console.log(`📋 Detalhamento por Cliente:`);
  results.clientes.forEach((c, idx) => {
    console.log(`   ${idx + 1}. ${c.nome}`);
    console.log(`      └─ ${c.mercados}M | ${c.produtos}P | ${c.concorrentes}C | ${c.leads}L`);
  });
  
  console.log('\n════════════════════════════════════════════════════════════════\n');
  
  // Salvar resultados
  const resultsJSON = {
    timestamp: new Date().toISOString(),
    duration: parseFloat(duration),
    avgTimePerClient: parseFloat((duration / clientes.length).toFixed(1)),
    successRate: parseFloat(((results.success / clientes.length) * 100).toFixed(1)),
    summary: {
      total: clientes.length,
      success: results.success,
      errors: results.errors,
      mercadosUnicos: results.mercados.size,
      produtos: results.produtos,
      concorrentes: results.concorrentes,
      leads: results.leads
    },
    clientes: results.clientes,
    errors: results.errorDetails
  };
  
  const fs = require('fs/promises');
  await fs.writeFile('/home/ubuntu/TESTE_20_RESULTS.json', JSON.stringify(resultsJSON, null, 2));
  
  await connection.end();
}

main().catch(console.error);
