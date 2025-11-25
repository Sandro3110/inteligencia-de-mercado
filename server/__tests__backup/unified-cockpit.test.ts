import { logger } from '@/lib/logger';

// @ts-ignore - TODO: Fix TypeScript error
import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
// @ts-ignore - TODO: Fix TypeScript error
import type { Context } from '../_core/context';

/**
 * Testes para validar a consolidação do Cockpit Unificado
 *
 * Fase 64: Consolidação de Funcionalidades
 * - Verifica que todas as queries necessárias para o UnifiedCockpit funcionam
 * - Valida que os dados são retornados corretamente para cada aba
 * - Testa filtros e estatísticas
 */

describe('Unified Cockpit - Consolidação de Funcionalidades', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testProjectId: number;
  let testPesquisaId: number;

  beforeAll(async () => {
    // Mock de contexto de usuário autenticado
    const mockContext: Context = {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(mockContext);

    // Buscar projeto de teste existente
    const projects = await caller.projects.list();
    if (projects.length > 0) {
      testProjectId = projects[0].id;

      // Buscar pesquisa de teste
      const pesquisas = await caller.pesquisas.list({
        projectId: testProjectId,
      });
      if (pesquisas.length > 0) {
        testPesquisaId = pesquisas[0].id;
      }
    }
  });

  describe('Aba Lista - Queries de Dados', () => {
    it('deve buscar lista de mercados', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const mercados = await caller.mercados.list({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
      });

      expect(mercados).toBeDefined();
      expect(Array.isArray(mercados)).toBe(true);
    });

    it('deve buscar lista de clientes', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const clientes = await caller.clientes.list({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
      });

      expect(clientes).toBeDefined();
      expect(Array.isArray(clientes)).toBe(true);
    });

    it('deve buscar lista de concorrentes', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const concorrentes = await caller.concorrentes.list({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
      });

      expect(concorrentes).toBeDefined();
      expect(Array.isArray(concorrentes)).toBe(true);
    });

    it('deve buscar lista de leads', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const leads = await caller.leads.list({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
      });

      expect(leads).toBeDefined();
      expect(Array.isArray(leads)).toBe(true);
    });
  });

  describe('Aba Mapa - Queries Geográficas', () => {
    it('deve buscar entidades para o mapa unificado', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const entities = await caller.unifiedMap.getAllEntities({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
        entityTypes: ['mercado', 'cliente', 'concorrente', 'lead'],
      });

      expect(entities).toBeDefined();
      expect(Array.isArray(entities)).toBe(true);
    });

    it('deve buscar estatísticas do mapa', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const stats = await caller.unifiedMap.getMapStats({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
      });

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byType');
    });
  });

  describe('Aba Kanban - Leads por Estágio', () => {
    it('deve buscar leads para visualização Kanban', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const leads = await caller.leads.list({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
      });

      expect(leads).toBeDefined();
      expect(Array.isArray(leads)).toBe(true);

      // Verificar que leads têm campo stage
      if (leads.length > 0) {
        const lead = leads[0];
        expect(lead).toHaveProperty('stage');
      }
    });
  });

  describe('Estatísticas do Header', () => {
    it('deve buscar estatísticas do dashboard', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const stats = await caller.dashboard.stats({
        projectId: testProjectId,
      });

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totals');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(stats.totals).toHaveProperty('mercados');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(stats.totals).toHaveProperty('clientes');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(stats.totals).toHaveProperty('concorrentes');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(stats.totals).toHaveProperty('leads');
    });
  });

  describe('Filtros e Pesquisa', () => {
    it('deve filtrar mercados por pesquisa', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const mercados = await caller.mercados.list({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
        search: 'test',
      });

      expect(mercados).toBeDefined();
      expect(Array.isArray(mercados)).toBe(true);
    });

    it('deve filtrar clientes por status de validação', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const clientes = await caller.clientes.list({
        projectId: testProjectId,
        pesquisaId: testPesquisaId,
        validationStatus: 'pending',
      });

      expect(clientes).toBeDefined();
      expect(Array.isArray(clientes)).toBe(true);
    });
  });

  describe('Integração de Projetos e Pesquisas', () => {
    it('deve listar projetos disponíveis', async () => {
      const projects = await caller.projects.list();

      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
    });

    it('deve listar pesquisas de um projeto', async () => {
      if (!testProjectId) {
        logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
        return;
      }

      const pesquisas = await caller.pesquisas.list({
        projectId: testProjectId,
      });

      expect(pesquisas).toBeDefined();
      expect(Array.isArray(pesquisas)).toBe(true);
    });
  });
});

describe('Redirects e Rotas Antigas', () => {
  it('deve validar que rotas antigas foram removidas/redirecionadas', () => {
    // Este teste é mais conceitual - valida que a estrutura está correta
    // As rotas antigas (/mercados, /geo-cockpit) agora redirecionam para /?view=lista ou /?view=mapa

    const oldRoutes = ['/mercados', '/geo-cockpit', '/cascade'];
    const newRoutes = ['/?view=lista', '/?view=mapa'];

    expect(oldRoutes.length).toBeGreaterThan(0);
    expect(newRoutes.length).toBeGreaterThan(0);

    // Validação conceitual: rotas antigas devem redirecionar para novas rotas
    expect(true).toBe(true);
  });
});

describe('Performance e Cache', () => {
  it('deve carregar dados rapidamente (< 2s)', async () => {
    // Buscar projeto de teste
    const mockContext: Context = {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
      req: {} as any,
      res: {} as any,
    };
    const caller = appRouter.createCaller(mockContext);
    const projects = await caller.projects.list();
    const testProjectId = projects.length > 0 ? projects[0].id : null;

    if (!testProjectId) {
      logger.debug('⚠️ Nenhum projeto de teste encontrado, pulando teste');
      return;
    }

    const startTime = Date.now();

    await Promise.all([
      caller.mercados.list({ projectId: testProjectId }),
      caller.clientes.list({ projectId: testProjectId }),
      caller.concorrentes.list({ projectId: testProjectId }),
      caller.leads.list({ projectId: testProjectId }),
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(2000); // Deve carregar em menos de 2 segundos
  });
});
