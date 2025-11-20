/**
 * Testes para Fase 56: Melhorias de Projetos
 * - Criação inline de projetos
 * - Deleção de projetos vazios
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers';
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

describe('Fase 56: Melhorias de Projetos', () => {
  let testProjectId: number | null = null;

  describe('56.1 - Criação de Projeto', () => {
    it('deve criar um novo projeto com nome e descrição', async () => {
      const newProject = await trpc.projects.create.mutate({
        nome: 'Projeto Teste Fase 56',
        descricao: 'Projeto criado para testar funcionalidade inline'
      });

      expect(newProject).toBeDefined();
      expect(newProject?.id).toBeGreaterThan(0);
      expect(newProject?.nome).toBe('Projeto Teste Fase 56');
      expect(newProject?.descricao).toBe('Projeto criado para testar funcionalidade inline');

      testProjectId = newProject?.id || null;
    });

    it('deve criar projeto apenas com nome (descrição opcional)', async () => {
      const newProject = await trpc.projects.create.mutate({
        nome: 'Projeto Sem Descrição'
      });

      expect(newProject).toBeDefined();
      expect(newProject?.nome).toBe('Projeto Sem Descrição');
    });

    it('deve listar projetos incluindo os recém-criados', async () => {
      const projects = await trpc.projects.list.query();

      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);

      const testProject = projects.find(p => p.nome === 'Projeto Teste Fase 56');
      expect(testProject).toBeDefined();
    });
  });

  describe('56.2 - Verificação de Projeto Vazio', () => {
    it('deve verificar que projeto recém-criado está vazio', async () => {
      if (!testProjectId) {
        throw new Error('testProjectId não definido');
      }

      const canDelete = await trpc.projects.canDelete.query(testProjectId);

      expect(canDelete).toBeDefined();
      expect(canDelete.canDelete).toBe(true);
      expect(canDelete.stats).toBeDefined();
      expect(canDelete.stats?.pesquisas).toBe(0);
      expect(canDelete.stats?.clientes).toBe(0);
      expect(canDelete.stats?.mercados).toBe(0);
    });

    it('deve verificar que projeto com dados NÃO pode ser deletado', async () => {
      // Projeto "Embalagens" (id: 1) tem dados
      const canDelete = await trpc.projects.canDelete.query(1);

      expect(canDelete).toBeDefined();
      expect(canDelete.canDelete).toBe(false);
      expect(canDelete.reason).toContain('dados');
    });
  });

  describe('56.3 - Deleção de Projeto Vazio', () => {
    it('deve deletar projeto vazio com sucesso', async () => {
      if (!testProjectId) {
        throw new Error('testProjectId não definido');
      }

      const result = await trpc.projects.deleteEmpty.mutate(testProjectId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve confirmar que projeto foi deletado', async () => {
      if (!testProjectId) {
        throw new Error('testProjectId não definido');
      }

      const project = await trpc.projects.byId.query(testProjectId);
      expect(project).toBeUndefined();
    });

    it('NÃO deve deletar projeto com dados', async () => {
      // Tentar deletar projeto "Embalagens" (id: 1) que tem dados
      const result = await trpc.projects.deleteEmpty.mutate(1);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('dados');
    });
  });

  describe('56.4 - Fluxo Completo', () => {
    it('deve criar, verificar e deletar projeto em sequência', async () => {
      // 1. Criar projeto
      const newProject = await trpc.projects.create.mutate({
        nome: 'Projeto Fluxo Completo',
        descricao: 'Teste de fluxo completo'
      });

      expect(newProject).toBeDefined();
      const projectId = newProject?.id;
      expect(projectId).toBeGreaterThan(0);

      // 2. Verificar que está vazio
      const canDelete = await trpc.projects.canDelete.query(projectId!);
      expect(canDelete.canDelete).toBe(true);

      // 3. Deletar
      const deleteResult = await trpc.projects.deleteEmpty.mutate(projectId!);
      expect(deleteResult.success).toBe(true);

      // 4. Confirmar deleção
      const deletedProject = await trpc.projects.byId.query(projectId!);
      expect(deletedProject).toBeUndefined();
    });
  });
});
