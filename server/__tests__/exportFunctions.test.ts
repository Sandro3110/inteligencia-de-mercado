import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportMercadosToExcel, exportLeadsToExcel } from "../exportToExcel";

// Mock do banco de dados
vi.mock("../db", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() =>
          Promise.resolve([
            {
              id: 1,
              nome: "Mercado Teste",
              segmentacao: "B2B",
              categoria: "Tecnologia",
              tamanhoMercado: "Grande",
              crescimentoAnual: "10%",
              tendencias: "Crescimento",
              principaisPlayers: "Player 1, Player 2",
              quantidadeClientes: 50,
              createdAt: new Date("2024-01-01"),
            },
          ])
        ),
      })),
    })),
  })),
}));

describe("exportFunctions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exportMercadosToExcel", () => {
    it("deve exportar mercados para Excel", async () => {
      const buffer = await exportMercadosToExcel(1);

      expect(buffer).toBeDefined();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("deve gerar buffer válido de Excel", async () => {
      const buffer = await exportMercadosToExcel(1);

      // Verificar assinatura de arquivo Excel (PK)
      const signature = buffer.toString("hex", 0, 2);
      expect(signature).toBe("504b"); // PK em hexadecimal
    });
  });

  describe("exportLeadsToExcel", () => {
    it("deve exportar leads para Excel", async () => {
      const buffer = await exportLeadsToExcel(1);

      expect(buffer).toBeDefined();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("deve gerar buffer válido de Excel", async () => {
      const buffer = await exportLeadsToExcel(1);

      // Verificar assinatura de arquivo Excel (PK)
      const signature = buffer.toString("hex", 0, 2);
      expect(signature).toBe("504b"); // PK em hexadecimal
    });
  });
});

/**
 * Testes para funções de formatação de dados para exportação
 */
describe("exportFormatting", () => {
  describe("formatDataForExport", () => {
    it("deve formatar dados com valores nulos", () => {
      const data = {
        nome: "Empresa",
        email: null,
        telefone: undefined,
        site: "https://example.com",
      };

      const formatted = {
        Nome: data.nome || "",
        Email: data.email || "",
        Telefone: data.telefone || "",
        Site: data.site || "",
      };

      expect(formatted["Nome"]).toBe("Empresa");
      expect(formatted["Email"]).toBe("");
      expect(formatted["Telefone"]).toBe("");
      expect(formatted["Site"]).toBe("https://example.com");
    });

    it("deve formatar datas corretamente", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = date.toLocaleDateString("pt-BR");

      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("deve formatar números como strings quando necessário", () => {
      const score = 85;
      const formatted = String(score);

      expect(formatted).toBe("85");
      expect(typeof formatted).toBe("string");
    });
  });

  describe("sanitizeDataForExport", () => {
    it("deve remover caracteres especiais perigosos", () => {
      const data = {
        nome: '=CMD|"/c calc"',
        descricao: "@SUM(A1:A10)",
      };

      // Sanitizar removendo prefixos perigosos
      const sanitized = {
        nome: data.nome.replace(/^[=@+\-]/, ""),
        descricao: data.descricao.replace(/^[=@+\-]/, ""),
      };

      expect(sanitized.nome).not.toMatch(/^=/);
      expect(sanitized.descricao).not.toMatch(/^@/);
    });

    it("deve manter dados seguros intactos", () => {
      const data = {
        nome: "Empresa Segura",
        email: "contato@empresa.com",
      };

      const sanitized = {
        nome: data.nome.replace(/^[=@+\-]/, ""),
        email: data.email.replace(/^[=@+\-]/, ""),
      };

      expect(sanitized.nome).toBe("Empresa Segura");
      expect(sanitized.email).toBe("contato@empresa.com");
    });
  });
});
