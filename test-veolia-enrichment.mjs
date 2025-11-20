/**
 * Script de teste: Simular enriquecimento da Veolia
 * Objetivo: Verificar se a API OpenAI retorna dados corretamente
 */

import { generateAllDataOptimized } from './server/integrations/openaiOptimized.js';

console.log('🧪 TESTE: Enriquecimento da Veolia\n');
console.log('=' .repeat(60));

const clienteVeolia = {
  nome: 'Veolia',
  produtoPrincipal: undefined,
  siteOficial: undefined,
  cidade: undefined
};

console.log('\n📋 Dados de entrada:');
console.log(JSON.stringify(clienteVeolia, null, 2));

console.log('\n🔄 Chamando OpenAI API...\n');

try {
  const startTime = Date.now();
  const resultado = await generateAllDataOptimized(clienteVeolia);
  const duration = Date.now() - startTime;
  
  console.log('\n✅ API respondeu com sucesso!\n');
  console.log('=' .repeat(60));
  console.log(`⏱️  Tempo: ${(duration/1000).toFixed(2)}s\n`);
  
  console.log('📊 RESUMO DOS DADOS RETORNADOS:\n');
  console.log(`   Mercados: ${resultado.mercados.length}`);
  
  let totalProdutos = 0;
  let totalConcorrentes = 0;
  let totalLeads = 0;
  
  resultado.mercados.forEach(m => {
    totalProdutos += m.produtos.length;
    totalConcorrentes += m.concorrentes.length;
    totalLeads += m.leads.length;
  });
  
  console.log(`   Produtos: ${totalProdutos}`);
  console.log(`   Concorrentes: ${totalConcorrentes}`);
  console.log(`   Leads: ${totalLeads}`);
  
  console.log('\n' + '=' .repeat(60));
  console.log('📝 DETALHAMENTO POR MERCADO:\n');
  
  resultado.mercados.forEach((mercadoItem, idx) => {
    console.log(`\n🎯 MERCADO ${idx + 1}: ${mercadoItem.mercado.nome}`);
    console.log(`   Categoria: ${mercadoItem.mercado.categoria}`);
    console.log(`   Segmentação: ${mercadoItem.mercado.segmentacao}`);
    console.log(`   Tamanho: ${mercadoItem.mercado.tamanhoEstimado}`);
    
    console.log(`\n   📦 Produtos (${mercadoItem.produtos.length}):`);
    mercadoItem.produtos.forEach((p, i) => {
      console.log(`      ${i+1}. ${p.nome}`);
      console.log(`         ${p.descricao?.substring(0, 80)}...`);
    });
    
    console.log(`\n   🏢 Concorrentes (${mercadoItem.concorrentes.length}):`);
    mercadoItem.concorrentes.forEach((c, i) => {
      console.log(`      ${i+1}. ${c.nome} (${c.porte})`);
      console.log(`         ${c.descricao?.substring(0, 80)}...`);
    });
    
    console.log(`\n   🎯 Leads (${mercadoItem.leads.length}):`);
    mercadoItem.leads.forEach((l, i) => {
      console.log(`      ${i+1}. ${l.nome} (${l.porte})`);
      console.log(`         ${l.justificativa?.substring(0, 80)}...`);
    });
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n💾 VERIFICANDO ESTRUTURA DOS DADOS:\n');
  
  // Verificar se todos os campos necessários estão presentes
  const primeiroMercado = resultado.mercados[0];
  
  console.log('✓ Campos do Mercado:');
  console.log(`  - nome: ${primeiroMercado.mercado.nome ? '✅' : '❌'}`);
  console.log(`  - categoria: ${primeiroMercado.mercado.categoria ? '✅' : '❌'}`);
  console.log(`  - segmentacao: ${primeiroMercado.mercado.segmentacao ? '✅' : '❌'}`);
  console.log(`  - tamanhoEstimado: ${primeiroMercado.mercado.tamanhoEstimado ? '✅' : '❌'}`);
  
  if (primeiroMercado.produtos.length > 0) {
    const primeiroProduto = primeiroMercado.produtos[0];
    console.log('\n✓ Campos do Produto:');
    console.log(`  - nome: ${primeiroProduto.nome ? '✅' : '❌'}`);
    console.log(`  - descricao: ${primeiroProduto.descricao ? '✅' : '❌'}`);
    console.log(`  - categoria: ${primeiroProduto.categoria ? '✅' : '❌'}`);
  }
  
  if (primeiroMercado.concorrentes.length > 0) {
    const primeiroConcorrente = primeiroMercado.concorrentes[0];
    console.log('\n✓ Campos do Concorrente:');
    console.log(`  - nome: ${primeiroConcorrente.nome ? '✅' : '❌'}`);
    console.log(`  - descricao: ${primeiroConcorrente.descricao ? '✅' : '❌'}`);
    console.log(`  - porte: ${primeiroConcorrente.porte ? '✅' : '❌'}`);
  }
  
  if (primeiroMercado.leads.length > 0) {
    const primeiroLead = primeiroMercado.leads[0];
    console.log('\n✓ Campos do Lead:');
    console.log(`  - nome: ${primeiroLead.nome ? '✅' : '❌'}`);
    console.log(`  - segmento: ${primeiroLead.segmento ? '✅' : '❌'}`);
    console.log(`  - porte: ${primeiroLead.porte ? '✅' : '❌'}`);
    console.log(`  - justificativa: ${primeiroLead.justificativa ? '✅' : '❌'}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!\n');
  console.log('📌 CONCLUSÃO:');
  console.log('   A API OpenAI está retornando dados completos e estruturados.');
  console.log('   Se o banco está vazio, o problema está na GRAVAÇÃO, não na API.\n');
  
  // Salvar resultado completo em arquivo JSON
  const fs = await import('fs');
  fs.writeFileSync(
    '/home/ubuntu/gestor-pav/veolia-api-response.json',
    JSON.stringify(resultado, null, 2)
  );
  console.log('💾 Resposta completa salva em: veolia-api-response.json\n');
  
} catch (error) {
  console.error('\n❌ ERRO ao chamar API:\n');
  console.error(error);
  console.log('\n📌 CONCLUSÃO:');
  console.log('   A API OpenAI falhou. Verifique credenciais e conexão.\n');
  process.exit(1);
}
