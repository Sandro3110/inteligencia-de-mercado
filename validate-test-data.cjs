const mysql = require('mysql2/promise');
require('dotenv/config');

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           VALIDAÇÃO DE DADOS - TESTE 20 CLIENTES              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  // Ler resultados do teste
  const fs = require('fs');
  const testResults = JSON.parse(fs.readFileSync('/home/ubuntu/TESTE_20_RESULTS.json', 'utf8'));
  
  console.log(`📋 Teste executado em: ${testResults.timestamp}`);
  console.log(`⏱️  Duração: ${testResults.duration}s`);
  console.log(`✅ Taxa de sucesso: ${testResults.successRate}%\n`);
  
  // IDs dos clientes testados
  const clienteIds = testResults.clientes.map(c => c.id);
  
  console.log(`🔍 Validando dados de ${clienteIds.length} clientes...\n`);
  
  const validation = {
    clientes_mercados: { expected: 0, found: 0, ok: false },
    produtos: { expected: 0, found: 0, ok: false },
    concorrentes: { expected: 0, found: 0, ok: false },
    leads: { expected: 0, found: 0, ok: false },
    mercados_unicos: { expected: 0, found: 0, ok: false }
  };
  
  // 1. Validar clientes_mercados
  console.log('1️⃣  Validando tabela clientes_mercados...');
  validation.clientes_mercados.expected = testResults.summary.total * 2; // 2 mercados por cliente
  
  const [cmRows] = await connection.query(`
    SELECT COUNT(*) as count
    FROM clientes_mercados
    WHERE clienteId IN (${clienteIds.join(',')})
  `);
  validation.clientes_mercados.found = cmRows[0].count;
  validation.clientes_mercados.ok = validation.clientes_mercados.found >= validation.clientes_mercados.expected;
  
  console.log(`   Esperado: ${validation.clientes_mercados.expected} registros`);
  console.log(`   Encontrado: ${validation.clientes_mercados.found} registros`);
  console.log(`   Status: ${validation.clientes_mercados.ok ? '✅ OK' : '❌ FALHA'}\n`);
  
  // 2. Validar produtos
  console.log('2️⃣  Validando tabela produtos...');
  validation.produtos.expected = testResults.summary.produtos;
  
  const [prodRows] = await connection.query(`
    SELECT COUNT(*) as count
    FROM produtos
    WHERE clienteId IN (${clienteIds.join(',')})
  `);
  validation.produtos.found = prodRows[0].count;
  validation.produtos.ok = validation.produtos.found >= validation.produtos.expected;
  
  console.log(`   Esperado: ${validation.produtos.expected} registros`);
  console.log(`   Encontrado: ${validation.produtos.found} registros`);
  console.log(`   Status: ${validation.produtos.ok ? '✅ OK' : '❌ FALHA'}\n`);
  
  // 3. Validar concorrentes
  console.log('3️⃣  Validando tabela concorrentes...');
  validation.concorrentes.expected = testResults.summary.concorrentes;
  
  const [concRows] = await connection.query(`
    SELECT COUNT(*) as count
    FROM concorrentes
    WHERE concorrenteHash LIKE 'Concorrente%'
    AND projectId = 1
  `);
  validation.concorrentes.found = concRows[0].count;
  validation.concorrentes.ok = validation.concorrentes.found >= validation.concorrentes.expected;
  
  console.log(`   Esperado: ${validation.concorrentes.expected} registros`);
  console.log(`   Encontrado: ${validation.concorrentes.found} registros`);
  console.log(`   Status: ${validation.concorrentes.ok ? '✅ OK' : '❌ FALHA'}\n`);
  
  // 4. Validar leads
  console.log('4️⃣  Validando tabela leads...');
  validation.leads.expected = testResults.summary.leads;
  
  const [leadRows] = await connection.query(`
    SELECT COUNT(*) as count
    FROM leads
    WHERE leadHash LIKE 'Lead%'
    AND projectId = 1
  `);
  validation.leads.found = leadRows[0].count;
  validation.leads.ok = validation.leads.found >= validation.leads.expected;
  
  console.log(`   Esperado: ${validation.leads.expected} registros`);
  console.log(`   Encontrado: ${validation.leads.found} registros`);
  console.log(`   Status: ${validation.leads.ok ? '✅ OK' : '❌ FALHA'}\n`);
  
  // 5. Validar mercados_unicos
  console.log('5️⃣  Validando tabela mercados_unicos...');
  validation.mercados_unicos.expected = testResults.summary.mercadosUnicos;
  
  const [mercRows] = await connection.query(`
    SELECT COUNT(*) as count
    FROM mercados_unicos
    WHERE nome LIKE 'Mercado Teste%'
    AND projectId = 1
  `);
  validation.mercados_unicos.found = mercRows[0].count;
  validation.mercados_unicos.ok = validation.mercados_unicos.found >= validation.mercados_unicos.expected;
  
  console.log(`   Esperado: ${validation.mercados_unicos.expected} registros`);
  console.log(`   Encontrado: ${validation.mercados_unicos.found} registros`);
  console.log(`   Status: ${validation.mercados_unicos.ok ? '✅ OK' : '❌ FALHA'}\n`);
  
  // Resumo da validação
  const allOk = Object.values(validation).every(v => v.ok);
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DA VALIDAÇÃO                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const tabelas = Object.keys(validation);
  let okCount = 0;
  
  tabelas.forEach(tabela => {
    const v = validation[tabela];
    if (v.ok) okCount++;
    console.log(`${v.ok ? '✅' : '❌'} ${tabela.padEnd(25)} ${v.found}/${v.expected}`);
  });
  
  console.log(`\n📊 Resultado Final: ${okCount}/${tabelas.length} tabelas validadas com sucesso`);
  console.log(`${allOk ? '✅ TESTE APROVADO' : '⚠️  TESTE COM RESSALVAS'}\n`);
  
  // Verificar integridade referencial
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║              VERIFICAÇÃO DE INTEGRIDADE REFERENCIAL            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  // Verificar se todos os produtos têm clienteId e mercadoId válidos
  const [orphanProds] = await connection.query(`
    SELECT COUNT(*) as count
    FROM produtos p
    WHERE p.clienteId IN (${clienteIds.join(',')})
    AND (
      NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id = p.clienteId)
      OR NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = p.mercadoId)
    )
  `);
  
  console.log(`1. Produtos órfãos (sem cliente ou mercado válido): ${orphanProds[0].count}`);
  console.log(`   Status: ${orphanProds[0].count === 0 ? '✅ OK' : '❌ FALHA'}\n`);
  
  // Verificar se todos os concorrentes têm mercadoId válido
  const [orphanConc] = await connection.query(`
    SELECT COUNT(*) as count
    FROM concorrentes c
    WHERE c.projectId = 1
    AND c.concorrenteHash LIKE 'Concorrente%'
    AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = c.mercadoId)
  `);
  
  console.log(`2. Concorrentes órfãos (sem mercado válido): ${orphanConc[0].count}`);
  console.log(`   Status: ${orphanConc[0].count === 0 ? '✅ OK' : '❌ FALHA'}\n`);
  
  // Verificar se todos os leads têm mercadoId válido
  const [orphanLeads] = await connection.query(`
    SELECT COUNT(*) as count
    FROM leads l
    WHERE l.projectId = 1
    AND l.leadHash LIKE 'Lead%'
    AND NOT EXISTS (SELECT 1 FROM mercados_unicos m WHERE m.id = l.mercadoId)
  `);
  
  console.log(`3. Leads órfãos (sem mercado válido): ${orphanLeads[0].count}`);
  console.log(`   Status: ${orphanLeads[0].count === 0 ? '✅ OK' : '❌ FALHA'}\n`);
  
  const integrityOk = orphanProds[0].count === 0 && orphanConc[0].count === 0 && orphanLeads[0].count === 0;
  
  console.log(`📊 Integridade Referencial: ${integrityOk ? '✅ APROVADA' : '❌ REPROVADA'}\n`);
  
  // Salvar resultado da validação
  const validationResult = {
    timestamp: new Date().toISOString(),
    testTimestamp: testResults.timestamp,
    validation,
    integrity: {
      orphanProducts: orphanProds[0].count,
      orphanCompetitors: orphanConc[0].count,
      orphanLeads: orphanLeads[0].count,
      ok: integrityOk
    },
    summary: {
      allTablesOk: allOk,
      integrityOk,
      overallOk: allOk && integrityOk
    }
  };
  
  fs.writeFileSync('/home/ubuntu/VALIDATION_RESULTS.json', JSON.stringify(validationResult, null, 2));
  
  console.log('════════════════════════════════════════════════════════════════\n');
  
  await connection.end();
}

main().catch(console.error);
