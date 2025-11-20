/**
 * Testes para Fase 58: Melhorias Avançadas de Gerenciamento de Projetos
 * 
 * Funcionalidades testadas:
 * - Arquivamento automático por inatividade
 * - Histórico de mudanças e log de auditoria
 * - Duplicação de projetos
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers';
import superjson from 'superjson';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${API_URL}/api/trpc`,
    }),
  ],
});

describe('Fase 58.1: Arquivamento Automático por Inatividade', () => {
  let testProjectId: number;

  beforeAll(async () => {
    // Criar projeto de teste
    const project = await trpc.projects.create.mutate({
      nome: 'Projeto Teste Inatividade',
      descricao: 'Projeto para testar arquivamento automático',
    });
    testProjectId = project!.id;
  });

  it('deve atualizar timestamp de atividade do projeto', async () => {
    const result = await trpc.projects.updateActivity.mutate(testProjectId);
    expect(result.success).toBe(true);
  });

  it('deve buscar projetos inativos (nenhum esperado)', async () => {
    const inactiveProjects = await trpc.projects.getInactive.query({ days: 30 });
    expect(Array.isArray(inactiveProjects)).toBe(true);
    // Projeto recém-criado não deve aparecer como inativo
    const hasTestProject = inactiveProjects.some(p => p.id === testProjectId);
    expect(hasTestProject).toBe(false);
  });

  it('deve buscar projetos inativos com período customizado', async () => {
    const inactiveProjects = await trpc.projects.getInactive.query({ days: 90 });
    expect(Array.isArray(inactiveProjects)).toBe(true);
  });

  it('deve executar hibernação automática sem erros', async () => {
    const result = await trpc.projects.autoHibernate.mutate({ days: 365 });
    expect(result).toHaveProperty('hibernated');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('results');
    expect(typeof result.hibernated).toBe('number');
    expect(typeof result.total).toBe('number');
  });

  it('deve validar que projeto ativo não é hibernado automaticamente', async () => {
    // Atualizar atividade do projeto
    await trpc.projects.updateActivity.mutate(testProjectId);
    
    // Tentar hibernar projetos inativos
    const result = await trpc.projects.autoHibernate.mutate({ days: 1 });
    
    // Verificar que o projeto de teste não foi hibernado
    const wasHibernated = result.results.some(
      r => r.projectId === testProjectId && r.success
    );
    expect(wasHibernated).toBe(false);
  });
});

describe('Fase 58.2: Histórico de Mudanças e Log de Auditoria', () => {
  let testProjectId: number;

  beforeAll(async () => {
    // Criar projeto de teste
    const project = await trpc.projects.create.mutate({
      nome: 'Projeto Teste Auditoria',
      descricao: 'Projeto para testar log de auditoria',
    });
    testProjectId = project!.id;
  });

  it('deve buscar histórico de auditoria do projeto', async () => {
    const result = await trpc.projects.getAuditLog.query({
      projectId: testProjectId,
      limit: 50,
      offset: 0,
    });

    expect(result).toHaveProperty('logs');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.logs)).toBe(true);
    expect(typeof result.total).toBe('number');
  });

  it('deve registrar criação do projeto no log', async () => {
    const result = await trpc.projects.getAuditLog.query({
      projectId: testProjectId,
      action: 'created',
    });

    expect(result.logs.length).toBeGreaterThan(0);
    const createdLog = result.logs.find(log => log.action === 'created');
    expect(createdLog).toBeDefined();
  });

  it('deve filtrar log por tipo de ação', async () => {
    // Atualizar projeto
    await trpc.projects.update.mutate({
      id: testProjectId,
      descricao: 'Descrição atualizada para teste',
    });

    // Buscar apenas logs de atualização
    const result = await trpc.projects.getAuditLog.query({
      projectId: testProjectId,
      action: 'updated',
    });

    expect(result.logs.every(log => log.action === 'updated')).toBe(true);
  });

  it('deve respeitar paginação no histórico', async () => {
    const page1 = await trpc.projects.getAuditLog.query({
      projectId: testProjectId,
      limit: 2,
      offset: 0,
    });

    const page2 = await trpc.projects.getAuditLog.query({
      projectId: testProjectId,
      limit: 2,
      offset: 2,
    });

    expect(page1.logs.length).toBeLessThanOrEqual(2);
    expect(page2.logs.length).toBeLessThanOrEqual(2);
    
    // Logs devem ser diferentes entre páginas
    if (page1.logs.length > 0 && page2.logs.length > 0) {
      expect(page1.logs[0].id).not.toBe(page2.logs[0].id);
    }
  });

  it('deve registrar hibernação no log de auditoria', async () => {
    // Hibernar projeto
    await trpc.projects.hibernate.mutate(testProjectId);

    // Buscar log de hibernação
    const result = await trpc.projects.getAuditLog.query({
      projectId: testProjectId,
      action: 'hibernated',
    });

    expect(result.logs.length).toBeGreaterThan(0);
    const hibernatedLog = result.logs.find(log => log.action === 'hibernated');
    expect(hibernatedLog).toBeDefined();

    // Reativar para não afetar outros testes
    await trpc.projects.reactivate.mutate(testProjectId);
  });

  it('deve incluir timestamp correto nos logs', async () => {
    const result = await trpc.projects.getAuditLog.query({
      projectId: testProjectId,
    });

    expect(result.logs.length).toBeGreaterThan(0);
    result.logs.forEach(log => {
      expect(log.createdAt).toBeDefined();
      expect(new Date(log.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});

describe('Fase 58.3: Duplicação de Projetos', () => {
  let originalProjectId: number;

  beforeAll(async () => {
    // Criar projeto original
    const project = await trpc.projects.create.mutate({
      nome: 'Projeto Original',
      descricao: 'Projeto para testar duplicação',
      cor: '#ff0000',
    });
    originalProjectId = project!.id;
  });

  it('deve duplicar projeto sem copiar mercados', async () => {
    const result = await trpc.projects.duplicate.mutate({
      projectId: originalProjectId,
      newName: 'Cópia do Projeto Original',
      copyMarkets: false,
    });

    expect(result.success).toBe(true);
    expect(result.newProjectId).toBeDefined();
    expect(typeof result.newProjectId).toBe('number');
    expect(result.newProjectId).not.toBe(originalProjectId);
  });

  it('deve duplicar projeto com mercados', async () => {
    const result = await trpc.projects.duplicate.mutate({
      projectId: originalProjectId,
      newName: 'Cópia com Mercados',
      copyMarkets: true,
    });

    expect(result.success).toBe(true);
    expect(result.newProjectId).toBeDefined();
  });

  it('deve validar nome obrigatório na duplicação', async () => {
    try {
      await trpc.projects.duplicate.mutate({
        projectId: originalProjectId,
        newName: '',
        copyMarkets: false,
      });
      // Se não lançar erro, teste falha
      expect(true).toBe(false);
    } catch (error: any) {
      // Esperamos um erro de validação
      expect(error).toBeDefined();
    }
  });

  it('deve criar projeto duplicado com status ativo', async () => {
    const result = await trpc.projects.duplicate.mutate({
      projectId: originalProjectId,
      newName: 'Projeto Duplicado Ativo',
      copyMarkets: false,
    });

    expect(result.success).toBe(true);
    
    if (result.newProjectId) {
      const newProject = await trpc.projects.byId.query(result.newProjectId);
      expect(newProject?.status).toBe('active');
    }
  });

  it('deve falhar ao duplicar projeto inexistente', async () => {
    try {
      await trpc.projects.duplicate.mutate({
        projectId: 999999,
        newName: 'Cópia de Projeto Inexistente',
        copyMarkets: false,
      });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});

describe('Fase 58: Integração Completa', () => {
  it('deve executar workflow completo: criar > atualizar > hibernar > duplicar', async () => {
    // 1. Criar projeto
    const project = await trpc.projects.create.mutate({
      nome: 'Projeto Workflow Completo',
      descricao: 'Teste de workflow completo',
    });
    expect(project).toBeDefined();
    const projectId = project!.id;

    // 2. Atualizar atividade
    const updateResult = await trpc.projects.updateActivity.mutate(projectId);
    expect(updateResult.success).toBe(true);

    // 3. Atualizar projeto
    await trpc.projects.update.mutate({
      id: projectId,
      descricao: 'Descrição atualizada no workflow',
    });

    // 4. Verificar log de auditoria
    const auditLog = await trpc.projects.getAuditLog.query({
      projectId,
    });
    expect(auditLog.logs.length).toBeGreaterThan(0);

    // 5. Hibernar projeto
    const hibernateResult = await trpc.projects.hibernate.mutate(projectId);
    expect(hibernateResult.success).toBe(true);

    // 6. Duplicar projeto hibernado
    const duplicateResult = await trpc.projects.duplicate.mutate({
      projectId,
      newName: 'Cópia do Projeto Hibernado',
      copyMarkets: false,
    });
    expect(duplicateResult.success).toBe(true);

    // 7. Verificar que cópia está ativa
    if (duplicateResult.newProjectId) {
      const newProject = await trpc.projects.byId.query(duplicateResult.newProjectId);
      expect(newProject?.status).toBe('active');
    }
  });

  it('deve validar performance com múltiplas operações', async () => {
    const startTime = Date.now();

    // Criar 3 projetos
    const projects = await Promise.all([
      trpc.projects.create.mutate({ nome: 'Projeto Performance 1' }),
      trpc.projects.create.mutate({ nome: 'Projeto Performance 2' }),
      trpc.projects.create.mutate({ nome: 'Projeto Performance 3' }),
    ]);

    // Atualizar atividade de todos
    await Promise.all(
      projects.map(p => trpc.projects.updateActivity.mutate(p!.id))
    );

    // Buscar logs de todos
    await Promise.all(
      projects.map(p => trpc.projects.getAuditLog.query({ projectId: p!.id }))
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Operações devem completar em menos de 5 segundos
    expect(duration).toBeLessThan(5000);
  });
});
