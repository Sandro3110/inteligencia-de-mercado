const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL não está definida');
  process.exit(1);
}

const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
});

async function mapDatabase() {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    
    // Listar todas as tabelas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`\n✅ Encontradas ${tables.length} tabelas\n`);
    
    const databaseStructure = {};
    
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`📋 Mapeando tabela: ${tableName}`);
      
      // Buscar colunas da tabela
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      // Tentar pegar uma amostra de dados
      let sample = null;
      let sampleKeys = [];
      try {
        const sampleData = await sql.unsafe(`SELECT * FROM "${tableName}" LIMIT 1`);
        if (sampleData && sampleData.length > 0) {
          sample = sampleData[0];
          sampleKeys = Object.keys(sample);
        }
      } catch (err) {
        console.log(`   ⚠️  Erro ao buscar amostra: ${err.message}`);
      }
      
      // Contar registros
      let rowCount = 0;
      try {
        const countResult = await sql.unsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
        rowCount = parseInt(countResult[0].count);
      } catch (err) {
        console.log(`   ⚠️  Erro ao contar registros: ${err.message}`);
      }
      
      databaseStructure[tableName] = {
        columns: columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          maxLength: col.character_maximum_length,
          precision: col.numeric_precision,
          scale: col.numeric_scale
        })),
        sampleKeys: sampleKeys,
        rowCount: rowCount
      };
      
      console.log(`   ✓ ${columns.length} colunas, ${rowCount} registros`);
    }
    
    // Salvar estrutura em arquivo JSON
    const outputPath = path.join(__dirname, '..', 'database-structure.json');
    fs.writeFileSync(outputPath, JSON.stringify(databaseStructure, null, 2));
    
    console.log(`\n✅ Estrutura do banco salva em: ${outputPath}`);
    console.log('\n📊 Resumo:');
    console.log(`   - Total de tabelas: ${Object.keys(databaseStructure).length}`);
    
    for (const [tableName, tableInfo] of Object.entries(databaseStructure)) {
      console.log(`\n   📋 ${tableName}:`);
      console.log(`      - Colunas: ${tableInfo.columns.length}`);
      console.log(`      - Registros: ${tableInfo.rowCount}`);
      console.log(`      - Chaves encontradas: ${tableInfo.sampleKeys.join(', ') || 'nenhuma'}`);
    }
    
    await sql.end();
    console.log('\n✅ Mapeamento concluído!');
  } catch (error) {
    console.error('❌ Erro ao mapear banco:', error);
    await sql.end();
    process.exit(1);
  }
}

mapDatabase();
