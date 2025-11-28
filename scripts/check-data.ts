// Script para verificar dados no banco
import { getDb } from '../server/db';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function checkData() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    return;
  }

  console.log('Checking pesquisas...');
  const pesquisas = await db.select().from(schema.pesquisas).limit(10);
  console.log('Pesquisas:', pesquisas.map(p => ({ id: p.id, nome: p.nome, projectId: p.projectId })));

  console.log('\nChecking clientes with pesquisaId = 1...');
  const clientes1 = await db
    .select()
    .from(schema.clientes)
    .where(eq(schema.clientes.pesquisaId, 1))
    .limit(5);
  console.log('Clientes with pesquisaId=1:', clientes1.length);
  if (clientes1.length > 0) {
    console.log('Sample cliente:', { id: clientes1[0].id, nome: clientes1[0].nome, pesquisaId: clientes1[0].pesquisaId });
  }

  console.log('\nChecking all clientes (first 10)...');
  const allClientes = await db.select().from(schema.clientes).limit(10);
  console.log('All clientes sample:');
  allClientes.forEach(c => {
    console.log(`  - ID: ${c.id}, Nome: ${c.nome}, pesquisaId: ${c.pesquisaId}`);
  });
}

checkData().catch(console.error).finally(() => process.exit(0));
