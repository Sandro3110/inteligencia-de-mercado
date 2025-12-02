/**
 * Vercel Serverless Function - tRPC Handler
 * Ponto único de entrada para todas as chamadas tRPC
 */

// Importar dependências necessárias
const { createHTTPServer } = require('@trpc/server/adapters/standalone');
const { appRouter } = require('../server/routers/index.js');
const { createContext } = require('../server/context.js');

// Handler principal
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
    // Por enquanto, retornar mock data para o dashboard
    // TODO: Implementar integração completa com tRPC
    
    const path = req.url.replace('/api/trpc/', '');
    
    // Mock response para dashboard
    if (path.includes('dashboard')) {
      res.status(200).json({
        result: {
          data: {
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
          }
        }
      });
      return;
    }

    // Para outras rotas, retornar resposta genérica
    res.status(200).json({
      result: {
        data: {
          message: 'tRPC endpoint - Em desenvolvimento',
          path: path,
          timestamp: new Date().toISOString()
        }
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
