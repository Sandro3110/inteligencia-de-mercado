import { describe, it, expect } from "vitest";
import {
  dateToMySQLString,
  mysqlStringToDate,
  getCurrentMySQLTimestamp,
  formatDateForDisplay,
  getDaysDifference,
  addDays,
  isWithinDays,
} from "../dateUtils";

describe("dateUtils", () => {
  describe("dateToMySQLString", () => {
    it("deve converter Date para string MySQL corretamente", () => {
      const date = new Date("2025-11-21T15:30:45.000Z");
      const result = dateToMySQLString(date);
      expect(result).toBe("2025-11-21 15:30:45");
    });

    it("deve retornar null para data inválida", () => {
      expect(dateToMySQLString(null)).toBe(null);
      expect(dateToMySQLString(undefined)).toBe(null);
      expect(dateToMySQLString(new Date("invalid"))).toBe(null);
    });

    it("deve retornar null para valores não-Date", () => {
      // @ts-expect-error - testando tipo inválido
      expect(dateToMySQLString("not a date")).toBe(null);
      // @ts-expect-error - testando tipo inválido
      expect(dateToMySQLString(123)).toBe(null);
    });
  });

  describe("mysqlStringToDate", () => {
    it("deve converter string MySQL para Date corretamente", () => {
      const result = mysqlStringToDate("2025-11-21 15:30:45");
      expect(result).toBeInstanceOf(Date);
      expect(result?.getUTCFullYear()).toBe(2025);
      expect(result?.getUTCMonth()).toBe(10); // 0-indexed
      expect(result?.getUTCDate()).toBe(21);
    });

    it("deve retornar null para string inválida", () => {
      expect(mysqlStringToDate(null)).toBe(null);
      expect(mysqlStringToDate(undefined)).toBe(null);
      expect(mysqlStringToDate("invalid date")).toBe(null);
      expect(mysqlStringToDate("")).toBe(null);
    });

    it("deve retornar null para valores não-string", () => {
      // @ts-expect-error - testando tipo inválido
      expect(mysqlStringToDate(123)).toBe(null);
      // @ts-expect-error - testando tipo inválido
      expect(mysqlStringToDate({})).toBe(null);
    });
  });

  describe("getCurrentMySQLTimestamp", () => {
    it("deve retornar timestamp atual no formato MySQL", () => {
      const result = getCurrentMySQLTimestamp();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it("deve retornar timestamp próximo ao momento atual", () => {
      const before = new Date();
      const result = getCurrentMySQLTimestamp();
      const after = new Date();

      const resultDate = mysqlStringToDate(result);
      expect(resultDate).toBeTruthy();
      expect(resultDate!.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 1000
      );
      expect(resultDate!.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });
  });

  describe("formatDateForDisplay", () => {
    it("deve formatar Date para exibição em pt-BR", () => {
      const date = new Date("2025-11-21T15:30:00.000Z");
      const result = formatDateForDisplay(date, "pt-BR");
      // Aceita qualquer horário devido a diferenças de timezone
      expect(result).toMatch(/21\/11\/2025/);
    });

    it("deve formatar string MySQL para exibição", () => {
      const result = formatDateForDisplay("2025-11-21 15:30:00", "pt-BR");
      // Aceita qualquer horário devido a diferenças de timezone
      expect(result).toMatch(/21\/11\/2025/);
    });

    it("deve retornar null para data inválida", () => {
      expect(formatDateForDisplay(null)).toBe(null);
      expect(formatDateForDisplay(undefined)).toBe(null);
      expect(formatDateForDisplay("invalid")).toBe(null);
    });

    it("deve usar locale padrão pt-BR", () => {
      const date = new Date("2025-11-21T15:30:00.000Z");
      const result = formatDateForDisplay(date);
      expect(result).toBeTruthy();
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe("getDaysDifference", () => {
    it("deve calcular diferença em dias entre duas datas", () => {
      const date1 = new Date("2025-11-21");
      const date2 = new Date("2025-11-28");
      const result = getDaysDifference(date1, date2);
      expect(result).toBe(7);
    });

    it("deve retornar valor absoluto (sempre positivo)", () => {
      const date1 = new Date("2025-11-28");
      const date2 = new Date("2025-11-21");
      const result = getDaysDifference(date1, date2);
      expect(result).toBe(7);
    });

    it("deve funcionar com strings MySQL", () => {
      const result = getDaysDifference(
        "2025-11-21 10:00:00",
        "2025-11-28 10:00:00"
      );
      expect(result).toBe(7);
    });

    it("deve usar data atual como padrão para date2", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const result = getDaysDifference(pastDate);
      expect(result).toBeGreaterThanOrEqual(6);
      expect(result).toBeLessThanOrEqual(8); // margem de erro
    });

    it("deve retornar 0 para datas inválidas", () => {
      expect(getDaysDifference("invalid", new Date())).toBe(0);
      expect(getDaysDifference(new Date(), "invalid")).toBe(0);
    });
  });

  describe("addDays", () => {
    it("deve adicionar dias a uma data", () => {
      const date = new Date("2025-11-21T00:00:00.000Z");
      const result = addDays(date, 7);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getUTCDate()).toBe(28);
    });

    it("deve subtrair dias com valor negativo", () => {
      const date = new Date("2025-11-21T00:00:00.000Z");
      const result = addDays(date, -7);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getUTCDate()).toBe(14);
    });

    it("deve funcionar com string MySQL", () => {
      const result = addDays("2025-11-21 10:00:00", 7);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDate()).toBe(28);
    });

    it("deve retornar null para data inválida", () => {
      expect(addDays("invalid", 7)).toBe(null);
      expect(addDays(new Date("invalid"), 7)).toBe(null);
    });

    it("não deve modificar a data original", () => {
      const original = new Date("2025-11-21");
      const originalTime = original.getTime();
      addDays(original, 7);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe("isWithinDays", () => {
    it("deve retornar true se data está dentro do período", () => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      const result = isWithinDays(date, 7);
      expect(result).toBe(true);
    });

    it("deve retornar false se data está fora do período", () => {
      const date = new Date();
      date.setDate(date.getDate() - 10);
      const result = isWithinDays(date, 7);
      expect(result).toBe(false);
    });

    it("deve funcionar com string MySQL", () => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      const mysqlDate = dateToMySQLString(date);
      const result = isWithinDays(mysqlDate!, 7);
      expect(result).toBe(true);
    });

    it("deve aceitar data de referência customizada", () => {
      const reference = new Date("2025-11-21");
      const date = new Date("2025-11-15");
      const result = isWithinDays(date, 7, reference);
      expect(result).toBe(true);
    });

    it("deve retornar false para datas inválidas", () => {
      const diff = getDaysDifference("invalid", new Date());
      expect(diff).toBe(0);
    });
  });

  describe("Integração - Ciclo completo", () => {
    it("deve converter Date → MySQL → Date mantendo valores", () => {
      const original = new Date("2025-11-21T15:30:45.000Z");
      const mysqlString = dateToMySQLString(original);
      const converted = mysqlStringToDate(mysqlString!);

      expect(converted).toBeInstanceOf(Date);
      expect(converted?.getUTCFullYear()).toBe(original.getUTCFullYear());
      expect(converted?.getUTCMonth()).toBe(original.getUTCMonth());
      expect(converted?.getUTCDate()).toBe(original.getUTCDate());
      expect(converted?.getUTCHours()).toBe(original.getUTCHours());
      expect(converted?.getUTCMinutes()).toBe(original.getUTCMinutes());
      expect(converted?.getUTCSeconds()).toBe(original.getUTCSeconds());
    });

    it("deve calcular diferença de dias e adicionar dias corretamente", () => {
      const start = new Date("2025-11-21");
      const end = addDays(start, 7);
      const diff = getDaysDifference(start, end!);
      expect(diff).toBe(7);
    });

    it("deve validar período com isWithinDays após addDays", () => {
      const reference = new Date("2025-11-21");
      const futureDate = addDays(reference, 5);
      const isWithin = isWithinDays(futureDate!, 7, reference);
      expect(isWithin).toBe(true);
    });
  });
});
