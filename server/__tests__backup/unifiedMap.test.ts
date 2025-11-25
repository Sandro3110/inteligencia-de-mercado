/**
 * Testes para Sistema Unificado de Mapas
 */

// @ts-ignore - TODO: Fix TypeScript error
import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import type { inferProcedureInput } from "@trpc/server";
import { getDb } from "../db";

// Mock context
const createMockContext = () => ({
  user: {
    id: "test-user",
    name: "Test User",
    email: "test@example.com",
  },
  req: {} as any,
  res: {} as any,
});

describe("Sistema Unificado de Mapas - Queries tRPC", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testProjectId: number;

  beforeAll(async () => {
    // @ts-ignore - TODO: Fix TypeScript error
    caller = appRouter.createCaller(createMockContext());

    // Buscar ou criar projeto de teste
    const db = await getDb();
    if (db) {
      const projects = await db.execute(
        `SELECT id FROM projects WHERE ativo = 1 LIMIT 1`
      );
      testProjectId = (projects as any).rows?.[0]?.id || 1;
    } else {
      testProjectId = 1;
    }
  });

  describe("getAllEntities", () => {
    it("deve retornar array de entidades", async () => {
      const input: inferProcedureInput<
        typeof appRouter.unifiedMap.getAllEntities
      > = {
        projectId: testProjectId,
      };

      const result = await caller.unifiedMap.getAllEntities(input);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("deve filtrar por tipo de entidade", async () => {
      const input: inferProcedureInput<
        typeof appRouter.unifiedMap.getAllEntities
      > = {
        projectId: testProjectId,
        entityTypes: ["cliente"],
      };

      const result = await caller.unifiedMap.getAllEntities(input);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Todas as entidades devem ser do tipo cliente
      result.forEach(entity => {
        expect(entity.type).toBe("cliente");
      });
    });

    it("deve filtrar por qualidade mínima", async () => {
      const minQuality = 50;
      const input: inferProcedureInput<
        typeof appRouter.unifiedMap.getAllEntities
      > = {
        projectId: testProjectId,
        minQuality,
      };

      const result = await caller.unifiedMap.getAllEntities(input);

      expect(result).toBeDefined();

      // Todas as entidades com qualidade devem ter score >= minQuality
      result.forEach(entity => {
        if (entity.qualidadeScore !== undefined) {
          expect(entity.qualidadeScore).toBeGreaterThanOrEqual(minQuality);
        }
      });
    });

    it("deve retornar entidades com coordenadas válidas", async () => {
      const input: inferProcedureInput<
        typeof appRouter.unifiedMap.getAllEntities
      > = {
        projectId: testProjectId,
      };

      const result = await caller.unifiedMap.getAllEntities(input);

      expect(result).toBeDefined();

      // Todas as entidades devem ter coordenadas válidas
      result.forEach(entity => {
        expect(entity.latitude).toBeDefined();
        expect(entity.longitude).toBeDefined();
        expect(typeof entity.latitude).toBe("number");
        expect(typeof entity.longitude).toBe("number");
        expect(entity.latitude).toBeGreaterThanOrEqual(-90);
        expect(entity.latitude).toBeLessThanOrEqual(90);
        expect(entity.longitude).toBeGreaterThanOrEqual(-180);
        expect(entity.longitude).toBeLessThanOrEqual(180);
      });
    });

    it("deve retornar estrutura correta de entidade", async () => {
      const input: inferProcedureInput<
        typeof appRouter.unifiedMap.getAllEntities
      > = {
        projectId: testProjectId,
      };

      const result = await caller.unifiedMap.getAllEntities(input);

      if (result.length > 0) {
        const entity = result[0];

        // Campos obrigatórios
        expect(entity).toHaveProperty("id");
        expect(entity).toHaveProperty("type");
        expect(entity).toHaveProperty("nome");
        expect(entity).toHaveProperty("latitude");
        expect(entity).toHaveProperty("longitude");

        // Tipo deve ser válido
        expect([
          "mercado",
          "cliente",
          "produto",
          "concorrente",
          "lead",
        ]).toContain(entity.type);
      }
    });

    it("deve filtrar por múltiplos tipos de entidade", async () => {
      const input: inferProcedureInput<
        typeof appRouter.unifiedMap.getAllEntities
      > = {
        projectId: testProjectId,
        entityTypes: ["cliente", "lead"],
      };

      const result = await caller.unifiedMap.getAllEntities(input);

      expect(result).toBeDefined();

      // Todas as entidades devem ser cliente ou lead
      result.forEach(entity => {
        expect(["cliente", "lead"]).toContain(entity.type);
      });
    });
  });

  describe("getEntityDetails", () => {
    it("deve retornar detalhes de um cliente", async () => {
      // Primeiro buscar um cliente existente
      const entities = await caller.unifiedMap.getAllEntities({
        projectId: testProjectId,
        entityTypes: ["cliente"],
      });

      if (entities.length > 0) {
        const clienteId = entities[0].id;

        const result = await caller.unifiedMap.getEntityDetails({
          entityType: "cliente",
          entityId: clienteId,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(clienteId);
        expect(result.nome).toBeDefined();
      }
    });

    it("deve retornar null para entidade inexistente", async () => {
      const result = await caller.unifiedMap.getEntityDetails({
        entityType: "cliente",
        entityId: 999999,
      });

      expect(result).toBeNull();
    });

    it("deve incluir mercados para clientes", async () => {
      const entities = await caller.unifiedMap.getAllEntities({
        projectId: testProjectId,
        entityTypes: ["cliente"],
      });

      if (entities.length > 0) {
        const clienteId = entities[0].id;

        const result = await caller.unifiedMap.getEntityDetails({
          entityType: "cliente",
          entityId: clienteId,
        });

        if (result) {
          expect(result).toHaveProperty("mercados");
          expect(Array.isArray(result.mercados)).toBe(true);
        }
      }
    });

    it("deve incluir tags quando disponíveis", async () => {
      const entities = await caller.unifiedMap.getAllEntities({
        projectId: testProjectId,
      });

      if (entities.length > 0) {
        const entity = entities[0];

        const result = await caller.unifiedMap.getEntityDetails({
          entityType: entity.type as any,
          entityId: entity.id,
        });

        if (result) {
          expect(result).toHaveProperty("tags");
          expect(Array.isArray(result.tags)).toBe(true);
        }
      }
    });
  });

  describe("getMapStats", () => {
    it("deve retornar estatísticas do mapa", async () => {
      const result = await caller.unifiedMap.getMapStats({
        projectId: testProjectId,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("byType");
      expect(result).toHaveProperty("byUF");
      expect(result).toHaveProperty("byQuality");
    });

    it("deve ter contadores corretos por tipo", async () => {
      const result = await caller.unifiedMap.getMapStats({
        projectId: testProjectId,
      });

      expect(result.byType).toBeDefined();
      expect(result.byType).toHaveProperty("mercado");
      expect(result.byType).toHaveProperty("cliente");
      expect(result.byType).toHaveProperty("produto");
      expect(result.byType).toHaveProperty("concorrente");
      expect(result.byType).toHaveProperty("lead");

      // Todos os contadores devem ser números >= 0
      Object.values(result.byType).forEach(count => {
        expect(typeof count).toBe("number");
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it("deve ter estatísticas de qualidade", async () => {
      const result = await caller.unifiedMap.getMapStats({
        projectId: testProjectId,
      });

      expect(result.byQuality).toBeDefined();
      expect(result.byQuality).toHaveProperty("high");
      expect(result.byQuality).toHaveProperty("medium");
      expect(result.byQuality).toHaveProperty("low");

      // Todos os contadores devem ser números >= 0
      expect(typeof result.byQuality.high).toBe("number");
      expect(typeof result.byQuality.medium).toBe("number");
      expect(typeof result.byQuality.low).toBe("number");
    });

    it("total deve ser soma de todos os tipos", async () => {
      const result = await caller.unifiedMap.getMapStats({
        projectId: testProjectId,
      });

      const sumByType = Object.values(result.byType).reduce(
        (sum, count) => sum + count,
        0
      );

      expect(result.total).toBe(sumByType);
    });
  });
});
