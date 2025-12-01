import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

const migration = readFileSync('./drizzle/migrations/0001_add_drill_down_indexes.sql', 'utf-8');

console.log('🔄 Aplicando índices...');
console.log(migration);

try {
  await sql.unsafe(migration);
  console.log('✅ Índices criados com sucesso!');
} catch (error) {
  console.error('❌ Erro ao criar índices:', error);
  process.exit(1);
} finally {
  await sql.end();
}
