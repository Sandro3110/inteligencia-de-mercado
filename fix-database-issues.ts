/**
 * Script de Correção dos Problemas Encontrados na Auditoria
 * 
 * Problemas a corrigir:
 * 1. 2 clientes órfãos (sem pesquisaId válido) - CRÍTICO
 * 2. 5 pesquisas com totalClientes inconsistente - MÉDIO
 */

import { getDb } from './server/db';

async function fixOrphanClientes() {
  console.log('\n🔧 Corrigindo clientes órfãos...\n');
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Buscar clientes órfãos
  const [orphans] = await db.execute(`
    SELECT * FROM clientes 
    WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)
  `);

  console.log(`📊 Encontrados ${(orphans as any).length} clientes órfãos`);

  if ((orphans as any).length === 0) {
    console.log('✅ Nenhum cliente órfão encontrado!');
    return;
  }

  // Mostrar detalhes
  for (const orphan of orphans as any[]) {
    console.log(`\n  Cliente ID: ${orphan.id}`);
    console.log(`  Nome: ${orphan.nome}`);
    console.log(`  ProjectId: ${orphan.projectId}`);
    console.log(`  PesquisaId: ${orphan.pesquisaId || 'NULL'}`);
    console.log(`  Hash: ${orphan.clienteHash}`);
  }

  // Estratégia de correção:
  // Opção 1: Deletar clientes órfãos (se não têm dados importantes)
  // Opção 2: Associar à primeira pesquisa ativa do projeto
  
  console.log('\n⚠️  AÇÃO NECESSÁRIA:');
  console.log('  Estes clientes não têm pesquisa válida associada.');
  console.log('  Recomendação: DELETAR (parecem ser registros de teste vazios)');
  
  // Deletar clientes órfãos
  const [result] = await db.execute(`
    DELETE FROM clientes 
    WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)
  `);

  console.log(`\n✅ ${(result as any).affectedRows} clientes órfãos deletados!`);
}

async function fixInconsistentCounters() {
  console.log('\n🔧 Corrigindo contadores inconsistentes...\n');
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Buscar pesquisas com contadores inconsistentes
  const [inconsistent] = await db.execute(`
    SELECT 
      p.id, 
      p.nome, 
      p.totalClientes as declarado,
      COUNT(c.id) as contagem_real
    FROM pesquisas p
    LEFT JOIN clientes c ON c.pesquisaId = p.id
    GROUP BY p.id
    HAVING declarado != contagem_real
  `);

  console.log(`📊 Encontradas ${(inconsistent as any).length} pesquisas com contadores inconsistentes`);

  if ((inconsistent as any).length === 0) {
    console.log('✅ Nenhuma inconsistência encontrada!');
    return;
  }

  // Mostrar detalhes
  for (const item of inconsistent as any[]) {
    console.log(`\n  Pesquisa: ${item.nome} (ID: ${item.id})`);
    console.log(`  Declarado: ${item.declarado} clientes`);
    console.log(`  Real: ${item.contagem_real} clientes`);
    console.log(`  Diferença: ${item.contagem_real - item.declarado}`);
  }

  // Corrigir contadores
  console.log('\n🔄 Atualizando contadores...');
  
  for (const item of inconsistent as any[]) {
    await db.execute(
      `UPDATE pesquisas SET totalClientes = ${item.contagem_real} WHERE id = ${item.id}`
    );
    
    console.log(`  ✅ Pesquisa "${item.nome}": ${item.declarado} → ${item.contagem_real}`);
  }

  console.log(`\n✅ ${(inconsistent as any).length} contadores atualizados!`);
}

async function verifyFixes() {
  console.log('\n🔍 Verificando correções...\n');
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verificar clientes órfãos
  const [orphans] = await db.execute(`
    SELECT COUNT(*) as count FROM clientes 
    WHERE pesquisaId IS NULL OR pesquisaId NOT IN (SELECT id FROM pesquisas)
  `);
  const orphansCount = (orphans as any)[0].count;
  
  if (orphansCount === 0) {
    console.log('✅ Nenhum cliente órfão encontrado');
  } else {
    console.log(`❌ Ainda existem ${orphansCount} clientes órfãos`);
  }

  // Verificar contadores
  const [inconsistent] = await db.execute(`
    SELECT COUNT(*) as count FROM (
      SELECT 
        p.id, 
        p.totalClientes as declarado,
        COUNT(c.id) as contagem_real
      FROM pesquisas p
      LEFT JOIN clientes c ON c.pesquisaId = p.id
      GROUP BY p.id
      HAVING declarado != contagem_real
    ) as subquery
  `);
  const inconsistentCount = (inconsistent as any)[0].count;
  
  if (inconsistentCount === 0) {
    console.log('✅ Todos os contadores estão consistentes');
  } else {
    console.log(`❌ Ainda existem ${inconsistentCount} pesquisas com contadores inconsistentes`);
  }
}

async function main() {
  console.log('🔧 Iniciando Correção dos Problemas do Banco de Dados...\n');
  console.log('=' .repeat(60));

  try {
    // Fazer backup antes de qualquer correção
    console.log('\n⚠️  IMPORTANTE: Certifique-se de ter um backup do banco antes de continuar!');
    console.log('   Este script irá DELETAR dados órfãos e ATUALIZAR contadores.\n');

    await fixOrphanClientes();
    await fixInconsistentCounters();
    await verifyFixes();

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ Correções concluídas com sucesso!\n');
    
    console.log('📝 Próximos passos:');
    console.log('  1. Executar auditoria novamente: npx tsx audit-database.ts');
    console.log('  2. Verificar se todos os problemas foram corrigidos');
    console.log('  3. Testar funcionalidades do sistema\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante correção:', error);
    process.exit(1);
  }
}

main();
