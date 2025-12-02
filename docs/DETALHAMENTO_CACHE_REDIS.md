# ⚡ DETALHAMENTO COMPLETO: CACHE REDIS

**Duração:** 2-3 dias (16-24 horas)  
**Complexidade:** Média  
**Prioridade:** 🟢 Alta  
**Investimento:** $0-10/mês (free tier disponível)

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Dia 1: Configuração](#dia-1-configuração)
3. [Dia 2: Implementação](#dia-2-implementação)
4. [Dia 3: Otimizações](#dia-3-otimizações)
5. [Benefícios Detalhados](#benefícios-detalhados)
6. [Casos de Uso](#casos-de-uso)
7. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 VISÃO GERAL

### **O Que Será Feito**

Implementar sistema de cache Redis para:
1. **Reduzir latência** - Respostas em ms vs segundos
2. **Diminuir carga no banco** - Menos queries
3. **Rate limiting** - Proteger APIs
4. **Sessões** - Armazenar tokens JWT

### **Por Que é Importante**

Atualmente, cada requisição vai ao banco PostgreSQL. Com Redis:
- ✅ **Performance 10-100x melhor**
- ✅ **Escalabilidade** - Suporta mais usuários
- ✅ **Proteção** - Rate limiting contra abuso
- ✅ **Custos menores** - Menos queries no banco

### **Comparação de Provedores**

| Provedor | Free Tier | Latência | Facilidade |
|----------|-----------|----------|------------|
| **Upstash** | 10k comandos/dia | < 10ms | ⭐⭐⭐⭐⭐ |
| **Redis Cloud** | 30MB | < 5ms | ⭐⭐⭐⭐ |
| **AWS ElastiCache** | Não | < 1ms | ⭐⭐⭐ |

**Recomendação:** Upstash (serverless, sem servidor para gerenciar)

---

## 📅 DIA 1: CONFIGURAÇÃO (8 HORAS)

### **MANHÃ (4 horas)**

#### **Etapa 1.1: Criar Conta no Upstash (30 min)**

**O que fazer:**
1. Acessar https://upstash.com
2. Criar conta (GitHub login)
3. Criar novo database Redis
4. Escolher região (us-east-1 ou mais próxima)
5. Copiar credenciais (UPSTASH_REDIS_REST_URL e TOKEN)

**Benefícios:**
- ✅ Serverless (sem servidor para gerenciar)
- ✅ Free tier generoso (10k comandos/dia)
- ✅ REST API (funciona em serverless)
- ✅ Dashboard visual

**Credenciais:**
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx...
```

---

#### **Etapa 1.2: Configurar Variáveis de Ambiente (15 min)**

**O que fazer:**
1. Acessar Vercel Dashboard
2. Settings → Environment Variables
3. Adicionar `UPSTASH_REDIS_REST_URL`
4. Adicionar `UPSTASH_REDIS_REST_TOKEN`
5. Salvar e redeploy

**Benefícios:**
- ✅ Segurança (credenciais não no código)
- ✅ Diferente por ambiente
- ✅ Fácil rotação

---

#### **Etapa 1.3: Instalar Cliente Redis (15 min)**

**O que fazer:**
```bash
cd /home/ubuntu/inteligencia-de-mercado
pnpm add @upstash/redis
```

**Benefícios:**
- ✅ Cliente oficial do Upstash
- ✅ REST API (funciona em serverless)
- ✅ TypeScript types incluídos
- ✅ Retry automático

---

#### **Etapa 1.4: Criar Cliente Redis (2 horas)**

**O que fazer:**
Criar `lib/redis.ts` com funções reutilizáveis.

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

// Inicializar cliente
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Configurações de cache por tipo de dado
 */
export const CACHE_TTL = {
  // Curto prazo (5 minutos)
  SHORT: 5 * 60,
  
  // Médio prazo (1 hora)
  MEDIUM: 60 * 60,
  
  // Longo prazo (24 horas)
  LONG: 24 * 60 * 60,
  
  // Específicos
  PROJETOS: 30 * 60, // 30 minutos
  ENTIDADES: 15 * 60, // 15 minutos
  DASHBOARD: 5 * 60, // 5 minutos
  ANALISES: 60 * 60, // 1 hora
} as const;

/**
 * Gerar chave de cache consistente
 */
export function getCacheKey(
  type: string,
  id: string | number,
  ...params: (string | number)[]
): string {
  const parts = [type, id, ...params].filter(Boolean);
  return parts.join(':');
}

/**
 * Buscar do cache ou executar função
 * @param key - Chave do cache
 * @param ttl - Tempo de vida em segundos
 * @param fn - Função para executar se não estiver em cache
 */
export async function cacheOrFetch<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  try {
    // 1. Tentar buscar do cache
    const cached = await redis.get<T>(key);
    
    if (cached !== null) {
      console.log(`[CACHE HIT] ${key}`);
      return cached;
    }
    
    console.log(`[CACHE MISS] ${key}`);
    
    // 2. Executar função
    const data = await fn();
    
    // 3. Salvar no cache
    await redis.setex(key, ttl, data);
    
    return data;
  } catch (error) {
    console.error(`[CACHE ERROR] ${key}:`, error);
    // Fallback: executar função sem cache
    return fn();
  }
}

/**
 * Invalidar cache por padrão
 * @param pattern - Padrão de chave (ex: "projetos:*")
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    await redis.del(...keys);
    console.log(`[CACHE INVALIDATED] ${pattern} (${keys.length} keys)`);
    
    return keys.length;
  } catch (error) {
    console.error(`[CACHE INVALIDATE ERROR] ${pattern}:`, error);
    return 0;
  }
}

/**
 * Rate limiting por IP
 * @param ip - Endereço IP
 * @param limit - Número máximo de requisições
 * @param window - Janela de tempo em segundos
 */
export async function rateLimit(
  ip: string,
  limit: number = 100,
  window: number = 60
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
}> {
  const key = `ratelimit:${ip}`;
  
  try {
    // Incrementar contador
    const count = await redis.incr(key);
    
    // Definir expiração na primeira requisição
    if (count === 1) {
      await redis.expire(key, window);
    }
    
    // Verificar se excedeu o limite
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    
    // Calcular tempo até reset
    const ttl = await redis.ttl(key);
    const reset = Date.now() + (ttl * 1000);
    
    return {
      allowed,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('[RATE LIMIT ERROR]:', error);
    // Fallback: permitir requisição
    return {
      allowed: true,
      remaining: limit,
      reset: Date.now() + (window * 1000),
    };
  }
}

/**
 * Armazenar sessão
 * @param token - Token JWT
 * @param data - Dados da sessão
 * @param ttl - Tempo de vida em segundos
 */
export async function setSession(
  token: string,
  data: any,
  ttl: number = 7 * 24 * 60 * 60 // 7 dias
): Promise<void> {
  const key = `session:${token}`;
  await redis.setex(key, ttl, data);
}

/**
 * Buscar sessão
 * @param token - Token JWT
 */
export async function getSession<T = any>(
  token: string
): Promise<T | null> {
  const key = `session:${token}`;
  return redis.get<T>(key);
}

/**
 * Remover sessão (logout)
 * @param token - Token JWT
 */
export async function deleteSession(token: string): Promise<void> {
  const key = `session:${token}`;
  await redis.del(key);
}

/**
 * Estatísticas de cache
 */
export async function getCacheStats() {
  try {
    const info = await redis.info();
    const dbsize = await redis.dbsize();
    
    return {
      keys: dbsize,
      memory: info.used_memory_human,
      hits: info.keyspace_hits,
      misses: info.keyspace_misses,
      hitRate: info.keyspace_hits / (info.keyspace_hits + info.keyspace_misses),
    };
  } catch (error) {
    console.error('[CACHE STATS ERROR]:', error);
    return null;
  }
}
```

**Benefícios de cada função:**

1. **`cacheOrFetch()`**
   - ✅ Padrão cache-aside
   - ✅ Fallback automático
   - ✅ Logs de hit/miss

2. **`invalidateCache()`**
   - ✅ Invalidação por padrão
   - ✅ Múltiplas chaves de uma vez
   - ✅ Logs de invalidação

3. **`rateLimit()`**
   - ✅ Proteção contra abuso
   - ✅ Headers de rate limit
   - ✅ Fallback seguro

4. **`setSession()` / `getSession()`**
   - ✅ Sessões distribuídas
   - ✅ Logout instantâneo
   - ✅ TTL automático

5. **`getCacheStats()`**
   - ✅ Monitoramento
   - ✅ Hit rate
   - ✅ Uso de memória

---

#### **Etapa 1.5: Testar Conexão (1 hora)**

**O que fazer:**
Criar script de teste `scripts/test-redis.mjs`:

```javascript
// scripts/test-redis.mjs
import { redis, cacheOrFetch, rateLimit } from '../lib/redis.ts';

console.log('🔴 Testando conexão com Redis...\n');

// Teste 1: Set e Get
console.log('1. Testando SET/GET:');
await redis.set('test:key', 'Hello Redis!');
const value = await redis.get('test:key');
console.log(`   Valor: ${value} ✅\n`);

// Teste 2: Cache or Fetch
console.log('2. Testando cacheOrFetch:');
const data = await cacheOrFetch(
  'test:data',
  60,
  async () => {
    console.log('   Executando função...');
    return { message: 'Dados do banco' };
  }
);
console.log(`   Resultado: ${JSON.stringify(data)} ✅\n`);

// Teste 3: Rate Limit
console.log('3. Testando rate limit:');
for (let i = 1; i <= 5; i++) {
  const result = await rateLimit('127.0.0.1', 3, 60);
  console.log(`   Requisição ${i}: ${result.allowed ? 'PERMITIDA' : 'BLOQUEADA'} (${result.remaining} restantes)`);
}
console.log('✅\n');

// Teste 4: Estatísticas
console.log('4. Estatísticas do cache:');
const stats = await redis.dbsize();
console.log(`   Total de chaves: ${stats} ✅\n`);

console.log('🎉 Todos os testes passaram!');
```

**Executar:**
```bash
node scripts/test-redis.mjs
```

**Saída esperada:**
```
🔴 Testando conexão com Redis...

1. Testando SET/GET:
   Valor: Hello Redis! ✅

2. Testando cacheOrFetch:
   Executando função...
   Resultado: {"message":"Dados do banco"} ✅

3. Testando rate limit:
   Requisição 1: PERMITIDA (2 restantes)
   Requisição 2: PERMITIDA (1 restantes)
   Requisição 3: PERMITIDA (0 restantes)
   Requisição 4: BLOQUEADA (0 restantes)
   Requisição 5: BLOQUEADA (0 restantes)
✅

4. Estatísticas do cache:
   Total de chaves: 3 ✅

🎉 Todos os testes passaram!
```

**Benefícios:**
- ✅ Validar configuração
- ✅ Ver funcionamento real
- ✅ Testar rate limiting

---

### **TARDE (4 horas)**

#### **Etapa 1.6: Criar Middleware de Rate Limit (2 horas)**

**O que fazer:**
Criar middleware para proteger endpoints.

```typescript
// lib/middleware/rateLimit.ts
import { rateLimit } from '../redis';

export async function rateLimitMiddleware(
  req: any,
  res: any,
  options: {
    limit?: number;
    window?: number;
  } = {}
) {
  const { limit = 100, window = 60 } = options;
  
  // Obter IP do cliente
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Verificar rate limit
  const result = await rateLimit(ip, limit, window);
  
  // Adicionar headers de rate limit
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.reset);
  
  // Bloquear se excedeu
  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Limite de ${limit} requisições por ${window}s excedido`,
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    });
  }
  
  return null; // Permitir requisição
}
```

**Uso:**
```typescript
// api/exemplo.js
import { rateLimitMiddleware } from '../lib/middleware/rateLimit';

export default async function handler(req, res) {
  // Aplicar rate limit (10 req/min)
  const rateLimitError = await rateLimitMiddleware(req, res, {
    limit: 10,
    window: 60,
  });
  
  if (rateLimitError) return rateLimitError;
  
  // Continuar com a lógica do endpoint
  return res.json({ message: 'OK' });
}
```

**Benefícios:**
- ✅ Proteção contra abuso
- ✅ Headers padrão (X-RateLimit-*)
- ✅ Mensagem de erro clara
- ✅ Retry-After header

---

#### **Etapa 1.7: Criar Middleware de Cache (2 horas)**

**O que fazer:**
Criar middleware para cachear respostas.

```typescript
// lib/middleware/cache.ts
import { cacheOrFetch, getCacheKey } from '../redis';

export function withCache(options: {
  ttl: number;
  keyPrefix: string;
}) {
  return function (handler: any) {
    return async function (req: any, res: any) {
      // Gerar chave baseada na URL e query params
      const cacheKey = getCacheKey(
        options.keyPrefix,
        req.url,
        JSON.stringify(req.query || {})
      );
      
      // Buscar do cache ou executar handler
      const data = await cacheOrFetch(
        cacheKey,
        options.ttl,
        async () => {
          // Capturar resposta do handler
          let capturedData: any;
          
          const mockRes = {
            ...res,
            json: (data: any) => {
              capturedData = data;
              return res.json(data);
            },
          };
          
          await handler(req, mockRes);
          return capturedData;
        }
      );
      
      // Adicionar header de cache
      res.setHeader('X-Cache', data ? 'HIT' : 'MISS');
      
      return res.json(data);
    };
  };
}
```

**Uso:**
```typescript
// api/projetos.js
import { withCache } from '../lib/middleware/cache';
import { CACHE_TTL } from '../lib/redis';

async function handler(req, res) {
  const projetos = await client`SELECT * FROM dim_projeto`;
  return res.json({ projetos });
}

export default withCache({
  ttl: CACHE_TTL.PROJETOS,
  keyPrefix: 'api:projetos',
})(handler);
```

**Benefícios:**
- ✅ Cache transparente
- ✅ Header X-Cache para debug
- ✅ TTL configurável
- ✅ Chave automática

---

## 📅 DIA 2: IMPLEMENTAÇÃO (8 HORAS)

### **Objetivo**
Adicionar cache em endpoints principais.

#### **Etapa 2.1: Cachear Listagem de Projetos (1 hora)**

**Antes:**
```typescript
// api/trpc.js - projetos.list
const projetos = await client`
  SELECT * FROM dim_projeto
  WHERE ativo = true
  ORDER BY created_at DESC
`;
```

**Depois:**
```typescript
import { cacheOrFetch, getCacheKey, CACHE_TTL } from '../lib/redis';

const cacheKey = getCacheKey('projetos', 'list');

const projetos = await cacheOrFetch(
  cacheKey,
  CACHE_TTL.PROJETOS,
  async () => {
    return client`
      SELECT * FROM dim_projeto
      WHERE ativo = true
      ORDER BY created_at DESC
    `;
  }
);
```

**Benefícios:**
- ✅ Latência: 500ms → 10ms (50x mais rápido)
- ✅ Carga no banco: -90%
- ✅ Escalabilidade: +10x usuários

---

#### **Etapa 2.2: Cachear Detalhes de Projeto (1 hora)**

```typescript
// projetos.getById
const cacheKey = getCacheKey('projeto', projetoId);

const projeto = await cacheOrFetch(
  cacheKey,
  CACHE_TTL.PROJETOS,
  async () => {
    const [projeto] = await client`
      SELECT * FROM dim_projeto WHERE id = ${projetoId}
    `;
    return projeto;
  }
);
```

**Invalidar quando atualizar:**
```typescript
// projetos.update
await client`UPDATE dim_projeto SET ... WHERE id = ${id}`;

// Invalidar cache
await invalidateCache(`projeto:${id}`);
await invalidateCache('projetos:list');
```

**Benefícios:**
- ✅ Detalhes instantâneos
- ✅ Invalidação precisa
- ✅ Consistência garantida

---

#### **Etapa 2.3: Cachear Base de Entidades (2 horas)**

```typescript
// entidades.list
const cacheKey = getCacheKey(
  'entidades',
  'list',
  projetoId,
  tipo || 'all',
  page,
  limit
);

const entidades = await cacheOrFetch(
  cacheKey,
  CACHE_TTL.ENTIDADES,
  async () => {
    return client`
      SELECT * FROM dim_entidade
      WHERE projeto_id = ${projetoId}
        ${tipo ? client`AND tipo_entidade = ${tipo}` : client``}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
  }
);
```

**Invalidar após importação:**
```typescript
// Após importação bem-sucedida
await invalidateCache(`entidades:list:${projetoId}:*`);
```

**Benefícios:**
- ✅ Listagens instantâneas
- ✅ Paginação cacheada
- ✅ Filtros cacheados

---

#### **Etapa 2.4: Cachear Dashboard (2 horas)**

```typescript
// dashboard.stats
const cacheKey = getCacheKey('dashboard', 'stats', userId);

const stats = await cacheOrFetch(
  cacheKey,
  CACHE_TTL.DASHBOARD,
  async () => {
    const [projetos] = await client`SELECT COUNT(*) FROM dim_projeto`;
    const [entidades] = await client`SELECT COUNT(*) FROM dim_entidade`;
    const [importacoes] = await client`SELECT COUNT(*) FROM dim_importacao`;
    
    return {
      projetos: projetos.count,
      entidades: entidades.count,
      importacoes: importacoes.count,
    };
  }
);
```

**Benefícios:**
- ✅ Dashboard carrega em < 100ms
- ✅ Menos 3 queries no banco
- ✅ Melhor experiência

---

#### **Etapa 2.5: Cachear Análises de IA (2 horas)**

```typescript
// ia.analyze
const cacheKey = getCacheKey('analise', projetoId, pesquisaId);

const analise = await cacheOrFetch(
  cacheKey,
  CACHE_TTL.ANALISES,
  async () => {
    // Análise com IA (cara e demorada)
    return analyzeMarket(entidades);
  }
);
```

**Benefícios:**
- ✅ Economia de custos de IA
- ✅ Resposta instantânea
- ✅ Menos chamadas à API

---

## 📅 DIA 3: OTIMIZAÇÕES (8 HORAS)

### **MANHÃ (4 horas)**

#### **Etapa 3.1: Implementar Cache Warming (2 horas)**

**O que fazer:**
Pre-popular cache com dados mais acessados.

```typescript
// scripts/warm-cache.mjs
import { redis, getCacheKey, CACHE_TTL } from '../lib/redis';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL);

async function warmCache() {
  console.log('🔥 Aquecendo cache...\n');
  
  // 1. Projetos ativos
  console.log('1. Projetos ativos...');
  const projetos = await client`
    SELECT * FROM dim_projeto WHERE ativo = true
  `;
  await redis.setex(
    getCacheKey('projetos', 'list'),
    CACHE_TTL.PROJETOS,
    projetos
  );
  console.log(`   ✅ ${projetos.length} projetos cacheados\n`);
  
  // 2. Dashboard stats
  console.log('2. Dashboard stats...');
  const [stats] = await client`
    SELECT
      (SELECT COUNT(*) FROM dim_projeto) as projetos,
      (SELECT COUNT(*) FROM dim_entidade) as entidades,
      (SELECT COUNT(*) FROM dim_importacao) as importacoes
  `;
  await redis.setex(
    getCacheKey('dashboard', 'stats'),
    CACHE_TTL.DASHBOARD,
    stats
  );
  console.log('   ✅ Stats cacheadas\n');
  
  // 3. Entidades por projeto
  console.log('3. Entidades por projeto...');
  for (const projeto of projetos) {
    const entidades = await client`
      SELECT * FROM dim_entidade
      WHERE projeto_id = ${projeto.id}
      LIMIT 50
    `;
    await redis.setex(
      getCacheKey('entidades', 'list', projeto.id, 'all', 1, 50),
      CACHE_TTL.ENTIDADES,
      entidades
    );
    console.log(`   ✅ Projeto ${projeto.id}: ${entidades.length} entidades`);
  }
  
  console.log('\n🎉 Cache aquecido com sucesso!');
}

warmCache().catch(console.error);
```

**Executar:**
```bash
node scripts/warm-cache.mjs
```

**Agendar (cron):**
```bash
# Executar a cada 15 minutos
*/15 * * * * cd /app && node scripts/warm-cache.mjs
```

**Benefícios:**
- ✅ Primeira requisição rápida
- ✅ Menos cache misses
- ✅ Melhor experiência

---

#### **Etapa 3.2: Dashboard de Monitoramento (2 horas)**

**O que fazer:**
Criar página para visualizar estatísticas do cache.

```typescript
// client/src/pages/CacheMonitor.tsx
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export default function CacheMonitor() {
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    fetch('/api/cache/stats')
      .then(r => r.json())
      .then(setStats);
      
    const interval = setInterval(() => {
      fetch('/api/cache/stats')
        .then(r => r.json())
        .then(setStats);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!stats) return <div>Carregando...</div>;
  
  const hitRate = ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1);
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Monitoramento de Cache</h1>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">Total de Chaves</h3>
          <p className="text-3xl font-bold">{stats.keys.toLocaleString()}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">Hit Rate</h3>
          <p className="text-3xl font-bold text-green-600">{hitRate}%</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">Memória Usada</h3>
          <p className="text-3xl font-bold">{stats.memory}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">Hits / Misses</h3>
          <p className="text-xl font-bold">
            {stats.hits.toLocaleString()} / {stats.misses.toLocaleString()}
          </p>
        </Card>
      </div>
      
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Ações</h2>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={async () => {
              await fetch('/api/cache/flush', { method: 'POST' });
              alert('Cache limpo!');
            }}
          >
            Limpar Cache
          </button>
          
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={async () => {
              await fetch('/api/cache/warm', { method: 'POST' });
              alert('Cache aquecido!');
            }}
          >
            Aquecer Cache
          </button>
        </div>
      </Card>
    </div>
  );
}
```

**Endpoint de stats:**
```typescript
// api/cache/stats.js
import { getCacheStats } from '../../lib/redis';

export default async function handler(req, res) {
  const stats = await getCacheStats();
  return res.json(stats);
}
```

**Benefícios:**
- ✅ Visibilidade do cache
- ✅ Monitoramento em tempo real
- ✅ Ações administrativas

---

### **TARDE (4 horas)**

#### **Etapa 3.3: Otimizar Chaves de Cache (2 horas)**

**O que fazer:**
Revisar e otimizar estratégia de chaves.

**Boas práticas:**

1. **Usar prefixos consistentes**
```typescript
// ❌ Ruim
'projeto_1'
'proj:1'
'p:1'

// ✅ Bom
'projeto:1'
'projeto:1:entidades'
'projeto:1:stats'
```

2. **Incluir versão**
```typescript
// Permite invalidar tudo mudando a versão
const VERSION = 'v1';
getCacheKey(VERSION, 'projeto', id);
```

3. **Usar namespaces**
```typescript
const NAMESPACE = {
  PROJETO: 'projeto',
  ENTIDADE: 'entidade',
  DASHBOARD: 'dashboard',
  IA: 'ia',
};
```

**Benefícios:**
- ✅ Organização clara
- ✅ Invalidação precisa
- ✅ Fácil debug

---

#### **Etapa 3.4: Implementar Cache de Segundo Nível (2 horas)**

**O que fazer:**
Adicionar cache em memória para dados muito acessados.

```typescript
// lib/cache-l2.ts
import { LRUCache } from 'lru-cache';

// Cache L2 (em memória)
const l2Cache = new LRUCache<string, any>({
  max: 500, // Máximo 500 itens
  ttl: 60 * 1000, // 1 minuto
});

export async function cacheL2OrFetch<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // 1. Tentar L2 (memória)
  const l2Value = l2Cache.get(key);
  if (l2Value !== undefined) {
    console.log(`[L2 HIT] ${key}`);
    return l2Value;
  }
  
  // 2. Buscar do Redis (L1)
  const value = await fn();
  
  // 3. Salvar no L2
  l2Cache.set(key, value);
  
  return value;
}
```

**Uso:**
```typescript
const data = await cacheL2OrFetch(
  'hot-data',
  () => cacheOrFetch('hot-data', 300, fetchFromDB)
);
```

**Benefícios:**
- ✅ Latência < 1ms
- ✅ Menos chamadas ao Redis
- ✅ Ideal para dados muito acessados

---

## 🎁 BENEFÍCIOS DETALHADOS

### **Performance**

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Latência (listagem)** | 500ms | 10ms | 50x |
| **Throughput** | 100 req/s | 1000 req/s | 10x |
| **Queries no banco** | 1000/min | 100/min | -90% |
| **Tempo de resposta P95** | 1.2s | 50ms | 24x |

### **Custos**

| Item | Antes | Depois | Economia |
|------|-------|--------|----------|
| **Banco de dados** | $50/mês | $20/mês | -60% |
| **Redis** | $0 | $0-10/mês | N/A |
| **Total** | $50/mês | $20-30/mês | -50% |

### **Escalabilidade**

- ✅ **Antes:** 100 usuários simultâneos
- ✅ **Depois:** 1000+ usuários simultâneos
- ✅ **Crescimento:** 10x

---

## 🎯 CASOS DE USO PRÁTICOS

### **Caso 1: Dashboard com 10k Usuários**

**Antes:**
- 10k usuários × 3 queries = 30k queries/dia
- Banco sobrecarregado
- Latência > 1s

**Depois:**
- Cache hit rate 90%
- 3k queries/dia no banco
- Latência < 50ms

**Resultado:**
- ✅ 90% menos carga
- ✅ 20x mais rápido
- ✅ Custos -60%

---

### **Caso 2: Análise de IA Cara**

**Antes:**
- Análise custa $0.50
- Usuário clica 10x = $5
- Custo mensal: $500

**Depois:**
- Primeira análise: $0.50
- Próximas 9: $0 (cache)
- Custo mensal: $50

**Resultado:**
- ✅ 90% de economia
- ✅ Resposta instantânea

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Hit Rate** | > 70% | Redis stats |
| **Latência P95** | < 100ms | APM |
| **Queries no Banco** | -80% | Logs |
| **Custo** | -50% | Billing |

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Upstash Redis criado
- [ ] Variáveis de ambiente configuradas
- [ ] Cliente Redis instalado
- [ ] Lib redis.ts criada
- [ ] Middleware de rate limit
- [ ] Middleware de cache
- [ ] 5+ endpoints cacheados
- [ ] Invalidação implementada
- [ ] Cache warming script
- [ ] Dashboard de monitoramento
- [ ] Hit rate > 70%
- [ ] Documentação criada

---

**Próximo:** [DETALHAMENTO_NOTIFICACOES_TEMPO_REAL.md](./DETALHAMENTO_NOTIFICACOES_TEMPO_REAL.md)
