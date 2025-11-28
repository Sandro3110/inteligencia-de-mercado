import { logger } from '@/lib/logger';

/**
 * Drizzle ORM - Configuração para Vercel Serverless
 *
 * Usa connection pooling otimizado para ambientes serverless.
 * Evita criar múltiplas conexões a cada invocação da função.
 *
 * IMPORTANT: Using PostgreSQL (pgTable) - Fixed 2025-11-28
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';

// Cache global de conexão (persiste entre invocações)
let cachedDb: ReturnType<typeof drizzle> | null = null;
let cachedClient: ReturnType<typeof postgres> | null = null;

/**
 * Obter instância do Drizzle com connection pooling
 */
export async function getServerlessDb() {
  // Retornar conexão em cache se existir
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    // Criar cliente postgres com configurações otimizadas para serverless
    const client = postgres(databaseUrl, {
      // Configurações para serverless
      max: 1, // Máximo 1 conexão por instância serverless
      idle_timeout: 20, // Fechar conexões ociosas após 20s
      connect_timeout: 10, // Timeout de conexão: 10s
      prepare: false, // Desabilitar prepared statements (melhor para serverless)

      // SSL (Supabase requer)
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,

      // Transformações de tipos
      types: {
        // Converter BIGINT para number
        bigint: postgres.BigInt,
      },
    });

    // Criar instância Drizzle
    const db = drizzle(client, { schema, logger: false });

    // Cachear para próximas invocações
    cachedClient = client;
    cachedDb = db;

    logger.debug('[Drizzle] Conexão serverless criada com sucesso');

    return db;
  } catch (error) {
    console.error('[Drizzle] Erro ao criar conexão:', error);
    throw error;
  }
}

/**
 * Fechar conexão (útil para testes)
 */
export async function closeServerlessDb() {
  if (cachedClient) {
    await cachedClient.end();
    cachedClient = null;
    cachedDb = null;
    logger.debug('[Drizzle] Conexão fechada');
  }
}

/**
 * Verificar se conexão está ativa
 */
export function isDbConnected(): boolean {
  return cachedDb !== null && cachedClient !== null;
}
