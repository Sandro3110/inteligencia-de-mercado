/**
 * Testes para Fase 57: Sistema de Hibernação de Projetos
 * - Hibernar projetos
 * - Reativar projetos
 * - Verificar status
 */

import { describe, it, expect } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../routers';
import superjson from 'superjson';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

describe('Fase 57: Sistema de Hibernação de Projetos', () => {
  let testProjectId: number | null = null;

  describe('57.1 - Criar Projeto para Teste', () => {
    it('deve criar um projeto de teste', async () => {
      const newProject = await trpc.projects.create.mutate({
        nome: 'Projeto Teste Hibernação',
        descricao: 'Projeto para testar hibernação'
      });

      expect(newProject).toBeDefined();
      expect(newProject?.id).toBeGreaterThan(0);
      expect(newProject?.status).toBe('active');

      testProjectId = newProject?.id || null;
    });
  });

  describe('57.2 - Hibernar Projeto', () => {
    it('deve hibernar projeto ativo', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const result = await trpc.projects.hibernate.mutate(testProjectId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve verificar que projeto está hibernado', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const isHibernated = await trpc.projects.isHibernated.query(testProjectId);

      expect(isHibernated).toBe(true);
    });

    it('deve retornar projeto com status hibernated na lista', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const projects = await trpc.projects.list.query();
      const testProject = projects.find(p => p.id === testProjectId);

      expect(testProject).toBeDefined();
      expect(testProject?.status).toBe('hibernated');
    });

    it('NÃO deve hibernar projeto já hibernado', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const result = await trpc.projects.hibernate.mutate(testProjectId);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toContain('já está adormecido');
    });
  });

  describe('57.3 - Reativar Projeto', () => {
    it('deve reativar projeto hibernado', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const result = await trpc.projects.reactivate.mutate(testProjectId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve verificar que projeto está ativo', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const isHibernated = await trpc.projects.isHibernated.query(testProjectId);

      expect(isHibernated).toBe(false);
    });

    it('deve retornar projeto com status active na lista', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const projects = await trpc.projects.list.query();
      const testProject = projects.find(p => p.id === testProjectId);

      expect(testProject).toBeDefined();
      expect(testProject?.status).toBe('active');
    });

    it('NÃO deve reativar projeto já ativo', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const result = await trpc.projects.reactivate.mutate(testProjectId);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toContain('já está ativo');
    });
  });

  describe('57.4 - Fluxo Completo', () => {
    it('deve criar, hibernar, reativar e deletar projeto', async () => {
      // 1. Criar projeto
      const newProject = await trpc.projects.create.mutate({
        nome: 'Projeto Fluxo Hibernação',
        descricao: 'Teste completo'
      });

      expect(newProject).toBeDefined();
      const projectId = newProject?.id;
      expect(projectId).toBeGreaterThan(0);
      expect(newProject?.status).toBe('active');

      // 2. Hibernar
      const hibernateResult = await trpc.projects.hibernate.mutate(projectId!);
      expect(hibernateResult.success).toBe(true);

      // 3. Verificar hibernação
      const isHibernated = await trpc.projects.isHibernated.query(projectId!);
      expect(isHibernated).toBe(true);

      // 4. Reativar
      const reactivateResult = await trpc.projects.reactivate.mutate(projectId!);
      expect(reactivateResult.success).toBe(true);

      // 5. Verificar reativação
      const isActive = await trpc.projects.isHibernated.query(projectId!);
      expect(isActive).toBe(false);

      // 6. Deletar projeto vazio
      const deleteResult = await trpc.projects.deleteEmpty.mutate(projectId!);
      expect(deleteResult.success).toBe(true);
    });
  });

  describe('57.5 - Limpeza', () => {
    it('deve deletar projeto de teste', async () => {
      if (!testProjectId) throw new Error('testProjectId não definido');

      const result = await trpc.projects.deleteEmpty.mutate(testProjectId);
      expect(result.success).toBe(true);
    });
  });
});
