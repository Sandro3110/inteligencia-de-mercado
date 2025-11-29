import { enrichClienteOptimized } from './server/enrichmentOptimized.ts';
import { getDb } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function enriquecerPesquisa11() {
  console.log('================================================================================');
  console.log('🚀 ENRIQUECIMENTO DA PESQUISA "BASE 2 TESTES" (ID 11)');
  console.log('================================================================================\n');

  try {
    const db = await getDb();

    // 1. Buscar clientes da pesquisa 11
    console.log('📂 Buscando clientes da pesquisa 11...\n');

    const clientes = await db.execute(sql`
      SELECT id, nome, cnpj, cidade, uf, cnae
      FROM clientes
      WHERE "pesquisaId" = 11
      ORDER BY id
      LIMIT 50
    `);

    console.log(`✅ ${clientes.length} clientes encontrados\n`);

    // 2. Enriquecer cada cliente
    let sucessos = 0;
    let falhas = 0;

    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i];
      console.log(`\n[${i + 1}/${clientes.length}] Enriquecendo: ${cliente.nome}`);
      console.log(`   CNPJ: ${cliente.cnpj || 'N/A'}`);

      try {
        const resultado = await enrichClienteOptimized(cliente.id);

        console.log(`   ✅ Sucesso!`);
        console.log(`      Mercados: ${resultado.mercados?.length || 0}`);
        console.log(`      Produtos: ${resultado.produtos?.length || 0}`);
        console.log(`      Concorrentes: ${resultado.concorrentes?.length || 0}`);
        console.log(`      Leads: ${resultado.leads?.length || 0}`);

        sucessos++;
      } catch (error: any) {
        console.log(`   ❌ Falha: ${error.message}`);
        falhas++;
      }

      // Aguardar 2s entre clientes para não sobrecarregar a API
      if (i < clientes.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // 3. Resumo final
    console.log(
      '\n================================================================================'
    );
    console.log('📊 RESUMO FINAL');
    console.log('================================================================================');
    console.log(`Total de clientes: ${clientes.length}`);
    console.log(`Sucessos: ${sucessos}`);
    console.log(`Falhas: ${falhas}`);
    console.log(`Taxa de sucesso: ${((sucessos / clientes.length) * 100).toFixed(1)}%`);
    console.log(
      '================================================================================\n'
    );

    console.log('✅ ENRIQUECIMENTO CONCLUÍDO!');
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    throw error;
  }
}

enriquecerPesquisa11()
  .then(() => {
    console.log('\n✅ Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  });
