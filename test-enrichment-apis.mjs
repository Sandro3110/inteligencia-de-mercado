/**
 * Script de Teste das APIs de Enriquecimento
 * 
 * Testa todas as APIs usadas no processo de enriquecimento:
 * 1. ReceitaWS - Dados de CNPJ
 * 2. SERPAPI - Busca de concorrentes e leads
 * 3. OpenAI/LLM - Identificação de mercados
 */

import 'dotenv/config';

console.log('🔍 TESTE DAS APIs DE ENRIQUECIMENTO\n');
console.log('=' .repeat(60));

// ============================================================================
// TESTE 1: ReceitaWS API
// ============================================================================
console.log('\n📋 TESTE 1: ReceitaWS API');
console.log('-'.repeat(60));

const RECEITAWS_API_KEY = process.env.RECEITAWS_API_KEY;
console.log(`API Key configurada: ${RECEITAWS_API_KEY ? '✅ SIM' : '❌ NÃO'}`);

if (RECEITAWS_API_KEY) {
  try {
    // Testar com CNPJ da Petrobras (exemplo público)
    const cnpjTeste = '33000167000101';
    console.log(`\nTestando CNPJ: ${cnpjTeste}`);
    
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpjTeste}`, {
      headers: {
        'Authorization': `Bearer ${RECEITAWS_API_KEY}`
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ReceitaWS funcionando!');
      console.log(`   Nome: ${data.nome || data.fantasia}`);
      console.log(`   Situação: ${data.situacao}`);
      console.log(`   Município: ${data.municipio}/${data.uf}`);
    } else {
      const error = await response.text();
      console.log('❌ Erro na ReceitaWS:');
      console.log(`   ${error}`);
    }
  } catch (error) {
    console.log('❌ Erro ao testar ReceitaWS:');
    console.log(`   ${error.message}`);
  }
} else {
  console.log('⚠️  Pulando teste - API Key não configurada');
}

// ============================================================================
// TESTE 2: SERPAPI
// ============================================================================
console.log('\n\n🔎 TESTE 2: SERPAPI');
console.log('-'.repeat(60));

const SERPAPI_KEY = process.env.SERPAPI_KEY;
console.log(`API Key configurada: ${SERPAPI_KEY ? '✅ SIM' : '❌ NÃO'}`);

if (SERPAPI_KEY) {
  try {
    const query = 'empresas de aterro sanitário brasil';
    console.log(`\nTestando busca: "${query}"`);
    
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: SERPAPI_KEY,
      num: '5',
      gl: 'br',
      hl: 'pt-br'
    });
    
    const response = await fetch(`https://serpapi.com/search?${params}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SERPAPI funcionando!');
      
      if (data.organic_results && data.organic_results.length > 0) {
        console.log(`   Resultados encontrados: ${data.organic_results.length}`);
        console.log('\n   Primeiros 3 resultados:');
        data.organic_results.slice(0, 3).forEach((result, i) => {
          console.log(`   ${i + 1}. ${result.title}`);
          console.log(`      ${result.link}`);
        });
      } else {
        console.log('   ⚠️  Nenhum resultado orgânico encontrado');
      }
      
      // Verificar créditos
      if (data.search_metadata) {
        console.log(`\n   Tempo de processamento: ${data.search_metadata.total_time_taken}s`);
      }
    } else {
      const error = await response.json();
      console.log('❌ Erro na SERPAPI:');
      console.log(`   ${JSON.stringify(error, null, 2)}`);
    }
  } catch (error) {
    console.log('❌ Erro ao testar SERPAPI:');
    console.log(`   ${error.message}`);
  }
} else {
  console.log('⚠️  Pulando teste - API Key não configurada');
}

// ============================================================================
// TESTE 3: OpenAI/LLM
// ============================================================================
console.log('\n\n🤖 TESTE 3: OpenAI/LLM');
console.log('-'.repeat(60));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;

console.log(`OpenAI API Key: ${OPENAI_API_KEY ? '✅ SIM' : '❌ NÃO'}`);
console.log(`Forge API Key: ${FORGE_API_KEY ? '✅ SIM' : '❌ NÃO'}`);
console.log(`Forge API URL: ${FORGE_API_URL || '❌ NÃO CONFIGURADA'}`);

if (OPENAI_API_KEY) {
  try {
    console.log('\nTestando OpenAI API diretamente...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que identifica mercados. Responda apenas com o nome do mercado.'
          },
          {
            role: 'user',
            content: 'Identifique o mercado para este produto: Serviços de coleta e tratamento de resíduos sólidos'
          }
        ]
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ LLM funcionando!');
      
      if (data.choices && data.choices[0]) {
        const mercado = data.choices[0].message.content;
        console.log(`   Mercado identificado: "${mercado}"`);
      }
      
      if (data.usage) {
        console.log(`\n   Tokens usados: ${data.usage.total_tokens}`);
      }
    } else {
      const error = await response.text();
      console.log('❌ Erro no LLM:');
      console.log(`   ${error}`);
    }
  } catch (error) {
    console.log('❌ Erro ao testar LLM:');
    console.log(`   ${error.message}`);
  }
} else {
  console.log('⚠️  Pulando teste - OpenAI API Key não configurada');
}

// ============================================================================
// RESUMO
// ============================================================================
console.log('\n\n' + '='.repeat(60));
console.log('📊 RESUMO DOS TESTES');
console.log('='.repeat(60));

console.log('\nAPIs Configuradas:');
console.log(`  ReceitaWS: ${RECEITAWS_API_KEY ? '✅' : '❌'}`);
console.log(`  SERPAPI:   ${SERPAPI_KEY ? '✅' : '❌'}`);
console.log(`  OpenAI:    ${OPENAI_API_KEY ? '✅' : '❌'}`);
console.log(`  OpenAI LLM: ${OPENAI_API_KEY ? '✅' : '❌'}`);

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('  1. Se alguma API falhou, verifique as credenciais');
console.log('  2. Se todas passaram, o problema pode estar na lógica de enriquecimento');
console.log('  3. Verifique os logs do servidor durante o enriquecimento');
console.log('  4. Teste o fluxo completo com dados reais\n');
