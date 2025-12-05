/**
 * Server Principal
 * FASE 1 - Sessão 1.4: Rate Limiting aplicado
 */

import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers';
import { createExpressContext } from './context';
import { connectRedis, disconnectRedis } from './lib/redis';
import { generalRateLimiter } from './middleware/rateLimit';

const app = express();
const port = process.env.PORT || 3000;

// Middleware de parsing
app.use(express.json());

// Rate Limiting Geral
// Aplica em todas as rotas
app.use(generalRateLimiter);

// TRPC middleware
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: createExpressContext,
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    redis: process.env.REDIS_URL ? 'configured' : 'not configured'
  });
});

// Endpoint REST para página de enriquecimento
// Retorna entidades não enriquecidas
app.get('/api/entidades', async (req, res) => {
  try {
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    
    const result = await db.execute(sql`
      SELECT 
        id,
        nome,
        cnpj,
        tipo_entidade,
        CASE WHEN enriquecido_em IS NOT NULL THEN true ELSE false END as enriquecida
      FROM dim_entidade
      WHERE enriquecido_em IS NULL
      ORDER BY created_at DESC
      LIMIT 100
    `);
    
    res.json({ entidades: result.rows });
  } catch (error) {
    console.error('Erro ao buscar entidades:', error);
    res.status(500).json({ error: 'Erro ao buscar entidades' });
  }
});

// Conectar ao Redis antes de iniciar o servidor
connectRedis()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📡 TRPC endpoint: http://localhost:${port}/api/trpc`);
      console.log(`🛡️  Rate limiting: ${process.env.REDIS_URL ? 'Redis' : 'Memory'}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM recebido, encerrando...');
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⏳ SIGINT recebido, encerrando...');
  await disconnectRedis();
  process.exit(0);
});
