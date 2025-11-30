/**
 * Teste simples para cleanEnrichment
 * Executar com: node test-clean-enrichment.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL?.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)?.[3] || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

console.log('🧪 Iniciando teste do cleanEnrichment...\n');

// Teste 1: Verificar se inArray funciona
console.log('📝 Teste 1: Verificar query com IN');
try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Buscar jobs com status 'running' ou 'paused'
  const { data, error } = await supabase
    .from('enrichment_jobs')
    .select('id, status')
    .eq('pesquisaId', 1)
    .in('status', ['running', 'paused']);

  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log(`✅ Query funcionou! Encontrados ${data.length} jobs`);
    console.log('Jobs:', data);
  }
} catch (error) {
  console.error('❌ Erro no teste 1:', error.message);
}

// Teste 2: Verificar se update com toISOString() funciona
console.log('\n📝 Teste 2: Verificar update com toISOString()');
try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Tentar atualizar (não vai fazer nada se não houver jobs)
  const { data, error } = await supabase
    .from('enrichment_jobs')
    .update({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    })
    .eq('pesquisaId', 1)
    .in('status', ['running', 'paused'])
    .select();

  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log(`✅ Update funcionou! Atualizados ${data?.length || 0} jobs`);
  }
} catch (error) {
  console.error('❌ Erro no teste 2:', error.message);
}

console.log('\n✅ Testes concluídos!');
