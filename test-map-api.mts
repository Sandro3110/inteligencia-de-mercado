// Script para testar a API getMapData localmente
import { db } from './server/db.js';
import { clientes, leads, concorrentes, pesquisas as pesquisasTable } from './drizzle/schema.js';
import { and, eq, isNotNull, sql, inArray } from 'drizzle-orm';

async function testGetMapData() {
  console.log('🔍 Testando getMapData...\n');

  const input = {
    entityTypes: ['cliente', 'lead', 'concorrente'],
    projectId: 1,
    pesquisaId: 1,
    filters: {},
  };

  console.log('📥 Input:', JSON.stringify(input, null, 2));

  try {
    // Buscar pesquisas do projeto
    const pesquisasQuery = await db
      .select({ id: pesquisasTable.id })
      .from(pesquisasTable)
      .where(eq(pesquisasTable.projectId, input.projectId));

    const pesquisaIds = pesquisasQuery.map((p) => p.id);
    console.log('\n📋 Pesquisas encontradas:', pesquisaIds);

    // Buscar clientes
    const clientesData = await db
      .select({
        id: clientes.id,
        nome: clientes.nome,
        latitude: clientes.latitude,
        longitude: clientes.longitude,
        cidade: clientes.cidade,
        uf: clientes.uf,
      })
      .from(clientes)
      .where(
        and(
          isNotNull(clientes.latitude),
          isNotNull(clientes.longitude),
          input.pesquisaId
            ? eq(clientes.pesquisaId, input.pesquisaId)
            : pesquisaIds && pesquisaIds.length > 0
              ? inArray(clientes.pesquisaId, pesquisaIds)
              : sql`1=1`
        )
      )
      .limit(5);

    console.log('\n👥 Clientes encontrados:', clientesData.length);
    console.log('Exemplo:', JSON.stringify(clientesData[0], null, 2));

    // Processar clientes
    const results = [];
    for (const c of clientesData) {
      if (!c.latitude || !c.longitude) continue;

      const lat = parseFloat(c.latitude as string);
      const lng = parseFloat(c.longitude as string);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`❌ Cliente ${c.id} tem coordenadas inválidas:`, { lat: c.latitude, lng: c.longitude });
        continue;
      }

      results.push({
        ...c,
        type: 'cliente' as const,
        latitude: lat,
        longitude: lng,
      });
    }

    console.log('\n✅ Resultados processados:', results.length);
    console.log('Exemplo processado:', JSON.stringify(results[0], null, 2));

    return results;
  } catch (error) {
    console.error('\n❌ Erro:', error);
    throw error;
  }
}

testGetMapData()
  .then(() => {
    console.log('\n✅ Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou:', error);
    process.exit(1);
  });
