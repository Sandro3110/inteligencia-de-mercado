import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

console.log('🔍 Buscando pesquisa...');

try {
  // Buscar pesquisa
  const pesquisas = await sql`
    SELECT id, nome, "totalClientes", "clientesEnriquecidos", "leadsCount", "mercadosCount", "produtosCount", "concorrentesCount"
    FROM pesquisas
    LIMIT 1
  `;

  if (pesquisas.length === 0) {
    console.log('❌ Nenhuma pesquisa encontrada');
    process.exit(1);
  }

  const pesquisa = pesquisas[0];
  console.log('📊 Pesquisa encontrada:', pesquisa);

  const pesquisaId = pesquisa.id;

  console.log('\n🧹 Iniciando limpeza...');

  // 1. Deletar jobs
  const jobsDeleted = await sql`
    DELETE FROM enrichment_jobs 
    WHERE "pesquisaId" = ${pesquisaId}
  `;
  console.log('✅ Jobs deletados:', jobsDeleted.count);

  // 2. Deletar leads
  const leadsDeleted = await sql`
    DELETE FROM leads 
    WHERE "pesquisaId" = ${pesquisaId}
  `;
  console.log('✅ Leads deletados:', leadsDeleted.count);

  // 3. Deletar concorrentes
  const concorrentesDeleted = await sql`
    DELETE FROM concorrentes 
    WHERE "pesquisaId" = ${pesquisaId}
  `;
  console.log('✅ Concorrentes deletados:', concorrentesDeleted.count);

  // 4. Buscar clientes da pesquisa
  const clientes = await sql`
    SELECT id FROM clientes WHERE "pesquisaId" = ${pesquisaId}
  `;
  const clienteIds = clientes.map(c => c.id);
  console.log('📋 Clientes encontrados:', clienteIds.length);

  // 5. Deletar produtos dos clientes
  if (clienteIds.length > 0) {
    const produtosDeleted = await sql`
      DELETE FROM produtos 
      WHERE "clienteId" = ANY(${clienteIds})
    `;
    console.log('✅ Produtos deletados:', produtosDeleted.count);

    // 6. Deletar relacionamentos clientes-mercados
    const relDeleted = await sql`
      DELETE FROM clientes_mercados 
      WHERE "clienteId" = ANY(${clienteIds})
    `;
    console.log('✅ Relacionamentos deletados:', relDeleted.count);
  }

  // 7. Deletar mercados órfãos
  const mercadosDeleted = await sql`
    DELETE FROM mercados_unicos 
    WHERE id NOT IN (
      SELECT DISTINCT "mercadoId" FROM clientes_mercados
    )
  `;
  console.log('✅ Mercados órfãos deletados:', mercadosDeleted.count);

  // 8. Resetar clientes
  const clientesReset = await sql`
    UPDATE clientes
    SET 
      site = NULL,
      cidade = NULL,
      uf = NULL,
      latitude = NULL,
      longitude = NULL,
      setor = NULL,
      descricao = NULL,
      "qualidadeScore" = NULL,
      "qualidadeClassificacao" = NULL,
      enriquecido = 0,
      "enriquecidoEm" = NULL,
      "updatedAt" = NOW()
    WHERE "pesquisaId" = ${pesquisaId}
  `;
  console.log('✅ Clientes resetados:', clientesReset.count);

  // 9. Resetar pesquisa
  const pesquisaReset = await sql`
    UPDATE pesquisas
    SET 
      "clientesEnriquecidos" = 0,
      "leadsCount" = 0,
      "concorrentesCount" = 0,
      "produtosCount" = 0,
      "mercadosCount" = 0,
      "clientesQualidadeMedia" = NULL,
      "leadsQualidadeMedia" = NULL,
      "concorrentesQualidadeMedia" = NULL,
      "geoEnriquecimentoTotal" = 0,
      "geoEnriquecimentoTotalEntidades" = 0,
      status = 'rascunho',
      "updatedAt" = NOW()
    WHERE id = ${pesquisaId}
  `;
  console.log('✅ Pesquisa resetada:', pesquisaReset.count);

  // Verificar resultado final
  const finalResult = await sql`
    SELECT id, nome, "totalClientes", "clientesEnriquecidos", "leadsCount", "mercadosCount", "produtosCount", "concorrentesCount", status
    FROM pesquisas
    WHERE id = ${pesquisaId}
  `;

  console.log('\n📊 Estado final da pesquisa:', finalResult[0]);

  await sql.end();
  console.log('\n✨ Limpeza concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}
