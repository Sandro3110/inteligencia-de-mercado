import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});

async function runMigration() {
  try {
    console.log('🔄 Iniciando migração...\n');
    
    // 1. Adicionar funcionalidades
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS funcionalidades TEXT`;
      console.log('✅ Campo funcionalidades adicionado');
    } catch (e) {
      console.log('⚠️  Campo funcionalidades já existe ou erro:', e.message);
    }
    
    // 2. Adicionar publico_alvo
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS publico_alvo VARCHAR(500)`;
      console.log('✅ Campo publico_alvo adicionado');
    } catch (e) {
      console.log('⚠️  Campo publico_alvo já existe ou erro:', e.message);
    }
    
    // 3. Adicionar diferenciais
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS diferenciais TEXT`;
      console.log('✅ Campo diferenciais adicionado');
    } catch (e) {
      console.log('⚠️  Campo diferenciais já existe ou erro:', e.message);
    }
    
    // 4. Adicionar tecnologias
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS tecnologias VARCHAR(500)`;
      console.log('✅ Campo tecnologias adicionado');
    } catch (e) {
      console.log('⚠️  Campo tecnologias já existe ou erro:', e.message);
    }
    
    // 5. Adicionar precificacao
    try {
      await client`ALTER TABLE dim_produto ADD COLUMN IF NOT EXISTS precificacao VARCHAR(500)`;
      console.log('✅ Campo precificacao adicionado');
    } catch (e) {
      console.log('⚠️  Campo precificacao já existe ou erro:', e.message);
    }
    
    console.log('\n✅ Migração concluída!\n');
    
    // Verificar estrutura
    const columns = await client`
      SELECT 
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'dim_produto'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Estrutura da tabela dim_produto:');
    columns.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  - ${col.column_name}: ${col.data_type}${length}`);
    });
    
  } catch (error) {
    console.error('\n❌ Erro na migração:', error);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration().catch(err => {
  console.error('Falha crítica:', err);
  process.exit(1);
});
