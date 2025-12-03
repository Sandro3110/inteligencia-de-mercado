import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);

try {
  console.log('Testando: ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);');
  await sql`ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS cidade VARCHAR(100)`;
  console.log('✅ Sucesso!');
  
  console.log('\nTestando: CREATE TABLE dim_mercado...');
  await sql`
    CREATE TABLE IF NOT EXISTS dim_mercado (
      id SERIAL PRIMARY KEY,
      entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
      nome VARCHAR(255) NOT NULL
    )
  `;
  console.log('✅ Tabela criada!');
  
  console.log('\nTestando: CREATE INDEX...');
  await sql`CREATE INDEX IF NOT EXISTS idx_mercado_entidade ON dim_mercado(entidade_id)`;
  console.log('✅ Índice criado!');
  
} catch (error) {
  console.error('❌ ERRO:', error.message);
  console.error('Detalhes:', error);
} finally {
  await sql.end();
}
