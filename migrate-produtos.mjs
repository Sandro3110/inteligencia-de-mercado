import postgres from 'postgres';
import fs from 'fs';

const client = postgres(process.env.DATABASE_URL);

try {
  console.log('🔄 Executando migração...');
  
  // Ler arquivo SQL
  const sql = fs.readFileSync('database/migration-produtos-detalhados.sql', 'utf8');
  
  // Executar migração
  await client.unsafe(sql);
  
  console.log('✅ Migração executada com sucesso!');
  
  // Verificar estrutura
  const columns = await client`
    SELECT 
      column_name,
      data_type,
      character_maximum_length,
      is_nullable
    FROM information_schema.columns
    WHERE table_name = 'dim_produto'
    ORDER BY ordinal_position
  `;
  
  console.log('\n📋 Estrutura atualizada da tabela dim_produto:');
  console.table(columns);
  
} catch (error) {
  console.error('❌ Erro na migração:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
