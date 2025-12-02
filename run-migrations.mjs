#!/usr/bin/env node
/**
 * Script para executar migrations SQL no Supabase
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Ler DATABASE_URL do .env
const envPath = join(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

if (!databaseUrlMatch) {
  console.error('❌ DATABASE_URL não encontrada no .env');
  process.exit(1);
}

const DATABASE_URL = databaseUrlMatch[1];

console.log('🔗 Conectando ao banco de dados...\n');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    const migrationsDir = join(__dirname, 'drizzle/migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.match(/^00[1-7]_.*\.sql$/)) // Apenas 001-007
      .sort();
    
    console.log(`📋 ${files.length} migrations encontradas:\n`);
    
    for (const file of files) {
      console.log(`⏳ Executando: ${file}...`);
      
      const sqlPath = join(migrationsDir, file);
      const sql = readFileSync(sqlPath, 'utf-8');
      
      try {
        await client.query(sql);
        console.log(`✅ ${file} - SUCESSO\n`);
      } catch (error) {
        console.error(`❌ ${file} - ERRO:`);
        console.error(error.message);
        console.error('');
        
        // Continuar com próximas migrations mesmo se uma falhar
        // (pode ser que já tenha sido executada)
      }
    }
    
    console.log('\n🎉 Migrations concluídas!');
    
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
