/**
 * Cliente Redis
 * FASE 1 - Sessão 1.4: Rate Limiting
 */

import { createClient } from 'redis';

// URL do Redis (local ou remoto)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Criar cliente Redis
export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      // Reconectar exponencialmente até 30 segundos
      if (retries > 10) {
        console.error('❌ Redis: Máximo de tentativas de reconexão atingido');
        return new Error('Máximo de tentativas atingido');
      }
      const delay = Math.min(retries * 100, 30000);
      console.log(`⏳ Redis: Reconectando em ${delay}ms...`);
      return delay;
    },
  },
});

// Eventos do Redis
redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis: Conectado');
});

redisClient.on('ready', () => {
  console.log('✅ Redis: Pronto para uso');
});

redisClient.on('reconnecting', () => {
  console.log('⏳ Redis: Reconectando...');
});

redisClient.on('end', () => {
  console.log('⚠️  Redis: Conexão encerrada');
});

/**
 * Conectar ao Redis
 * Chame esta função no início da aplicação
 */
export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error);
    // Não lançar erro - aplicação pode funcionar sem Redis
    // (rate limiting será desabilitado)
  }
}

/**
 * Desconectar do Redis
 * Chame esta função ao encerrar a aplicação
 */
export async function disconnectRedis() {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    console.error('❌ Erro ao desconectar do Redis:', error);
  }
}

/**
 * Verificar se Redis está disponível
 */
export function isRedisAvailable(): boolean {
  return redisClient.isOpen && redisClient.isReady;
}

/**
 * Helper: Incrementar contador com TTL
 * Usado para rate limiting manual
 */
export async function incrementWithTTL(
  key: string,
  ttl: number
): Promise<number> {
  const count = await redisClient.incr(key);
  if (count === 1) {
    // Primeira vez, definir TTL
    await redisClient.expire(key, ttl);
  }
  return count;
}

/**
 * Helper: Obter tempo restante até expiração
 */
export async function getTTL(key: string): Promise<number> {
  return await redisClient.ttl(key);
}
