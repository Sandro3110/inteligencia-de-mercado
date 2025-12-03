// api/ia-enriquecer-completo.js - Enriquecimento completo em uma operação
// Gera: Cliente + Mercado + Produtos + Concorrentes + Leads
import OpenAI from 'openai';
import postgres from 'postgres';
import { gerarCacheKey, getCache, saveCache } from './lib/cache.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_COSTS = {
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.60,
  },
};

function calculateCost(model, inputTokens, outputTokens) {
  const costs = MODEL_COSTS[model];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const client = postgres(process.env.DATABASE_URL);

  try {
    const { userId, entidadeId, nome, cnpj, cidade, uf } = req.body;

    if (!userId || !entidadeId || !nome) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: userId, entidadeId, nome' });
    }

    const startTime = Date.now();

    // Verificar cache
    const cacheKey = gerarCacheKey('enriquecimento_completo', nome);
    const cached = await getCache(client, cacheKey);
    
    if (cached) {
      console.log(`[Cache HIT] ${nome}`);
      await client.end();
      return res.json({
        success: true,
        cached: true,
        data: cached,
        usage: { cacheHit: true }
      });
    }

    // Buscar usuário
    let [user] = await client`SELECT name, email FROM users WHERE id = ${userId}`;
    if (!user && userId.includes('@')) {
      [user] = await client`SELECT name, email FROM users WHERE email = ${userId}`;
    }
    if (!user) {
      await client.end();
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const userName = user.name || user.email;

    // Chamar endpoint de enriquecimento original (reutilizar lógica)
    const enrichResponse = await fetch(`${process.env.VERCEL_URL || 'https://www.intelmarket.app'}/api/ia-enriquecer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, entidadeId, nome, cnpj, cidade, uf })
    });

    if (!enrichResponse.ok) {
      throw new Error('Erro no enriquecimento básico');
    }

    const enrichData = await enrichResponse.json();

    // Gerar concorrentes
    const concorrentesResponse = await fetch(`${process.env.VERCEL_URL || 'https://www.intelmarket.app'}/api/ia-gerar-concorrentes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        entidadeId,
        nome,
        mercado: enrichData.data.mercado.nome,
        produtos: enrichData.data.produtos,
        cidade,
        uf
      })
    });

    const concorrentesData = concorrentesResponse.ok ? await concorrentesResponse.json() : { data: [] };

    // Gerar leads
    const leadsResponse = await fetch(`${process.env.VERCEL_URL || 'https://www.intelmarket.app'}/api/ia-gerar-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        entidadeId,
        nome,
        mercado: enrichData.data.mercado.nome,
        produtos: enrichData.data.produtos,
        concorrentes: concorrentesData.data,
        cidade,
        uf
      })
    });

    const leadsData = leadsResponse.ok ? await leadsResponse.json() : { data: [] };

    const duration = Date.now() - startTime;

    // Consolidar resultado
    const resultado = {
      cliente: enrichData.data.cliente,
      mercado: enrichData.data.mercado,
      produtos: enrichData.data.produtos,
      concorrentes: concorrentesData.data || [],
      leads: leadsData.data || []
    };

    // Salvar no cache (30 dias)
    await saveCache(client, cacheKey, 'enriquecimento_completo', resultado, 30);

    // Atualizar flag de cache na entidade
    await client`
      UPDATE dim_entidade
      SET cache_hit = false,
          cache_expires_at = NOW() + INTERVAL '30 days'
      WHERE id = ${entidadeId}
    `;

    await client.end();

    return res.json({
      success: true,
      cached: false,
      data: resultado,
      usage: {
        duration,
        totalRecords: 1 + 1 + (resultado.produtos?.length || 0) + (resultado.concorrentes?.length || 0) + (resultado.leads?.length || 0)
      }
    });

  } catch (error) {
    console.error('[Enriquecimento Completo] Erro:', error);
    await client.end();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
