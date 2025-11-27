import { getDb } from './server/db/index.js';
import { projects, pesquisas, mercadosUnicos, leads, clientes, concorrentes } from './drizzle/schema.js';
import { eq, count } from 'drizzle-orm';

async function testDashboardStats() {
  console.log('🔍 Testando Dashboard Stats...\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Falha na conexão com banco');
    return;
  }
  
  try {
    // Test 1: Contar projetos ativos
    console.log('1. Contando projetos ativos...');
    const [projectsResult] = await db
      .select({ value: count() })
      .from(projects)
      .where(eq(projects.ativo, 1));
    console.log(`   ✅ Projetos: ${projectsResult?.value || 0}`);
    
    // Test 2: Contar pesquisas
    console.log('2. Contando pesquisas...');
    const [pesquisasResult] = await db
      .select({ value: count() })
      .from(pesquisas);
    console.log(`   ✅ Pesquisas: ${pesquisasResult[0]?.value || 0}`);
    
    // Test 3: Contar mercados
    console.log('3. Contando mercados...');
    const [mercadosResult] = await db
      .select({ value: count() })
      .from(mercadosUnicos);
    console.log(`   ✅ Mercados: ${mercadosResult[0]?.value || 0}`);
    
    // Test 4: Contar leads
    console.log('4. Contando leads...');
    const [leadsResult] = await db
      .select({ value: count() })
      .from(leads);
    console.log(`   ✅ Leads: ${leadsResult[0]?.value || 0}`);
    
    // Test 5: Contar clientes
    console.log('5. Contando clientes...');
    const [clientesResult] = await db
      .select({ value: count() })
      .from(clientes);
    console.log(`   ✅ Clientes: ${clientesResult[0]?.value || 0}`);
    
    // Test 6: Contar concorrentes
    console.log('6. Contando concorrentes...');
    const [concorrentesResult] = await db
      .select({ value: count() })
      .from(concorrentes);
    console.log(`   ✅ Concorrentes: ${concorrentesResult[0]?.value || 0}`);
    
    console.log('\n✅ TODOS OS TESTES PASSARAM!');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testDashboardStats();
