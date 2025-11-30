/**
 * Teste da API de Mapa
 * Verificar se retorna dados com diferentes parâmetros
 */

import { getDb } from './server/db';
import { clientes, leads, concorrentes } from './drizzle/schema';
import { isNotNull, eq, and } from 'drizzle-orm';

async function testMapAPI() {
  console.log('🧪 Testando API de Mapa...\n');

  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }

  // Teste 1: Buscar TODOS os clientes com coordenadas (sem filtro)
  console.log('📊 Teste 1: Buscar TODOS os clientes com coordenadas');
  const allClientes = await db
    .select({
      id: clientes.id,
      nome: clientes.nome,
      latitude: clientes.latitude,
      longitude: clientes.longitude,
      pesquisaId: clientes.pesquisaId,
    })
    .from(clientes)
    .where(and(isNotNull(clientes.latitude), isNotNull(clientes.longitude)));

  console.log(`✅ Encontrados: ${allClientes.length} clientes`);
  if (allClientes.length > 0) {
    console.log(`   Exemplo: ${allClientes[0].nome} (pesquisaId: ${allClientes[0].pesquisaId})`);
  }
  console.log('');

  // Teste 2: Buscar clientes da pesquisa ID=1
  console.log('📊 Teste 2: Buscar clientes da pesquisa ID=1');
  const pesquisa1Clientes = await db
    .select({
      id: clientes.id,
      nome: clientes.nome,
      latitude: clientes.latitude,
      longitude: clientes.longitude,
    })
    .from(clientes)
    .where(
      and(isNotNull(clientes.latitude), isNotNull(clientes.longitude), eq(clientes.pesquisaId, 1))
    );

  console.log(`✅ Encontrados: ${pesquisa1Clientes.length} clientes`);
  console.log('');

  // Teste 3: Buscar leads com coordenadas
  console.log('📊 Teste 3: Buscar leads com coordenadas');
  const allLeads = await db
    .select({
      id: leads.id,
      nome: leads.nome,
      latitude: leads.latitude,
      longitude: leads.longitude,
      pesquisaId: leads.pesquisaId,
    })
    .from(leads)
    .where(and(isNotNull(leads.latitude), isNotNull(leads.longitude)));

  console.log(`✅ Encontrados: ${allLeads.length} leads`);
  console.log('');

  // Teste 4: Buscar concorrentes com coordenadas
  console.log('📊 Teste 4: Buscar concorrentes com coordenadas');
  const allConcorrentes = await db
    .select({
      id: concorrentes.id,
      nome: concorrentes.nome,
      latitude: concorrentes.latitude,
      longitude: concorrentes.longitude,
      pesquisaId: concorrentes.pesquisaId,
    })
    .from(concorrentes)
    .where(and(isNotNull(concorrentes.latitude), isNotNull(concorrentes.longitude)));

  console.log(`✅ Encontrados: ${allConcorrentes.length} concorrentes`);
  console.log('');

  // Resumo
  const total = allClientes.length + allLeads.length + allConcorrentes.length;
  console.log('📊 RESUMO:');
  console.log(`   Clientes: ${allClientes.length}`);
  console.log(`   Leads: ${allLeads.length}`);
  console.log(`   Concorrentes: ${allConcorrentes.length}`);
  console.log(`   TOTAL: ${total} entidades com coordenadas`);
  console.log('');

  // Conclusão
  if (total === 0) {
    console.log('❌ PROBLEMA: Nenhuma entidade com coordenadas encontrada!');
  } else if (total < 100) {
    console.log('⚠️  ATENÇÃO: Poucas entidades com coordenadas (esperado: ~1600)');
  } else {
    console.log('✅ OK: Dados suficientes para exibir no mapa');
  }
}

testMapAPI().catch(console.error);
