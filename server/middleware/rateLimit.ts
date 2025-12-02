/**
 * Middleware de Rate Limiting
 * FASE 1 - Sessão 1.4
 * 
 * Protege a aplicação contra:
 * - Ataques de força bruta
 * - Ataques DDoS
 * - Abuso de API
 */

import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient, isRedisAvailable } from '../lib/redis';

/**
 * Rate Limiter Geral
 * 100 requisições por 15 minutos por IP
 * 
 * Protege contra abuso geral da API
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos',
    retryAfter: '15 minutos',
  },
  standardHeaders: true, // Retorna info no `RateLimit-*` headers
  legacyHeaders: false, // Desabilita `X-RateLimit-*` headers
  // Usar Redis se disponível, senão usar memória
  store: isRedisAvailable()
    ? new RedisStore({
        // @ts-expect-error - RedisStore aceita client do redis v5
        client: redisClient,
        prefix: 'rl:general:',
      })
    : undefined,
  // Pular rate limit para usuários autenticados com papel ADMIN
  skip: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userRole === 'admin';
  },
});

/**
 * Rate Limiter para Login
 * 5 tentativas por 15 minutos por IP
 * 
 * Protege contra ataques de força bruta em login
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    error: 'Muitas tentativas de login, tente novamente em 15 minutos',
    retryAfter: '15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisAvailable()
    ? new RedisStore({
        // @ts-expect-error - RedisStore aceita client do redis v5
        client: redisClient,
        prefix: 'rl:login:',
      })
    : undefined,
  // Identificar por IP + email (se fornecido)
  keyGenerator: (req) => {
    const ip = req.ip || 'unknown';
    // @ts-expect-error - body pode conter email
    const email = req.body?.email || '';
    return `${ip}:${email}`;
  },
});

/**
 * Rate Limiter para Criação de Recursos
 * 20 criações por hora por usuário
 * 
 * Protege contra spam de criação de projetos, pesquisas, etc
 */
export const createRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 criações
  message: {
    error: 'Muitas criações em pouco tempo, tente novamente em 1 hora',
    retryAfter: '1 hora',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisAvailable()
    ? new RedisStore({
        // @ts-expect-error - RedisStore aceita client do redis v5
        client: redisClient,
        prefix: 'rl:create:',
      })
    : undefined,
  // Identificar por userId
  keyGenerator: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userId || req.ip || 'unknown';
  },
  // Pular para ADMIN
  skip: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userRole === 'admin';
  },
});

/**
 * Rate Limiter para Importação
 * 5 importações por hora por usuário
 * 
 * Importações são operações pesadas
 */
export const importRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 importações
  message: {
    error: 'Muitas importações em pouco tempo, tente novamente em 1 hora',
    retryAfter: '1 hora',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisAvailable()
    ? new RedisStore({
        // @ts-expect-error - RedisStore aceita client do redis v5
        client: redisClient,
        prefix: 'rl:import:',
      })
    : undefined,
  keyGenerator: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userId || req.ip || 'unknown';
  },
  skip: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userRole === 'admin';
  },
});

/**
 * Rate Limiter para Exportação
 * 10 exportações por hora por usuário
 * 
 * Exportações são operações pesadas
 */
export const exportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 exportações
  message: {
    error: 'Muitas exportações em pouco tempo, tente novamente em 1 hora',
    retryAfter: '1 hora',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisAvailable()
    ? new RedisStore({
        // @ts-expect-error - RedisStore aceita client do redis v5
        client: redisClient,
        prefix: 'rl:export:',
      })
    : undefined,
  keyGenerator: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userId || req.ip || 'unknown';
  },
  skip: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userRole === 'admin';
  },
});

/**
 * Rate Limiter para Enriquecimento
 * 50 enriquecimentos por hora por usuário
 * 
 * Enriquecimento consome APIs externas
 */
export const enrichmentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 enriquecimentos
  message: {
    error: 'Muitos enriquecimentos em pouco tempo, tente novamente em 1 hora',
    retryAfter: '1 hora',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisAvailable()
    ? new RedisStore({
        // @ts-expect-error - RedisStore aceita client do redis v5
        client: redisClient,
        prefix: 'rl:enrichment:',
      })
    : undefined,
  keyGenerator: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userId || req.ip || 'unknown';
  },
  skip: (req) => {
    // @ts-expect-error - ctx é adicionado pelo tRPC
    return req.ctx?.userRole === 'admin';
  },
});
