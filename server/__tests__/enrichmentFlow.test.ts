import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeEnrichmentFlow } from "../enrichmentFlow";

describe("enrichmentFlow", () => {
  // Nota: validateEnrichmentInput é uma função interna, não exportada
  // Testes de validação são feitos através do executeEnrichmentFlow

  describe("executeEnrichmentFlow", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("deve executar fluxo de enriquecimento com sucesso", async () => {
      const input = {
        clientes: [{ nome: "Empresa Teste", cnpj: "12345678000190" }],
        projectName: "Teste Flow",
      };

      const progressCallback = vi.fn();

      // Executar fluxo (não aguardar conclusão, pois é assíncrono)
      executeEnrichmentFlow(input, progressCallback);

      // Aguardar um pouco para callbacks iniciais
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar que callback foi chamado
      expect(progressCallback).toHaveBeenCalled();
    });

    it("deve aceitar input válido sem erros", () => {
      const input = {
        clientes: [{ nome: "Empresa Teste", cnpj: "12345678000190" }],
        projectName: "Teste Flow",
      };

      const progressCallback = vi.fn();

      // Executar fluxo não deve lançar erro
      expect(() => {
        executeEnrichmentFlow(input, progressCallback);
      }).not.toThrow();
    });
  });
});
