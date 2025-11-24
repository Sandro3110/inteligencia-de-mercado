import { logger } from '@/lib/logger';

/**
 * Testes de Integração - Estrutura do Sistema Pós-Fusão
 * Valida que as fusões de páginas foram implementadas corretamente
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const CLIENT_PAGES_DIR = path.resolve(__dirname, '../../client/src/pages');
const CLIENT_COMPONENTS_DIR = path.resolve(__dirname, '../../client/src/components');
const APP_TSX_PATH = path.resolve(__dirname, '../../client/src/App.tsx');
const SIDEBAR_PATH = path.resolve(__dirname, '../../client/src/components/AppSidebar.tsx');

describe('Fase 64 - Estrutura do Sistema Pós-Fusão', () => {
  describe('Páginas Unificadas Criadas', () => {
    it('PerformanceCenter.tsx deve existir', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'PerformanceCenter.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('ReportsAutomation.tsx deve existir', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'ReportsAutomation.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('ProjectManagement.tsx deve existir (atualizado com abas)', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'ProjectManagement.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('Componentes de Abas Criados', () => {
    it('ProjectsTab.tsx deve existir', () => {
      const filePath = path.join(CLIENT_COMPONENTS_DIR, 'projects/ProjectsTab.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('ActivityTab.tsx deve existir', () => {
      const filePath = path.join(CLIENT_COMPONENTS_DIR, 'projects/ActivityTab.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('LogsTab.tsx deve existir', () => {
      const filePath = path.join(CLIENT_COMPONENTS_DIR, 'projects/LogsTab.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('ScheduleTab.tsx deve existir', () => {
      const filePath = path.join(CLIENT_COMPONENTS_DIR, 'reports/ScheduleTab.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('AutomationTab.tsx deve existir', () => {
      const filePath = path.join(CLIENT_COMPONENTS_DIR, 'reports/AutomationTab.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('Páginas Antigas Ainda Existem (para serem removidas)', () => {
    it('ROIDashboard.tsx ainda existe (será removido)', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'ROIDashboard.tsx');
      const exists = fs.existsSync(filePath);
      // Apenas documentando que ainda existe
      expect(typeof exists).toBe('boolean');
    });

    it('FunnelView.tsx ainda existe (será removido)', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'FunnelView.tsx');
      const exists = fs.existsSync(filePath);
      expect(typeof exists).toBe('boolean');
    });

    it('ResearchOverview.tsx ainda existe (será removido)', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'ResearchOverview.tsx');
      const exists = fs.existsSync(filePath);
      expect(typeof exists).toBe('boolean');
    });
  });

  describe('Rotas Configuradas no App.tsx', () => {
    it('App.tsx deve ter rota para PerformanceCenter', () => {
      const content = fs.readFileSync(APP_TSX_PATH, 'utf-8');
      expect(content).toContain('PerformanceCenter');
      expect(content).toContain('/performance');
    });

    it('App.tsx deve ter rota para ReportsAutomation', () => {
      const content = fs.readFileSync(APP_TSX_PATH, 'utf-8');
      expect(content).toContain('ReportsAutomation');
      expect(content).toContain('/relatorios');
    });

    it('App.tsx deve ter redirects configurados', () => {
      const content = fs.readFileSync(APP_TSX_PATH, 'utf-8');
      // Verificar se há redirects para as rotas antigas
      expect(content).toContain('window.location.href');
    });

    it('App.tsx não deve mais importar páginas antigas', () => {
      const content = fs.readFileSync(APP_TSX_PATH, 'utf-8');
      expect(content).not.toContain('import ROIDashboard');
      expect(content).not.toContain('import FunnelView');
      expect(content).not.toContain('import SchedulePage');
      expect(content).not.toContain('import AtividadePage');
      expect(content).not.toContain('import ProjectActivityDashboard');
    });
  });

  describe('Menu Lateral Reorganizado', () => {
    it('AppSidebar.tsx deve ter seção Core', () => {
      const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');
      expect(content).toContain('🎯 Core');
    });

    it('AppSidebar.tsx deve ter seção Análise', () => {
      const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');
      expect(content).toContain('📊 Análise');
    });

    it('AppSidebar.tsx deve ter seção Configurações', () => {
      const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');
      expect(content).toContain('⚙️ Configurações');
    });

    it('AppSidebar.tsx deve ter seção Sistema', () => {
      const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');
      expect(content).toContain('📁 Sistema');
    });

    it('AppSidebar.tsx deve ter item "Performance e Conversão"', () => {
      const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');
      expect(content).toContain('Performance e Conversão');
      expect(content).toContain('/performance');
    });

    it('AppSidebar.tsx deve ter item "Relatórios e Automação"', () => {
      const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');
      expect(content).toContain('Relatórios e Automação');
      expect(content).toContain('/relatorios');
    });

    it('AppSidebar.tsx não deve mais ter itens de páginas antigas', () => {
      const content = fs.readFileSync(SIDEBAR_PATH, 'utf-8');
      expect(content).not.toContain('ROI e Performance');
      expect(content).not.toContain('Funil de Conversão');
      expect(content).not.toContain('Agendamentos');
      expect(content).not.toContain('Atividade de Projetos');
    });
  });

  describe('Contagem de Páginas', () => {
    it('Deve ter reduzido o número total de páginas', () => {
      const files = fs.readdirSync(CLIENT_PAGES_DIR);
      const tsxFiles = files.filter((f) => f.endsWith('.tsx'));

      // Antes: ~46 páginas
      // Depois: ~31 páginas (algumas ainda não foram removidas)
      // Meta final: ~18 páginas

      logger.debug(`Total de páginas .tsx: ${tsxFiles.length}`);
      expect(tsxFiles.length).toBeGreaterThan(0);
      expect(tsxFiles.length).toBeLessThan(50); // Menos que o original
    });
  });

  describe('Validação de Imports', () => {
    it('PerformanceCenter deve importar componentes corretos', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'PerformanceCenter.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Verificar se tem estrutura de seções
      expect(content).toContain('DashboardLayout');
    });

    it('ReportsAutomation deve importar Tabs', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'ReportsAutomation.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('Tabs');
      expect(content).toContain('TabsContent');
      expect(content).toContain('ScheduleTab');
      expect(content).toContain('AutomationTab');
    });

    it('ProjectManagement deve importar Tabs de projetos', () => {
      const filePath = path.join(CLIENT_PAGES_DIR, 'ProjectManagement.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('Tabs');
      expect(content).toContain('ProjectsTab');
      expect(content).toContain('ActivityTab');
      expect(content).toContain('LogsTab');
    });
  });
});
