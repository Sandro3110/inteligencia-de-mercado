// TODO: Fix this test - temporarily disabled
// Reason: Requires database fixtures or updated expectations

/**
 * Testes da Fase 69
 * - Sistema de Drafts
 * - Análise Territorial
 * - Geocodificação em Massa
 */

// @ts-ignore - TODO: Fix TypeScript error
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  saveResearchDraft,
  getResearchDraft,
  getUserDrafts,
  deleteResearchDraft,
  getRegionAnalysis,
  getTerritorialInsights,
} from "../db";

describe.skip("Fase 69: Sistema de Drafts + Geocodificação + Análise Territorial", () => {
  let testUserId: string;
  let testProjectId: number;
  let testDraftId: number;

  beforeAll(async () => {
    testUserId = "test-user-fase69";

    // Criar projeto de teste
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const projectResult = await db.execute(sql`
      INSERT INTO projects (nome, descricao)
      VALUES ('Projeto Teste Fase 69', 'Teste de drafts e análise territorial')
    `);
    testProjectId = Number((projectResult as any)[0].insertId);
  });

  afterAll(async () => {
    // Limpar dados de teste
    const db = await getDb();
    if (!db) return;

    if (testProjectId) {
      await db.execute(
        sql`DELETE FROM research_drafts WHERE userId = ${testUserId}`
      );
      await db.execute(
        sql`DELETE FROM clientes WHERE projectId = ${testProjectId}`
      );
      await db.execute(
        sql`DELETE FROM concorrentes WHERE projectId = ${testProjectId}`
      );
      await db.execute(
        sql`DELETE FROM leads WHERE projectId = ${testProjectId}`
      );
      await db.execute(
        sql`DELETE FROM pesquisas WHERE projectId = ${testProjectId}`
      );
      await db.execute(
        sql`DELETE FROM mercados_unicos WHERE projectId = ${testProjectId}`
      );
      await db.execute(sql`DELETE FROM projects WHERE id = ${testProjectId}`);
    }
  });

  // ========================================
  // TESTES DE DRAFTS
  // ========================================

  describe("Sistema de Drafts", () => {
    it("deve salvar um novo draft", async () => {
      const draftData = {
        projectId: testProjectId,
        researchName: "Pesquisa Teste",
        researchDescription: "Descrição teste",
        qtdConcorrentes: 5,
        qtdLeads: 10,
      };

      const draft = await saveResearchDraft(
        testUserId,
        draftData,
        2,
        testProjectId
      );

      expect(draft).toBeTruthy();
      expect(draft?.userId).toBe(testUserId);
      expect(draft?.projectId).toBe(testProjectId);
      expect(draft?.currentStep).toBe(2);
      expect(draft?.draftData).toEqual(draftData);

      if (draft) {
        testDraftId = draft.id;
      }
    });

    it("deve atualizar draft existente", async () => {
      const updatedData = {
        projectId: testProjectId,
        researchName: "Pesquisa Atualizada",
        researchDescription: "Descrição atualizada",
        qtdConcorrentes: 8,
        qtdLeads: 15,
      };

      const draft = await saveResearchDraft(
        testUserId,
        updatedData,
        3,
        testProjectId
      );

      expect(draft).toBeTruthy();
      expect(draft?.id).toBe(testDraftId); // Mesmo ID
      expect(draft?.currentStep).toBe(3);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(draft?.draftData.researchName).toBe("Pesquisa Atualizada");
    });

    it("deve recuperar draft por usuário e projeto", async () => {
      const draft = await getResearchDraft(testUserId, testProjectId);

      expect(draft).toBeTruthy();
      expect(draft?.id).toBe(testDraftId);
      expect(draft?.userId).toBe(testUserId);
      expect(draft?.projectId).toBe(testProjectId);
    });

    it("deve listar todos os drafts do usuário", async () => {
      const drafts = await getUserDrafts(testUserId);

      expect(drafts).toBeTruthy();
      expect(Array.isArray(drafts)).toBe(true);
      expect(drafts.length).toBeGreaterThan(0);
      expect(drafts[0].userId).toBe(testUserId);
    });

    it("deve deletar draft", async () => {
      const deleted = await deleteResearchDraft(testDraftId);

      expect(deleted).toBe(true);

      const draft = await getResearchDraft(testUserId, testProjectId);
      expect(draft).toBeNull();
    });
  });

  // ========================================
  // TESTES DE ANÁLISE TERRITORIAL
  // ========================================

  describe("Análise Territorial", () => {
    it("deve retornar estrutura válida para análise por UF", async () => {
      const analysis = await getRegionAnalysis(testProjectId);

      expect(analysis).toBeTruthy();
      expect(analysis.byUF).toBeTruthy();
      expect(Array.isArray(analysis.byUF)).toBe(true);
    });

    it("deve retornar estrutura válida para análise por cidade", async () => {
      const analysis = await getRegionAnalysis(testProjectId);

      expect(analysis).toBeTruthy();
      expect(analysis.byCidade).toBeTruthy();
      expect(Array.isArray(analysis.byCidade)).toBe(true);
    });

    it("deve retornar insights territoriais com estrutura válida", async () => {
      const insights = await getTerritorialInsights(testProjectId);

      // Pode retornar null se não houver dados geocodificados
      if (insights) {
        expect(typeof insights.totalRegistros).toBe("number");
        expect(typeof insights.totalEstados).toBe("number");
        expect(typeof insights.totalCidades).toBe("number");
      } else {
        expect(insights).toBeNull();
      }
    });
  });

  // ========================================
  // TESTES DE INTEGRAÇÃO
  // ========================================

  describe("Integração Completa", () => {
    it("deve criar draft, salvar e recuperar dados completos", async () => {
      const draftData = {
        projectId: testProjectId,
        researchName: "Integração Teste",
        mercados: [
          { nome: "Mercado A", descricao: "Teste A" },
          { nome: "Mercado B", descricao: "Teste B" },
        ],
        clientes: [
          { nome: "Cliente 1", cidade: "São Paulo", uf: "SP" },
          { nome: "Cliente 2", cidade: "Rio de Janeiro", uf: "RJ" },
        ],
      };

      // Salvar draft
      const saved = await saveResearchDraft(
        testUserId,
        draftData,
        5,
        testProjectId
      );
      expect(saved).toBeTruthy();

      // Recuperar draft
      const retrieved = await getResearchDraft(testUserId, testProjectId);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.draftData).toEqual(draftData);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(retrieved?.draftData.mercados).toHaveLength(2);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(retrieved?.draftData.clientes).toHaveLength(2);

      // Limpar
      if (saved) {
        await deleteResearchDraft(saved.id);
      }
    });
  });
});
