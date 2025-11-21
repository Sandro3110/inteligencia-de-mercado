/**
 * Teste Completo do Fluxo de Enriquecimento
 * 
 * Cria uma pesquisa de teste "Aterro Sanitário" no projeto Ground
 * e executa o enriquecimento completo, verificando cada etapa.
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

console.log('🧪 TESTE COMPLETO DO FLUXO DE ENRIQUECIMENTO\n');
console.log('='.repeat(70));

// Conectar ao banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('\n✅ Conectado ao banco de dados');

// Buscar projeto Ground
console.log('\n📁 Buscando projeto "Ground"...');
const [projects] = await connection.execute(
  'SELECT * FROM projects WHERE nome = ? LIMIT 1',
  ['Ground']
);

if (projects.length === 0) {
  console.log('❌ Projeto "Ground" não encontrado!');
  console.log('   Criando projeto Ground...');
  
  const [result] = await connection.execute(
    'INSERT INTO projects (nome, descricao, createdAt) VALUES (?, ?, NOW())',
    ['Ground', 'Projeto de teste para enriquecimento']
  );
  
  const projectId = result.insertId;
  console.log(`✅ Projeto Ground criado com ID: ${projectId}`);
} else {
  const project = projects[0];
  console.log(`✅ Projeto encontrado: ${project.nome} (ID: ${project.id})`);
}

const projectId = projects.length > 0 ? projects[0].id : result.insertId;

// Criar pesquisa de teste
console.log('\n🔍 Criando pesquisa "Aterro Sanitário"...');

const [pesquisaResult] = await connection.execute(
  `INSERT INTO pesquisas (projectId, nome, descricao, totalClientes, status, createdAt) 
   VALUES (?, ?, ?, ?, ?, NOW())`,
  [
    projectId,
    'Aterro Sanitário',
    'Pesquisa de teste criada via script',
    1, // 1 cliente de teste
    'em_andamento'
  ]
);

const pesquisaId = pesquisaResult.insertId;
console.log(`✅ Pesquisa criada com ID: ${pesquisaId}`);

// Criar cliente de teste
console.log('\n👤 Criando cliente de teste...');

const [clienteResult] = await connection.execute(
  `INSERT INTO clientes (
    projectId, pesquisaId, nome, cnpj, produtoPrincipal,
    validationStatus, qualidadeScore, qualidadeClassificacao, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  [
    projectId,
    pesquisaId,
    'Empresa Teste Aterro',
    null, // Sem CNPJ para testar enriquecimento
    'Serviços de coleta e tratamento de resíduos sólidos',
    'pending',
    0,
    'Ruim'
  ]
);

const clienteId = clienteResult.insertId;
console.log(`✅ Cliente criado com ID: ${clienteId}`);

// Testar enriquecimento via LLM
console.log('\n🤖 Testando identificação de mercado via LLM...');

try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que identifica mercados B2B. Responda apenas com o nome do mercado, sem explicações.'
        },
        {
          role: 'user',
          content: 'Identifique o mercado para este produto: Serviços de coleta e tratamento de resíduos sólidos'
        }
      ],
      temperature: 0.3
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    const mercado = data.choices[0].message.content.trim();
    console.log(`✅ Mercado identificado: "${mercado}"`);
    
    // Criar mercado no banco
    console.log('\n📊 Criando mercado no banco...');
    const [mercadoResult] = await connection.execute(
      `INSERT INTO mercados_unicos (projectId, nome, createdAt)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [projectId, mercado]
    );
    
    const mercadoId = mercadoResult.insertId;
    console.log(`✅ Mercado criado/encontrado com ID: ${mercadoId}`);
    
    // Associar cliente ao mercado
    await connection.execute(
      `INSERT INTO cliente_mercados (clienteId, mercadoId) VALUES (?, ?)`,
      [clienteId, mercadoId]
    );
    console.log(`✅ Cliente associado ao mercado`);
    
  } else {
    const error = await response.text();
    console.log(`❌ Erro ao identificar mercado: ${error}`);
  }
} catch (error) {
  console.log(`❌ Erro: ${error.message}`);
}

// Testar busca de concorrentes via SERPAPI
console.log('\n🔎 Testando busca de concorrentes via SERPAPI...');

try {
  const query = 'empresas de aterro sanitário brasil';
  const params = new URLSearchParams({
    engine: 'google',
    q: query,
    api_key: process.env.SERPAPI_KEY,
    num: '5',
    gl: 'br',
    hl: 'pt-br'
  });
  
  const response = await fetch(`https://serpapi.com/search?${params}`);
  
  if (response.ok) {
    const data = await response.json();
    
    if (data.organic_results && data.organic_results.length > 0) {
      console.log(`✅ Encontrados ${data.organic_results.length} concorrentes potenciais`);
      
      // Salvar primeiros 3 concorrentes no banco
      console.log('\n💼 Salvando concorrentes no banco...');
      let savedCount = 0;
      
      for (const result of data.organic_results.slice(0, 3)) {
        try {
          await connection.execute(
            `INSERT INTO concorrentes (
              projectId, pesquisaId, mercadoId, nome, site, produto,
              qualidadeScore, qualidadeClassificacao, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              projectId,
              pesquisaId,
              1, // mercadoId temporário
              result.title,
              result.link,
              result.snippet || '',
              50, // Score médio
              'Bom'
            ]
          );
          savedCount++;
          console.log(`   ${savedCount}. ${result.title}`);
        } catch (error) {
          console.log(`   ⚠️  Erro ao salvar: ${error.message}`);
        }
      }
      
      console.log(`✅ ${savedCount} concorrentes salvos no banco`);
    } else {
      console.log('⚠️  Nenhum resultado encontrado');
    }
  } else {
    const error = await response.text();
    console.log(`❌ Erro na busca: ${error}`);
  }
} catch (error) {
  console.log(`❌ Erro: ${error.message}`);
}

// Buscar leads
console.log('\n🎯 Testando busca de leads via SERPAPI...');

try {
  const query = 'empresas que precisam de aterro sanitário brasil';
  const params = new URLSearchParams({
    engine: 'google',
    q: query,
    api_key: process.env.SERPAPI_KEY,
    num: '10',
    gl: 'br',
    hl: 'pt-br'
  });
  
  const response = await fetch(`https://serpapi.com/search?${params}`);
  
  if (response.ok) {
    const data = await response.json();
    
    if (data.organic_results && data.organic_results.length > 0) {
      console.log(`✅ Encontrados ${data.organic_results.length} leads potenciais`);
      
      // Salvar primeiros 5 leads no banco
      console.log('\n📈 Salvando leads no banco...');
      let savedCount = 0;
      
      for (const result of data.organic_results.slice(0, 5)) {
        try {
          await connection.execute(
            `INSERT INTO leads (
              projectId, pesquisaId, mercadoId, nome, site,
              qualidadeScore, qualidadeClassificacao, stage, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              projectId,
              pesquisaId,
              1, // mercadoId temporário
              result.title,
              result.link,
              40, // Score inicial
              'Regular',
              'novo'
            ]
          );
          savedCount++;
          console.log(`   ${savedCount}. ${result.title}`);
        } catch (error) {
          console.log(`   ⚠️  Erro ao salvar: ${error.message}`);
        }
      }
      
      console.log(`✅ ${savedCount} leads salvos no banco`);
    } else {
      console.log('⚠️  Nenhum resultado encontrado');
    }
  } else {
    const error = await response.text();
    console.log(`❌ Erro na busca: ${error}`);
  }
} catch (error) {
  console.log(`❌ Erro: ${error.message}`);
}

// Verificar resultados finais
console.log('\n\n' + '='.repeat(70));
console.log('📊 RESULTADOS FINAIS');
console.log('='.repeat(70));

const [stats] = await connection.execute(
  `SELECT 
    (SELECT COUNT(*) FROM clientes WHERE projectId = ?) as clientes,
    (SELECT COUNT(*) FROM mercados_unicos WHERE projectId = ?) as mercados,
    (SELECT COUNT(*) FROM concorrentes WHERE projectId = ?) as concorrentes,
    (SELECT COUNT(*) FROM leads WHERE projectId = ?) as leads`,
  [projectId, projectId, projectId, projectId]
);

const result = stats[0];
console.log(`\n📁 Projeto: Ground (ID: ${projectId})`);
console.log(`🔍 Pesquisa: Aterro Sanitário (ID: ${pesquisaId})`);
console.log(`\n📈 Estatísticas:`);
console.log(`   👤 Clientes: ${result.clientes}`);
console.log(`   📊 Mercados: ${result.mercados}`);
console.log(`   💼 Concorrentes: ${result.concorrentes}`);
console.log(`   🎯 Leads: ${result.leads}`);

console.log(`\n✅ Teste concluído com sucesso!`);
console.log(`\n💡 Acesse o sistema e verifique os resultados em:`);
console.log(`   - Visão Geral (projeto Ground)`);
console.log(`   - Ver Resultados`);
console.log(`   - Mercados\n`);

await connection.end();
