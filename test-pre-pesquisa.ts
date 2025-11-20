/**
 * Script de Teste: Pré-Pesquisa com OpenAI
 * 
 * Testa a integração com OpenAI para buscar e estruturar dados de empresas
 * a partir de inputs simples (nome ou site).
 */

import { invokeLLM } from './server/_core/llm';

// Schema esperado do output
interface EmpresaInfo {
  nome: string | null;
  cnpj: string | null;
  site: string | null;
  produto: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  segmentacao: string | null;
  porte: string | null;
}

/**
 * Função de pré-pesquisa que será integrada ao sistema
 */
async function prePesquisa(query: string): Promise<EmpresaInfo> {
  console.log(`\n🔍 Pesquisando: "${query}"`);
  console.log('─'.repeat(80));

  const prompt = `
Você é um assistente de pesquisa de mercado especializado em encontrar informações públicas sobre empresas brasileiras.

INPUT: "${query}"

Sua tarefa é pesquisar informações públicas sobre esta empresa e retornar dados estruturados no formato JSON.

INSTRUÇÕES:
1. Se o input for apenas um nome, busque informações sobre a empresa com esse nome
2. Se o input for um site, busque informações sobre a empresa dona desse site
3. Priorize informações oficiais e confiáveis
4. Se não encontrar alguma informação, retorne null para aquele campo
5. Para CNPJ, use o formato XX.XXX.XXX/XXXX-XX
6. Para telefone, use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
7. Para UF, use a sigla de 2 letras (ex: SP, RJ, MG)
8. Para segmentação, classifique como "B2B", "B2C" ou "B2B/B2C"
9. Para porte, classifique como "MEI", "Micro", "Pequeno", "Médio" ou "Grande"

CAMPOS OBRIGATÓRIOS:
- nome: Nome oficial da empresa
- produto: Produto ou serviço principal oferecido

CAMPOS OPCIONAIS (retorne null se não encontrar):
- cnpj: CNPJ no formato XX.XXX.XXX/XXXX-XX
- site: URL do site oficial (com https://)
- cidade: Cidade da sede
- uf: Estado da sede (sigla de 2 letras)
- telefone: Telefone de contato
- email: Email de contato
- segmentacao: B2B, B2C ou B2B/B2C
- porte: MEI, Micro, Pequeno, Médio ou Grande

Retorne APENAS o JSON, sem texto adicional.
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de pesquisa de mercado especializado em encontrar informações públicas sobre empresas brasileiras. Sempre retorne dados estruturados em JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'empresa_info',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              nome: { type: 'string', nullable: true },
              cnpj: { type: 'string', nullable: true },
              site: { type: 'string', nullable: true },
              produto: { type: 'string', nullable: true },
              cidade: { type: 'string', nullable: true },
              uf: { type: 'string', nullable: true },
              telefone: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true },
              segmentacao: { type: 'string', nullable: true },
              porte: { type: 'string', nullable: true }
            },
            required: ['nome', 'cnpj', 'site', 'produto', 'cidade', 'uf', 'telefone', 'email', 'segmentacao', 'porte'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI retornou resposta vazia');
    }

    const data: EmpresaInfo = JSON.parse(content);

    console.log('\n✅ Dados encontrados:');
    console.log(JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('\n❌ Erro na pré-pesquisa:', error);
    throw error;
  }
}

/**
 * Valida os dados retornados pela IA
 */
function validarDados(data: EmpresaInfo): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!data.nome || data.nome.length < 3) {
    erros.push('Nome inválido ou muito curto');
  }

  // Validação de CNPJ (formato)
  if (data.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)) {
    erros.push(`CNPJ em formato inválido: ${data.cnpj}`);
  }

  // Validação de URL
  if (data.site && !data.site.startsWith('http')) {
    erros.push(`Site sem protocolo http/https: ${data.site}`);
  }

  // Validação de UF
  if (data.uf && data.uf.length !== 2) {
    erros.push(`UF inválida (deve ter 2 letras): ${data.uf}`);
  }

  // Validação de segmentação
  if (data.segmentacao && !['B2B', 'B2C', 'B2B/B2C'].includes(data.segmentacao)) {
    erros.push(`Segmentação inválida: ${data.segmentacao}`);
  }

  // Validação de porte
  const portesValidos = ['MEI', 'Micro', 'Pequeno', 'Médio', 'Grande'];
  if (data.porte && !portesValidos.includes(data.porte)) {
    erros.push(`Porte inválido: ${data.porte}`);
  }

  // Regra de negócio: CNPJ OU Site obrigatório
  if (!data.cnpj && !data.site) {
    erros.push('CNPJ ou Site deve ser fornecido (pelo menos um dos dois)');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * Exibe resultado da validação
 */
function exibirValidacao(data: EmpresaInfo) {
  console.log('\n📋 Validação dos Dados:');
  console.log('─'.repeat(80));

  const { valido, erros } = validarDados(data);

  if (valido) {
    console.log('✅ Todos os dados são válidos!');
  } else {
    console.log('❌ Erros encontrados:');
    erros.forEach((erro, index) => {
      console.log(`  ${index + 1}. ${erro}`);
    });
  }

  // Calcular completude dos dados
  const campos = Object.keys(data) as (keyof EmpresaInfo)[];
  const camposPreenchidos = campos.filter(campo => data[campo] !== null && data[campo] !== '').length;
  const completude = Math.round((camposPreenchidos / campos.length) * 100);

  console.log(`\n📊 Completude dos dados: ${camposPreenchidos}/${campos.length} campos (${completude}%)`);
  console.log('─'.repeat(80));
}

/**
 * Executa os testes
 */
async function executarTestes() {
  console.log('\n🧪 TESTE DE PRÉ-PESQUISA COM OPENAI');
  console.log('═'.repeat(80));

  const casosDeTeste = [
    'cooperativa de insumos de holambra',
    'carga pesada distribuidora'
  ];

  const resultados: Array<{ query: string; data: EmpresaInfo | null; erro: string | null }> = [];

  for (let i = 0; i < casosDeTeste.length; i++) {
    const query = casosDeTeste[i];

    console.log(`\n\n📝 TESTE ${i + 1} de ${casosDeTeste.length}`);
    console.log('═'.repeat(80));

    try {
      const data = await prePesquisa(query);
      exibirValidacao(data);
      resultados.push({ query, data, erro: null });
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ Teste falhou: ${mensagemErro}`);
      resultados.push({ query, data: null, erro: mensagemErro });
    }

    // Aguardar 2 segundos entre testes para evitar rate limit
    if (i < casosDeTeste.length - 1) {
      console.log('\n⏳ Aguardando 2 segundos antes do próximo teste...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Resumo final
  console.log('\n\n📊 RESUMO DOS TESTES');
  console.log('═'.repeat(80));

  const testesComSucesso = resultados.filter(r => r.data !== null).length;
  const testesFalhados = resultados.filter(r => r.erro !== null).length;

  console.log(`✅ Testes com sucesso: ${testesComSucesso}/${casosDeTeste.length}`);
  console.log(`❌ Testes falhados: ${testesFalhados}/${casosDeTeste.length}`);

  console.log('\n📋 Detalhes:');
  resultados.forEach((resultado, index) => {
    console.log(`\n${index + 1}. "${resultado.query}"`);
    if (resultado.data) {
      console.log(`   ✅ Sucesso - Nome: ${resultado.data.nome}`);
      console.log(`   📍 Localização: ${resultado.data.cidade || '?'} - ${resultado.data.uf || '?'}`);
      console.log(`   🏢 CNPJ: ${resultado.data.cnpj || 'Não encontrado'}`);
      console.log(`   🌐 Site: ${resultado.data.site || 'Não encontrado'}`);
      console.log(`   📦 Produto: ${resultado.data.produto || 'Não encontrado'}`);
      
      const { valido, erros } = validarDados(resultado.data);
      if (!valido) {
        console.log(`   ⚠️  Avisos de validação: ${erros.join(', ')}`);
      }
    } else {
      console.log(`   ❌ Falhou - ${resultado.erro}`);
    }
  });

  console.log('\n═'.repeat(80));
  console.log('🏁 Testes concluídos!\n');
}

// Executar testes
executarTestes().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
