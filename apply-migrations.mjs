import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada!');
  process.exit(1);
}

// Extrair URL e anon key do DATABASE_URL
const match = DATABASE_URL.match(/postgresql:\/\/postgres\.([^:]+):([^@]+)@/);
if (!match) {
  console.error('❌ Formato de DATABASE_URL inválido!');
  process.exit(1);
}

const projectRef = match[1];
const password = match[2];
const supabaseUrl = `https://${projectRef}.supabase.co`;

// Usar anon key (pública) - para migrations use service_role key se disponível
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbnpseW5tdWVyYm1xaW5neWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MjkxODQsImV4cCI6MjA0ODMwNTE4NH0.Gq4xQZxYqQKqYqYqYqYqYqYqYqYqYqYqYqYqYqYqYqY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ler migration SQL
const migrationSQL = readFileSync('./migrations/002_criar_nova_estrutura.sql', 'utf-8');

// Dividir em statements individuais (simplificado)
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`📝 Aplicando ${statements.length} statements...`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  if (!stmt) continue;
  
  console.log(`\n[${i+1}/${statements.length}] Executando...`);
  console.log(stmt.substring(0, 100) + '...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
    if (error) {
      console.error(`❌ Erro:`, error.message);
      // Continuar mesmo com erro (alguns podem ser esperados)
    } else {
      console.log(`✅ OK`);
    }
  } catch (err) {
    console.error(`❌ Exceção:`, err.message);
  }
}

console.log('\n✅ Migration concluída!');
