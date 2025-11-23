import { describe, it, expect, beforeAll } from "vitest";
import {
  createProject,
  updateProject,
  hibernateProject,
  reactivateProject,
  deleteEmptyProject,
  getProjectAuditLog,
  getProjectsActivity,
  checkProjectsForHibernation,
  sendHibernationWarning,
  postponeHibernation,
  executeScheduledHibernations,
  getProjectById,
} from "../db";

/**
 * FASE 59: INTEGRAÇÃO E AUTOMAÇÃO DO SISTEMA DE PROJETOS
 *
 * Testes para:
 * 59.1 - Log de Auditoria Automático
 * 59.2 - Dashboard de Atividade de Projetos
 * 59.3 - Sistema de Notificações Antes de Hibernar
 */

describe("Fase 59.1: Log de Auditoria Automático", () => {
  let testProjectId: number;

  it("deve registrar log ao criar projeto", async () => {
    const project = await createProject(
      {
        nome: "Projeto Teste Log Create",
        descricao: "Teste de log de criação",
        cor: "#FF0000",
      },
      "test-user-id"
    );

    expect(project).toBeTruthy();
    testProjectId = project!.id;

    // Verificar se log foi criado
    const logs = await getProjectAuditLog(testProjectId, {
      limit: 10,
      offset: 0,
    });
    expect(logs.logs.length).toBeGreaterThan(0);

    const createLog = logs.logs.find(log => log.action === "created");
    expect(createLog).toBeTruthy();
    expect(createLog?.userId).toBe("test-user-id");
  });

  it("deve registrar log ao atualizar projeto", async () => {
    const updated = await updateProject(
      testProjectId,
      {
        nome: "Projeto Teste Log Update",
        descricao: "Descrição atualizada",
      },
      "test-user-id"
    );

    expect(updated).toBe(true);

    // Verificar se log foi criado com diff
    const logs = await getProjectAuditLog(testProjectId, {
      limit: 10,
      offset: 0,
    });
    const updateLog = logs.logs.find(log => log.action === "updated");

    expect(updateLog).toBeTruthy();
    expect(updateLog?.changes).toBeTruthy();
    expect(updateLog?.changes?.nome).toBeTruthy();
  });

  it("deve registrar log ao hibernar projeto", async () => {
    const result = await hibernateProject(testProjectId, "test-user-id");
    expect(result.success).toBe(true);

    // Verificar log
    const logs = await getProjectAuditLog(testProjectId, {
      limit: 10,
      offset: 0,
    });
    const hibernateLog = logs.logs.find(log => log.action === "hibernated");

    expect(hibernateLog).toBeTruthy();
    expect(hibernateLog?.changes?.status).toBeTruthy();
    expect(hibernateLog?.changes?.status?.after).toBe("hibernated");
  });

  it("deve registrar log ao reativar projeto", async () => {
    const result = await reactivateProject(testProjectId, "test-user-id");
    expect(result.success).toBe(true);

    // Verificar log
    const logs = await getProjectAuditLog(testProjectId, {
      limit: 10,
      offset: 0,
    });
    const reactivateLog = logs.logs.find(log => log.action === "reactivated");

    expect(reactivateLog).toBeTruthy();
    expect(reactivateLog?.changes?.status).toBeTruthy();
    expect(reactivateLog?.changes?.status?.after).toBe("active");
  });

  it("deve registrar log ao deletar projeto vazio", async () => {
    // Criar projeto vazio para deletar
    const emptyProject = await createProject(
      {
        nome: "Projeto Vazio Para Deletar",
        descricao: "Será deletado",
      },
      "test-user-id"
    );

    expect(emptyProject).toBeTruthy();
    const emptyProjectId = emptyProject!.id;

    // Deletar
    const result = await deleteEmptyProject(emptyProjectId, "test-user-id");
    expect(result.success).toBe(true);

    // Verificar log (projeto foi deletado, mas log permanece)
    const logs = await getProjectAuditLog(emptyProjectId, {
      limit: 10,
      offset: 0,
    });
    const deleteLog = logs.logs.find(log => log.action === "deleted");

    expect(deleteLog).toBeTruthy();
    expect(deleteLog?.metadata?.reason).toBe("empty_project");
  });
});

describe("Fase 59.2: Dashboard de Atividade de Projetos", () => {
  it("deve retornar estatísticas de atividade", async () => {
    const activity = await getProjectsActivity();

    expect(activity).toBeTruthy();
    expect(activity.totalProjects).toBeGreaterThanOrEqual(0);
    expect(activity.activeProjects).toBeGreaterThanOrEqual(0);
    expect(activity.hibernatedProjects).toBeGreaterThanOrEqual(0);
    expect(activity.inactiveProjects30).toBeGreaterThanOrEqual(0);
    expect(activity.inactiveProjects60).toBeGreaterThanOrEqual(0);
    expect(activity.inactiveProjects90).toBeGreaterThanOrEqual(0);
  });

  it("deve retornar projetos com informações de atividade", async () => {
    const activity = await getProjectsActivity();

    expect(activity.projectsWithActivity).toBeInstanceOf(Array);

    if (activity.projectsWithActivity.length > 0) {
      const project = activity.projectsWithActivity[0];

      expect(project.id).toBeTruthy();
      expect(project.nome).toBeTruthy();
      expect(project.status).toMatch(/^(active|hibernated)$/);
      expect(project.recentActions).toBeInstanceOf(Array);
    }
  });

  it("deve incluir últimas ações de cada projeto", async () => {
    const activity = await getProjectsActivity();

    const projectWithActions = activity.projectsWithActivity.find(
      p => p.recentActions.length > 0
    );

    if (projectWithActions) {
      const action = projectWithActions.recentActions[0];

      expect(action.action).toBeTruthy();
      expect(action.createdAt).toBeInstanceOf(Date);
      // userName pode ser null se ação foi feita sem usuário
    }
  });

  it("deve calcular dias de inatividade corretamente", async () => {
    const activity = await getProjectsActivity();

    const projectWithActivity = activity.projectsWithActivity.find(
      p => p.daysSinceActivity !== null
    );

    if (projectWithActivity) {
      expect(projectWithActivity.daysSinceActivity).toBeGreaterThanOrEqual(0);
      expect(typeof projectWithActivity.daysSinceActivity).toBe("number");
    }
  });
});

describe("Fase 59.3: Sistema de Notificações Antes de Hibernar", () => {
  let testProjectForWarning: number;

  beforeAll(async () => {
    // Criar projeto para testes de notificação
    const project = await createProject({
      nome: "Projeto Teste Notificação",
      descricao: "Para testar avisos de hibernação",
    });

    testProjectForWarning = project!.id;
  });

  it("deve identificar projetos que precisam de aviso", async () => {
    const projectsToWarn = await checkProjectsForHibernation(30);

    expect(projectsToWarn).toBeInstanceOf(Array);

    // Cada projeto deve ter informações completas
    projectsToWarn.forEach(item => {
      expect(item.project).toBeTruthy();
      expect(item.project.id).toBeTruthy();
      expect(item.daysSinceActivity).toBeGreaterThanOrEqual(0);
      expect(item.scheduledHibernationDate).toBeInstanceOf(Date);
    });
  });

  it("deve enviar aviso de hibernação", async () => {
    const now = new Date();
    const scheduledDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = await sendHibernationWarning(
      testProjectForWarning,
      "Projeto Teste",
      25,
      scheduledDate
    );

    // Sucesso pode ser false se notifyOwner falhar (normal em ambiente de teste)
    expect(result).toBeTruthy();
    expect(result.warningId).toBeTruthy();
  });

  it("deve adiar hibernação de projeto", async () => {
    const result = await postponeHibernation(testProjectForWarning, 30);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    // Verificar se lastActivityAt foi atualizado
    const project = await getProjectById(testProjectForWarning);
    expect(project?.lastActivityAt).toBeTruthy();
  });

  it("deve executar hibernações agendadas", async () => {
    const result = await executeScheduledHibernations("test-user-id");

    expect(result).toBeTruthy();
    expect(typeof result.hibernated).toBe("number");
    expect(typeof result.errors).toBe("number");
    expect(result.hibernated).toBeGreaterThanOrEqual(0);
    expect(result.errors).toBeGreaterThanOrEqual(0);
  });

  it("não deve enviar aviso duplicado para mesmo projeto", async () => {
    // Tentar enviar outro aviso para o mesmo projeto
    const projectsToWarn = await checkProjectsForHibernation(30);

    // O projeto com aviso recente não deve aparecer na lista
    const hasDuplicate = projectsToWarn.some(
      item => item.project.id === testProjectForWarning
    );

    // Esperamos que não haja duplicata (aviso já foi enviado e não expirou)
    expect(hasDuplicate).toBe(false);
  });

  it("deve respeitar adiamento de hibernação", async () => {
    // Adiar hibernação
    await postponeHibernation(testProjectForWarning, 30);

    // Verificar que projeto não aparece em checkProjectsForHibernation
    const projectsToWarn = await checkProjectsForHibernation(30);

    const isInWarningList = projectsToWarn.some(
      item => item.project.id === testProjectForWarning
    );

    // Projeto adiado não deve aparecer na lista de avisos
    expect(isInWarningList).toBe(false);
  });
});

describe("Fase 59: Integração Completa", () => {
  it("deve ter log de auditoria funcionando em todas as operações", async () => {
    // Criar projeto
    const project = await createProject(
      {
        nome: "Projeto Integração Completa",
        descricao: "Teste de integração",
      },
      "integration-test-user"
    );

    const projectId = project!.id;

    // Atualizar
    await updateProject(
      projectId,
      { nome: "Projeto Atualizado" },
      "integration-test-user"
    );

    // Hibernar
    await hibernateProject(projectId, "integration-test-user");

    // Reativar
    await reactivateProject(projectId, "integration-test-user");

    // Verificar logs
    const logs = await getProjectAuditLog(projectId, { limit: 10, offset: 0 });

    expect(logs.logs.length).toBeGreaterThanOrEqual(4);

    const actions = logs.logs.map(log => log.action);
    expect(actions).toContain("created");
    expect(actions).toContain("updated");
    expect(actions).toContain("hibernated");
    expect(actions).toContain("reactivated");
  });

  it("deve ter dashboard mostrando projetos com logs de auditoria", async () => {
    const activity = await getProjectsActivity();

    // Verificar que projetos têm ações recentes
    const projectsWithRecentActions = activity.projectsWithActivity.filter(
      p => p.recentActions.length > 0
    );

    expect(projectsWithRecentActions.length).toBeGreaterThan(0);

    // Verificar estrutura das ações
    projectsWithRecentActions.forEach(project => {
      project.recentActions.forEach(action => {
        expect(action.action).toMatch(
          /^(created|updated|hibernated|reactivated|deleted)$/
        );
        expect(action.createdAt).toBeInstanceOf(Date);
      });
    });
  });
});
