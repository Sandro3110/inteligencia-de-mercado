import { enrichClienteCompleto } from './server/enrichmentV2.ts';
import { getDb } from './server/db.ts';
import { clientes, mercadosUnicos, clientesMercados, produtos, concorrentes, leads } from './drizzle/schema.ts';
import { eq, sql } from 'drizzle-orm';

const PROJECT_ID = 1;

async function main() {
  console.log('🚀 Teste de Enriquecimento - 1 Cliente Aleatório\n');
  
  // Buscar cliente aleatório
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }
  
  const [cliente] = await db.select()
    .from(clientes)
    .where(eq(clientes.projectId, PROJECT_ID))
    .orderBy(sql`RAND()`)
    .limit(1);
  
  if (!cliente) {
    console.error('❌ Nenhum cliente encontrado');
    process.exit(1);
  }
  
  console.log('📋 CLIENTE SELECIONADO:');
  console.log(`   ID: ${cliente.id}`);
  console.log(`   Nome: ${cliente.nome}`);
  console.log(`   CNPJ: ${cliente.cnpj || 'não informado'}`);
  console.log(`   Produto: ${cliente.produtoPrincipal || 'não informado'}\n`);
  
  // Executar enriquecimento
  console.log('⏱️  Iniciando enriquecimento...\n');
  const startTime = Date.now();
  
  const result = await enrichClienteCompleto(cliente.id, PROJECT_ID);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('✅ ENRIQUECIMENTO CONCLUÍDO!\n');
  console.log(`⏱️  Tempo total: ${duration}s`);
  console.log(`✓  Success: ${result.success}`);
  console.log(`✓  Mercados: ${result.mercados}`);
  console.log(`✓  Produtos: ${result.produtos}`);
  console.log(`✓  Concorrentes: ${result.concorrentes}`);
  console.log(`✓  Leads: ${result.leads}\n`);
  
  // Buscar dados enriquecidos
  const [clienteEnriquecido] = await db.select().from(clientes).where(eq(clientes.id, cliente.id)).limit(1);
  
  const mercadosResult = await db.select()
    .from(mercadosUnicos)
    .innerJoin(clientesMercados, eq(clientesMercados.mercadoId, mercadosUnicos.id))
    .where(eq(clientesMercados.clienteId, cliente.id));
  
  const produtosResult = await db.select().from(produtos).where(eq(produtos.clienteId, cliente.id));
  const concorrentesResult = await db.select().from(concorrentes).where(eq(concorrentes.projectId, PROJECT_ID)).limit(10);
  const leadsResult = await db.select().from(leads).where(eq(leads.projectId, PROJECT_ID)).limit(10);
  
  console.log('📊 DADOS ENRIQUECIDOS:\n');
  console.log('👤 CLIENTE:');
  console.log(`   Email: ${clienteEnriquecido.email || 'N/A'}`);
  console.log(`   Telefone: ${clienteEnriquecido.telefone || 'N/A'}`);
  console.log(`   Site: ${clienteEnriquecido.siteOficial || 'N/A'}`);
  console.log(`   Cidade/UF: ${clienteEnriquecido.cidade || '?'}/${clienteEnriquecido.uf || '?'}`);
  console.log(`   Região: ${clienteEnriquecido.regiao || 'N/A'}`);
  console.log(`   Porte: ${clienteEnriquecido.porte || 'N/A'}`);
  console.log(`   Faturamento: ${clienteEnriquecido.faturamentoDeclarado || 'N/A'}`);
  console.log(`   Quality Score: ${clienteEnriquecido.qualidadeScore || 0}/100\n`);
  
  console.log('🏢 MERCADOS:');
  mercadosResult.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.mercados_unicos.nome}`);
  });
  
  console.log('\n📦 PRODUTOS:');
  produtosResult.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.nome} (${p.categoria || 'N/A'})`);
  });
  
  console.log('\n🎯 CONCORRENTES (amostra):');
  concorrentesResult.slice(0, 5).forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.nome} - ${c.cidade || '?'}/${c.uf || '?'}`);
  });
  
  console.log('\n🔥 LEADS (amostra):');
  leadsResult.slice(0, 5).forEach((l, i) => {
    console.log(`   ${i + 1}. ${l.nome} - ${l.tipo || 'N/A'}`);
  });
  
  console.log('\n💰 ESTIMATIVA DE CUSTO:');
  console.log(`   Tokens estimados: ~8.000 tokens`);
  console.log(`   Custo estimado: ~$0,0012 USD\n`);
  
  console.log('🎉 Teste concluído!\n');
}

main().catch(error => {
  console.error('\n❌ Erro:', error);
  process.exit(1);
});
