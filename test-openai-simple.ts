/**
 * Teste simples da OpenAI para verificar coordenadas
 */

import { generateAllDataOptimized } from './server/integrations/openaiOptimized';

async function testarOpenAI() {
  console.log('🧪 Testando OpenAI com cliente de exemplo...\n');

  const clienteTeste = {
    nome: 'PRAXIS EMBALAGENS LTDA',
    cnpj: '19224389000187',
    produtoPrincipal: undefined,
    siteOficial: undefined,
    cidade: undefined,
  };

  try {
    console.log('📋 Cliente de teste:');
    console.log(JSON.stringify(clienteTeste, null, 2));
    console.log('\n🔄 Chamando OpenAI...\n');

    const resultado = await generateAllDataOptimized(clienteTeste);

    console.log('✅ RESPOSTA DA OPENAI:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CLIENTE ENRIQUECIDO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(resultado.clienteEnriquecido, null, 2));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗺️ COORDENADAS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Latitude: ${resultado.clienteEnriquecido.latitude || 'NÃO RETORNADO'}`);
    console.log(`   Longitude: ${resultado.clienteEnriquecido.longitude || 'NÃO RETORNADO'}`);
    console.log(`   Cidade: ${resultado.clienteEnriquecido.cidade || 'NÃO RETORNADO'}`);
    console.log(`   UF: ${resultado.clienteEnriquecido.uf || 'NÃO RETORNADO'}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 RESUMO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Mercados: ${resultado.mercados.length}`);

    resultado.mercados.forEach((m, i) => {
      console.log(`\n   Mercado ${i + 1}: ${m.mercado.nome}`);
      console.log(`   - Produtos: ${m.produtos.length}`);
      console.log(`   - Concorrentes: ${m.concorrentes.length}`);
      console.log(`   - Leads: ${m.leads.length}`);

      // Verificar coordenadas dos concorrentes
      const concorrentesComCoord = m.concorrentes.filter((c) => c.latitude && c.longitude);
      console.log(
        `   - Concorrentes com coordenadas: ${concorrentesComCoord.length}/${m.concorrentes.length}`
      );

      // Verificar coordenadas dos leads
      const leadsComCoord = m.leads.filter((l) => l.latitude && l.longitude);
      console.log(`   - Leads com coordenadas: ${leadsComCoord.length}/${m.leads.length}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TESTE CONCLUÍDO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('\n❌ ERRO:', error);
  }
}

testarOpenAI();
