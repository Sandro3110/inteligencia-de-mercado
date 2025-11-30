import { getDb } from './server/db';
import { pesquisas } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function fixPesquisa() {
  const db = await getDb();
  if (!db) {
    console.error('❌ Falha ao conectar ao banco');
    return;
  }

  console.log('Verificando pesquisas...');

  const allPesquisas = await db.select().from(pesquisas);
  console.log(`\nTotal de pesquisas: ${allPesquisas.length}`);

  for (const p of allPesquisas) {
    console.log(`\nPesquisa ID ${p.id}:`);
    console.log(`  Nome: ${p.nome}`);
    console.log(`  Ativo: ${p.ativo}`);
    console.log(`  ProjectId: ${p.projectId}`);
    console.log(`  TotalClientes: ${p.totalClientes}`);
    console.log(`  ClientesEnriquecidos: ${p.clientesEnriquecidos}`);
  }

  // Ativar todas as pesquisas inativas
  const inativas = allPesquisas.filter((p) => p.ativo !== 1);
  if (inativas.length > 0) {
    console.log(`\n🔧 Ativando ${inativas.length} pesquisa(s)...`);
    for (const p of inativas) {
      await db.update(pesquisas).set({ ativo: 1 }).where(eq(pesquisas.id, p.id));
      console.log(`✅ Pesquisa ID ${p.id} ("${p.nome}") ativada!`);
    }
  } else {
    console.log('\n✅ Todas as pesquisas já estão ativas');
  }

  process.exit(0);
}

fixPesquisa().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
