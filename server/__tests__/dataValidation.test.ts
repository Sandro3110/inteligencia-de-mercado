import { describe, it, expect } from "vitest";

/**
 * Funções de validação de dados
 */

function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) {
    return false;
  }

  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return false;
  }

  return true;
}

function validateEmail(email: string): boolean {
  if (!email) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateURL(url: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

function validateTelefone(telefone: string): boolean {
  if (!telefone) {
    return false;
  }

  // Remove caracteres não numéricos
  const cleanTel = telefone.replace(/\D/g, "");

  // Verifica se tem entre 10 e 11 dígitos (DDD + número)
  return cleanTel.length >= 10 && cleanTel.length <= 11;
}

function validateQualityScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

describe("dataValidation", () => {
  describe("validateCNPJ", () => {
    it("deve aceitar CNPJ válido com 14 dígitos", () => {
      expect(validateCNPJ("12345678000190")).toBe(true);
    });

    it("deve aceitar CNPJ formatado", () => {
      expect(validateCNPJ("12.345.678/0001-90")).toBe(true);
    });

    it("deve rejeitar CNPJ com menos de 14 dígitos", () => {
      expect(validateCNPJ("123456780001")).toBe(false);
    });

    it("deve rejeitar CNPJ com mais de 14 dígitos", () => {
      expect(validateCNPJ("123456780001901")).toBe(false);
    });

    it("deve rejeitar CNPJ com todos os dígitos iguais", () => {
      expect(validateCNPJ("11111111111111")).toBe(false);
      expect(validateCNPJ("00000000000000")).toBe(false);
    });

    it("deve rejeitar CNPJ vazio", () => {
      expect(validateCNPJ("")).toBe(false);
    });
  });

  describe("validateEmail", () => {
    it("deve aceitar email válido", () => {
      expect(validateEmail("contato@empresa.com")).toBe(true);
      expect(validateEmail("user+tag@example.co.uk")).toBe(true);
    });

    it("deve rejeitar email sem @", () => {
      expect(validateEmail("contatoempresa.com")).toBe(false);
    });

    it("deve rejeitar email sem domínio", () => {
      expect(validateEmail("contato@")).toBe(false);
    });

    it("deve rejeitar email sem usuário", () => {
      expect(validateEmail("@empresa.com")).toBe(false);
    });

    it("deve rejeitar email vazio", () => {
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validateURL", () => {
    it("deve aceitar URL válida com http", () => {
      expect(validateURL("http://example.com")).toBe(true);
    });

    it("deve aceitar URL válida com https", () => {
      expect(validateURL("https://example.com")).toBe(true);
    });

    it("deve aceitar URL com subdomínio", () => {
      expect(validateURL("https://www.example.com")).toBe(true);
    });

    it("deve aceitar URL com path", () => {
      expect(validateURL("https://example.com/path/to/page")).toBe(true);
    });

    it("deve rejeitar URL sem protocolo", () => {
      expect(validateURL("example.com")).toBe(false);
    });

    it("deve rejeitar URL com protocolo inválido", () => {
      expect(validateURL("ftp://example.com")).toBe(false);
    });

    it("deve rejeitar URL vazia", () => {
      expect(validateURL("")).toBe(false);
    });
  });

  describe("validateTelefone", () => {
    it("deve aceitar telefone com 10 dígitos (fixo)", () => {
      expect(validateTelefone("1133334444")).toBe(true);
    });

    it("deve aceitar telefone com 11 dígitos (celular)", () => {
      expect(validateTelefone("11999998888")).toBe(true);
    });

    it("deve aceitar telefone formatado", () => {
      expect(validateTelefone("(11) 3333-4444")).toBe(true);
      expect(validateTelefone("(11) 99999-8888")).toBe(true);
    });

    it("deve rejeitar telefone com menos de 10 dígitos", () => {
      expect(validateTelefone("113333444")).toBe(false);
    });

    it("deve rejeitar telefone com mais de 11 dígitos", () => {
      expect(validateTelefone("119999988889")).toBe(false);
    });

    it("deve rejeitar telefone vazio", () => {
      expect(validateTelefone("")).toBe(false);
    });
  });

  describe("validateQualityScore", () => {
    it("deve aceitar score válido entre 0 e 100", () => {
      expect(validateQualityScore(0)).toBe(true);
      expect(validateQualityScore(50)).toBe(true);
      expect(validateQualityScore(100)).toBe(true);
    });

    it("deve rejeitar score negativo", () => {
      expect(validateQualityScore(-1)).toBe(false);
    });

    it("deve rejeitar score maior que 100", () => {
      expect(validateQualityScore(101)).toBe(false);
    });
  });
});

// Exportar funções para uso em outros módulos
export {
  validateCNPJ,
  validateEmail,
  validateURL,
  validateTelefone,
  validateQualityScore,
};
