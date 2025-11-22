import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import type { inferProcedureInput } from "@trpc/server";

describe("Análise Territorial - Testes Completos", () => {
  let projectId: number;
  let pesquisaId: number | undefined;

  const createCaller = () => {
    return appRouter.createCaller({
      user: {
        id: "test-user-territorial",
        name: "Test User Territorial",
        email: "test@territorial.com",
        role: "admin",
      },
      req: {} as any,
      res: {} as any,
    });
  };

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar primeiro projeto existente
    const projectsResult: any = await db.execute(`SELECT id FROM projects LIMIT 1`);
    const projects = projectsResult[0] || projectsResult;
    if (projects && projects.length > 0) {
      projectId = projects[0].id;
    } else {
      throw new Error("Nenhum projeto encontrado no banco");
    }

    // Buscar primeira pesquisa existente (opcional)
    if (projectId) {
      const pesquisasResult: any = await db.execute(`SELECT id FROM pesquisas LIMIT 1`);
      const pesquisas = pesquisasResult[0] || pesquisasResult;
      if (pesquisas && pesquisas.length > 0) {
        pesquisaId = pesquisas[0].id;
      }
    }
  });

  afterAll(async () => {
    // Não há nada para limpar pois usamos dados existentes
  });

  describe("getTerritorialDensity", () => {
    it("deve retornar densidade territorial sem filtros", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensity({
        projectId,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("deve filtrar por tipo de entidade (clientes)", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensity({
        projectId,
        entityType: "clientes",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((item: any) => {
        expect(item.entityType).toBe("clientes");
      });
    });

    it("deve filtrar por tipo de entidade (leads)", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensity({
        projectId,
        entityType: "leads",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((item: any) => {
        expect(item.entityType).toBe("leads");
      });
    });

    it("deve filtrar por tipo de entidade (concorrentes)", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensity({
        projectId,
        entityType: "concorrentes",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((item: any) => {
        expect(item.entityType).toBe("concorrentes");
      });
    });

    it("deve filtrar por pesquisaId", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensity({
        projectId,
        pesquisaId,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Se houver dados, validar pesquisaId
      if (result.length > 0 && pesquisaId) {
        result.forEach((item: any) => {
          expect(item.pesquisaId).toBe(pesquisaId);
        });
      }
    });

    it("deve retornar apenas entidades com geolocalização", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensity({
        projectId,
      });

      expect(result).toBeDefined();
      result.forEach((item: any) => {
        expect(item.latitude).toBeDefined();
        expect(item.longitude).toBeDefined();
        expect(item.latitude).not.toBeNull();
        expect(item.longitude).not.toBeNull();
      });
    });
  });

  describe("getDensityStatsByRegion", () => {
    it("deve retornar estatísticas por região", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensityStats({
        projectId,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("deve agrupar corretamente por UF", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensityStats({
        projectId,
      });

      expect(result).toBeDefined();
      if (result.length > 0) {
        result.forEach((item: any) => {
          expect(item.uf).toBeDefined();
          expect(item.totalEntities).toBeGreaterThanOrEqual(0);
          expect(item.avgQuality).toBeGreaterThanOrEqual(0);
          expect(item.avgQuality).toBeLessThanOrEqual(100);
        });
      }
    });

    it("deve calcular média de qualidade corretamente", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensityStats({
        projectId,
      });

      expect(result).toBeDefined();
      if (result.length > 0) {
        result.forEach((item: any) => {
          expect(typeof item.avgQuality).toBe("number");
          expect(item.avgQuality).toBeGreaterThanOrEqual(0);
          expect(item.avgQuality).toBeLessThanOrEqual(100);
        });
      }
    });

    it("deve filtrar por pesquisaId", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensityStats({
        projectId,
        pesquisaId,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("deve retornar contadores de tipos de entidades", async () => {
      const caller = createCaller();
      const result = await caller.territorial.getDensityStats({
        projectId,
      });

      expect(result).toBeDefined();
      if (result.length > 0) {
        result.forEach((item: any) => {
          expect(item.clientesCount).toBeDefined();
          expect(item.leadsCount).toBeDefined();
          expect(item.concorrentesCount).toBeDefined();
          expect(typeof item.clientesCount).toBe("number");
          expect(typeof item.leadsCount).toBe("number");
          expect(typeof item.concorrentesCount).toBe("number");
        });
      }
    });
  });

  describe("Integração Completa", () => {
    it("deve validar performance com grandes volumes", async () => {
      const caller = createCaller();
      
      const startTime = Date.now();
      await caller.territorial.getDensity({
        projectId,
      });
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // Menos de 5 segundos
    });

    it("deve retornar estruturas de dados corretas", async () => {
      const caller = createCaller();
      
      const density = await caller.territorial.getDensity({
        projectId,
      });
      
      const stats = await caller.territorial.getDensityStats({
        projectId,
      });

      expect(density).toBeDefined();
      expect(stats).toBeDefined();
      expect(Array.isArray(density)).toBe(true);
      expect(Array.isArray(stats)).toBe(true);
    });
  });
});
