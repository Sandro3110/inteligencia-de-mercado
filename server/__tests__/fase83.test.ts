import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../routers';
import { getDb } from '../db';
import { apiHealthLog } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('FASE 83: Dashboard de Saúde das APIs', () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (db) {
      await db.delete(apiHealthLog);
    }
  });

  describe('83.1 Backend - Logging de API', () => {
    it('deve registrar chamada de API com sucesso', async () => {
      const { logAPICall } = await import('../apiHealth');
      
      await logAPICall({
        apiName: 'openai',
        status: 'success',
        responseTime: 150,
        endpoint: 'test-endpoint',
      });

      if (!db) throw new Error('Database not available');
      
      const logs = await db
        .select()
        .from(apiHealthLog)
        .where(eq(apiHealthLog.apiName, 'openai'))
        .limit(1);

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].status).toBe('success');
      expect(logs[0].responseTime).toBe(150);
    });

    it('deve registrar chamada de API com erro', async () => {
      const { logAPICall } = await import('../apiHealth');
      
      await logAPICall({
        apiName: 'serpapi',
        status: 'error',
        responseTime: 5000,
        errorMessage: 'API key inválida',
        endpoint: 'test-endpoint',
      });

      if (!db) throw new Error('Database not available');
      
      const logs = await db
        .select()
        .from(apiHealthLog)
        .where(eq(apiHealthLog.apiName, 'serpapi'))
        .limit(1);

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].status).toBe('error');
      expect(logs[0].errorMessage).toBe('API key inválida');
    });

    it('deve obter estatísticas de saúde de uma API', async () => {
      const { getAPIHealthStats } = await import('../apiHealth');
      
      const stats = await getAPIHealthStats('openai', 7);

      expect(stats).toBeDefined();
      expect(stats.apiName).toBe('openai');
      expect(stats.totalCalls).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });

    it('deve obter histórico de chamadas', async () => {
      const { getAPIHealthHistory } = await import('../apiHealth');
      
      const history = await getAPIHealthHistory(undefined, 10);

      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        expect(history[0]).toHaveProperty('apiName');
        expect(history[0]).toHaveProperty('status');
        expect(history[0]).toHaveProperty('responseTime');
      }
    });
  });

  describe('83.2 Endpoints tRPC', () => {
    it('deve retornar estatísticas de todas as APIs', async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const stats = await caller.apiHealth.stats({ days: 7 });

      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBe(3); // openai, serpapi, receitaws
      
      stats.forEach((stat) => {
        expect(stat).toHaveProperty('apiName');
        expect(stat).toHaveProperty('totalCalls');
        expect(stat).toHaveProperty('successRate');
        expect(stat).toHaveProperty('avgResponseTime');
      });
    });

    it('deve retornar estatísticas de uma API específica', async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const stat = await caller.apiHealth.statsByAPI({ 
        apiName: 'openai',
        days: 7 
      });

      expect(stat).toBeDefined();
      expect(stat.apiName).toBe('openai');
      expect(stat).toHaveProperty('successRate');
    });

    it('deve retornar histórico de chamadas', async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const history = await caller.apiHealth.history({ limit: 5 });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('83.3 Cálculo de Métricas', () => {
    it('deve calcular taxa de sucesso corretamente', async () => {
      const { logAPICall, getAPIHealthStats } = await import('../apiHealth');
      
      // Limpar logs anteriores de receitaws
      if (db) {
        await db.delete(apiHealthLog).where(eq(apiHealthLog.apiName, 'receitaws'));
      }

      // Registrar 7 sucessos e 3 erros
      for (let i = 0; i < 7; i++) {
        await logAPICall({
          apiName: 'receitaws',
          status: 'success',
          responseTime: 100 + i * 10,
        });
      }

      for (let i = 0; i < 3; i++) {
        await logAPICall({
          apiName: 'receitaws',
          status: 'error',
          responseTime: 5000,
          errorMessage: 'Timeout',
        });
      }

      const stats = await getAPIHealthStats('receitaws', 7);

      expect(stats.totalCalls).toBe(10);
      expect(stats.successCount).toBe(7);
      expect(stats.errorCount).toBe(3);
      expect(stats.successRate).toBe(70); // 7/10 = 70%
    });

    it('deve calcular tempo médio de resposta corretamente', async () => {
      const { logAPICall, getAPIHealthStats } = await import('../apiHealth');
      
      // Limpar logs anteriores
      if (db) {
        await db.delete(apiHealthLog).where(eq(apiHealthLog.apiName, 'openai'));
      }

      // Registrar chamadas com tempos conhecidos: 100, 200, 300
      await logAPICall({
        apiName: 'openai',
        status: 'success',
        responseTime: 100,
      });

      await logAPICall({
        apiName: 'openai',
        status: 'success',
        responseTime: 200,
      });

      await logAPICall({
        apiName: 'openai',
        status: 'success',
        responseTime: 300,
      });

      const stats = await getAPIHealthStats('openai', 7);

      // Média: (100 + 200 + 300) / 3 = 200
      expect(stats.avgResponseTime).toBe(200);
    });
  });

  describe('83.4 Validação de Dados', () => {
    it('deve validar nomes de API permitidos', async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      // Deve aceitar APIs válidas
      await expect(
        caller.apiHealth.statsByAPI({ apiName: 'openai', days: 7 })
      ).resolves.toBeDefined();

      await expect(
        caller.apiHealth.statsByAPI({ apiName: 'serpapi', days: 7 })
      ).resolves.toBeDefined();

      await expect(
        caller.apiHealth.statsByAPI({ apiName: 'receitaws', days: 7 })
      ).resolves.toBeDefined();
    });

    it('deve retornar estatísticas vazias quando não há dados', async () => {
      const { getAPIHealthStats } = await import('../apiHealth');
      
      // Limpar todos os logs de serpapi
      if (db) {
        await db.delete(apiHealthLog).where(eq(apiHealthLog.apiName, 'serpapi'));
      }

      const stats = await getAPIHealthStats('serpapi', 7);

      expect(stats.totalCalls).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.errorCount).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.avgResponseTime).toBe(0);
    });
  });
});
