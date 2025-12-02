// setup-ia-database.mjs
// Script para criar tabelas de IA no banco de dados

import postgres from 'postgres';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function setupDatabase() {
  log(colors.cyan, '\n╔════════════════════════════════════════╗');
  log(colors.cyan, '║   SETUP DO BANCO DE DADOS DE IA       ║');
  log(colors.cyan, '╚════════════════════════════════════════╝\n');
  
  try {
    // Ler arquivo SQL
    const sqlContent = fs.readFileSync('./database/ia-schema.sql', 'utf8');
    
    log(colors.cyan, '📝 Executando script SQL...\n');
    
    // Executar SQL
    await sql.unsafe(sqlContent);
    
    log(colors.green, '✅ Tabelas criadas com sucesso!');
    
    // Verificar configuração
    const config = await sql`SELECT * FROM ia_config WHERE ativo = TRUE LIMIT 1`;
    
    if (config.length > 0) {
      log(colors.green, '\n✅ Configuração padrão criada:');
      log(colors.cyan, `   Plataforma: ${config[0].plataforma}`);
      log(colors.cyan, `   Modelo: ${config[0].modelo}`);
      log(colors.cyan, `   Budget Mensal: $${config[0].budget_mensal}`);
    }
    
    // Verificar tabelas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('ia_config', 'ia_usage')
      ORDER BY table_name
    `;
    
    log(colors.green, '\n✅ Tabelas criadas:');
    tables.forEach(t => {
      log(colors.cyan, `   - ${t.table_name}`);
    });
    
    // Verificar views
    const views = await sql`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_name LIKE 'ia_stats%'
      ORDER BY table_name
    `;
    
    if (views.length > 0) {
      log(colors.green, '\n✅ Views criadas:');
      views.forEach(v => {
        log(colors.cyan, `   - ${v.table_name}`);
      });
    }
    
    log(colors.green, '\n🎉 Setup concluído com sucesso!');
    
  } catch (error) {
    log(colors.red, '\n❌ Erro ao executar setup:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

setupDatabase().catch(error => {
  console.error(error);
  process.exit(1);
});
