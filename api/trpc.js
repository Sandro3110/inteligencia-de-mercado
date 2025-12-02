/**
 * Vercel Serverless Function - tRPC Handler
 * Conecta ao banco Supabase e retorna dados reais
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { count, eq } from 'drizzle-orm';

// Schema imports (usando require para compatibilidade)
const schema = await import('../drizzle/schema.ts');
const { dimProjeto, dimPesquisa, dimEntidade } = schema;

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
    // Conectar ao banco
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada');
    }

    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    // Extrair path e input da URL
    const url = new URL(req.url, `https://${req.headers.host}`);
    const pathParts = url.pathname.replace('/api/trpc/', '').split('.');
    const router = pathParts[0];
    const procedure = pathParts[1];
    
    console.log(`[tRPC] ${router}.${procedure}`);

    let data = null;

    // PROJETOS
    if (router === 'projetos') {
      if (procedure === 'listAtivos') {
        const result = await db
          .select()
          .from(dimProjeto)
          .where(eq(dimProjeto.status, 'ativo'))
          .limit(100);
        data = result;
      } else if (procedure === 'list') {
        const result = await db
          .select()
          .from(dimProjeto)
          .limit(100);
        data = result;
      }
    }

    // PESQUISAS
    else if (router === 'pesquisas') {
      if (procedure === 'listEmProgresso') {
        const result = await db
          .select()
          .from(dimPesquisa)
          .where(eq(dimPesquisa.status, 'em_progresso'))
          .limit(100);
        data = result;
      } else if (procedure === 'list') {
        const result = await db
          .select()
          .from(dimPesquisa)
          .limit(100);
        data = result;
      }
    }

    // ENTIDADES
    else if (router === 'entidades') {
      if (procedure === 'list') {
        const result = await db
          .select()
          .from(dimEntidade)
          .limit(100);
        data = result;
      }
    }

    // DASHBOARD (agregações)
    else if (router === 'dashboard') {
      if (procedure === 'getDashboardData') {
        // Contar projetos ativos
        const [{ value: totalProjetos }] = await db
          .select({ value: count() })
          .from(dimProjeto)
          .where(eq(dimProjeto.status, 'ativo'));

        // Contar pesquisas em progresso
        const [{ value: totalPesquisas }] = await db
          .select({ value: count() })
          .from(dimPesquisa)
          .where(eq(dimPesquisa.status, 'em_progresso'));

        // Contar entidades
        const [{ value: totalEntidades }] = await db
          .select({ value: count() })
          .from(dimEntidade);

        data = {
          kpis: {
            totalProjetos: totalProjetos || 0,
            totalPesquisas: totalPesquisas || 0,
            totalEntidades: totalEntidades || 0,
            totalClientes: 0,
            totalLeads: 0,
            totalConcorrentes: 0,
            receitaPotencial: 0,
            scoreMedioFit: 0,
            taxaConversao: 0,
            crescimentoMensal: 0
          },
          distribuicao: {
            porTipo: [],
            porSegmento: []
          },
          topMercados: [],
          topRegioes: [],
          atividadesRecentes: []
        };
      }
    }

    // Fechar conexão
    await client.end();

    // Resposta no formato tRPC
    res.status(200).json({
      result: {
        data: data || []
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
