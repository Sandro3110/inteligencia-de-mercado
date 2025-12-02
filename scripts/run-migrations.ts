import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL!;

async function runMigrations() {
  console.log('🚀 Executando migrations...\n');
  
  const sql = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(sql);
  
  const migrationsDir = path.join(__dirname, '../drizzle/migrations');
  const migrationFiles = [
    '0002_add_status_importacao.sql',
    '0003_add_importacao_tables.sql',
  ];
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${file}`);
      continue;
    }
    
    console.log(`📄 Executando: ${file}`);
    const migrationSQL = fs.readFileSync(filePath, 'utf-8');
    
    try {
      await sql.unsafe(migrationSQL);
      console.log(`✅ ${file} executado com sucesso!\n`);
    } catch (error: any) {
      console.error(`❌ Erro ao executar ${file}:`);
      console.error(error.message);
      console.error('');
    }
  }
  
  await sql.end();
  console.log('✅ Migrations concluídas!');
}

runMigrations().catch(console.error);
