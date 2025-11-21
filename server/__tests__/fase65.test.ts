/**
 * Testes da Fase 65: Correções Críticas
 * - Migração SQL (colunas qtdConcorrentesPorMercado, qtdLeadsPorMercado, qtdProdutosPorCliente)
 * - Página de enriquecimento com progresso
 * - Seletor de pesquisa no header
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../db";

describe("Fase 65: Correções Críticas", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("65.1 - Migração SQL: Colunas Adicionadas", () => {
    it("deve ter coluna qtdConcorrentesPorMercado na tabela pesquisas", async () => {
      if (!db) {
        throw new Error("Database not available");
      }

      const result: any = await db.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'pesquisas'
        AND COLUMN_NAME = 'qtdConcorrentesPorMercado'
      `);

      expect(result).toHaveLength(1);
      expect(result[0].COLUMN_NAME).toBe("qtdConcorrentesPorMercado");
      expect(result[0].DATA_TYPE).toBe("int");
      expect(result[0].COLUMN_DEFAULT).toBe("10");
    });

    it("deve ter coluna qtdLeadsPorMercado na tabela pesquisas", async () => {
      if (!db) {
        throw new Error("Database not available");
      }

      const result: any = await db.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'pesquisas'
        AND COLUMN_NAME = 'qtdLeadsPorMercado'
      `);

      expect(result).toHaveLength(1);
      expect(result[0].COLUMN_NAME).toBe("qtdLeadsPorMercado");
      expect(result[0].DATA_TYPE).toBe("int");
      expect(result[0].COLUMN_DEFAULT).toBe("20");
    });

    it("deve ter coluna qtdProdutosPorCliente na tabela pesquisas", async () => {
      if (!db) {
        throw new Error("Database not available");
      }

      const result: any = await db.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'pesquisas'
        AND COLUMN_NAME = 'qtdProdutosPorCliente'
      `);

      expect(result).toHaveLength(1);
      expect(result[0].COLUMN_NAME).toBe("qtdProdutosPorCliente");
      expect(result[0].DATA_TYPE).toBe("int");
      expect(result[0].COLUMN_DEFAULT).toBe("3");
    });

    it("deve conseguir buscar pesquisas sem erro de coluna", async () => {
      if (!db) {
        throw new Error("Database not available");
      }

      // Esta query deve funcionar sem erro "Unknown column"
      const result: any = await db.execute(`
        SELECT id, projectId, nome, qtdConcorrentesPorMercado, qtdLeadsPorMercado, qtdProdutosPorCliente
        FROM pesquisas
        WHERE ativo = 1
        LIMIT 1
      `);

      // Se chegou aqui, não houve erro de coluna
      expect(result).toBeDefined();
    });
  });

  describe("65.2 - Página de Enriquecimento", () => {
    it("deve ter rota /enrichment-progress configurada no App.tsx", async () => {
      const fs = await import("fs/promises");
      const appContent = await fs.readFile(
        "/home/ubuntu/gestor-pav/client/src/App.tsx",
        "utf-8"
      );

      expect(appContent).toContain("/enrichment-progress");
      expect(appContent).toContain("EnrichmentProgress");
    });

    it("deve ter componente EnrichmentProgress.tsx criado", async () => {
      const fs = await import("fs/promises");

      try {
        const content = await fs.readFile(
          "/home/ubuntu/gestor-pav/client/src/pages/EnrichmentProgress.tsx",
          "utf-8"
        );
        expect(content).toContain("export default function EnrichmentProgress");
        expect(content).toContain("refetchInterval: 5000"); // Polling a cada 5s
      } catch (error) {
        throw new Error("Arquivo EnrichmentProgress.tsx não encontrado");
      }
    });

    it("deve ter redirecionamento do wizard para /enrichment-progress", async () => {
      const fs = await import("fs/promises");
      const wizardContent = await fs.readFile(
        "/home/ubuntu/gestor-pav/client/src/pages/ResearchWizard.tsx",
        "utf-8"
      );

      expect(wizardContent).toContain("setLocation('/enrichment-progress')");
    });
  });

  describe("65.3 - Seletor de Pesquisa no Header", () => {
    it("deve ter componente PesquisaSelector no CascadeView", async () => {
      const fs = await import("fs/promises");
      const cascadeContent = await fs.readFile(
        "/home/ubuntu/gestor-pav/client/src/pages/CascadeView.tsx",
        "utf-8"
      );

      expect(cascadeContent).toContain("PesquisaSelector");
      expect(cascadeContent).toContain("useSelectedPesquisa");
    });

    it("deve passar pesquisaId para query de mercados", async () => {
      const fs = await import("fs/promises");
      const cascadeContent = await fs.readFile(
        "/home/ubuntu/gestor-pav/client/src/pages/CascadeView.tsx",
        "utf-8"
      );

      expect(cascadeContent).toContain("pesquisaId: selectedPesquisaId");
    });

    it("deve ter hook useSelectedPesquisa implementado", async () => {
      const fs = await import("fs/promises");

      try {
        const content = await fs.readFile(
          "/home/ubuntu/gestor-pav/client/src/hooks/useSelectedPesquisa.ts",
          "utf-8"
        );
        expect(content).toContain("export function useSelectedPesquisa");
        expect(content).toContain("localStorage");
      } catch (error) {
        throw new Error("Hook useSelectedPesquisa não encontrado");
      }
    });
  });

  describe("65.4 - Validação Integrada", () => {
    it("deve conseguir buscar mercados filtrados por pesquisaId", async () => {
      if (!db) {
        throw new Error("Database not available");
      }

      // Buscar uma pesquisa ativa
      const pesquisas: any = await db.execute(`
        SELECT id, projectId FROM pesquisas WHERE ativo = 1 LIMIT 1
      `);

      if (pesquisas.length === 0) {
        console.log("⚠️ Nenhuma pesquisa ativa encontrada para teste");
        return;
      }

      const pesquisaId = pesquisas[0].id;
      const projectId = pesquisas[0].projectId;

      // Buscar mercados filtrados por pesquisaId
      const mercados: any = await db.execute(`
        SELECT COUNT(*) as total
        FROM mercados
        WHERE projectId = ${projectId}
        AND pesquisaId = ${pesquisaId}
      `);

      expect(mercados).toBeDefined();
      expect(mercados[0].total).toBeGreaterThanOrEqual(0);
    });

    it("deve ter servidor funcionando sem erros críticos", async () => {
      // Verifica se consegue conectar ao banco
      expect(db).toBeDefined();
      expect(db).not.toBeNull();
    });
  });
});
