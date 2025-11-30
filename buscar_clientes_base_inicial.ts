import { db } from './server/db';
import { clientes, pesquisas } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function buscarClientesBaseInicial() {
  try {
    console.log('🔍 Buscando pesquisa "Base Inicial"...\n');

    // Buscar pesquisa "Base Inicial"
    const pesquisa = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.nome, 'Base Inicial'))
      .limit(1);

    if (pesquisa.length === 0) {
      console.log('❌ Pesquisa "Base Inicial" não encontrada!');
      return;
    }

    const pesquisaId = pesquisa[0].id;
    console.log(`✅ Pesquisa encontrada: ${pesquisa[0].nome} (ID: ${pesquisaId})\n`);

    // Buscar clientes da pesquisa
    console.log('🔍 Buscando clientes da pesquisa...\n');
    const clientesDaPesquisa = await db
      .select()
      .from(clientes)
      .where(eq(clientes.pesquisaId, pesquisaId))
      .limit(10); // Buscar 10 para ter opções

    console.log(`📊 Total de clientes encontrados: ${clientesDaPesquisa.length}\n`);
    console.log('='.repeat(80));

    // Exibir clientes
    clientesDaPesquisa.forEach((cliente, index) => {
      console.log(`\n${index + 1}. ${cliente.nome}`);
      console.log(`   ID: ${cliente.id}`);
      console.log(`   CNPJ: ${cliente.cnpj || 'Não informado'}`);
      console.log(`   Site: ${cliente.site || 'Não informado'}`);
      console.log(`   Cidade: ${cliente.cidade || 'Não informado'}`);
      console.log(`   UF: ${cliente.uf || 'Não informado'}`);
      console.log(`   Setor: ${cliente.setor || 'Não informado'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Busca concluída!');

    // Salvar resultado em JSON
    const resultado = {
      pesquisa: pesquisa[0],
      totalClientes: clientesDaPesquisa.length,
      clientes: clientesDaPesquisa.map((c) => ({
        id: c.id,
        nome: c.nome,
        cnpj: c.cnpj,
        site: c.site,
        cidade: c.cidade,
        uf: c.uf,
        setor: c.setor,
        descricao: c.descricao,
      })),
    };

    await Bun.write('clientes_base_inicial.json', JSON.stringify(resultado, null, 2));
    console.log('\n💾 Resultado salvo em: clientes_base_inicial.json');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

buscarClientesBaseInicial();
