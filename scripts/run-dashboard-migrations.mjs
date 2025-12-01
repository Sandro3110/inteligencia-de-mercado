#!/usr/bin/env node
/**
 * Script para executar migrations SQL do Dashboard
 * Aplica índices e stored procedures manualmente
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function runMigration(filePath, description) {
  console.log(`\n📝 Executando: ${description}`);
  try {
    const migrationSQL = readFileSync(filePath, 'utf-8');
    await sql.unsafe(migrationSQL);
    console.log(`✅ ${description} - Concluído`);
  } catch (error) {
    console.error(`❌ ${description} - Erro:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando migrations do Dashboard...\n');

  const migrationsDir = join(__dirname, '..', 'drizzle', 'migrations');

  try {
    // 1. Criar índices
    await runMigration(
      join(migrationsDir, 'add_dashboard_indexes.sql'),
      'Índices do Dashboard'
    );

    // 2. Criar stored procedure
    await runMigration(
      join(migrationsDir, 'create_get_pesquisas_summary.sql'),
      'Stored Procedure get_pesquisas_summary'
    );

    console.log('\n✅ Todas as migrations foram aplicadas com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro ao aplicar migrations:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
