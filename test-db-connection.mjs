import { getDb } from './server/db.ts';

async function testConnection() {
  try {
    const db = await getDb();
    
    if (!db) {
      console.log('❌ Database not connected');
      process.exit(1);
    }
    
    console.log('✅ Database connected');
    
    // Test simple query
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Query executed successfully');
    
    // Check tables
    const tables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables in database:');
    const tableList = Array.isArray(tables) ? tables : (tables.rows || []);
    tableList.forEach((row) => {
      console.log(`  - ${row.table_name || row[0]}`);
    });
    
    console.log(`\n✅ Total tables: ${tableList.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
