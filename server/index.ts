/**
 * Server Principal
 * FASE 1 - Sessão 1.4: Rate Limiting aplicado
 */

import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers';
import { createContext } from './context';
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
    createContext,
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
