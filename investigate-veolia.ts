/**
 * INVESTIGAÇÃO COMPLETA DO FLUXO DE ENRIQUECIMENTO DA VEOLIA
 * 
 * Este script rastreia todo o caminho dos dados desde a criação
 * do cliente até a exibição na tela, identificando pontos de falha.
 */

import { getDb } from './server/db';
import { clientes, pesquisas, mercadosUnicos, produtos, concorrentes, leads, clientesMercados } from './drizzle/schema';
import { eq, and } from 'drizzle-orm';

console.log('🔍 INVESTIGAÇÃO COMPLETA DO FLUXO VEOLIA\n');
console.log('='.repeat(80));

(async () => {
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }

  // ========== PASSO 1: ENCONTRAR CLIENTE VEOLIA ==========
  console.log('\n📋 PASSO 1: Buscar cliente Veolia no banco\n');
  
  const clientesVeolia = await db
    .select()
    .from(clientes)
    .where(eq(clientes.nome, 'Veolia'));
  
  if (clientesVeolia.length === 0) {
    console.error('❌ FALHA: Cliente Veolia não encontrado no banco!');
    process.exit(1);
  }
  
  console.log(`✅ Encontrado ${clientesVeolia.length} cliente(s) Veolia:\n`);
  
  clientesVeolia.forEach((cliente, idx) => {
    console.log(`   Cliente ${idx + 1}:`);
    console.log(`   - ID: ${cliente.id}`);
    console.log(`   - Nome: ${cliente.nome}`);
    console.log(`   - PesquisaId: ${cliente.pesquisaId || '❌ NULL'}`);
    console.log(`   - ProjectId: ${cliente.projectId}`);
    console.log(`   - CNPJ: ${cliente.cnpj || 'Não informado'}`);
    console.log(`   - Produto Principal: ${cliente.produtoPrincipal || 'Não informado'}`);
    console.log(`   - Cidade: ${cliente.cidade || 'Não informado'}`);
    console.log(`   - Criado em: ${cliente.createdAt}\n`);
  });

  // Usar o primeiro cliente para investigação
  const clienteVeolia = clientesVeolia[0];

  // ========== PASSO 2: VERIFICAR PESQUISA ASSOCIADA ==========
  console.log('='.repeat(80));
  console.log('\n📋 PASSO 2: Verificar pesquisa associada ao cliente\n');
  
  if (!clienteVeolia.pesquisaId) {
    console.error('❌ FALHA CRÍTICA: Cliente Veolia NÃO tem pesquisaId associada!');
    console.error('   Isso significa que o cliente foi criado SEM vínculo com uma pesquisa.');
    console.error('   Consequência: Os dados enriquecidos não aparecem em nenhuma pesquisa!\n');
  } else {
    const [pesquisa] = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.id, clienteVeolia.pesquisaId))
      .limit(1);
    
    if (!pesquisa) {
      console.error(`❌ FALHA: Pesquisa ID ${clienteVeolia.pesquisaId} não existe no banco!`);
    } else {
      console.log('✅ Pesquisa encontrada:');
      console.log(`   - ID: ${pesquisa.id}`);
      console.log(`   - Nome: ${pesquisa.nome}`);
      console.log(`   - Status: ${pesquisa.status}`);
      console.log(`   - ProjectId: ${pesquisa.projectId}`);
      console.log(`   - Criada em: ${pesquisa.createdAt}\n`);
    }
  }

  // ========== PASSO 3: VERIFICAR MERCADOS ASSOCIADOS ==========
  console.log('='.repeat(80));
  console.log('\n📋 PASSO 3: Verificar mercados associados ao cliente\n');
  
  // Buscar através da tabela de associação
  const associacoes = await db
    .select()
    .from(clientesMercados)
    .where(eq(clientesMercados.clienteId, clienteVeolia.id));
  
  console.log(`   Associações cliente-mercado: ${associacoes.length}\n`);
  
  if (associacoes.length === 0) {
    console.error('❌ FALHA: Cliente Veolia NÃO está associado a nenhum mercado!');
    console.error('   Isso significa que o enriquecimento não criou as associações.\n');
  } else {
    console.log('✅ Associações encontradas:');
    
    for (const assoc of associacoes) {
      const [mercado] = await db
        .select()
        .from(mercadosUnicos)
        .where(eq(mercadosUnicos.id, assoc.mercadoId))
        .limit(1);
      
      if (mercado) {
        console.log(`   - Mercado ID ${mercado.id}: ${mercado.nome}`);
        console.log(`     PesquisaId: ${mercado.pesquisaId || '❌ NULL'}`);
        console.log(`     ProjectId: ${mercado.projectId}`);
      }
    }
    console.log('');
  }

  // ========== PASSO 4: VERIFICAR PRODUTOS CRIADOS ==========
  console.log('='.repeat(80));
  console.log('\n📋 PASSO 4: Verificar produtos criados para o cliente\n');
  
  const produtosCliente = await db
    .select()
    .from(produtos)
    .where(eq(produtos.clienteId, clienteVeolia.id));
  
  console.log(`   Total de produtos: ${produtosCliente.length}\n`);
  
  if (produtosCliente.length === 0) {
    console.error('❌ FALHA: Nenhum produto foi criado para a Veolia!');
    console.error('   Isso indica que o enriquecimento não foi executado ou falhou.\n');
  } else {
    console.log('✅ Produtos encontrados:');
    produtosCliente.slice(0, 3).forEach(p => {
      console.log(`   - ${p.nome}`);
      console.log(`     PesquisaId: ${p.pesquisaId || '❌ NULL'}`);
      console.log(`     MercadoId: ${p.mercadoId}`);
      console.log(`     ProjectId: ${p.projectId}`);
    });
    if (produtosCliente.length > 3) {
      console.log(`   ... e mais ${produtosCliente.length - 3} produtos\n`);
    }
  }

  // ========== PASSO 5: VERIFICAR CONCORRENTES CRIADOS ==========
  console.log('='.repeat(80));
  console.log('\n📋 PASSO 5: Verificar concorrentes criados\n');
  
  // Buscar concorrentes dos mercados associados
  let totalConcorrentes = 0;
  let concorrentesSemPesquisaId = 0;
  
  for (const assoc of associacoes) {
    const concorrentesMercado = await db
      .select()
      .from(concorrentes)
      .where(eq(concorrentes.mercadoId, assoc.mercadoId));
    
    totalConcorrentes += concorrentesMercado.length;
    concorrentesSemPesquisaId += concorrentesMercado.filter(c => !c.pesquisaId).length;
  }
  
  console.log(`   Total de concorrentes: ${totalConcorrentes}`);
  console.log(`   Concorrentes SEM pesquisaId: ${concorrentesSemPesquisaId}\n`);
  
  if (totalConcorrentes === 0) {
    console.error('❌ FALHA: Nenhum concorrente foi criado!\n');
  } else if (concorrentesSemPesquisaId > 0) {
    console.warn(`⚠️  AVISO: ${concorrentesSemPesquisaId} concorrentes sem pesquisaId!`);
    console.warn('   Eles não aparecerão nas buscas filtradas por pesquisa.\n');
  } else {
    console.log('✅ Todos os concorrentes têm pesquisaId associada.\n');
  }

  // ========== PASSO 6: VERIFICAR LEADS CRIADOS ==========
  console.log('='.repeat(80));
  console.log('\n📋 PASSO 6: Verificar leads criados\n');
  
  let totalLeads = 0;
  let leadsSemPesquisaId = 0;
  
  for (const assoc of associacoes) {
    const leadsMercado = await db
      .select()
      .from(leads)
      .where(eq(leads.mercadoId, assoc.mercadoId));
    
    totalLeads += leadsMercado.length;
    leadsSemPesquisaId += leadsMercado.filter(l => !l.pesquisaId).length;
  }
  
  console.log(`   Total de leads: ${totalLeads}`);
  console.log(`   Leads SEM pesquisaId: ${leadsSemPesquisaId}\n`);
  
  if (totalLeads === 0) {
    console.error('❌ FALHA: Nenhum lead foi criado!\n');
  } else if (leadsSemPesquisaId > 0) {
    console.warn(`⚠️  AVISO: ${leadsSemPesquisaId} leads sem pesquisaId!`);
    console.warn('   Eles não aparecerão nas buscas filtradas por pesquisa.\n');
  } else {
    console.log('✅ Todos os leads têm pesquisaId associada.\n');
  }

  // ========== PASSO 7: SIMULAR QUERY DO FRONTEND ==========
  console.log('='.repeat(80));
  console.log('\n📋 PASSO 7: Simular query do frontend (como a tela busca dados)\n');
  
  if (!clienteVeolia.pesquisaId) {
    console.error('❌ IMPOSSÍVEL SIMULAR: Cliente não tem pesquisaId!');
    console.error('   A tela provavelmente busca dados por pesquisaId.');
    console.error('   Como o cliente não tem pesquisaId, NADA aparece na tela!\n');
  } else {
    console.log(`   Simulando busca por pesquisaId = ${clienteVeolia.pesquisaId}...\n`);
    
    // Buscar mercados da pesquisa
    const mercadosPesquisa = await db
      .select()
      .from(mercadosUnicos)
      .where(eq(mercadosUnicos.pesquisaId, clienteVeolia.pesquisaId));
    
    console.log(`   Mercados encontrados: ${mercadosPesquisa.length}`);
    
    // Buscar produtos da pesquisa
    const produtosPesquisa = await db
      .select()
      .from(produtos)
      .where(eq(produtos.pesquisaId, clienteVeolia.pesquisaId));
    
    console.log(`   Produtos encontrados: ${produtosPesquisa.length}`);
    
    // Buscar concorrentes da pesquisa
    const concorrentesPesquisa = await db
      .select()
      .from(concorrentes)
      .where(eq(concorrentes.pesquisaId, clienteVeolia.pesquisaId));
    
    console.log(`   Concorrentes encontrados: ${concorrentesPesquisa.length}`);
    
    // Buscar leads da pesquisa
    const leadsPesquisa = await db
      .select()
      .from(leads)
      .where(eq(leads.pesquisaId, clienteVeolia.pesquisaId));
    
    console.log(`   Leads encontrados: ${leadsPesquisa.length}\n`);
    
    if (mercadosPesquisa.length === 0 && produtosPesquisa.length === 0 && 
        concorrentesPesquisa.length === 0 && leadsPesquisa.length === 0) {
      console.error('❌ FALHA CRÍTICA: Nenhum dado encontrado para esta pesquisa!');
      console.error('   Mesmo com pesquisaId associada, os dados não estão vinculados.\n');
    } else {
      console.log('✅ Dados encontrados! A tela deveria mostrar esses dados.\n');
    }
  }

  // ========== RESUMO FINAL ==========
  console.log('='.repeat(80));
  console.log('\n📊 RESUMO DA INVESTIGAÇÃO\n');
  
  const problemas: string[] = [];
  
  if (!clienteVeolia.pesquisaId) {
    problemas.push('❌ CRÍTICO: Cliente Veolia sem pesquisaId');
  }
  
  if (associacoes.length === 0) {
    problemas.push('❌ Cliente não associado a mercados');
  }
  
  if (produtosCliente.length === 0) {
    problemas.push('❌ Nenhum produto criado');
  }
  
  if (totalConcorrentes === 0) {
    problemas.push('❌ Nenhum concorrente criado');
  }
  
  if (totalLeads === 0) {
    problemas.push('❌ Nenhum lead criado');
  }
  
  if (concorrentesSemPesquisaId > 0) {
    problemas.push(`⚠️  ${concorrentesSemPesquisaId} concorrentes sem pesquisaId`);
  }
  
  if (leadsSemPesquisaId > 0) {
    problemas.push(`⚠️  ${leadsSemPesquisaId} leads sem pesquisaId`);
  }
  
  if (problemas.length === 0) {
    console.log('✅ NENHUM PROBLEMA ENCONTRADO!');
    console.log('   Os dados estão corretos no banco.');
    console.log('   O problema pode estar no frontend (cache, filtros, etc.)\n');
  } else {
    console.log('🔴 PROBLEMAS ENCONTRADOS:\n');
    problemas.forEach(p => console.log(`   ${p}`));
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log('\n🎯 PRÓXIMOS PASSOS:\n');
  
  if (!clienteVeolia.pesquisaId) {
    console.log('1. CORRIGIR: Associar cliente Veolia a uma pesquisa existente');
    console.log('2. CORRIGIR: Atualizar pesquisaId em todos os dados relacionados');
    console.log('3. PREVENIR: Garantir que novos clientes sempre tenham pesquisaId\n');
  } else if (problemas.length > 0) {
    console.log('1. Verificar logs do processo de enriquecimento');
    console.log('2. Re-executar enriquecimento se necessário');
    console.log('3. Corrigir pesquisaId nos dados afetados\n');
  } else {
    console.log('1. Verificar queries do frontend');
    console.log('2. Limpar cache do navegador');
    console.log('3. Verificar filtros aplicados na tela\n');
  }
  
  process.exit(0);
})();
