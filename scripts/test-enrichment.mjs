#!/usr/bin/env node
/**
 * Script de Teste do Sistema de Enriquecimento V2
 * Executa os 3 testes progressivos
 */

import { enrichClienteCompleto } from '../server/enrichmentV2.ts';

const PROJECT_ID = 1; // Ajustar conforme necessário

console.log('🚀 Iniciando Testes de Enriquecimento V2\n');

// ============================================
// TESTE 1: 1 Cliente
// ============================================
async function teste1() {
  console.log('📋 TESTE 1: Enriquecer 1 Cliente Completo');
  console.log('==========================================\n');

  const clienteId = 1; // Ajustar conforme necessário
  const startTime = Date.now();

  try {
    const result = await enrichClienteCompleto(clienteId, PROJECT_ID);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Teste 1 concluído em ${duration}s`);
    console.log(`   Mercados: ${result.mercados}`);
    console.log(`   Produtos: ${result.produtos}`);
    console.log(`   Concorrentes: ${result.concorrentes}`);
    console.log(`   Leads: ${result.leads}`);
    console.log(`   Success: ${result.success}\n`);

    return result.success;
  } catch (error) {
    console.error(`❌ Teste 1 falhou:`, error);
    return false;
  }
}

// ============================================
// TESTE 2: 10 Clientes
// ============================================
async function teste2() {
  console.log('📋 TESTE 2: Enriquecer 10 Clientes');
  console.log('===================================\n');

  const clienteIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Ajustar conforme necessário
  const startTime = Date.now();
  const results = [];

  try {
    for (const clienteId of clienteIds) {
      console.log(`   Processando cliente ${clienteId}...`);
      const result = await enrichClienteCompleto(clienteId, PROJECT_ID);
      results.push({ clienteId, ...result });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const successCount = results.filter(r => r.success).length;

    console.log(`\n✅ Teste 2 concluído em ${duration}s`);
    console.log(`   Clientes processados: ${successCount}/${clienteIds.length}`);
    console.log(`   Total mercados: ${results.reduce((sum, r) => sum + r.mercados, 0)}`);
    console.log(`   Total produtos: ${results.reduce((sum, r) => sum + r.produtos, 0)}`);
    console.log(`   Total concorrentes: ${results.reduce((sum, r) => sum + r.concorrentes, 0)}`);
    console.log(`   Total leads: ${results.reduce((sum, r) => sum + r.leads, 0)}\n`);

    return successCount === clienteIds.length;
  } catch (error) {
    console.error(`❌ Teste 2 falhou:`, error);
    return false;
  }
}

// ============================================
// TESTE 3: 50 Clientes
// ============================================
async function teste3() {
  console.log('📋 TESTE 3: Enriquecer 50 Clientes');
  console.log('===================================\n');

  const clienteIds = Array.from({ length: 50 }, (_, i) => i + 1); // IDs 1-50
  const startTime = Date.now();
  const results = [];

  try {
    for (let i = 0; i < clienteIds.length; i++) {
      const clienteId = clienteIds[i];
      const progress = ((i + 1) / clienteIds.length * 100).toFixed(1);
      
      process.stdout.write(`\r   Progresso: ${progress}% (${i + 1}/${clienteIds.length})`);
      
      const result = await enrichClienteCompleto(clienteId, PROJECT_ID);
      results.push({ clienteId, ...result });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const durationMin = (duration / 60).toFixed(1);
    const successCount = results.filter(r => r.success).length;

    console.log(`\n\n✅ Teste 3 concluído em ${duration}s (~${durationMin} minutos)`);
    console.log(`   Clientes processados: ${successCount}/${clienteIds.length}`);
    console.log(`   Total mercados: ${results.reduce((sum, r) => sum + r.mercados, 0)}`);
    console.log(`   Total produtos: ${results.reduce((sum, r) => sum + r.produtos, 0)}`);
    console.log(`   Total concorrentes: ${results.reduce((sum, r) => sum + r.concorrentes, 0)}`);
    console.log(`   Total leads: ${results.reduce((sum, r) => sum + r.leads, 0)}\n`);

    return successCount === clienteIds.length;
  } catch (error) {
    console.error(`\n❌ Teste 3 falhou:`, error);
    return false;
  }
}

// ============================================
// EXECUTAR TESTES
// ============================================
async function main() {
  const args = process.argv.slice(2);
  const testNumber = args[0] ? parseInt(args[0]) : null;

  if (testNumber === 1) {
    const success = await teste1();
    process.exit(success ? 0 : 1);
  } else if (testNumber === 2) {
    const success = await teste2();
    process.exit(success ? 0 : 1);
  } else if (testNumber === 3) {
    const success = await teste3();
    process.exit(success ? 0 : 1);
  } else {
    // Executar todos os testes
    console.log('Executando todos os testes...\n');
    
    const teste1Success = await teste1();
    if (!teste1Success) {
      console.error('❌ Teste 1 falhou. Abortando.\n');
      process.exit(1);
    }

    const teste2Success = await teste2();
    if (!teste2Success) {
      console.error('❌ Teste 2 falhou. Abortando.\n');
      process.exit(1);
    }

    const teste3Success = await teste3();
    if (!teste3Success) {
      console.error('❌ Teste 3 falhou.\n');
      process.exit(1);
    }

    console.log('🎉 Todos os testes passaram com sucesso!\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
