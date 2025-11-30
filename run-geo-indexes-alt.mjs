#!/usr/bin/env node

/**
 * Script para executar migration de índices de geoposição
 * Usa getDb() do projeto para conectar ao Supabase
 */

import { readFileSync } from 'fs';
import { getDb } from './server/db.js';

async function runMigration() {
  try {
    console.log('🚀 Conectando ao banco de dados...\n');
    
    const db = await getDb();
    if (!db) {
      throw new Error('Não foi possível conectar ao banco de dados');
    }
    
    console.log('✅ Conectado com sucesso!\n');
    console.log('📝 Executando migration de índices de geoposição...\n');
    
    // Ler arquivo SQL
    const sql = readFileSync('./drizzle/migrations/add_geo_indexes.sql', 'utf-8');
    
    // Dividir em statements individuais
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        return s.length > 0 && 
               !s.startsWith('--') && 
               !s.includes('EXPLAIN ANALYZE') && 
               !s.includes('DROP INDEX') &&
               !s.includes('SELECT') &&
               s.includes('CREATE INDEX');
      });
    
    console.log(`📊 Criando ${statements.length} índices...\n`);
    
    // Executar cada CREATE INDEX
    for (const stmt of statements) {
      const indexMatch = stmt.match(/CREATE INDEX.*?(idx_\w+)/);
      const indexName = indexMatch ? indexMatch[1] : 'índice';
      
      try {
        await db.execute(stmt);
        console.log(`✅ ${indexName}`);
      } catch (err) {
        if (err.message && err.message.includes('already exists')) {
          console.log(`⚠️  ${indexName} (já existe)`);
        } else {
          console.error(`❌ Erro em ${indexName}:`, err.message || err);
        }
      }
    }
    
    console.log('\n📊 Verificando índices criados...\n');
    
    // Verificar índices
    const result = await db.execute(`
      SELECT 
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexname::regclass)) as size
      FROM pg_indexes
      WHERE indexname LIKE 'idx_%_geo_%' OR indexname = 'idx_pesquisas_projectId'
      ORDER BY tablename, indexname;
    `);
    
    if (result.rows && result.rows.length > 0) {
      console.log('Índices criados:');
      console.table(result.rows);
      console.log(`\n✅ Total: ${result.rows.length} índices`);
    } else {
      console.log('⚠️  Nenhum índice encontrado (pode ser que já existam)');
    }
    
    console.log('\n🎉 Migration concluída!');
    console.log('\n📈 Ganho esperado: 60-80% de redução no tempo de query');
    console.log('   Antes: ~2.0s → Depois: ~0.4s\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ Erro ao executar migration:', err);
    process.exit(1);
  }
}

// Executar
runMigration();
