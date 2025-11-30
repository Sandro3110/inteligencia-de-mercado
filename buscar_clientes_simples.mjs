import { getServerlessDb } from './server/lib/drizzle-serverless.ts';
import { clientes, pesquisas } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = getServerlessDb();

console.log('🔍 Buscando pesquisa "Base Inicial"...\n');

// Buscar pesquisa
const pesquisa = await db
  .select()
  .from(pesquisas)
  .where(eq(pesquisas.nome, 'Base Inicial'))
  .limit(1);

if (pesquisa.length === 0) {
  console.log('❌ Pesquisa "Base Inicial" não encontrada!');
  process.exit(1);
}

const pesquisaId = pesquisa[0].id;
console.log(`✅ Pesquisa encontrada: ${pesquisa[0].nome} (ID: ${pesquisaId})\n`);

// Buscar clientes
console.log('🔍 Buscando clientes...\n');
const clientesDaPesquisa = await db
  .select()
  .from(clientes)
  .where(eq(clientes.pesquisaId, pesquisaId))
  .limit(10);

console.log(`📊 Total: ${clientesDaPesquisa.length} clientes\n`);
console.log('='.repeat(80));

clientesDaPesquisa.forEach((cliente, index) => {
  console.log(`\n${index + 1}. ${cliente.nome}`);
  console.log(`   Cidade: ${cliente.cidade || 'N/A'}, UF: ${cliente.uf || 'N/A'}`);
  console.log(`   Setor: ${cliente.setor || 'N/A'}`);
});

console.log('\n' + '='.repeat(80));

// Salvar JSON
const resultado = {
  pesquisa: pesquisa[0],
  totalClientes: clientesDaPesquisa.length,
  clientes: clientesDaPesquisa.slice(0, 5).map(c => ({
    id: c.id,
    nome: c.nome,
    cnpj: c.cnpj,
    site: c.site,
    cidade: c.cidade,
    uf: c.uf,
    setor: c.setor
  }))
};

await import('fs').then(fs => 
  fs.promises.writeFile('clientes_base_inicial.json', JSON.stringify(resultado, null, 2))
);

console.log('\n💾 5 clientes salvos em: clientes_base_inicial.json');
process.exit(0);
