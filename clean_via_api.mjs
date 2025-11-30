// Importar getDb do projeto
import { getDb } from './drizzle/db.js';
import { pesquisas, clientes, leads, concorrentes, produtos, mercadosUnicos, clientesMercados, enrichmentJobs } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

console.log('🔍 Conectando ao banco...');

const db = await getDb();

if (!db) {
  console.error('❌ Falha ao conectar ao banco');
  process.exit(1);
}

console.log('✅ Conectado!');

// Buscar pesquisa
console.log('\n🔍 Buscando pesquisa...');
const pesquisasList = await db.select().from(pesquisas).limit(1);

if (pesquisasList.length === 0) {
  console.log('❌ Nenhuma pesquisa encontrada');
  process.exit(1);
}

const pesquisa = pesquisasList[0];
console.log('📊 Pesquisa encontrada:', {
  id: pesquisa.id,
  nome: pesquisa.nome,
  totalClientes: pesquisa.totalClientes,
  clientesEnriquecidos: pesquisa.clientesEnriquecidos,
  leadsCount: pesquisa.leadsCount,
  mercadosCount: pesquisa.mercadosCount,
});

const pesquisaId = pesquisa.id;

console.log('\n🧹 Iniciando limpeza...');

// 1. Deletar jobs
const jobsDeleted = await db.delete(enrichmentJobs).where(eq(enrichmentJobs.pesquisaId, pesquisaId));
console.log('✅ Jobs deletados:', jobsDeleted.rowsAffected || 0);

// 2. Deletar leads
const leadsDeleted = await db.delete(leads).where(eq(leads.pesquisaId, pesquisaId));
console.log('✅ Leads deletados:', leadsDeleted.rowsAffected || 0);

// 3. Deletar concorrentes
const concorrentesDeleted = await db.delete(concorrentes).where(eq(concorrentes.pesquisaId, pesquisaId));
console.log('✅ Concorrentes deletados:', concorrentesDeleted.rowsAffected || 0);

// 4. Buscar clientes
const clientesList = await db.select({ id: clientes.id }).from(clientes).where(eq(clientes.pesquisaId, pesquisaId));
const clienteIds = clientesList.map(c => c.id);
console.log('📋 Clientes encontrados:', clienteIds.length);

// 5. Deletar produtos
let produtosDeleted = 0;
for (const clienteId of clienteIds) {
  const result = await db.delete(produtos).where(eq(produtos.clienteId, clienteId));
  produtosDeleted += result.rowsAffected || 0;
}
console.log('✅ Produtos deletados:', produtosDeleted);

// 6. Deletar relacionamentos
let relDeleted = 0;
for (const clienteId of clienteIds) {
  const result = await db.delete(clientesMercados).where(eq(clientesMercados.clienteId, clienteId));
  relDeleted += result.rowsAffected || 0;
}
console.log('✅ Relacionamentos deletados:', relDeleted);

// 7. Resetar clientes
const clientesReset = await db.update(clientes)
  .set({
    site: null,
    cidade: null,
    uf: null,
    latitude: null,
    longitude: null,
    setor: null,
    descricao: null,
    qualidadeScore: null,
    qualidadeClassificacao: null,
    enriquecido: 0,
    enriquecidoEm: null,
    updatedAt: new Date().toISOString(),
  })
  .where(eq(clientes.pesquisaId, pesquisaId));
console.log('✅ Clientes resetados:', clientesReset.rowsAffected || 0);

// 8. Resetar pesquisa
const pesquisaReset = await db.update(pesquisas)
  .set({
    clientesEnriquecidos: 0,
    leadsCount: 0,
    concorrentesCount: 0,
    produtosCount: 0,
    mercadosCount: 0,
    clientesQualidadeMedia: null,
    leadsQualidadeMedia: null,
    concorrentesQualidadeMedia: null,
    geoEnriquecimentoTotal: 0,
    geoEnriquecimentoTotalEntidades: 0,
    status: 'rascunho',
    updatedAt: new Date().toISOString(),
  })
  .where(eq(pesquisas.id, pesquisaId));
console.log('✅ Pesquisa resetada:', pesquisaReset.rowsAffected || 0);

// Verificar resultado final
const finalResult = await db.select().from(pesquisas).where(eq(pesquisas.id, pesquisaId));
console.log('\n📊 Estado final da pesquisa:', {
  id: finalResult[0].id,
  nome: finalResult[0].nome,
  totalClientes: finalResult[0].totalClientes,
  clientesEnriquecidos: finalResult[0].clientesEnriquecidos,
  leadsCount: finalResult[0].leadsCount,
  mercadosCount: finalResult[0].mercadosCount,
  produtosCount: finalResult[0].produtosCount,
  concorrentesCount: finalResult[0].concorrentesCount,
  status: finalResult[0].status,
});

console.log('\n✨ Limpeza concluída com sucesso!');
process.exit(0);
