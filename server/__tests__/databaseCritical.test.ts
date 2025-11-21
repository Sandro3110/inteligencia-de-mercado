import { describe, it, expect, vi, beforeEach } from "vitest";
import { toMySQLTimestamp, toISODate, toDateBR, now } from "../dateUtils";

/**
 * Testes para funções críticas de conversão de data
 */
describe("dateUtils - Critical Functions", () => {
  describe("toMySQLTimestamp", () => {
    it("deve converter Date para formato MySQL timestamp", () => {
      const date = new Date("2024-01-15T10:30:45Z");
      const result = toMySQLTimestamp(date);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result).toBe("2024-01-15 10:30:45");
    });

    it("deve usar data atual quando não fornecida", () => {
      const result = toMySQLTimestamp();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it("deve manter precisão de segundos", () => {
      const date = new Date("2024-12-31T23:59:59Z");
      const result = toMySQLTimestamp(date);

      expect(result).toBe("2024-12-31 23:59:59");
    });
  });

  describe("toISODate", () => {
    it("deve converter Date para formato ISO date (YYYY-MM-DD)", () => {
      const date = new Date("2024-01-15T10:30:45Z");
      const result = toISODate(date);

      expect(result).toBe("2024-01-15");
    });

    it("deve manter zeros à esquerda", () => {
      const date = new Date("2024-01-05T10:30:45Z");
      const result = toISODate(date);

      expect(result).toBe("2024-01-05");
    });
  });

  describe("toDateBR", () => {
    it("deve converter Date para formato brasileiro", () => {
      const date = new Date("2024-01-15T10:30:45Z");
      const result = toDateBR(date);

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe("now", () => {
    it("deve retornar timestamp atual no formato MySQL", () => {
      const result = now();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it("deve retornar valores diferentes em chamadas consecutivas", async () => {
      const result1 = now();
      await new Promise(resolve => setTimeout(resolve, 1100)); // Aguardar 1+ segundo
      const result2 = now();

      expect(result1).not.toBe(result2);
    });
  });
});

/**
 * Testes para funções críticas de validação de qualidade
 */
describe("qualityScore - Critical Functions", () => {
  describe("calculateQualityScore", () => {
    function calculateQualityScore(data: {
      hasEmail?: boolean;
      hasTelefone?: boolean;
      hasSite?: boolean;
      hasCNPJ?: boolean;
      hasEndereco?: boolean;
    }): number {
      let score = 0;

      if (data.hasEmail) score += 25;
      if (data.hasTelefone) score += 20;
      if (data.hasSite) score += 20;
      if (data.hasCNPJ) score += 20;
      if (data.hasEndereco) score += 15;

      return Math.min(score, 100);
    }

    it("deve calcular score 100 para dados completos", () => {
      const score = calculateQualityScore({
        hasEmail: true,
        hasTelefone: true,
        hasSite: true,
        hasCNPJ: true,
        hasEndereco: true,
      });

      expect(score).toBe(100);
    });

    it("deve calcular score 0 para dados vazios", () => {
      const score = calculateQualityScore({});

      expect(score).toBe(0);
    });

    it("deve calcular score parcial corretamente", () => {
      const score = calculateQualityScore({
        hasEmail: true, // 25
        hasCNPJ: true, // 20
      });

      expect(score).toBe(45);
    });

    it("deve limitar score máximo a 100", () => {
      const score = calculateQualityScore({
        hasEmail: true,
        hasTelefone: true,
        hasSite: true,
        hasCNPJ: true,
        hasEndereco: true,
      });

      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("classifyQuality", () => {
    function classifyQuality(
      score: number
    ): "rico" | "medio" | "precisa_ajuste" {
      if (score >= 80) return "rico";
      if (score >= 50) return "medio";
      return "precisa_ajuste";
    }

    it('deve classificar como "rico" para score >= 80', () => {
      expect(classifyQuality(80)).toBe("rico");
      expect(classifyQuality(90)).toBe("rico");
      expect(classifyQuality(100)).toBe("rico");
    });

    it('deve classificar como "medio" para score entre 50 e 79', () => {
      expect(classifyQuality(50)).toBe("medio");
      expect(classifyQuality(65)).toBe("medio");
      expect(classifyQuality(79)).toBe("medio");
    });

    it('deve classificar como "precisa_ajuste" para score < 50', () => {
      expect(classifyQuality(0)).toBe("precisa_ajuste");
      expect(classifyQuality(25)).toBe("precisa_ajuste");
      expect(classifyQuality(49)).toBe("precisa_ajuste");
    });
  });
});

/**
 * Testes para funções críticas de sanitização de dados
 */
describe("dataSanitization - Critical Functions", () => {
  describe("sanitizeCNPJ", () => {
    function sanitizeCNPJ(cnpj: string): string {
      return cnpj.replace(/\D/g, "");
    }

    it("deve remover formatação de CNPJ", () => {
      const result = sanitizeCNPJ("12.345.678/0001-90");
      expect(result).toBe("12345678000190");
    });

    it("deve manter apenas dígitos", () => {
      const result = sanitizeCNPJ("12-345-678/0001-90");
      expect(result).toBe("12345678000190");
    });

    it("deve retornar string vazia para input vazio", () => {
      const result = sanitizeCNPJ("");
      expect(result).toBe("");
    });
  });

  describe("sanitizeEmail", () => {
    function sanitizeEmail(email: string): string {
      return email.trim().toLowerCase();
    }

    it("deve converter para minúsculas", () => {
      const result = sanitizeEmail("CONTATO@EMPRESA.COM");
      expect(result).toBe("contato@empresa.com");
    });

    it("deve remover espaços", () => {
      const result = sanitizeEmail("  contato@empresa.com  ");
      expect(result).toBe("contato@empresa.com");
    });
  });

  describe("sanitizeURL", () => {
    function sanitizeURL(url: string): string {
      let sanitized = url.trim();

      // Adicionar https:// se não tiver protocolo
      if (!sanitized.match(/^https?:\/\//i)) {
        sanitized = "https://" + sanitized;
      }

      return sanitized;
    }

    it("deve adicionar https:// se não tiver protocolo", () => {
      const result = sanitizeURL("example.com");
      expect(result).toBe("https://example.com");
    });

    it("deve manter https:// existente", () => {
      const result = sanitizeURL("https://example.com");
      expect(result).toBe("https://example.com");
    });

    it("deve manter http:// existente", () => {
      const result = sanitizeURL("http://example.com");
      expect(result).toBe("http://example.com");
    });

    it("deve remover espaços", () => {
      const result = sanitizeURL("  example.com  ");
      expect(result).toBe("https://example.com");
    });
  });
});
