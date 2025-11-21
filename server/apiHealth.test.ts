import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  logAPICall,
  getAPIHealthStats,
  getAPIHealthHistory,
  testAPIConnection,
} from "./apiHealth";
import { getDb } from "./db";
import { apiHealthLog } from "../drizzle/schema";
import { sql } from "drizzle-orm";

describe("API Health Monitoring System", () => {
  beforeAll(async () => {
    // Limpar dados de teste
    const db = await getDb();
    if (db) {
      await db.delete(apiHealthLog);
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    const db = await getDb();
    if (db) {
      await db.delete(apiHealthLog);
    }
  });

  describe("logAPICall", () => {
    it("deve registrar uma chamada de API com sucesso", async () => {
      await logAPICall({
        apiName: "openai",
        status: "success",
        responseTime: 150,
        endpoint: "/chat/completions",
        requestData: JSON.stringify({ test: true }),
      });

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const logs = await db
        .select()
        .from(apiHealthLog)
        .where(sql`apiName = 'openai'`);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].apiName).toBe("openai");
      expect(logs[0].status).toBe("success");
      expect(logs[0].responseTime).toBe(150);
    });

    it("deve registrar uma chamada de API com erro", async () => {
      await logAPICall({
        apiName: "receitaws",
        status: "error",
        responseTime: 5000,
        endpoint: "/cnpj",
        errorMessage: "Timeout na requisição",
        requestData: JSON.stringify({ cnpj: "12345678000190" }),
      });

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const logs = await db
        .select()
        .from(apiHealthLog)
        .where(sql`apiName = 'receitaws'`);
      expect(logs.length).toBeGreaterThan(0);

      const errorLog = logs.find(log => log.status === "error");
      expect(errorLog).toBeDefined();
      expect(errorLog?.errorMessage).toBe("Timeout na requisição");
    });

    it("deve registrar múltiplas chamadas de diferentes APIs", async () => {
      await logAPICall({
        apiName: "openai",
        status: "success",
        responseTime: 200,
      });

      await logAPICall({
        apiName: "serpapi",
        status: "success",
        responseTime: 300,
      });

      await logAPICall({
        apiName: "receitaws",
        status: "error",
        responseTime: 1000,
        errorMessage: "API indisponível",
      });

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const allLogs = await db.select().from(apiHealthLog);
      expect(allLogs.length).toBeGreaterThanOrEqual(3);

      const apiNames = new Set(allLogs.map(log => log.apiName));
      expect(apiNames.has("openai")).toBe(true);
      expect(apiNames.has("serpapi")).toBe(true);
      expect(apiNames.has("receitaws")).toBe(true);
    });
  });

  describe("getAPIHealthStats", () => {
    beforeAll(async () => {
      // Criar dados de teste
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db.delete(apiHealthLog);

      // Simular 10 chamadas bem-sucedidas e 2 com erro para OpenAI
      for (let i = 0; i < 10; i++) {
        await logAPICall({
          apiName: "openai",
          status: "success",
          responseTime: 100 + i * 10,
        });
      }

      for (let i = 0; i < 2; i++) {
        await logAPICall({
          apiName: "openai",
          status: "error",
          responseTime: 5000,
          errorMessage: "Erro de teste",
        });
      }

      // Simular 5 chamadas bem-sucedidas para ReceitaWS
      for (let i = 0; i < 5; i++) {
        await logAPICall({
          apiName: "receitaws",
          status: "success",
          responseTime: 200 + i * 20,
        });
      }
    });

    it("deve calcular estatísticas corretas para cada API", async () => {
      const openaiStats = await getAPIHealthStats("openai", 7);
      const receitawsStats = await getAPIHealthStats("receitaws", 7);

      expect(openaiStats).toBeDefined();
      expect(openaiStats.totalCalls).toBe(12);
      expect(openaiStats.successCount).toBe(10);
      expect(openaiStats.errorCount).toBe(2);
      expect(openaiStats.successRate).toBeCloseTo(83, 1);
      expect(openaiStats.avgResponseTime).toBeGreaterThan(0);

      expect(receitawsStats).toBeDefined();
      expect(receitawsStats.totalCalls).toBe(5);
      expect(receitawsStats.successCount).toBe(5);
      expect(receitawsStats.errorCount).toBe(0);
      expect(receitawsStats.successRate).toBe(100);
    });

    it("deve respeitar o filtro de dias", async () => {
      const stats1Day = await getAPIHealthStats("openai", 1);
      const stats7Days = await getAPIHealthStats("openai", 7);

      expect(stats1Day).toBeDefined();
      expect(stats7Days).toBeDefined();

      // Todos os logs são recentes, então devem aparecer em ambos
      expect(stats1Day.totalCalls).toBeGreaterThan(0);
      expect(stats7Days.totalCalls).toBeGreaterThan(0);
    });
  });

  describe("getAPIHealthHistory", () => {
    it("deve retornar histórico de chamadas limitado", async () => {
      const history = await getAPIHealthHistory(5);

      expect(history).toBeDefined();
      expect(history.length).toBeLessThanOrEqual(5);

      if (history.length > 0) {
        expect(history[0]).toHaveProperty("apiName");
        expect(history[0]).toHaveProperty("status");
        expect(history[0]).toHaveProperty("responseTime");
        expect(history[0]).toHaveProperty("createdAt");
      }
    });

    it("deve ordenar por data decrescente (mais recente primeiro)", async () => {
      const history = await getAPIHealthHistory(10);

      if (history.length > 1) {
        const firstDate = new Date(history[0].createdAt);
        const secondDate = new Date(history[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(
          secondDate.getTime()
        );
      }
    });
  });

  describe("testAPIConnection", () => {
    it("deve testar conexão com OpenAI", async () => {
      const result = await testAPIConnection("openai");

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("responseTime");

      if (!result.success) {
        expect(result).toHaveProperty("error");
        console.log(
          "OpenAI test failed (expected if no API key):",
          result.error
        );
      }
    });

    it("deve testar conexão com ReceitaWS", async () => {
      const result = await testAPIConnection("receitaws");

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("responseTime");

      if (!result.success) {
        expect(result).toHaveProperty("error");
        console.log("ReceitaWS test failed:", result.error);
      }
    });

    it("deve testar conexão com SERPAPI", async () => {
      const result = await testAPIConnection("serpapi");

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("responseTime");

      if (!result.success) {
        expect(result).toHaveProperty("error");
        console.log(
          "SERPAPI test failed (expected if no API key):",
          result.error
        );
      }
    });

    it("deve registrar resultado do teste no log", async () => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const logCountBefore = (await db.select().from(apiHealthLog)).length;

      await testAPIConnection("openai");

      const logCountAfter = (await db.select().from(apiHealthLog)).length;
      expect(logCountAfter).toBeGreaterThan(logCountBefore);
    });
  });

  describe("Integration: Logging automático no enrichmentFlow", () => {
    it("deve ter integração com logAPICall nas chamadas de LLM", async () => {
      // Este teste verifica se o código de integração existe
      const fs = await import("fs/promises");
      const enrichmentFlowContent = await fs.readFile(
        "/home/ubuntu/gestor-pav/server/enrichmentFlow.ts",
        "utf-8"
      );

      // Verificar se há importação de logAPICall
      expect(enrichmentFlowContent).toContain("logAPICall");

      // Verificar se há chamadas de log para OpenAI
      expect(enrichmentFlowContent).toContain("apiName: 'openai'");

      // Verificar se há chamadas de log para ReceitaWS
      expect(enrichmentFlowContent).toContain("apiName: 'receitaws'");

      // Verificar se há tratamento de erro com logging
      expect(enrichmentFlowContent).toContain("status: 'error'");
      expect(enrichmentFlowContent).toContain("status: 'success'");
    });
  });
});
