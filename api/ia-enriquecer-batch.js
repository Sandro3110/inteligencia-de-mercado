// api/ia-enriquecer-batch.js - Batch processing com proteções de qualidade
import postgres from 'postgres';
import { verificarSeguranca, registrarAuditoria } from './lib/security.js';gres';

// Processar em lotes com pausa
async function processarEmLotes(empresas, batchSize = 3) {
  const resultados = [];
  
  for (let i = 0; i < empresas.length; i += batchSize) {
    const batch = empresas.slice(i, i + batchSize);
    
    console.log(`[Batch ${Math.floor(i / batchSize) + 1}] Processando ${batch.length} empresas...`);
    
    // Processar lote em paralelo (cada uma com chamada independente)
    const batchResults = await Promise.allSettled(
      batch.map(empresa => enriquecerEmpresa(empresa))
    );
    
    resultados.push(...batchResults);
    
    // Pausa de 1s entre lotes (evita rate limit + melhora qualidade)
    if (i + batchSize < empresas.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return resultados;
}

// Enriquecer uma empresa (chamada independente)
async function enriquecerEmpresa(empresa) {
  const response = await fetch(`${process.env.VERCEL_URL || 'https://www.intelmarket.app'}/api/ia-enriquecer-completo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empresa)
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao enriquecer ${empresa.nome}`);
  }
  
  return await response.json();
}

// Validar similaridade entre resultados
function validarSimilaridade(resultados) {
  const avisos = [];
  
  for (let i = 0; i < resultados.length; i++) {
    if (resultados[i].status !== 'fulfilled') continue;
    
    const dados1 = resultados[i].value?.data;
    if (!dados1) continue;
    
    for (let j = i + 1; j < resultados.length; j++) {
      if (resultados[j].status !== 'fulfilled') continue;
      
      const dados2 = resultados[j].value?.data;
      if (!dados2) continue;
      
      // Verificar se produtos são muito similares
      const produtos1 = dados1.produtos?.map(p => p.nome).join(',') || '';
      const produtos2 = dados2.produtos?.map(p => p.nome).join(',') || '';
      
      if (produtos1 && produtos2 && produtos1 === produtos2) {
        avisos.push({
          tipo: 'produtos_identicos',
          empresas: [i, j],
          detalhes: 'Produtos idênticos detectados'
        });
      }
    }
  }
  
  return avisos;
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
  const startTime = Date.now();
  let user;

  try {
    // 🔒 MIDDLEWARE DE SEGURANÇA
    user = await verificarSeguranca(req, client, {
      rateLimit: 3,   // 3 chamadas (muito restritivo - batch)
      janela: 60      // por minuto
    });
    const { empresas } = req.body;

    if (!empresas || !Array.isArray(empresas) || empresas.length === 0) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: empresas (array)' });
    }

    if (empresas.length > 50) {
      return res.status(400).json({ error: 'Máximo de 50 empresas por lote' });
    }

    const startTime = Date.now();

    // Processar em lotes de 3 (proteção de qualidade)
    const resultados = await processarEmLotes(empresas, 3);

    // Validar similaridade
    const avisos = validarSimilaridade(resultados);

    const duration = Date.now() - startTime;

    // Contar sucessos e falhas
    const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
    const falhas = resultados.filter(r => r.status === 'rejected').length;

    // ✅ REGISTRAR AUDITORIA DE SUCESSO
    await registrarAuditoria({
      userId: user.userId,
      action: 'enriquecer_batch',
      endpoint: req.url,
      metodo: 'POST',
      parametros: { total: empresas.length },
      resultado: 'sucesso',
      duracao: Date.now() - startTime,
      custo: 0,
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    }, client);
    
    await client.end();

    return res.json({
      success: true,
      summary: {
        total: empresas.length,
        sucessos,
        falhas,
        duration,
        avisos: avisos.length
      },
      resultados: resultados.map((r, i) => ({
        empresa: empresas[i].nome,
        status: r.status,
        data: r.status === 'fulfilled' ? r.value : null,
        error: r.status === 'rejected' ? r.reason.message : null
      })),
      avisos
    });

  } catch (error) {
    console.error('[Batch] Erro:', error);
    
    // ❌ REGISTRAR AUDITORIA DE ERRO
    try {
      await registrarAuditoria({
        userId: user?.userId || 'unknown',
        action: 'enriquecer_batch',
        endpoint: req.url,
        metodo: 'POST',
        resultado: error.message.includes('Rate limit') ? 'bloqueado' : 'erro',
        erro: error.message,
        duracao: Date.now() - startTime,
        custo: 0,
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      }, client);
    } catch (e) {
      console.error('[Batch] Erro ao registrar auditoria:', e);
    }
    
    await client.end();
    
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente em alguns minutos.'
      });
    }
    
    if (error.message.includes('bloqueado')) {
      return res.status(403).json({
        success: false,
        error: 'Usuário bloqueado temporariamente.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
