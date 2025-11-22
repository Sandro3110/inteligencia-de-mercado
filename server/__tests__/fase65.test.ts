/**
 * Testes para Fase 65: Agendamentos, Filtros de Drafts e Heatmap
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import {
  createReportSchedule,
  getReportSchedules,
  getReportScheduleById,
  updateReportSchedule,
  deleteReportSchedule,
  saveResearchDraft,
  getFilteredDrafts,
  deleteResearchDraft,
  getTerritorialDensity,
  getDensityStatsByRegion,
} from '../db';

const db = drizzle(process.env.DATABASE_URL!);

describe('Fase 65: Novas Funcionalidades', () => {
  const testProjectId = 1;
  const testUserId = 'test-user-fase65';

  describe('65.1: Agendamento de Relatórios', () => {
    let scheduleId: number;

    it('deve criar um agendamento de relatório', async () => {
      const nextRunAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const nextRunTimestamp = nextRunAt.toISOString().slice(0, 19).replace('T', ' ');

      const result = await createReportSchedule({
        projectId: testProjectId,
        name: 'Relatório Semanal de Teste',
        frequency: 'weekly',
        recipients: ['test@example.com', 'test2@example.com'],
        config: {
          format: 'pdf',
          includeCharts: true,
        },
        nextRunAt: nextRunTimestamp,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBeTypeOf('number');
      expect(result?.name).toBe('Relatório Semanal de Teste');
      expect(result?.frequency).toBe('weekly');

      scheduleId = result!.id;
    });

    it('deve listar agendamentos do projeto', async () => {
      const result = await getReportSchedules(testProjectId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve buscar agendamento por ID', async () => {
      const result = await getReportScheduleById(scheduleId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(scheduleId);
      expect(result?.name).toBe('Relatório Semanal de Teste');
    });

    it('deve atualizar um agendamento', async () => {
      const success = await updateReportSchedule(scheduleId, {
        name: 'Relatório Semanal Atualizado',
        enabled: false,
      });

      expect(success).toBe(true);

      const updated = await getReportScheduleById(scheduleId);
      expect(updated?.name).toBe('Relatório Semanal Atualizado');
      expect(updated?.enabled).toBe(false);
    });

    it('deve deletar um agendamento', async () => {
      const success = await deleteReportSchedule(scheduleId);
      expect(success).toBe(true);

      const deleted = await getReportScheduleById(scheduleId);
      expect(deleted).toBeNull();
    });
  });

  describe('65.2: Filtros Avançados de Drafts', () => {
    let draftId: number;

    it('deve salvar um draft com progressStatus', async () => {
      const result = await saveResearchDraft(
        testUserId,
        {
          projectName: 'Projeto Teste',
          method: 'manual',
          step1Data: { test: true },
        },
        2,
        testProjectId,
        'in_progress'
      );

      expect(result).toBeDefined();
      expect(result?.id).toBeTypeOf('number');
      expect(result?.currentStep).toBe(2);
      
      draftId = result!.id;
    });

    it('deve filtrar drafts por projeto', async () => {
      const result = await getFilteredDrafts(testUserId, {
        projectId: testProjectId,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve filtrar drafts por status de progresso', async () => {
      const result = await getFilteredDrafts(testUserId, {
        progressStatus: 'in_progress',
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('deve filtrar drafts por período (últimos 7 dias)', async () => {
      const result = await getFilteredDrafts(testUserId, {
        daysAgo: 7,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('deve buscar drafts por texto no conteúdo', async () => {
      const result = await getFilteredDrafts(testUserId, {
        searchText: 'Projeto Teste',
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('deve limpar o draft de teste', async () => {
      const success = await deleteResearchDraft(draftId);
      expect(success).toBe(true);
    });
  });

  describe('65.3: Heatmap de Concentração Territorial', () => {
    it('deve buscar dados de densidade territorial', async () => {
      const result = await getTerritorialDensity(testProjectId);

      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const item = result[0];
        expect(item).toHaveProperty('latitude');
        expect(item).toHaveProperty('longitude');
        expect(item).toHaveProperty('cidade');
        expect(item).toHaveProperty('uf');
      }
    });

    it('deve filtrar densidade por tipo de entidade', async () => {
      const result = await getTerritorialDensity(testProjectId, undefined, 'clientes');

      expect(Array.isArray(result)).toBe(true);
    });

    it('deve buscar estatísticas de densidade por região', async () => {
      const result = await getDensityStatsByRegion(testProjectId);

      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const stat = result[0];
        expect(stat).toHaveProperty('uf');
        expect(stat).toHaveProperty('total');
        expect(stat).toHaveProperty('qualidadeMedia');
        expect(stat).toHaveProperty('altaQualidade');
      }
    });

    it('deve retornar estatísticas ordenadas por total decrescente', async () => {
      const result = await getDensityStatsByRegion(testProjectId);

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(Number(result[i].total)).toBeGreaterThanOrEqual(Number(result[i + 1].total));
        }
      }
    });
  });
});
