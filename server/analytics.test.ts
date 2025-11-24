import { describe, it, expect } from "vitest";
import {
  getDistribuicaoGeografica,
  getDistribuicaoSegmentacao,
  getTimelineValidacoes,
  getFunilConversao,
  getTop10Mercados,
} from "./db";

describe("Dashboard Analytics", () => {
  it("should get distribuicao geografica", async () => {
    const result = await getDistribuicaoGeografica();
    expect(Array.isArray(result)).toBe(true);

    if (result.length > 0) {
      const first = result[0];
      expect(first).toHaveProperty("uf");
      expect(first).toHaveProperty("count");
      expect(typeof first.uf).toBe("string");
      expect(typeof first.count).toBe("number");
    }
  });

  it("should get distribuicao segmentacao", async () => {
    const result = await getDistribuicaoSegmentacao();
    expect(Array.isArray(result)).toBe(true);

    if (result.length > 0) {
      const first = result[0];
      expect(first).toHaveProperty("segmentacao");
      expect(first).toHaveProperty("count");
      expect(["B2B", "B2C", "Ambos"]).toContain(first.segmentacao);
      expect(typeof first.count).toBe("number");
    }
  });

  it("should get timeline validacoes with default 30 days", async () => {
    const result = await getTimelineValidacoes();
    expect(Array.isArray(result)).toBe(true);

    if (result.length > 0) {
      const first = result[0];
      expect(first).toHaveProperty("date");
      expect(first).toHaveProperty("count");
      expect(typeof first.date).toBe("string");
      expect(typeof first.count).toBe("number");
    }
  });

  it("should get timeline validacoes with custom days", async () => {
    const result = await getTimelineValidacoes(7);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get funil conversao", async () => {
    const result = await getFunilConversao();
    expect(result).toHaveProperty("leads");
    expect(result).toHaveProperty("clientes");
    expect(result).toHaveProperty("validados");
    expect(typeof result.leads).toBe("number");
    expect(typeof result.clientes).toBe("number");
    expect(typeof result.validados).toBe("number");
    expect(result.validados).toBeLessThanOrEqual(result.clientes);
  });

  it("should get top 10 mercados", async () => {
    const result = await getTop10Mercados();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(10);

    if (result.length > 0) {
      const first = result[0];
      expect(first).toHaveProperty("nome");
      expect(first).toHaveProperty("quantidadeClientes");
      expect(typeof first.nome).toBe("string");
      expect(typeof first.quantidadeClientes).toBe("number");

      // Verificar ordenação decrescente
      if (result.length > 1) {
        expect(result[0].quantidadeClientes).toBeGreaterThanOrEqual(
          result[1].quantidadeClientes
        );
      }
    }
  });
});
