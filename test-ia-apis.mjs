// test-ia-apis.mjs
// Script para testar TODAS as APIs de IA do projeto Intelmarket

import postgres from 'postgres';

const BASE_URL = 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

// Função auxiliar para fazer requisições
async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

// 1. Verificar se tabelas existem
async function checkDatabase() {
  log(colors.cyan, '\n📊 VERIFICANDO BANCO DE DADOS...\n');
  
  try {
    // Verificar tabela ia_config
    const configExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ia_config'
      )
    `;
    
    if (configExists[0].exists) {
      log(colors.green, '✅ Tabela ia_config existe');
      
      const config = await sql`SELECT * FROM ia_config WHERE ativo = TRUE LIMIT 1`;
      if (config.length > 0) {
        log(colors.green, `   Plataforma: ${config[0].plataforma}`);
        log(colors.green, `   Modelo: ${config[0].modelo}`);
        log(colors.green, `   Budget: $${config[0].budget_mensal}`);
      } else {
        log(colors.yellow, '⚠️  Nenhuma configuração ativa encontrada');
      }
    } else {
      log(colors.red, '❌ Tabela ia_config NÃO existe');
      return false;
    }
    
    // Verificar tabela ia_usage
    const usageExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ia_usage'
      )
    `;
    
    if (usageExists[0].exists) {
      log(colors.green, '✅ Tabela ia_usage existe');
      
      const count = await sql`SELECT COUNT(*) FROM ia_usage`;
      log(colors.green, `   Total de registros: ${count[0].count}`);
    } else {
      log(colors.red, '❌ Tabela ia_usage NÃO existe');
      return false;
    }
    
    return true;
  } catch (error) {
    log(colors.red, '❌ Erro ao verificar banco:', error.message);
    return false;
  }
}

// 2. Testar endpoint de estatísticas
async function testStatsEndpoint() {
  log(colors.cyan, '\n📈 TESTANDO ENDPOINT DE ESTATÍSTICAS...\n');
  
  try {
    const { status, data } = await makeRequest('/api/ia-stats');
    
    if (status === 200 && data.success) {
      log(colors.green, '✅ Endpoint /api/ia-stats funcionando');
      log(colors.blue, '\nDados retornados:');
      log(colors.blue, `   Plataforma: ${data.data.config.plataforma}`);
      log(colors.blue, `   Modelo: ${data.data.config.modelo}`);
      log(colors.blue, `   Budget: $${data.data.config.budgetMensal}`);
      log(colors.blue, `   Chamadas (mês): ${data.data.resumoMensal.totalChamadas}`);
      log(colors.blue, `   Tokens (mês): ${data.data.resumoMensal.totalTokens}`);
      log(colors.blue, `   Custo (mês): $${data.data.resumoMensal.custoTotal}`);
      log(colors.blue, `   % Budget usado: ${data.data.resumoMensal.percentualUsado}%`);
      return true;
    } else {
      log(colors.red, '❌ Erro no endpoint:', data);
      return false;
    }
  } catch (error) {
    log(colors.red, '❌ Erro ao testar endpoint:', error.message);
    return false;
  }
}

// 3. Testar endpoint de enriquecimento
async function testEnriquecimentoEndpoint() {
  log(colors.cyan, '\n🔍 TESTANDO ENDPOINT DE ENRIQUECIMENTO...\n');
  
  try {
    // Buscar um usuário admin real
    const users = await sql`
      SELECT id FROM user_profiles 
      WHERE email IN ('sandrodireto@gmail.com', 'cmbusso@gmail.com')
      LIMIT 1
    `;
    
    if (users.length === 0) {
      log(colors.yellow, '⚠️  Nenhum usuário admin encontrado, pulando teste');
      return false;
    }
    
    const userId = users[0].id;
    
    const payload = {
      userId,
      entidadeId: 999, // ID fictício para teste
      nome: 'Nubank',
      cnpj: '18.236.120/0001-58',
    };
    
    log(colors.blue, 'Enviando requisição...');
    log(colors.blue, JSON.stringify(payload, null, 2));
    
    const { status, data } = await makeRequest('/api/ia-enriquecer', 'POST', payload);
    
    if (status === 200 && data.success) {
      log(colors.green, '✅ Endpoint /api/ia-enriquecer funcionando');
      log(colors.blue, '\nDados retornados:');
      log(colors.blue, `   Descrição: ${data.data.descricao.substring(0, 100)}...`);
      log(colors.blue, `   Setor: ${data.data.setor}`);
      log(colors.blue, `   Porte: ${data.data.porte}`);
      log(colors.blue, `   Score: ${data.data.score}/10`);
      log(colors.blue, `   Produtos: ${data.data.produtos.length} produtos`);
      log(colors.blue, `\n   Tokens: ${data.usage.tokens}`);
      log(colors.blue, `   Custo: $${data.usage.custo}`);
      log(colors.blue, `   Duração: ${data.usage.duracao}ms`);
      return true;
    } else {
      log(colors.red, '❌ Erro no endpoint:', data);
      return false;
    }
  } catch (error) {
    log(colors.red, '❌ Erro ao testar endpoint:', error.message);
    return false;
  }
}

// 4. Testar endpoint de análise de mercado
async function testAnaliseEndpoint() {
  log(colors.cyan, '\n📊 TESTANDO ENDPOINT DE ANÁLISE DE MERCADO...\n');
  
  try {
    const users = await sql`
      SELECT id FROM user_profiles 
      WHERE email IN ('sandrodireto@gmail.com', 'cmbusso@gmail.com')
      LIMIT 1
    `;
    
    if (users.length === 0) {
      log(colors.yellow, '⚠️  Nenhum usuário admin encontrado, pulando teste');
      return false;
    }
    
    const userId = users[0].id;
    
    const payload = {
      userId,
      projetoId: 999,
      entidades: [
        { nome: 'Nubank', setor: 'Fintech' },
        { nome: 'Inter', setor: 'Fintech' },
        { nome: 'PicPay', setor: 'Fintech' },
      ],
    };
    
    log(colors.blue, 'Enviando requisição...');
    log(colors.blue, JSON.stringify(payload, null, 2));
    
    const { status, data } = await makeRequest('/api/ia-analisar-mercado', 'POST', payload);
    
    if (status === 200 && data.success) {
      log(colors.green, '✅ Endpoint /api/ia-analisar-mercado funcionando');
      log(colors.blue, '\nDados retornados:');
      log(colors.blue, `   Resumo: ${data.data.resumo.substring(0, 100)}...`);
      log(colors.blue, `   Oportunidades: ${data.data.oportunidades.length} itens`);
      log(colors.blue, `   Riscos: ${data.data.riscos.length} itens`);
      log(colors.blue, `   Tendências: ${data.data.tendencias.length} itens`);
      log(colors.blue, `\n   Tokens: ${data.usage.tokens}`);
      log(colors.blue, `   Custo: $${data.usage.custo}`);
      log(colors.blue, `   Duração: ${data.usage.duracao}ms`);
      return true;
    } else {
      log(colors.red, '❌ Erro no endpoint:', data);
      return false;
    }
  } catch (error) {
    log(colors.red, '❌ Erro ao testar endpoint:', error.message);
    return false;
  }
}

// 5. Testar endpoint de sugestões
async function testSugestoesEndpoint() {
  log(colors.cyan, '\n💡 TESTANDO ENDPOINT DE SUGESTÕES...\n');
  
  try {
    const users = await sql`
      SELECT id FROM user_profiles 
      WHERE email IN ('sandrodireto@gmail.com', 'cmbusso@gmail.com')
      LIMIT 1
    `;
    
    if (users.length === 0) {
      log(colors.yellow, '⚠️  Nenhum usuário admin encontrado, pulando teste');
      return false;
    }
    
    const userId = users[0].id;
    
    const payload = {
      userId,
      entidadeId: 999,
      entidade: {
        nome: 'Empresa Alpha',
        tipo: 'lead',
        setor: 'Tecnologia',
        porte: 'Médio',
        score: 7,
      },
    };
    
    log(colors.blue, 'Enviando requisição...');
    log(colors.blue, JSON.stringify(payload, null, 2));
    
    const { status, data } = await makeRequest('/api/ia-sugestoes', 'POST', payload);
    
    if (status === 200 && data.success) {
      log(colors.green, '✅ Endpoint /api/ia-sugestoes funcionando');
      log(colors.blue, '\nDados retornados:');
      log(colors.blue, `   Sugestões: ${data.data.sugestoes.length} ações`);
      data.data.sugestoes.slice(0, 3).forEach((sug, i) => {
        log(colors.blue, `   ${i + 1}. ${sug.acao} (${sug.prioridade}, ${sug.prazo})`);
      });
      log(colors.blue, `\n   Tokens: ${data.usage.tokens}`);
      log(colors.blue, `   Custo: $${data.usage.custo}`);
      log(colors.blue, `   Duração: ${data.usage.duracao}ms`);
      return true;
    } else {
      log(colors.red, '❌ Erro no endpoint:', data);
      return false;
    }
  } catch (error) {
    log(colors.red, '❌ Erro ao testar endpoint:', error.message);
    return false;
  }
}

// 6. Verificar registros de uso
async function checkUsageRecords() {
  log(colors.cyan, '\n📝 VERIFICANDO REGISTROS DE USO...\n');
  
  try {
    const records = await sql`
      SELECT 
        processo,
        COUNT(*) as total,
        SUM(total_tokens) as tokens,
        SUM(custo) as custo
      FROM ia_usage
      WHERE created_at >= NOW() - INTERVAL '1 hour'
      GROUP BY processo
      ORDER BY total DESC
    `;
    
    if (records.length > 0) {
      log(colors.green, '✅ Registros de uso encontrados (última hora):');
      records.forEach(r => {
        log(colors.blue, `   ${r.processo}: ${r.total} chamadas, ${r.tokens} tokens, $${Number(r.custo).toFixed(4)}`);
      });
      return true;
    } else {
      log(colors.yellow, '⚠️  Nenhum registro de uso na última hora');
      return false;
    }
  } catch (error) {
    log(colors.red, '❌ Erro ao verificar registros:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  log(colors.cyan, '\n╔════════════════════════════════════════╗');
  log(colors.cyan, '║   TESTE COMPLETO DAS APIs DE IA       ║');
  log(colors.cyan, '╚════════════════════════════════════════╝');
  
  const results = {
    database: false,
    stats: false,
    enriquecimento: false,
    analise: false,
    sugestoes: false,
    usage: false,
  };
  
  // 1. Verificar banco
  results.database = await checkDatabase();
  if (!results.database) {
    log(colors.red, '\n❌ Banco de dados não está configurado corretamente');
    log(colors.yellow, '\n💡 Execute o script de setup do banco primeiro:');
    log(colors.yellow, '   node setup-ia-database.mjs');
    await sql.end();
    process.exit(1);
  }
  
  // 2. Testar estatísticas
  results.stats = await testStatsEndpoint();
  
  // 3. Testar enriquecimento
  results.enriquecimento = await testEnriquecimentoEndpoint();
  
  // 4. Testar análise
  results.analise = await testAnaliseEndpoint();
  
  // 5. Testar sugestões
  results.sugestoes = await testSugestoesEndpoint();
  
  // 6. Verificar registros
  results.usage = await checkUsageRecords();
  
  // Resumo final
  log(colors.cyan, '\n╔════════════════════════════════════════╗');
  log(colors.cyan, '║         RESUMO DOS TESTES             ║');
  log(colors.cyan, '╚════════════════════════════════════════╝\n');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? colors.green : colors.red;
    log(color, `${icon} ${test.toUpperCase()}`);
  });
  
  log(colors.cyan, `\n📊 Resultado: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    log(colors.green, '\n🎉 TODOS OS TESTES PASSARAM!');
  } else {
    log(colors.yellow, '\n⚠️  Alguns testes falharam. Verifique os logs acima.');
  }
  
  await sql.end();
}

// Executar
runAllTests().catch(error => {
  log(colors.red, '\n❌ Erro fatal:', error);
  sql.end();
  process.exit(1);
});
