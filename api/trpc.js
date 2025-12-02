/**
 * Vercel Serverless Function - tRPC Handler
 * Router principal para todas as chamadas tRPC
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extrair path e input da URL
    const url = new URL(req.url, `https://${req.headers.host}`);
    const pathParts = url.pathname.replace('/api/trpc/', '').split('.');
    const router = pathParts[0];
    const procedure = pathParts[1];
    
    console.log(`[tRPC] ${router}.${procedure}`);

    // Mock data por router/procedure
    const mockData = getMockData(router, procedure);

    // Resposta no formato tRPC
    res.status(200).json({
      result: {
        data: mockData
      }
    });

  } catch (error) {
    console.error('Erro no handler tRPC:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}

function getMockData(router, procedure) {
  // Projetos
  if (router === 'projetos') {
    if (procedure === 'listAtivos') {
      return [
        {
          id: 1,
          nome: 'Expansão Sudeste',
          descricao: 'Análise de mercado para expansão na região Sudeste',
          status: 'ativo',
          dataInicio: '2025-11-01',
          responsavel: 'João Silva',
          progresso: 65
        },
        {
          id: 2,
          nome: 'Mapeamento Tecnologia',
          descricao: 'Identificação de empresas de tecnologia em SP',
          status: 'ativo',
          dataInicio: '2025-11-15',
          responsavel: 'Maria Santos',
          progresso: 40
        },
        {
          id: 3,
          nome: 'Análise Concorrência',
          descricao: 'Estudo detalhado dos principais concorrentes',
          status: 'ativo',
          dataInicio: '2025-12-01',
          responsavel: 'Pedro Costa',
          progresso: 25
        }
      ];
    }
    
    if (procedure === 'list') {
      return [
        {
          id: 1,
          nome: 'Expansão Sudeste',
          descricao: 'Análise de mercado para expansão na região Sudeste',
          status: 'ativo',
          dataInicio: '2025-11-01',
          responsavel: 'João Silva',
          progresso: 65
        },
        {
          id: 2,
          nome: 'Mapeamento Tecnologia',
          descricao: 'Identificação de empresas de tecnologia em SP',
          status: 'ativo',
          dataInicio: '2025-11-15',
          responsavel: 'Maria Santos',
          progresso: 40
        },
        {
          id: 3,
          nome: 'Análise Concorrência',
          descricao: 'Estudo detalhado dos principais concorrentes',
          status: 'ativo',
          dataInicio: '2025-12-01',
          responsavel: 'Pedro Costa',
          progresso: 25
        },
        {
          id: 4,
          nome: 'Pesquisa Varejo',
          descricao: 'Mapeamento de varejistas no Brasil',
          status: 'concluido',
          dataInicio: '2025-10-01',
          responsavel: 'Ana Lima',
          progresso: 100
        }
      ];
    }
  }

  // Pesquisas
  if (router === 'pesquisas') {
    if (procedure === 'listEmProgresso') {
      return [
        {
          id: 1,
          nome: 'Empresas de TI - São Paulo',
          tipo: 'cnpj',
          status: 'em_progresso',
          dataInicio: '2025-12-01',
          progresso: 45,
          totalEncontrados: 1250
        },
        {
          id: 2,
          nome: 'Startups - Rio de Janeiro',
          tipo: 'cnpj',
          status: 'em_progresso',
          dataInicio: '2025-12-02',
          progresso: 20,
          totalEncontrados: 380
        }
      ];
    }
    
    if (procedure === 'list') {
      return [
        {
          id: 1,
          nome: 'Empresas de TI - São Paulo',
          tipo: 'cnpj',
          status: 'em_progresso',
          dataInicio: '2025-12-01',
          progresso: 45,
          totalEncontrados: 1250
        },
        {
          id: 2,
          nome: 'Startups - Rio de Janeiro',
          tipo: 'cnpj',
          status: 'em_progresso',
          dataInicio: '2025-12-02',
          progresso: 20,
          totalEncontrados: 380
        },
        {
          id: 3,
          nome: 'Indústrias - Minas Gerais',
          tipo: 'cnpj',
          status: 'concluida',
          dataInicio: '2025-11-15',
          progresso: 100,
          totalEncontrados: 890
        }
      ];
    }
  }

  // Entidades
  if (router === 'entidades') {
    if (procedure === 'list') {
      return [
        {
          id: 1,
          nome: 'Tech Solutions LTDA',
          cnpj: '12.345.678/0001-90',
          cidade: 'São Paulo',
          estado: 'SP',
          segmento: 'Tecnologia',
          tipo: 'lead',
          scoreFit: 85
        },
        {
          id: 2,
          nome: 'Digital Corp',
          cnpj: '98.765.432/0001-10',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          segmento: 'Tecnologia',
          tipo: 'cliente',
          scoreFit: 92
        }
      ];
    }
  }

  // Dashboard (fallback)
  return {
    kpis: {
      totalEntidades: 1250,
      totalClientes: 450,
      totalLeads: 680,
      totalConcorrentes: 120,
      receitaPotencial: 125000000,
      scoreMedioFit: 72,
      taxaConversao: 18.5,
      crescimentoMensal: 12.3
    },
    distribuicao: {
      porTipo: [
        { tipo: 'Clientes', valor: 450, percentual: 36 },
        { tipo: 'Leads', valor: 680, percentual: 54.4 },
        { tipo: 'Concorrentes', valor: 120, percentual: 9.6 }
      ],
      porSegmento: [
        { segmento: 'A', valor: 280, percentual: 22.4 },
        { segmento: 'B', valor: 520, percentual: 41.6 },
        { segmento: 'C', valor: 450, percentual: 36 }
      ]
    },
    topMercados: [
      { id: 1, nome: 'Tecnologia', entidades: 380, receita: 45000000 },
      { id: 2, nome: 'Varejo', entidades: 290, receita: 32000000 },
      { id: 3, nome: 'Serviços', entidades: 250, receita: 28000000 },
      { id: 4, nome: 'Indústria', entidades: 180, receita: 15000000 },
      { id: 5, nome: 'Saúde', entidades: 150, receita: 5000000 }
    ],
    topRegioes: [
      { id: 1, cidade: 'São Paulo', estado: 'SP', entidades: 520 },
      { id: 2, cidade: 'Rio de Janeiro', estado: 'RJ', entidades: 280 },
      { id: 3, cidade: 'Belo Horizonte', estado: 'MG', entidades: 180 },
      { id: 4, cidade: 'Curitiba', estado: 'PR', entidades: 120 },
      { id: 5, cidade: 'Porto Alegre', estado: 'RS', entidades: 90 }
    ],
    atividadesRecentes: [
      {
        id: 1,
        tipo: 'novo_lead',
        descricao: 'Novo lead identificado: Tech Solutions LTDA',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 2,
        tipo: 'conversao',
        descricao: 'Lead convertido em cliente: Digital Corp',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 3,
        tipo: 'atualizacao',
        descricao: 'Score atualizado para: Mega Retail SA',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      },
      {
        id: 4,
        tipo: 'importacao',
        descricao: 'Importação concluída: 45 novas entidades',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      },
      {
        id: 5,
        tipo: 'analise',
        descricao: 'Análise de mercado finalizada: Setor Tecnologia',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString()
      }
    ]
  };
}
