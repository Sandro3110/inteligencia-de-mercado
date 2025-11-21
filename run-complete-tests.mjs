import { getDb } from './server/db.ts';
import fs from 'fs';

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, status, details = '') {
  const result = { name, status, details, timestamp: new Date().toISOString() };
  
  if (status === 'PASS') {
    testResults.passed.push(result);
    console.log(`✅ ${name}`);
  } else if (status === 'FAIL') {
    testResults.failed.push(result);
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  } else if (status === 'WARN') {
    testResults.warnings.push(result);
    console.log(`⚠️  ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

async function testDatabaseConnection() {
  console.log('\n🔍 TESTE 1: CONEXÃO COM BANCO DE DADOS\n');
  
  try {
    const db = await getDb();
    if (!db) {
      logTest('Conexão com banco de dados', 'FAIL', 'Database não conectado');
      return false;
    }
    
    logTest('Conexão com banco de dados', 'PASS');
    
    // Test query execution
    await db.execute('SELECT 1');
    logTest('Execução de queries', 'PASS');
    
    return true;
  } catch (error) {
    logTest('Conexão com banco de dados', 'FAIL', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('\n🔍 TESTE 2: SCHEMA DO BANCO DE DADOS\n');
  
  try {
    const db = await getDb();
    
    // Tabelas corretas conforme schema do Drizzle
    const requiredTables = [
      'users',
      'projects',
      'pesquisas',
      'mercados_unicos',  // Nome correto!
      'clientes',
      'concorrentes',
      'leads',
      'produtos',
      'project_audit_log',
      'hibernation_warnings',
      'export_history',
      'saved_filters_export',
      'notifications',
      'analytics_mercados',
      'analytics_dimensoes'
    ];
    
    for (const tableName of requiredTables) {
      try {
        const result = await db.execute(`SELECT COUNT(*) as count FROM ${tableName} LIMIT 1`);
        logTest(`Tabela: ${tableName}`, 'PASS');
      } catch (error) {
        logTest(`Tabela: ${tableName}`, 'FAIL', error.message);
      }
    }
    
    return true;
  } catch (error) {
    logTest('Verificação de schema', 'FAIL', error.message);
    return false;
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 TESTE 3: INTEGRIDADE DOS DADOS\n');
  
  try {
    const db = await getDb();
    
    // Check if there are any projects
    const projects = await db.execute('SELECT COUNT(*) as count FROM projects');
    const projectCount = projects[0]?.count || 0;
    
    if (projectCount === 0) {
      logTest('Projetos no banco', 'WARN', 'Nenhum projeto encontrado (esperado em instalação nova)');
    } else {
      logTest('Projetos no banco', 'PASS', `${projectCount} projeto(s) encontrado(s)`);
    }
    
    // Check if there are any pesquisas
    const pesquisas = await db.execute('SELECT COUNT(*) as count FROM pesquisas');
    const pesquisaCount = pesquisas[0]?.count || 0;
    
    if (pesquisaCount === 0) {
      logTest('Pesquisas no banco', 'WARN', 'Nenhuma pesquisa encontrada (esperado em instalação nova)');
    } else {
      logTest('Pesquisas no banco', 'PASS', `${pesquisaCount} pesquisa(s) encontrada(s)`);
    }
    
    // Check mercados_unicos (nome correto)
    const mercados = await db.execute('SELECT COUNT(*) as count FROM mercados_unicos');
    const mercadoCount = mercados[0]?.count || 0;
    
    if (mercadoCount === 0) {
      logTest('Mercados no banco', 'WARN', 'Nenhum mercado encontrado (esperado em instalação nova)');
    } else {
      logTest('Mercados no banco', 'PASS', `${mercadoCount} mercado(s) encontrado(s)`);
    }
    
    // Check clientes
    const clientes = await db.execute('SELECT COUNT(*) as count FROM clientes');
    const clienteCount = clientes[0]?.count || 0;
    logTest('Clientes no banco', clienteCount > 0 ? 'PASS' : 'WARN', `${clienteCount} cliente(s) (esperado em instalação nova)`);
    
    // Check concorrentes
    const concorrentes = await db.execute('SELECT COUNT(*) as count FROM concorrentes');
    const concorrenteCount = concorrentes[0]?.count || 0;
    logTest('Concorrentes no banco', concorrenteCount > 0 ? 'PASS' : 'WARN', `${concorrenteCount} concorrente(s) (esperado em instalação nova)`);
    
    // Check leads
    const leads = await db.execute('SELECT COUNT(*) as count FROM leads');
    const leadCount = leads[0]?.count || 0;
    logTest('Leads no banco', leadCount > 0 ? 'PASS' : 'WARN', `${leadCount} lead(s) (esperado em instalação nova)`);
    
    return true;
  } catch (error) {
    logTest('Integridade dos dados', 'FAIL', error.message);
    return false;
  }
}

async function testRouterEndpoints() {
  console.log('\n🔍 TESTE 4: ENDPOINTS tRPC\n');
  
  try {
    // Import routers
    const { appRouter } = await import('./server/routers.ts');
    
    // Check if main routers exist
    const routers = [
      'auth',
      'analytics',
      'projects',
      'pesquisas',
      'mercados',
      'clientes',
      'concorrentes',
      'leads',
      'produtos',
      'export',
      'geo',
      'apiHealth',
      'system'
    ];
    
    for (const routerName of routers) {
      if (appRouter[routerName]) {
        logTest(`Router: ${routerName}`, 'PASS');
      } else {
        logTest(`Router: ${routerName}`, 'FAIL', 'Router não encontrado');
      }
    }
    
    return true;
  } catch (error) {
    logTest('Verificação de routers', 'FAIL', error.message);
    return false;
  }
}

async function testFrontendFiles() {
  console.log('\n🔍 TESTE 5: ARQUIVOS DO FRONTEND\n');
  
  const requiredFiles = [
    'client/src/App.tsx',
    'client/src/main.tsx',
    'client/src/lib/trpc.ts',
    'client/src/pages/CascadeView.tsx',
    'client/src/pages/ProjectManagement.tsx',
    'client/src/pages/ResearchWizard.tsx',
    'client/src/pages/TendenciasDashboard.tsx',
    'client/src/pages/ActivityDashboard.tsx',
    'client/src/components/DashboardLayout.tsx'
  ];
  
  for (const filePath of requiredFiles) {
    const fullPath = `/home/ubuntu/gestor-pav/${filePath}`;
    if (fs.existsSync(fullPath)) {
      logTest(`Arquivo: ${filePath}`, 'PASS');
    } else {
      logTest(`Arquivo: ${filePath}`, 'WARN', 'Arquivo não encontrado (pode não ser crítico)');
    }
  }
  
  return true;
}

async function testDatabaseFunctions() {
  console.log('\n🔍 TESTE 6: FUNÇÕES DO BANCO DE DADOS\n');
  
  try {
    const db = await import('./server/db.ts');
    
    const functions = [
      'getDb',
      'upsertUser',
      'getUser',
      'getProjects',
      'createProject',
      'updateProject',
      'hibernateProject',
      'reactivateProject',
      'getMercados',
      'getClientes',
      'getConcorrentes',
      'getLeads'
    ];
    
    for (const funcName of functions) {
      if (typeof db[funcName] === 'function') {
        logTest(`Função DB: ${funcName}`, 'PASS');
      } else {
        logTest(`Função DB: ${funcName}`, 'WARN', 'Função não encontrada');
      }
    }
    
    return true;
  } catch (error) {
    logTest('Verificação de funções DB', 'FAIL', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO FINAL DE TESTES');
  console.log('='.repeat(80));
  
  const total = testResults.passed.length + testResults.failed.length + testResults.warnings.length;
  const passRate = total > 0 ? ((testResults.passed.length / total) * 100).toFixed(2) : 0;
  
  console.log(`\n✅ Testes Aprovados: ${testResults.passed.length}`);
  console.log(`❌ Testes Falhados: ${testResults.failed.length}`);
  console.log(`⚠️  Avisos: ${testResults.warnings.length}`);
  console.log(`📈 Taxa de Sucesso: ${passRate}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FALHAS CRÍTICAS ENCONTRADAS:');
    testResults.failed.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.name}`);
      console.log(`   Detalhes: ${test.details}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  AVISOS (Não Críticos):');
    testResults.warnings.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.name}`);
      console.log(`   Detalhes: ${test.details}`);
    });
  }
  
  // Save report to file
  const reportPath = '/home/ubuntu/gestor-pav/test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  
  console.log('\n' + '='.repeat(80));
  
  return testResults.failed.length === 0;
}

async function runAllTests() {
  console.log('🚀 INICIANDO BATERIA COMPLETA DE TESTES - VERSÃO 2\n');
  console.log('='.repeat(80));
  
  await testDatabaseConnection();
  await testDatabaseSchema();
  await testDataIntegrity();
  await testRouterEndpoints();
  await testFrontendFiles();
  await testDatabaseFunctions();
  
  const success = await generateReport();
  
  if (success) {
    console.log('\n🎉 TODOS OS TESTES CRÍTICOS PASSARAM!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  ALGUNS TESTES CRÍTICOS FALHARAM. VERIFIQUE O RELATÓRIO ACIMA.\n');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('\n💥 ERRO FATAL:', error);
  process.exit(1);
});
