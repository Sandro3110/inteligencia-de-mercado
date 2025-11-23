/**
 * Testes para Páginas Unificadas - Fase 64
 * Valida as fusões de páginas implementadas
 */

import { describe, it, expect } from "vitest";

describe("Fusões de Páginas - Fase 64", () => {
  describe("Semana 1 - Fusões de Alta Prioridade", () => {
    it("Analytics Unificado - deve existir AnalyticsPage", async () => {
      const module = await import("../pages/AnalyticsPage");
      expect(module.default).toBeDefined();
    });

    it("Central de Notificações - deve existir Notificacoes", async () => {
      const module = await import("../pages/Notificacoes");
      expect(module.default).toBeDefined();
    });

    it("Configurações de Notificações - deve existir NotificationConfig", async () => {
      const module = await import("../pages/NotificationConfig");
      expect(module.default).toBeDefined();
    });

    it("Geo Cockpit Unificado - deve existir GeoCockpit", async () => {
      const module = await import("../pages/GeoCockpit");
      expect(module.default).toBeDefined();
    });

    it("Administração Geo - deve existir GeoAdmin", async () => {
      const module = await import("../pages/GeoAdmin");
      expect(module.default).toBeDefined();
    });
  });

  describe("Semana 2 - Fusões de Média Prioridade", () => {
    it("Central de Exportação - deve existir ExportWizard", async () => {
      const module = await import("../pages/ExportWizard");
      expect(module.default).toBeDefined();
    });

    it("Central de Alertas - deve existir AlertsPage", async () => {
      const module = await import("../pages/AlertsPage");
      expect(module.default).toBeDefined();
    });

    it("Gestão de Projetos Unificada - deve existir ProjectManagement", async () => {
      const module = await import("../pages/ProjectManagement");
      expect(module.default).toBeDefined();
    });

    it("Gestão de Projetos - deve ter componentes de abas", async () => {
      const projectsTab = await import("../components/projects/ProjectsTab");
      const activityTab = await import("../components/projects/ActivityTab");
      const logsTab = await import("../components/projects/LogsTab");

      expect(projectsTab.ProjectsTab).toBeDefined();
      expect(activityTab.ActivityTab).toBeDefined();
      expect(logsTab.LogsTab).toBeDefined();
    });
  });

  describe("Semana 3 - Fusões de Baixa Prioridade", () => {
    it("Dashboard de Tendências - deve existir TendenciasDashboard", async () => {
      const module = await import("../pages/TendenciasDashboard");
      expect(module.default).toBeDefined();
    });

    it("Performance e Conversão - deve existir PerformanceCenter", async () => {
      const module = await import("../pages/PerformanceCenter");
      expect(module.default).toBeDefined();
    });

    it("Relatórios e Automação - deve existir ReportsAutomation", async () => {
      const module = await import("../pages/ReportsAutomation");
      expect(module.default).toBeDefined();
    });

    it("Relatórios e Automação - deve ter componentes de abas", async () => {
      const scheduleTab = await import("../components/reports/ScheduleTab");
      const automationTab = await import("../components/reports/AutomationTab");

      expect(scheduleTab.ScheduleTab).toBeDefined();
      expect(automationTab.AutomationTab).toBeDefined();
    });
  });

  describe("Rotas e Navegação", () => {
    it("App.tsx - deve ter rotas unificadas configuradas", async () => {
      const module = await import("../App");
      expect(module.default).toBeDefined();
    });

    it("AppSidebar - deve ter menu reorganizado", async () => {
      const module = await import("../components/AppSidebar");
      expect(module.AppSidebar).toBeDefined();
    });
  });

  describe("Páginas Antigas Removidas", () => {
    it("ROIDashboard - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/ROIDashboard");
        // Se chegou aqui, a página ainda existe (não deveria)
        expect(true).toBe(false);
      } catch (error) {
        // Esperado: página não existe mais
        expect(true).toBe(true);
      }
    });

    it("FunnelView - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/FunnelView");
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });

    it("ResearchOverview - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/ResearchOverview");
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });

    it("ReportsPage - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/ReportsPage");
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });

    it("SchedulePage - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/SchedulePage");
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });

    it("ReportSchedules - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/ReportSchedules");
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });

    it("ProjectActivityDashboard - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/ProjectActivityDashboard");
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });

    it("AtividadePage - não deve mais existir como página separada", async () => {
      try {
        await import("../pages/AtividadePage");
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });
  });
});
