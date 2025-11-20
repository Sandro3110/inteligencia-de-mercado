/**
 * Teste FINAL das 3 correções
 * Enriquece 5 clientes e valida os bugs corrigidos
 */

import mysql from 'mysql2/promise';
import { enrichClientesParallel } from './server/enrichmentOptimized.js';

async function test() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         TESTE FINAL DAS 3 CORREÇÕES DE BUGS                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 1. Buscar 5 clientes não enriquecidos
  console.log('📋 Buscando 5 clientes não enriquecidos...\n');
  
  const [clientes] = await conn.query(`
    SELECT c.id, c.nome
    FROM clientes c
    LEFT JOIN clientes_mercados cm ON c.id = cm.clienteId
    WHERE c.projectId = 1 AND cm.clienteId IS NULL
    LIMIT 5
  `);
  
  if (clientes.length === 0) {
    console.log('⚠️ Não há clientes não enriquecidos disponíveis\n');
    await conn.end();
    process.exit(0);
  }
  
  console.log(`✅ Encontrados ${clientes.length} clientes:\n`);
  clientes.forEach((c, i) => {
    console.log(`${i+1}. ${c.nome} (ID: ${c.id})`);
  });
  
  const clienteIds = clientes.map(c => c.id);
  
  // 2. Enriquecer clientes
  console.log('\n🚀 Iniciando enriquecimento com código CORRIGIDO...\n');
  
  const startTime = Date.now();
  
  try {
    const results = await enrichClientesParallel(clienteIds, 1);
    
    const duration = (Date.now() - startTime) / 1000;
    
    // 3. Resultados
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    RESULTADOS DO ENRIQUECIMENTO                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    console.log(`⏱️  Tempo total: ${duration.toFixed(1)}s`);
    console.log(`📊 Taxa: ${(clientes.length / duration * 60).toFixed(1)} clientes/min\n`);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Sucesso: ${successful}/${clientes.length}`);
    console.log(`❌ Falhas: ${failed}/${clientes.length}\n`);
    
    if (failed > 0) {
      console.log('⚠️ Erros encontrados:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - Cliente ${r.clienteId}: ${r.error}`);
      });
      console.log('');
    }
    
    // 4. Verificar correções no banco
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║         VERIFICAÇÃO DAS 3 CORREÇÕES NOS DADOS NOVOS           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // Bug Fix 1: Campo produto em concorrentes
    const [concorrenteCheck] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(produto) as comProduto,
        ROUND(COUNT(produto) * 100.0 / COUNT(*), 1) as percentual
      FROM concorrentes
      WHERE mercadoId IN (
        SELECT mercadoId FROM clientes_mercados WHERE clienteId IN (${clienteIds.join(',')})
      )
    `);
    
    console.log('✅ BUG FIX 1 - Campo produto em concorrentes:');
    console.log(`   Total: ${concorrenteCheck[0].total}`);
    console.log(`   Com produto: ${concorrenteCheck[0].comProduto} (${concorrenteCheck[0].percentual}%)`);
    console.log(`   Esperado: 100%\n`);
    
    // Bug Fix 2: Quality Score e Classificação
    const [qualityCheck] = await conn.query(`
      SELECT 
        'Concorrentes' as tipo,
        MIN(qualidadeScore) as minScore,
        MAX(qualidadeScore) as maxScore,
        ROUND(AVG(qualidadeScore), 1) as avgScore,
        COUNT(DISTINCT qualidadeScore) as uniqueScores,
        COUNT(qualidadeClassificacao) as comClassificacao,
        COUNT(*) as total
      FROM concorrentes
      WHERE mercadoId IN (
        SELECT mercadoId FROM clientes_mercados WHERE clienteId IN (${clienteIds.join(',')})
      )
      UNION ALL
      SELECT 
        'Leads' as tipo,
        MIN(qualidadeScore) as minScore,
        MAX(qualidadeScore) as maxScore,
        ROUND(AVG(qualidadeScore), 1) as avgScore,
        COUNT(DISTINCT qualidadeScore) as uniqueScores,
        COUNT(qualidadeClassificacao) as comClassificacao,
        COUNT(*) as total
      FROM leads
      WHERE mercadoId IN (
        SELECT mercadoId FROM clientes_mercados WHERE clienteId IN (${clienteIds.join(',')})
      )
    `);
    
    console.log('✅ BUG FIX 2 - Quality Score melhorado:');
    qualityCheck.forEach(row => {
      console.log(`   ${row.tipo}:`);
      console.log(`     - Total: ${row.total}`);
      console.log(`     - Score: ${row.minScore} a ${row.maxScore} (média: ${row.avgScore})`);
      console.log(`     - Scores únicos: ${row.uniqueScores} (antes: sempre 65)`);
      console.log(`     - Com classificação: ${row.comClassificacao}/${row.total} (${(row.comClassificacao/row.total*100).toFixed(1)}%)\n`);
    });
    
    // Bug Fix 3: Campo ativo em produtos
    const [produtoCheck] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        SUM(ativo) as ativos,
        ROUND(SUM(ativo) * 100.0 / COUNT(*), 1) as percentual
      FROM produtos
      WHERE clienteId IN (${clienteIds.join(',')})
    `);
    
    console.log('✅ BUG FIX 3 - Campo ativo em produtos:');
    console.log(`   Total: ${produtoCheck[0].total}`);
    console.log(`   Ativos: ${produtoCheck[0].ativos} (${produtoCheck[0].percentual}%)`);
    console.log(`   Esperado: 100%\n`);
    
    // Validação final
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    VALIDAÇÃO FINAL                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    const produtoOK = produtoCheck[0].percentual === 100;
    const qualityOK = qualityCheck[0].uniqueScores > 1; // Deve ter variação
    const concorrenteOK = concorrenteCheck[0].percentual === 100;
    const classificacaoOK = qualityCheck[0].comClassificacao === qualityCheck[0].total; // 100%
    
    console.log(`${concorrenteOK ? '✅' : '❌'} Bug Fix 1 (produto): ${concorrenteOK ? 'OK' : 'FALHOU'} - ${concorrenteCheck[0].percentual}%`);
    console.log(`${qualityOK ? '✅' : '❌'} Bug Fix 2a (quality score): ${qualityOK ? 'OK' : 'FALHOU'} - ${qualityCheck[0].uniqueScores} scores únicos`);
    console.log(`${classificacaoOK ? '✅' : '❌'} Bug Fix 2b (classificação): ${classificacaoOK ? 'OK' : 'FALHOU'} - ${qualityCheck[0].comClassificacao}/${qualityCheck[0].total}`);
    console.log(`${produtoOK ? '✅' : '❌'} Bug Fix 3 (ativo): ${produtoOK ? 'OK' : 'FALHOU'} - ${produtoCheck[0].percentual}%\n`);
    
    if (produtoOK && qualityOK && concorrenteOK && classificacaoOK) {
      console.log('🎉 TODAS AS CORREÇÕES VALIDADAS COM SUCESSO!\n');
      console.log('✅ Sistema 100% pronto para produção\n');
      console.log('📊 Próximo passo: Enriquecer os 728 clientes restantes\n');
    } else {
      console.log('⚠️ Algumas correções falharam. Revisar código.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro durante enriquecimento:', error.message);
    console.error(error.stack);
  }
  
  await conn.end();
  process.exit(0);
}

test().catch(console.error);
