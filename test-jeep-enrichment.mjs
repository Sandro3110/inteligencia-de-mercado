/**
 * Script de teste para API de enriquecimento
 * Cliente: Jeep do Brasil
 */

const API_BASE = 'http://localhost:3000';

async function callTRPC(procedure, input) {
  const response = await fetch(`${API_BASE}/api/trpc/${procedure}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input !== undefined ? { '0': { json: input } } : {})
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`tRPC error on ${procedure}: ${error}`);
  }

  const data = await response.json();
  return data[0]?.result?.data;
}

async function testEnrichment() {
  console.log('🚀 Iniciando teste de enriquecimento - Jeep do Brasil\n');

  try {
    // 1. Criar projeto de teste
    console.log('📋 Criando projeto de teste...');
    const project = await callTRPC('projects.create', {
      nome: 'Teste Jeep - ' + new Date().toLocaleString('pt-BR'),
      descricao: 'Teste de enriquecimento com cliente Jeep do Brasil'
    });

    const projectId = project.id;
    console.log(`✅ Projeto criado: ID ${projectId}\n`);

    // 2. Preparar dados do cliente Jeep
    const jeepData = {
      projectId,
      clientes: [
        {
          nome: 'Jeep do Brasil',
          cnpj: '04601397000165',
          site: 'https://www.jeep.com.br',
          segmentacaoB2bB2c: 'B2C',
          porte: 'Grande',
        }
      ]
    };

    console.log('🎯 Dados do cliente preparados:');
    console.log(JSON.stringify(jeepData.clientes[0], null, 2));
    console.log('');

    // 3. Executar enriquecimento
    console.log('🔄 Executando enriquecimento...');
    console.log('⏳ Este processo pode levar alguns minutos...\n');
    
    const enrichmentResult = await callTRPC('enrichment.execute', jeepData);
    const jobId = enrichmentResult.jobId;
    console.log(`✅ Enriquecimento iniciado: Job ID ${jobId}`);

    // 4. Aguardar conclusão
    console.log('⏳ Aguardando conclusão (45 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 45000));

    // 5. Buscar resultados
    console.log('\n📊 Buscando resultados...\n');

    // Buscar mercados
    const mercados = await callTRPC('mercados.byProject', { projectId });
    console.log(`🎯 Mercados identificados: ${mercados.length}`);
    mercados.slice(0, 5).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.nome} (${m.segmentacao}) - ${m.quantidadeClientes || 0} clientes`);
    });
    console.log('');

    // Buscar concorrentes
    const concorrentes = await callTRPC('concorrentes.byProject', { projectId });
    console.log(`🏢 Concorrentes identificados: ${concorrentes.length}`);
    concorrentes.slice(0, 5).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.nome} (${c.porte || 'N/A'})`);
    });
    console.log('');

    // Buscar leads
    const leads = await callTRPC('leads.byProject', { projectId });
    console.log(`📈 Leads gerados: ${leads.length}`);
    
    // Agrupar por estágio
    const byStage = leads.reduce((acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {});

    console.log('  Por estágio:');
    Object.entries(byStage).forEach(([stage, count]) => {
      console.log(`    - ${stage}: ${count}`);
    });
    console.log('');

    // Top 5 leads por qualidade
    const topLeads = leads
      .filter(l => l.qualidadeScore)
      .sort((a, b) => b.qualidadeScore - a.qualidadeScore)
      .slice(0, 5);

    console.log('🌟 Top 5 Leads por Qualidade:');
    topLeads.forEach((lead, i) => {
      console.log(`  ${i + 1}. ${lead.nome} - Score: ${lead.qualidadeScore}/100`);
      console.log(`     Tipo: ${lead.tipo || 'N/A'} | Porte: ${lead.porte || 'N/A'} | Região: ${lead.regiao || 'N/A'}`);
    });
    console.log('');

    // Resumo final
    console.log('📋 RESUMO DO TESTE:');
    console.log('═'.repeat(60));
    console.log(`Projeto ID: ${projectId}`);
    console.log(`Cliente: Jeep do Brasil`);
    console.log(`Mercados identificados: ${mercados.length}`);
    console.log(`Concorrentes encontrados: ${concorrentes.length}`);
    console.log(`Leads gerados: ${leads.length}`);
    
    const avgScore = leads.length > 0 
      ? (leads.reduce((sum, l) => sum + (l.qualidadeScore || 0), 0) / leads.length).toFixed(1)
      : 0;
    console.log(`Score médio de qualidade: ${avgScore}/100`);
    
    const highQualityLeads = leads.filter(l => (l.qualidadeScore || 0) >= 80).length;
    console.log(`Leads de alta qualidade (≥80): ${highQualityLeads}`);
    console.log('═'.repeat(60));
    console.log('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    throw error;
  }
}

// Executar teste
testEnrichment().catch(error => {
  process.exit(1);
});
