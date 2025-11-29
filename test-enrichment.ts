/**
 * Script de teste para enriquecer 10 clientes e verificar coordenadas
 */

import { enrichClienteOptimized } from './server/enrichmentOptimized';

const clientesParaTestar = [
  2205, // PRAXIS EMBALAGENS LTDA
  2405, // ZANDEI IND DE PLASTICOS LTDA
  2406, // ZANQUETA COM DE MATERIAIS PARA CONSTRUCAO LTDA
  2407, // ZARELLI SUPERMERCADOS LTDA
  2408, // ZENAPLAST IND COM DE ARTEFATOS DE PLASTICO LTDA
  2409, // ZEVIPLAST IND E COM DE PLASTICOS EIRELI
  2410, // ZIONI IONILY CEOTTO PILAR PAPEIS EIRELI
  301633, // AGRO INDUSTRIAL ITUBERA LTDA
  301635, // AGRONILSEN COMERCIO DE PRODUTOS AGRICOLAS LTDA
  301636, // AGROPECUARIA FAZENDA ALIANCA LTDA
];

async function testarEnriquecimento() {
  console.log('🧪 Iniciando teste de enriquecimento com 10 clientes...\n');

  for (const clienteId of clientesParaTestar) {
    try {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🔄 Enriquecendo cliente ID: ${clienteId}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      const result = await enrichClienteOptimized(clienteId, 1);

      console.log(`\n✅ Resultado:`);
      console.log(`   - Success: ${result.success}`);
      console.log(`   - Mercados: ${result.mercadosCreated}`);
      console.log(`   - Produtos: ${result.produtosCreated}`);
      console.log(`   - Concorrentes: ${result.concorrentesCreated}`);
      console.log(`   - Leads: ${result.leadsCreated}`);
      console.log(`   - Duração: ${result.duration}ms`);

      if (result.error) {
        console.log(`   ❌ Erro: ${result.error}`);
      }

      // Aguardar 2 segundos entre cada cliente para não sobrecarregar API
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`\n❌ Erro ao enriquecer cliente ${clienteId}:`, error);
    }
  }

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Teste concluído!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

testarEnriquecimento().catch(console.error);
