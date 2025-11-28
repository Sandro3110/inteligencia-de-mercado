/**
 * Script para testar queries do Drizzle e verificar SQL gerado
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema.js';
import { eq, count } from 'drizzle-orm';

async function testQueries() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
  }

  const client = postgres(databaseUrl, {
    ssl: 'require',
    prepare: false,
  });

  const db = drizzle(client, { schema, logger: true }); // logger: true para ver SQL

  console.log('\n=== Test 1: COUNT query (funciona) ===');
  const countResult = await db
    .select({ count: count() })
    .from(schema.clientes)
    .where(eq(schema.clientes.pesquisaId, 1));

  console.log('Count result:', countResult);

  console.log('\n=== Test 2: SELECT query (não funciona) ===');
  const selectResult = await db
    .select()
    .from(schema.clientes)
    .where(eq(schema.clientes.pesquisaId, 1))
    .limit(5);

  console.log('Select result:', selectResult.length, 'rows');
  if (selectResult.length > 0) {
    console.log('First row:', selectResult[0]);
  }

  await client.end();
}

testQueries().catch(console.error);
